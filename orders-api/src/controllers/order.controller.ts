import { Router, Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { createOrderSchema } from '../dtos/create-order.dto';
import { authMiddleware } from '../../libs/common/src/middlewares/auth.middleware';

const router = Router();
const service = new OrderService();

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear una nueva orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *       401:
 *         description: No autorizado
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  try {
    const order = await service.createOrder(parsed.data);
    return res.status(201).json(order);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
});

/**
 * @swagger
 * /orders/{id}/confirm:
 *   post:
 *     summary: Confirmar una orden
 *     description: Confirma la orden y aplica cambios de stock. Soporta idempotencia.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la orden
 *       - in: header
 *         name: X-Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de idempotencia para evitar duplicados
 *     responses:
 *       200:
 *         description: Orden confirmada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 alreadyProcessed:
 *                   type: boolean
 *                   description: Indica si ya fue procesada anteriormente
 *       400:
 *         description: Falta header de idempotencia o error en la confirmación
 *       401:
 *         description: No autorizado
 */
router.post('/:id/confirm', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const idempotencyKey = req.header('X-Idempotency-Key');
  if (!idempotencyKey) {
    return res.status(400).json({ message: 'X-Idempotency-Key required' });
  }

  try {
    const resp = await service.confirmOrder(id, idempotencyKey);
    return res.status(200).json(resp);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
});

export default router;
