import { Router, Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { createProductSchema } from '../dtos/create-product.dto';
import { updateProductSchema } from '../dtos/update-product.dto';
import { authMiddleware } from '../../libs/common/src/middlewares/auth.middleware';

const router = Router();
const service = new ProductService();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  const product = await service.createProduct(parsed.data);
  return res.status(201).json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const product = await service.getProduct(id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  return res.json(product);
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Buscar productos con paginación
 *     tags: [Products]
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
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
  const products = await service.searchProducts(search, cursor, limit);
  return res.json(products);
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Actualizar un producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProduct'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  const product = await service.updateProduct(id, parsed.data);
  return res.json(product);
});

export default router;
