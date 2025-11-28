import express from 'express';
import swaggerUi from 'swagger-ui-express';
import customerRouter from './controllers/customer.controller';
import authRouter from './controllers/auth.controller';
import { errorMiddleware } from '../libs/common/src/middlewares/error.middleware';
import { swaggerSpec } from './config/swagger.config';

const app = express();
app.use(express.json());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRouter);
app.use('/customers', customerRouter);
app.use(errorMiddleware);

export default app;
