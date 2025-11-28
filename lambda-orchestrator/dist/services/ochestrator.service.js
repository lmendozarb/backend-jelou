"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const axios_1 = __importDefault(require("axios"));
class OrchestratorService {
    jwtToken;
    customersBase;
    ordersBase;
    constructor(jwtToken, customersBase = process.env.CUSTOMERS_API_BASE || 'http://localhost:3001', ordersBase = process.env.ORDERS_API_BASE || 'http://localhost:3002') {
        this.jwtToken = jwtToken;
        this.customersBase = customersBase;
        this.ordersBase = ordersBase;
    }
    async execute(payload) {
        const { customer_id, items, idempotency_key, correlation_id } = payload;
        // 1. Validar cliente con JWT
        const customerRes = await axios_1.default.get(`${this.customersBase}/customers/${customer_id}`, { headers: { Authorization: `Bearer ${this.jwtToken}` } });
        const customer = customerRes.data;
        // 2. Crear orden con JWT
        const orderRes = await axios_1.default.post(`${this.ordersBase}/orders`, { customer_id, items }, { headers: { Authorization: `Bearer ${this.jwtToken}` } });
        const order = orderRes.data;
        // 3. Confirmar orden con JWT e idempotencia
        const confirmRes = await axios_1.default.post(`${this.ordersBase}/orders/${order.id}/confirm`, {}, {
            headers: {
                Authorization: `Bearer ${this.jwtToken}`,
                'X-Idempotency-Key': idempotency_key
            }
        });
        const confirmed = confirmRes.data;
        return {
            success: true,
            correlationId: correlation_id || null,
            data: {
                customer,
                order: confirmed.order ?? confirmed
            }
        };
    }
}
exports.OrchestratorService = OrchestratorService;
