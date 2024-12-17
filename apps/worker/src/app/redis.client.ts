import IORedis from 'ioredis';

import { type WorkerConfig } from './worker.config';

let redisClient: IORedis | null = null;

export const getRedisClient = (config: WorkerConfig): IORedis => {
    if (!redisClient) {
        redisClient = new IORedis({
            host: config.redis.host,
            port: config.redis.port,
            maxRetriesPerRequest: null,
        });
    }

    return redisClient;
};
