import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Orders API',
      version: '1.0.0',
      description: 'API para gestión de órdenes y productos',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token para autenticación',
        },
      },
      schemas: {
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID de la orden',
            },
            customer_id: {
              type: 'integer',
              description: 'ID del cliente',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled'],
              description: 'Estado de la orden',
            },
            total: {
              type: 'number',
              format: 'decimal',
              description: 'Total de la orden',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            order_id: {
              type: 'integer',
            },
            product_id: {
              type: 'integer',
            },
            qty: {
              type: 'integer',
            },
            price: {
              type: 'number',
              format: 'decimal',
            },
          },
        },
        CreateOrder: {
          type: 'object',
          required: ['customer_id', 'items'],
          properties: {
            customer_id: {
              type: 'integer',
              description: 'ID del cliente',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['product_id', 'qty'],
                properties: {
                  product_id: {
                    type: 'integer',
                  },
                  qty: {
                    type: 'integer',
                    minimum: 1,
                  },
                },
              },
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            name: {
              type: 'string',
            },
            price: {
              type: 'number',
              format: 'decimal',
            },
            stock: {
              type: 'integer',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateProduct: {
          type: 'object',
          required: ['sku', 'name', 'priceCents', 'stock'],
          properties: {
            sku: {
              type: 'string',
              minLength: 3,
            },
            name: {
              type: 'string',
              minLength: 3,
            },
            priceCents: {
              type: 'number',
              minimum: 0,
            },
            stock: {
              type: 'integer',
              minimum: 0,
            },
          },
        },
        UpdateProduct: {
          type: 'object',
          properties: {
            priceCents: {
              type: 'number',
              minimum: 0,
            },
            stock: {
              type: 'integer',
              minimum: 0,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Orders',
        description: 'Operaciones relacionadas con órdenes',
      },
      {
        name: 'Products',
        description: 'Operaciones relacionadas con productos',
      },
      {
        name: 'Health',
        description: 'Estado del servicio',
      },
    ],
  },
  apis: ['./src/controllers/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
