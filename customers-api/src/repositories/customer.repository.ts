import { PrismaClient, Customer } from '@prisma/client';

const prisma = new PrismaClient();

export class CustomerRepository {
  async create(data: { name: string; email: string; phone: string }): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async findById(id: number): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { id, deleted: false }
    });
  }

  async search(search: string, cursor?: number, limit = 10) {
    return prisma.customer.findMany({
      where: {
        deleted: false,
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
        ]
      },
      take: limit,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: { id: 'asc' }
    });
  }

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data
    });
  }

  async softDelete(id: number) {
    return prisma.customer.update({
      where: { id },
      data: { deleted: true }
    });
  }
}
