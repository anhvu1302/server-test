const redisCache = require("./RedisCache");
(async () => {
  await redisCache.initializeRedisClient();
})();
class CacheManager {
  constructor(baseKey) {
    if (!baseKey) {
      throw new Error("baseKey must be provided");
    }
    this.baseKey = baseKey;
  }

  static getInstance(baseKey) {
    if (!baseKey) {
      throw new Error("baseKey must be provided");
    }
    return new CacheManager(baseKey);
  }

  async get(queryParams) {
    const fullKey = `${this.baseKey}:${redisCache.queryParamsToKey(
      queryParams
    )}`;
    return await redisCache.readData(fullKey);
  }
  /**
   * @param {string} queryParams The key used to store and retrieve data from cache.
   * @param {object} options Optional configuration object for cache settings.
   *                        It can contain fields like 'EX' for expiry time.
   * @param {string} suffix Optional suffix to append to the cache key.
   * @returns {Promise<any>} The cached data or fresh data fetched by the callback.
   */
  async set(queryParams, value, options, suffix = "") {
    const fullKey = `${this.baseKey}:${redisCache.queryParamsToKey(
      queryParams
    )}${suffix ? ":" + suffix : ""}`;
    await redisCache.writeData(fullKey, value, options);
  }

  async del(queryParams) {
    const fullKey = `${this.baseKey}:${redisCache.queryParamsToKey(
      queryParams
    )}`;
    await redisCache.deleteData(fullKey);
  }

  async invalidateCache() {
    const scanPattern = `*${this.baseKey}*`;
    const keys = await redisCache.scan(scanPattern);
    for (const key of keys) {
      await redisCache.deleteData(key);
    }
  }
  /**
   * Retrieves data from cache if available, or fetches fresh data using the provided callback
   * and caches it for future use.
   * @param {string} queryParams The key used to store and retrieve data from cache.
   * @param {Function} cb The callback function that fetches fresh data if not found in cache.
   * @param {object} options Optional configuration object for cache settings.
   *                        It can contain fields like 'EX' for expiry time.
   * @param {string} suffix Optional suffix to append to the cache key.
   * @returns {Promise<any>} The cached data or fresh data fetched by the callback.
   */
  async getOrSetCache(queryParams, cb, options, suffix) {
    const fullKey = `${this.baseKey}:${redisCache.queryParamsToKey(
      queryParams
    )}${suffix ? `:${suffix}` : ""}`;
    return redisCache.getOrSetCache(fullKey, cb, options);
  }
}

module.exports = CacheManager;
