FROM node:22-alpine

# Instalar dependencias necesarias para Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

COPY orders-api/package.json orders-api/tsconfig.json ./
COPY prisma ./prisma
RUN npm install && npx prisma generate --schema=prisma/schema.prisma

COPY libs ./libs
COPY orders-api/src ./src

EXPOSE 3002

CMD ["npm", "run", "start"]
