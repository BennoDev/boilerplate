import { createClient, type RedisClientType } from 'redis';

import { type ApiConfig } from './api.config';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (
    config: ApiConfig,
): Promise<RedisClientType> => {
    if (!redisClient) {
        redisClient = createClient({
            url: `${config.redis.host}:${config.redis.port}`,
        });
        await redisClient.connect();
    }

    return redisClient;
};
