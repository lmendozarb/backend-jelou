import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: process.env.SERVICE_NAME || 'api',
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

// Helper para crear logger con contexto
export const createLogger = (context: string) => {
  return logger.child({ context });
};

export default logger;
