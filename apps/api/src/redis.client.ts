import IORedis from 'ioredis';

import { ApiConfig } from './api.config';

// Don't directly access, only access via `getRedisClient`
let redisClient: IORedis.Redis | null = null;

export function getRedisClient(config: ApiConfig): IORedis.Redis {
    if (!redisClient) {
        redisClient = new IORedis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
        });
    }

    return redisClient;
}
