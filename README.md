# Prueba Técnica – Backend B2B (Node.js + MySQL + Docker + Lambda)

Sistema mínimo de gestión de clientes, productos y órdenes con arquitectura de microservicios.


## Componentes

- **`customers-api`**: Gestión de clientes (CRUD, búsqueda)
- **`orders-api`**: Gestión de productos y órdenes (con idempotencia)
- **`lambda-orchestrator`**: Orquestador HTTP para crear y confirmar órdenes
- **`prisma/`**: Schema único compartido
- **`db/`**: Scripts SQL de inicialización y datos de ejemplo
- **`libs/common/`**: Middlewares y utilidades compartidas (auth, logging)

## 🚀 Requisitos Previos

- **Docker** y **Docker Compose**
- **Node.js 20+** (para lambda-orchestrator local)
- **jq** (opcional, para visualizar JSON en terminal)

## 📦 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd backend-jelou
cp env.example .env
```

### 2. Construir y levantar servicios con Docker

```bash
# Construir imágenes y levantar servicios
docker-compose build
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps
```

Deberías ver:
```
NAME            STATUS          PORTS
customers-api   Up              0.0.0.0:3001->3001/tcp
orders-api      Up              0.0.0.0:3002->3002/tcp
jelou-mysql     Up              0.0.0.0:3306->3306/tcp
```

### 3. Verificar que las APIs estén funcionando

```bash
# Customers API
curl http://localhost:3001/health
# Respuesta: {"status":"ok"}

# Orders API
curl http://localhost:3002/health
# Respuesta: {"status":"ok"}
```

## 🔑 Generar Token JWT para Autenticación

Todas las APIs requieren autenticación JWT. Para obtener un token:

### Generar token de prueba

```bash
curl -X POST http://localhost:3001/auth/demo-token \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Guardar token en variable de entorno

```bash
# Guardar token automáticamente
export TOKEN=$(curl -s -X POST http://localhost:3001/auth/demo-token \
  -H "Content-Type: application/json" -d '{}' | jq -r '.token')

# Verificar que se guardó
echo $TOKEN
```

**Nota:** Los tokens JWT expiran en 24 horas. Genera uno nuevo si es necesario.

## 📡 Ejemplos de Uso de la API

### 1. Crear una Orden (POST /orders)

```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "qty": 2
      },
      {
        "product_id": 2,
        "qty": 1
      }
    ]
  }'
```

**Respuesta exitosa (201):**
```json
{
  "id": 1,
  "customerId": 1,
  "status": "CREATED",
  "totalCents": 349700,
  "createdAt": "2025-11-28T16:00:00.000Z"
}
```

### 2. Confirmar Orden (POST /orders/:id/confirm)

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Idempotency-Key: unique-key-123"
```

**Respuesta exitosa (200):**
```json
{
  "orderId": 1,
  "status": "CONFIRMED",
  "order": {
    "id": 1,
    "customerId": 1,
    "status": "CONFIRMED",
    "totalCents": 349700,
    "createdAt": "2025-11-28T16:00:00.000Z"
  }
}
```

**Idempotencia:** Si envías la misma `X-Idempotency-Key` dos veces, obtendrás la misma respuesta sin procesar la orden nuevamente.

### 3. Listar Productos (GET /products)

```bash
curl -X GET "http://localhost:3002/products?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": 1,
      "sku": "SKU-001",
      "name": "Laptop Pro",
      "priceCents": 129900,
      "stock": 10,
      "createdAt": "2025-11-28T14:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

### 4. Crear Producto (POST /products)

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "SKU-004",
    "name": "iPhone 15 Pro",
    "priceCents": 99900,
    "stock": 50
  }'
