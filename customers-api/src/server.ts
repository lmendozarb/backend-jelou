import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Customers API listening on port ${env.PORT}`);
});
