
import { createClient } from 'redis';
import env from './env.js';

export const redisClient = createClient({
    url: env.redis.url,
    socket: {
        reconnectStrategy(retries) {
            return Math.min(retries * 250, 3000);
        },
    },
});

redisClient.on('error', (error: Error) => {
    console.error('[Redis] Connection error:', error.message);
});

redisClient.on('ready', () => {
    console.log('[Redis] Connection ready');
});

redisClient.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...');
});

export async function connectRedis(): Promise<void> {
    if (redisClient.isOpen) return;

    try {
        await redisClient.connect();
    } catch (error) {
        console.error(
            '[Redis] Initial connection failed; cache will be unavailable until reconnect:',
            error instanceof Error ? error.message : error,
        );
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}
