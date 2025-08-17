const Redis = require('ioredis');
require('dotenv').config();

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  showFriendlyErrorStack: process.env.NODE_ENV === 'development',
  // Add connection timeout and retry settings
  connectTimeout: 5000,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100
};

// Create Redis client
let redisClient = null;
let redisAvailable = false;

// Initialize Redis connection
const initRedis = () => {
  try {
    if (!redisClient) {
      redisClient = new Redis(redisConfig);
      
      redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
        redisAvailable = true;
      });
      
      redisClient.on('ready', () => {
        console.log('✅ Redis is ready');
        redisAvailable = true;
      });
      
      redisClient.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
        redisAvailable = false;
      });
      
      redisClient.on('close', () => {
        console.log('🔌 Redis connection closed');
        redisAvailable = false;
      });

      redisClient.on('end', () => {
        console.log('🔌 Redis connection ended');
        redisAvailable = false;
      });

      // Set a timeout for initial connection
      setTimeout(() => {
        if (!redisAvailable) {
          console.log('⚠️ Redis connection timeout - continuing without Redis');
        }
      }, 5000);
    }
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    console.log('⚠️ Continuing without Redis - caching will be disabled');
    return null;
  }
};

// In-memory fallback cache when Redis is not available
const memoryCache = new Map();
const memoryCacheTTL = new Map();

// Clean up expired memory cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of memoryCacheTTL.entries()) {
    if (now > expiry) {
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Redis utility functions with fallback
const redisUtils = {
  // Get value from cache
  async get(key) {
    try {
      if (redisAvailable && redisClient) {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to memory cache
        const cached = memoryCache.get(key);
        if (cached) {
          const expiry = memoryCacheTTL.get(key);
          if (Date.now() < expiry) {
            return cached;
          } else {
            memoryCache.delete(key);
            memoryCacheTTL.delete(key);
          }
        }
        return null;
      }
    } catch (error) {
      console.error('Cache GET error:', error);
      // Fallback to memory cache
      const cached = memoryCache.get(key);
      if (cached) {
        const expiry = memoryCacheTTL.get(key);
        if (Date.now() < expiry) {
          return cached;
        }
      }
      return null;
    }
  },

  // Set value in cache with expiration
  async set(key, value, expireSeconds = 3600) {
    try {
      if (redisAvailable && redisClient) {
        const serializedValue = JSON.stringify(value);
        if (expireSeconds > 0) {
          await redisClient.setex(key, expireSeconds, serializedValue);
        } else {
          await redisClient.set(key, serializedValue);
        }
        return true;
      } else {
        // Fallback to memory cache
        memoryCache.set(key, value);
        if (expireSeconds > 0) {
          memoryCacheTTL.set(key, Date.now() + (expireSeconds * 1000));
        }
        return true;
      }
    } catch (error) {
      console.error('Cache SET error:', error);
      // Fallback to memory cache
      memoryCache.set(key, value);
      if (expireSeconds > 0) {
        memoryCacheTTL.set(key, Date.now() + (expireSeconds * 1000));
      }
      return true;
    }
  },

  // Delete key from cache
  async del(key) {
    try {
      if (redisAvailable && redisClient) {
        await redisClient.del(key);
      }
      // Also clear from memory cache
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
      return true;
    } catch (error) {
      console.error('Cache DEL error:', error);
      // Clear from memory cache
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
      return true;
    }
  },

  // Delete keys matching pattern
  async delPattern(pattern) {
    try {
      if (redisAvailable && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
      // Clear all memory cache (simple fallback)
      memoryCache.clear();
      memoryCacheTTL.clear();
      return true;
    } catch (error) {
      console.error('Cache DELPATTERN error:', error);
      // Clear all memory cache
      memoryCache.clear();
      memoryCacheTTL.clear();
      return true;
    }
  },

  // Hash operations
  async hset(key, field, value) {
    try {
      if (redisAvailable && redisClient) {
        await redisClient.hset(key, field, JSON.stringify(value));
        return true;
      } else {
        // Simple fallback - store as regular key
        const hashKey = `${key}:${field}`;
        memoryCache.set(hashKey, value);
        return true;
      }
    } catch (error) {
      console.error('Cache HSET error:', error);
      const hashKey = `${key}:${field}`;
      memoryCache.set(hashKey, value);
      return true;
    }
  },

  async hincrby(key, field, increment) {
    try {
      if (redisAvailable && redisClient) {
        return await redisClient.hincrby(key, field, increment);
      } else {
        // Simple fallback - increment in memory
        const hashKey = `${key}:${field}`;
        const current = memoryCache.get(hashKey) || 0;
        const newValue = current + increment;
        memoryCache.set(hashKey, newValue);
        return newValue;
      }
    } catch (error) {
      console.error('Cache HINCRBY error:', error);
      const hashKey = `${key}:${field}`;
      const current = memoryCache.get(hashKey) || 0;
      const newValue = current + increment;
      memoryCache.set(hashKey, newValue);
      return newValue;
    }
  },

  // Check if Redis is available
  isAvailable() {
    return redisAvailable && redisClient && redisClient.status === 'ready';
  },

  // Close Redis connection
  async close() {
    try {
      if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        redisAvailable = false;
        console.log('🔌 Redis connection closed gracefully');
      }
    } catch (error) {
      console.error('Redis close error:', error);
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisUtils.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await redisUtils.close();
  process.exit(0);
});

module.exports = {
  redisUtils,
  initRedis
};
