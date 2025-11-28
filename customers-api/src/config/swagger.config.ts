import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customers API',
      version: '1.0.0',
      description: 'API para gestión de clientes',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token para autenticación de usuarios',
        },
        internalAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Token interno para comunicación entre servicios',
        },
      },
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del cliente',
            },
            name: {
              type: 'string',
              description: 'Nombre del cliente',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del cliente',
            },

            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        CreateCustomer: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del cliente',
              minLength: 3,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del cliente',
            },
            phone: {
              type: 'string',
              description: 'Teléfono del cliente',
              minLength: 10,
            },
          },
        },
        UpdateCustomer: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del cliente',
              minLength: 3,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del cliente',
            },
            phone: {
              type: 'string',
              description: 'Teléfono del cliente',
              minLength: 10,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Autenticación y generación de tokens',
      },
      {
        name: 'Customers',
        description: 'Operaciones relacionadas con clientes',
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
