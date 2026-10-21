
import { redisRepository } from '../repositories/redis.repository.js';

export const CacheTTL = {
  short: 5 * 60,          // 5 minutes
  list: 60 * 60,          // 1 hour
  article: 24 * 60 * 60,  // 24 hours
  week: 7 * 24 * 60 * 60, // 7 days
  viewDedup: 24 * 60 * 60, // 24 hours
} as const;

export class CacheService {

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisRepository.get<T>(key);

      // Avoid exposing visitor identifiers in logs.
      const label = key.startsWith('article:likes:state:')
        ? 'article:likes:state:<redacted>'
        : key;

      console.info(
        value === null
          ? `[Cache MISS] ${label}`
          : `[Cache HIT] ${label}`,
      );

      return value;
    } catch (error) {
      console.error('[Cache ERROR] Read failed:', error);
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
      console.info(`[Cache SET] ${key} TTL=${ttlSeconds}s`);
    } catch (error) {
      console.error('[Cache ERROR] Write failed:', error);
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

    // MongoDB/source remains authoritative on a cache miss.
    const value = await loadFromSource();

    await this.set(key, value, ttlSeconds);

    return value;
  }

  /**
   * Atomically mark a key once, for example a visitor's article view.
   * Returns false if the key already exists.
   *
   * Returns null when Redis is unavailable, so callers can distinguish
   * a cache failure from a duplicate marker.
   */
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
      console.error('[Cache] Atomic marker failed:', error);
      return null;
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await redisRepository.delete(key);
    } catch (error) {
      console.error('[Cache] Invalidation failed:', error);
    }
  }

  async invalidateMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    try {
      await redisRepository.deleteMany(keys);
    } catch (error) {
      console.error('[Cache] Multi-key invalidation failed:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      await redisRepository.deleteByPattern(pattern);
    } catch (error) {
      console.error('[Cache] Pattern invalidation failed:', error);
    }
  }
}

export const cacheService = new CacheService();
