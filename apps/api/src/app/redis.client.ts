import IORedis from 'ioredis';

import { type ApiConfig } from './api.config';

let redisClient: IORedis | null = null;

export const getRedisClient = (config: ApiConfig): IORedis => {
    if (!redisClient) {
        redisClient = new IORedis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
        });
    }

    return redisClient;
};
