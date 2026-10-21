
import { redisRepository } from '../repositories/redis.repository.js';

export const CacheTTL = {
  short: 5 * 60,
  list: 60 * 60,
  article: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  viewDedup: 24 * 60 * 60,
} as const;

function safeCacheKey(key: string): string {
  return key.replace(
    /(article:likes:state:[^:]+:).+/,
    '$1<redacted>',
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisRepository.get<T>(key);
      const label = safeCacheKey(key);

      console.info(
        value === null
          ? `[Cache MISS] ${label}`
          : `[Cache HIT] ${label}`,
      );

      return value;
    } catch (error) {
      console.error('[Cache ERROR] Read failed:', errorMessage(error));
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = CacheTTL.article,
  ): Promise<void> {
    try {
      await redisRepository.set(key, value, ttlSeconds);

      console.info(
        `[Cache SET] ${safeCacheKey(key)} TTL=${ttlSeconds}s`,
      );
    } catch (error) {
      console.error('[Cache ERROR] Write failed:', errorMessage(error));
    }
  }

  async remember<T>(
    key: string,
    ttlSeconds: number,
    loadFromSource: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await loadFromSource();
    await this.set(key, value, ttlSeconds);

    return value;
  }

  async markOnce(
    key: string,
    ttlSeconds: number,
  ): Promise<boolean | null> {
    try {
      const marked = await redisRepository.setIfNotExists(
        key,
        '1',
        ttlSeconds,
      );

      console.info(
        marked
          ? '[Cache MARK] New marker created'
          : '[Cache MARK] Marker already exists',
      );

      return marked;
    } catch (error) {
      console.error(
        '[Cache ERROR] Atomic marker failed:',
        errorMessage(error),
      );
      return null;
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await redisRepository.delete(key);
      console.info(`[Cache INVALIDATE] ${safeCacheKey(key)}`);
    } catch (error) {
      console.error(
        '[Cache ERROR] Invalidation failed:',
        errorMessage(error),
      );
    }
  }

  async invalidateMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    try {
      await redisRepository.deleteMany(keys);
      console.info(`[Cache INVALIDATE] ${keys.length} keys`);
    } catch (error) {
      console.error(
        '[Cache ERROR] Multi-key invalidation failed:',
        errorMessage(error),
      );
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      await redisRepository.deleteByPattern(pattern);
      console.info(`[Cache INVALIDATE PATTERN] ${pattern}`);
    } catch (error) {
      console.error(
        '[Cache ERROR] Pattern invalidation failed:',
        errorMessage(error),
      );
    }
  }
}

export const cacheService = new CacheService();
