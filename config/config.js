require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-app',
  
  // Security Configuration
  bcryptRounds: 12,
  
  // JWT Configuration
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  jwtAccessExpiresIn: '15m', // 15 minutes
  jwtRefreshExpiresIn: '30d', // 30 days
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Rate Limiting
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100
};

module.exports = config; 