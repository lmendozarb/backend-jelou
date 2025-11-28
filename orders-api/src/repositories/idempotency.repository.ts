import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class IdempotencyRepository {
  async findByKey(key: string) {
    return prisma.idempotencyKey.findUnique({ where: { key } });
  }

  async save(
    key: string,
    targetType: string,
    targetId: number,
    status: string,
    responseBody: any,
    ttlMinutes = 60
  ) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    return prisma.idempotencyKey.create({
      data: {
        key,
        targetType,
        targetId,
        status,
        responseBody: JSON.stringify(responseBody),
        expiresAt
      }
    });
  }
}
