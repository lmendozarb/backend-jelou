import 'dotenv/config';

export const env = {
  PORT: Number(process.env.CUSTOMERS_PORT || 3001)
};
