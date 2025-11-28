"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serverlessConfig = {
    service: 'lambda-orchestrator',
    frameworkVersion: '3',
    plugins: ['serverless-offline'],
    provider: {
        name: 'aws',
        runtime: 'nodejs20.x',
        region: 'us-east-1',
        environment: {
            CUSTOMERS_API_BASE: process.env.CUSTOMERS_API_BASE || 'http://localhost:3001',
            ORDERS_API_BASE: process.env.ORDERS_API_BASE || 'http://localhost:3002'
        }
    },
    functions: {
        createAndConfirmOrder: {
            handler: 'dist/src/handler.createAndConfirmOrder',
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
