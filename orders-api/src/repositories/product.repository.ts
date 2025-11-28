import { PrismaClient, Product } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductRepository {
  create(data: { sku: string; name: string; priceCents: number; stock: number }): Promise<Product> {
    return prisma.product.create({ data });
  }

  findById(id: number) {
    return prisma.product.findUnique({ where: { id } });
  }

  update(id: number, data: Partial<Product>) {
    return prisma.product.update({ where: { id }, data });
  }

  search(search: string, cursor?: number, limit = 10) {
    return prisma.product.findMany({
      where: {
        OR: [
          { sku: { contains: search } },
          { name: { contains: search } }
        ]
      },
      take: limit,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: { id: 'asc' }
    });
  }
}
