import 'dotenv/config';

export const env = {
  PORT: Number(process.env.ORDERS_PORT || 3002),
  CUSTOMERS_INTERNAL_URL:
    process.env.CUSTOMERS_INTERNAL_URL || 'http://customers-api:3001/customers/internal'
};
