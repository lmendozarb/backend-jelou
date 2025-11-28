import { Request, Response, Router } from 'express';
import { CustomerService } from '../services/customer.service';
import { createCustomerSchema } from '../dtos/create-customer.dto';
import {
  authMiddleware,
  internalServiceAuth
} from '../../libs/common/src/middlewares/auth.middleware';

const router = Router();
const service = new CustomerService();

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomer'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  const customer = await service.createCustomer(parsed.data);
  return res.status(201).json(customer);
});

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const customer = await service.getCustomer(id);
  if (!customer) return res.status(404).json({ message: 'Not found' });
  return res.json(customer);
});

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Buscar clientes con paginación
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: integer
 *         description: Cursor para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *                 nextCursor:
 *                   type: integer
 *                   nullable: true
 *       401:
 *         description: No autorizado
 */
router.get('/', authMiddleware, async (req, res) => {
  const search = (req.query.search as string) || '';
  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const customers = await service.searchCustomers(search, cursor, limit);
  return res.json(customers);
});

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomer'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const customer = await service.updateCustomer(id, req.body);
  return res.json(customer);
});

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       204:
 *         description: Cliente eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cliente no encontrado
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  await service.deleteCustomer(id);
  return res.status(204).send();
});

/**
 * @swagger
 * /customers/internal/{id}:
 *   get:
 *     summary: Obtener cliente (endpoint interno)
 *     description: Endpoint para comunicación entre servicios
 *     tags: [Customers]
 *     security:
 *       - internalAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: Token interno inválido
 */
router.get('/internal/:id', internalServiceAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const customer = await service.getCustomer(id);
  if (!customer) return res.status(404).json({ message: 'Not found' });
  return res.json(customer);
});

export default router;
