// Temporarily comment out dotenv to let docker-compose environment variables take precedence
// require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  mongoURI: process.env.MONGODB_URI,
  
  // Security Configuration
  bcryptRounds: 12,
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: '30d', // 30 days
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
  
  // Rate Limiting
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100
};

module.exports = config; 