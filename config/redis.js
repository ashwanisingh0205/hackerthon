const Redis = require('ioredis');

// Simple Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  connectTimeout: 5000,
  lazyConnect: false,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
};

// Create Redis client
let redisClient = null;
let redisAvailable = false;

// Initialize Redis connection
const initRedis = () => {
  try {
    console.log('🔌 Connecting to Redis...');
    console.log('🔌 Redis config:', { host: redisConfig.host, port: redisConfig.port, db: redisConfig.db });
    
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
      console.error('❌ Redis error:', err.message);
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

    // Test connection with ping
    redisClient.ping().then(() => {
      console.log('✅ Redis ping successful');
      redisAvailable = true;
    }).catch((err) => {
      console.error('❌ Redis ping failed:', err.message);
      redisAvailable = false;
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    return null;
  }
};

// Simple Redis utilities
const redisUtils = {
  // Check if Redis is available
  isAvailable() {
    return redisAvailable && redisClient && redisClient.status === 'ready';
  },

  // Get value from cache
  async get(key) {
    try {
      if (this.isAvailable()) {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      }
      return null;
    } catch (error) {
      console.error('Redis GET error:', error.message);
      return null;
    }
  },

  // Set value in cache with expiration
  async set(key, value, expireSeconds = 3600) {
    try {
      if (this.isAvailable()) {
        const serializedValue = JSON.stringify(value);
        if (expireSeconds > 0) {
          await redisClient.setex(key, expireSeconds, serializedValue);
        } else {
          await redisClient.set(key, serializedValue);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redis SET error:', error.message);
      return false;
    }
  },

  // Delete key from cache
  async del(key) {
    try {
      if (this.isAvailable()) {
        await redisClient.del(key);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redis DEL error:', error.message);
      return false;
    }
  },

  // Delete keys matching pattern
  async delPattern(pattern) {
    try {
      if (this.isAvailable()) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redis DELPATTERN error:', error.message);
      return false;
    }
  },

  // Hash operations
  async hset(key, field, value) {
    try {
      if (this.isAvailable()) {
        await redisClient.hset(key, field, JSON.stringify(value));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Redis HSET error:', error.message);
      return false;
    }
  },

  async hincrby(key, field, increment) {
    try {
      if (this.isAvailable()) {
        return await redisClient.hincrby(key, field, increment);
      }
      return 0;
    } catch (error) {
      console.error('Redis HINCRBY error:', error.message);
      return 0;
    }
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
      console.error('Redis close error:', error.message);
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
