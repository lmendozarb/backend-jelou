"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serverlessConfig = {
    service: 'lambda-orchestrator',
    frameworkVersion: '4',
    plugins: ['serverless-offline'],
    provider: {
        name: 'aws',
        runtime: 'nodejs20.x',
        region: 'us-east-1',
        environment: {
            CUSTOMERS_API_BASE: process.env.CUSTOMERS_API_BASE || 'http://localhost:3001',
            ORDERS_API_BASE: process.env.ORDERS_API_BASE || 'http://localhost:3002',
            SERVICE_TOKEN: process.env.SERVICE_TOKEN || 'internal-token',
            JWT_TOKEN: process.env.JWT_TOKEN || 'fake-jwt-for-demo'
        }
    },
    functions: {
        createAndConfirmOrder: {
            handler: 'dist/handler.createAndConfirmOrder',
            events: [
                {
                    http: {
                        method: 'post',
                        path: '/orchestrator/create-and-confirm-order'
                    }
                }
            ]
        }
    }
};
module.exports = serverlessConfig;
