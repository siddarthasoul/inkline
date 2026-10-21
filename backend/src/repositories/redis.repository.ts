
import { redisClient } from '../config/redis.js';

export class RedisRepository {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);

    if (value === null) return null;

    return JSON.parse(value) as T;
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttlSeconds !== undefined) {
      this.validateTTL(ttlSeconds);
      await redisClient.set(key, serialized, { EX: ttlSeconds });
      return;
    }

    await redisClient.set(key, serialized);
  }

  async getString(key: string): Promise<string | null> {
    return redisClient.get(key);
  }

  async setString(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    if (ttlSeconds !== undefined) {
      this.validateTTL(ttlSeconds);
      await redisClient.set(key, value, { EX: ttlSeconds });
      return;
    }

    await redisClient.set(key, value);
  }

  /**
   * Atomically creates a key only when it does not already exist.
   * Returns true if this call created the key.
   */
  async setIfNotExists(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    this.validateTTL(ttlSeconds);

    const result = await redisClient.set(key, value, {
      NX: true,
      EX: ttlSeconds,
    });

    return result === 'OK';
  }

  async delete(key: string): Promise<void> {
    await redisClient.del(key);
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    return (await redisClient.exists(key)) === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    this.validateTTL(ttlSeconds);
    return (await redisClient.expire(key, ttlSeconds)) === 1;
  }

  async increment(key: string): Promise<number> {
    return redisClient.incr(key);
  }

  async decrement(key: string): Promise<number> {
    return redisClient.decr(key);
  }

  async deleteByPattern(pattern: string): Promise<void> {
    for await (const key of redisClient.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      await redisClient.del(key);
    }
  }

  private validateTTL(ttlSeconds: number): void {
    if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error('TTL must be a positive integer');
    }
  }
}

export const redisRepository = new RedisRepository();