```

### 5. Obtener Cliente (GET /customers/:id)

```bash
curl -X GET http://localhost:3001/customers/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "ACME",
  "email": "ops@acme.com",
  "phone": "+51 999999999",
  "deleted": false,
  "createdAt": "2025-11-28T14:00:00.000Z"
}
```

## 🎯 Lambda Orchestrator (Opcional)

El Lambda Orchestrator permite crear y confirmar órdenes en una sola llamada HTTP.

### 1. Instalar dependencias del lambda

```bash
cd lambda-orchestrator
npm install
npm run build
```

### 2. Iniciar lambda en modo local

```bash
npm run dev
```

El lambda estará disponible en: **http://localhost:3000**

### 3. Probar el Lambda Orchestrator

```bash
curl -X POST http://localhost:3000/dev/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "qty": 2
      },
      {
        "product_id": 2,
        "qty": 1
      }
    ],
    "idempotency_key": "order-unique-123",
    "correlation_id": "req-789"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "correlationId": "req-789",
  "data": {
    "customer": {
      "id": 1,
      "name": "ACME",
      "email": "ops@acme.com"
    },
    "order": {
      "id": 1,
      "customerId": 1,
      "status": "CONFIRMED",
      "totalCents": 349700,
      "items": [...]
    }
  }
}
```


## 📚 Documentación de APIs

Ambas APIs tienen documentación OpenAPI/Swagger integrada:

- **Customers API**: http://localhost:3001/api-docs
- **Orders API**: http://localhost:3002/api-docs

Puedes explorar todos los endpoints, ver schemas y probar las APIs directamente desde el navegador.

## 🗂️ Estructura del Proyecto

```
backend-jelou/
├── customers-api/          # API de clientes
│   ├── src/
│   │   ├── controllers/    # Endpoints HTTP
│   │   ├── services/       # Lógica de negocio
│   │   ├── repositories/   # Acceso a datos (Prisma)
│   │   ├── dtos/           # Validación con Zod
│   │   └── config/         # Configuración (Swagger, env)
│   ├── Dockerfile
│   └── package.json
├── orders-api/             # API de productos y órdenes
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── dtos/
│   │   └── config/
│   ├── Dockerfile
│   └── package.json
├── lambda-orchestrator/    # Lambda HTTP con Serverless Framework
│   ├── src/
│   │   └── handler.ts
│   ├── services/
│   │   └── ochestrator.service.ts
│   ├── serverless.ts
│   └── package.json
├── prisma/                 # Schema compartido de Prisma
│   └── schema.prisma
├── libs/common/            # Código compartido
│   └── src/
│       ├── middlewares/    # Auth, errores
│       └── utils/          # Logger (Pino)
├── db/                     # Scripts SQL
│   ├── schema.sql
│   └── seed.sql
├── docker-compose.yml      # Orquestación de servicios
├── .env                    # Variables de entorno
└── README.md
```

## 🔐 Autenticación y Seguridad

### JWT Tokens

- **Endpoint de generación**: `POST /auth/demo-token`
- **Expiración**: 24 horas
- **Header**: `Authorization: Bearer <token>`

### Token Interno de Servicios

Para comunicación entre microservicios:
- **Token**: `internal-token` (definido en `.env` como `SERVICE_TOKEN`)
- **Uso**: Endpoint interno `/customers/internal/:id`

## 🧪 Testing

### Script de prueba completo

```bash
#!/bin/bash

# 1. Generar token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/demo-token \
  -H "Content-Type: application/json" -d '{}' | jq -r '.token')

echo "Token: ${TOKEN:0:50}..."

# 2. Crear orden
echo "Creando orden..."
ORDER=$(curl -s -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 1, "qty": 2}]
  }')

ORDER_ID=$(echo $ORDER | jq -r '.id')
echo "Orden creada: ID=$ORDER_ID"

# 3. Confirmar orden
echo "Confirmando orden..."
curl -s -X POST http://localhost:3002/orders/$ORDER_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Idempotency-Key: test-$(date +%s)" | jq .

echo "✅ Prueba completada"
```

## 🐛 Troubleshooting

### Los contenedores no inician

```bash
# Ver logs
docker-compose logs -f

# Reconstruir imágenes
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Error "Invalid token" o "Unauthorized"

```bash
# Generar un nuevo token (expiran en 24h)
curl -X POST http://localhost:3001/auth/demo-token \
  -H "Content-Type: application/json" -d '{}'
```

### Error "Cannot connect to database"

```bash
# Verificar que MySQL esté corriendo
docker-compose ps mysql

# Reiniciar MySQL
docker-compose restart mysql

# Esperar 10 segundos y reiniciar las APIs
sleep 10
docker-compose restart customers-api orders-api
```

### Puertos en uso

Si ves errores como `address already in use`:

```bash
# Encontrar proceso usando el puerto
lsof -i :3001
lsof -i :3002

# Matar proceso
kill <PID>
```

## 🌐 Variables de Entorno

Ver archivo `.env`:

```env
# Base de datos
DATABASE_URL=mysql://root:root@mysql:3306/jelou

# Autenticación
JWT_SECRET=super-secret
SERVICE_TOKEN=internal-token

# Logging
LOG_LEVEL=info
NODE_ENV=development

# Puertos
CUSTOMERS_PORT=3001
ORDERS_PORT=3002

# URLs internas (Docker)
CUSTOMERS_INTERNAL_URL=http://customers-api:3001/customers/internal

# URLs externas (desde host)
CUSTOMERS_API_BASE=http://localhost:3001
ORDERS_API_BASE=http://localhost:3002
```

## 📖 Documentación Adicional

- **[SWAGGER.md](./SWAGGER.md)** - Guía de uso de Swagger/OpenAPI
- **[LAMBDA_GUIDE.md](./LAMBDA_GUIDE.md)** - Guía completa del Lambda Orchestrator
- **[TEST_PRODUCTS.md](./TEST_PRODUCTS.md)** - Ejemplos de pruebas de productos

## 🎓 Stack Tecnológico

- **Runtime**: Node.js 22 / TypeScript 5
- **Framework**: Express.js
- **ORM**: Prisma
- **Base de datos**: MySQL 8
- **Validación**: Zod
- **Autenticación**: JWT (jsonwebtoken)
- **Logging**: Pino
- **Documentación**: Swagger/OpenAPI
- **Contenedores**: Docker + Docker Compose
- **Lambda**: Serverless Framework (offline)

## 📄 Licencia

MIT
