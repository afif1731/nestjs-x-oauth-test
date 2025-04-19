// eslint-disable-next-line @typescript-eslint/naming-convention
export const RedisConfig = {
  development: {
    REDIS_PORT: Number.parseInt(process.env.REDIS_PORT) || 6377,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  },
  production: {
    REDIS_PORT: Number.parseInt(process.env.REDIS_PORT) || 6379,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  },
};
