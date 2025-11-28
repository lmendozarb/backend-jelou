import axios from 'axios';

interface OrchestratorInput {
  customer_id: number;
  items: { product_id: number; qty: number }[];
  idempotency_key: string;
  correlation_id?: string;
}

export class OrchestratorService {
  constructor(
    private jwtToken: string,
    private customersBase = process.env.CUSTOMERS_API_BASE || 'http://localhost:3001',
    private ordersBase = process.env.ORDERS_API_BASE || 'http://localhost:3002'
  ) {}

  async execute(payload: OrchestratorInput) {
    const { customer_id, items, idempotency_key, correlation_id } = payload;

    // 1. Validar cliente con JWT
    const customerRes = await axios.get(
      `${this.customersBase}/customers/${customer_id}`,
      { headers: { Authorization: `Bearer ${this.jwtToken}` } }
    );
    const customer = customerRes.data;

    // 2. Crear orden con JWT
    const orderRes = await axios.post(
      `${this.ordersBase}/orders`,
      { customer_id, items },
      { headers: { Authorization: `Bearer ${this.jwtToken}` } }
    );
    const order = orderRes.data;

    // 3. Confirmar orden con JWT e idempotencia
    const confirmRes = await axios.post(
      `${this.ordersBase}/orders/${order.id}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.jwtToken}`,
          'X-Idempotency-Key': idempotency_key
        }
      }
    );

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