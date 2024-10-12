const { createClient } = require("redis");
const CryptoJS = require("crypto-js");

class RedisCache {
  constructor() {
    this.redisClient = undefined;
    this.defaultOptions = {
      EX: process.env.REDIS_EXPIRED_DEFAULT,
    };
  }

  async initializeRedisClient() {
    // const redisURL = `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}`;
    const redisURL = `redis://127.0.0.1:6379`;
    if (redisURL) {
      this.redisClient = createClient({ url: redisURL }).on("error", (e) => {
        console.error(`Failed to create the Redis client with error:`);
        console.error(e);
      });

      try {
        await this.redisClient.connect();
        console.log(`Connected to Redis successfully!`);
      } catch (e) {
        console.error(`Connection to Redis failed with error:`);
        console.error(e);
      }
    }
  }

  queryParamsToKey(queryParams) {
    return CryptoJS.MD5(queryParams).toString();
  }

  isRedisWorking() {
    return !!this.redisClient?.isOpen;
  }

  async writeData(key, data, options = this.defaultOptions) {
    if (this.isRedisWorking()) {
      try {
        await this.redisClient.set(key, data, options);
      } catch (e) {
        console.error(`Failed to cache data for key=${key}`, e);
      }
    }
  }

  async readData(key) {
    if (this.isRedisWorking()) {
      return await this.redisClient.get(key);
    }
    return null;
  }

  async deleteData(key) {
    if (this.isRedisWorking()) {
      try {
        await this.redisClient.del(key);
      } catch (e) {
        console.error(`Failed to delete cache for key=${key}`, e);
      }
    }
  }
  async scan(pattern) {
    if (this.isRedisWorking()) {
      let cursor = 0;
      let keys = [];

      do {
        const reply = await this.redisClient.scan(cursor, {
          MATCH: pattern,
        });
        cursor = reply.cursor;
        keys = keys.concat(reply.keys);
      } while (cursor !== 0);

      return keys;
    } else {
      return [];
    }
  }
  async getOrSetCache(key, cb, options = this.defaultOptions) {
    if (this.isRedisWorking()) {
      try {
        const data = await this.readData(key);
        if (data != null) return JSON.parse(data);
        const freshData = await cb();
        await this.writeData(key, JSON.stringify(freshData), options);
        return freshData;
      } catch (error) {
        throw error;
      }
    } else {
      const freshData = await cb();
      return freshData;
    }
  }
}

module.exports = new RedisCache();
