import { Router, Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const service = new CustomerService();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Credenciales inválidas
 *       400:
 *         description: Datos inválidos
 */
router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  // Buscar cliente por email
  const customers = await service.searchCustomers(email, undefined, 1);
  const customer = customers.items.find(c => c.email === email);

  if (!customer) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Verificar password (asumiendo que tienes un campo password en tu modelo)
  // Nota: Necesitarás agregar este campo al schema de Prisma si no existe
  const isValid = await bcrypt.compare(password, (customer as any).password || '');
  
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generar JWT
  const token = jwt.sign(
    { 
      sub: customer.id.toString(),
      email: customer.email 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email
    }
  });
});

/**
 * @swagger
 * /auth/demo-token:
 *   post:
 *     summary: Generar token de prueba (solo para desarrollo)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 default: demo@example.com
 *     responses:
 *       200:
 *         description: Token generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 */
router.post('/demo-token', async (req: Request, res: Response) => {
  const email = req.body.email || 'demo@example.com';
  
  const token = jwt.sign(
    { 
      sub: '1',
      email: email
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({ token });
});

export default router;
