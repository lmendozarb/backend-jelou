import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderRepository {
  async createOrderWithItems(data: {
    customerId: number;
    items: { productId: number; qty: number }[];
  }) {
    return prisma.$transaction(async (tx) => {
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } }
      });

      let totalCents = 0;

      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.qty) {
          throw new Error(`Insufficient stock for product ${product.id}`);
        }
        totalCents += product.priceCents * item.qty;
      }

      const order = await tx.order.create({
        data: {
          customerId: data.customerId,
          status: OrderStatus.CREATED,
          totalCents
        }
      });

      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId)!;
        const subtotal = product.priceCents * item.qty;
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            qty: item.qty,
            unitPriceCents: product.priceCents,
            subtotalCents: subtotal
          }
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.qty }
        });
      }

      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true }
      });

      return fullOrder!;
    });
  }

  findById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
  }

  async updateStatus(id: number, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}
