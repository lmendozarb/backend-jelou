"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndConfirmOrder = void 0;
const ochestrator_service_1 = require("../services/ochestrator.service");
const createAndConfirmOrder = async (event) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        // Extraer JWT del header Authorization
        const authHeader = event.headers?.authorization || event.headers?.Authorization;
        const jwtToken = authHeader?.replace('Bearer ', '') || '';
        if (!jwtToken) {
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: 'Missing Authorization header' })
            };
        }
        const service = new ochestrator_service_1.OrchestratorService(jwtToken);
        const result = await service.execute(body);
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        };
    }
    catch (e) {
        console.error(e);
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: e.message })
        };
    }
};
exports.createAndConfirmOrder = createAndConfirmOrder;
