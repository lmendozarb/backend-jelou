import axios from 'axios';
import { env } from '../config/env';
import { OrderRepository } from '../repositories/order.repository';
import { IdempotencyRepository } from '../repositories/idempotency.repository';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { createLogger } from '../../libs/common/src/utils/logger';

const logger = createLogger('OrderService');

export class OrderService {
  constructor(
    private readonly orderRepo = new OrderRepository(),
    private readonly idempotencyRepo = new IdempotencyRepository()
  ) {}

  async validateCustomer(customerId: number) {
    logger.debug({ customerId }, 'Validating customer');
    const url = `${env.CUSTOMERS_INTERNAL_URL}/${customerId}`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SERVICE_TOKEN || 'internal-token'}`
      }
    });
    return res.data;
  }

  async createOrder(dto: CreateOrderDto) {
    await this.validateCustomer(dto.customer_id);
    logger.info({ dto }, 'Creating new order');
    const order = await this.orderRepo.createOrderWithItems({
      customerId: dto.customer_id,
      items: dto.items.map((i) => ({
        productId: i.product_id,
        qty: i.qty
      }))
    });
    logger.info({ orderId: order.id }, 'Order created successfully');
    return order;
  }

  async confirmOrder(orderId: number, idempotencyKey: string) {
    logger.info({ orderId, idempotencyKey }, 'Confirming order');
    const existing = await this.idempotencyRepo.findByKey(idempotencyKey);
    if (existing) {
      return JSON.parse(existing.responseBody);
    }

    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('Order not found');

    if (order.status === 'CONFIRMED') {
      const response = { orderId: order.id, status: order.status, order };
      await this.idempotencyRepo.save(
        idempotencyKey,
        'order_confirm',
        order.id,
        'CONFIRMED',
        response
      );
      return response;
    }

    const updated = await this.orderRepo.updateStatus(orderId, 'CONFIRMED');

    const response = { orderId: updated.id, status: updated.status, order: updated };
    logger.info({ orderId: updated.id }, 'Order confirmed successfully');
    await this.idempotencyRepo.save(
      idempotencyKey,
      'order_confirm',
      updated.id,
      'CONFIRMED',
      response
    );
    return response;
  }
}
