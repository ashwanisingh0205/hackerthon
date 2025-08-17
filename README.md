# JWT Authentication Backend

A secure Node.js authentication API with JWT tokens, built with Express.js and MongoDB. Now with Docker support!

## Features

- 🔐 **JWT Authentication** with 30-day token expiration
- 🐳 **Docker Support** with development and production configurations
- 📚 **Swagger Documentation**: Complete API documentation
- 🚀 **Rate Limiting**: Protection against brute force attacks
- 🔒 **Password Hashing**: Secure password storage with bcrypt
- 🛡️ **Security**: Simplified token management without refresh tokens

## Token Strategy

### JWT Token
- **Duration**: 30 days
- **Purpose**: Long-lived token for API access
- **Storage**: Client-side (localStorage/sessionStorage)
- **Security**: Stateless authentication, no server-side storage needed

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| POST | `/api/auth/logout` | Logout (client-side) | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Request/Response Examples

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Protected Route
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Quick Start with Docker

### Development Environment

1. **Start the application with MongoDB and Redis:**
   ```bash
   npm run docker:compose:build
   ```

2. **Access the application:**
   - Backend API: http://localhost:8000
   - Swagger Documentation: http://localhost:8000/api-docs
   - MongoDB: localhost:27017
   - Redis: localhost:6379

3. **Stop the application:**
   ```bash
   npm run docker:compose:down
   ```

### Redis Configuration (Optional)

The application includes Redis for caching learning content and categories. Redis is **optional** - the app will work without it using in-memory fallback caching.

**With Redis (recommended for production):**
- Faster caching performance
- Persistent cache across app restarts
- Better memory management

**Without Redis:**
- In-memory caching (cleared on app restart)
- No additional infrastructure required
- Suitable for development/testing

**Environment Variables:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Production Environment

1. **Set up environment variables:**
   Create a `.env` file:
   ```env
   JWT_SECRET=your-super-secure-jwt-secret-key
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

2. **Start the production application:**
   ```bash
   npm run docker:compose:prod:build
   ```

## Manual Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/auth-app
   JWT_SECRET=your-super-secret-key-change-in-production
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Testing

Run the included test script to verify JWT functionality:

```bash
node test-auth.js
```

This will test:
- User registration
- Login with token generation
- Protected route access
- Logout functionality

## Security Features

### Token Management
- **JWT tokens** are long-lived (30 days) for simplicity
- **Stateless authentication** - no server-side token storage
- **Secure token generation** with strong secrets

### Password Security
- **bcrypt hashing** with 12 rounds of salt
- **Minimum password length** of 6 characters
- **Email validation** with regex pattern

### API Security
- **Rate limiting** to prevent brute force attacks
- **CORS protection** with configurable origins
- **Helmet.js** for security headers
- **Input validation** on all endpoints

## Database Schema

### User Model
```javascript
{
  fullName: String (max 100 chars),
  email: String (unique, validated),
  mobileNumber: String (optional),
  dateOfBirth: Date (optional),
  password: String (hashed, min 6 chars),
  timestamps: true
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8000 |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/auth-app` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key-change-in-production` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## API Documentation

Visit `http://localhost:8000/api-docs` for interactive Swagger documentation.

## Client Integration

### Frontend Implementation

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Store token
  localStorage.setItem('token', data.data.token);
  
  return data;
};

// API calls with token
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return response;
};

// Logout
const logout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  localStorage.removeItem('token');
  window.location.href = '/login';
};
```

## Docker Commands

### Development
```bash
# Start with rebuild
npm run docker:compose:build

# Start without rebuild
npm run docker:compose

# Stop services
npm run docker:compose:down
```

### Production
```bash
# Start production environment
npm run docker:compose:prod:build

# View logs
docker-compose logs -f
```

## Production Considerations

1. **Change default secrets** in environment variables
2. **Use HTTPS** in production
3. **Implement proper CORS** configuration
4. **Add request logging** and monitoring
5. **Set up database indexes** for performance
6. **Use managed MongoDB** service in production
7. **Add rate limiting** per user/IP
8. **Use environment-specific** configurations

## License

ISC 