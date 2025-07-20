# JWT Authentication Backend

A secure Node.js authentication API with JWT access and refresh tokens, built with Express.js and MongoDB.

## Features

- 🔐 **JWT Authentication** with access and refresh tokens
- ⏰ **Token Expiration**: Access tokens (15 minutes), Refresh tokens (30 days)
- 🔄 **Token Rotation**: New refresh tokens issued on each refresh
- 🛡️ **Security**: Refresh tokens stored in database for revocation
- 📚 **Swagger Documentation**: Complete API documentation
- 🚀 **Rate Limiting**: Protection against brute force attacks
- 🔒 **Password Hashing**: Secure password storage with bcrypt

## Token Strategy

### Access Token
- **Duration**: 15 minutes
- **Purpose**: Short-lived token for API access
- **Storage**: Client-side (memory/localStorage)
- **Security**: Automatically expires, reducing attack window

### Refresh Token
- **Duration**: 30 days
- **Purpose**: Long-lived token for obtaining new access tokens
- **Storage**: Database + Client-side (httpOnly cookie recommended)
- **Security**: Can be revoked from database

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Login and get tokens | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout and revoke token | No |
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
      "username": "johndoe",
      "email": "user@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Protected Route
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Installation

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
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/auth-app
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
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
node test-jwt.js
```

This will test:
- User registration
- Login with token generation
- Protected route access
- Token refresh
- Logout with token revocation

## Security Features

### Token Management
- **Access tokens** are short-lived (15 minutes) to minimize exposure
- **Refresh tokens** are long-lived (30 days) but can be revoked
- **Token rotation** ensures refresh tokens are replaced on each use
- **Database storage** of refresh tokens allows for revocation

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
  username: String (unique, 3-30 chars),
  email: String (unique, validated),
  password: String (hashed, min 6 chars),
  refreshTokens: [{
    token: String,
    createdAt: Date
  }],
  timestamps: true
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/auth-app` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | `your-access-secret-key-change-in-production` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `your-refresh-secret-key-change-in-production` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## API Documentation

Visit `http://localhost:5000/api-docs` for interactive Swagger documentation.

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
  
  // Store tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  
  return data;
};

// API calls with token
const apiCall = async (url, options = {}) => {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshToken();
    // Retry the original request
    return apiCall(url, options);
  }
  
  return response;
};

// Token refresh
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  // Update stored tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
};
```

## Production Considerations

1. **Change default secrets** in environment variables
2. **Use HTTPS** in production
3. **Implement proper CORS** configuration
4. **Add request logging** and monitoring
5. **Set up database indexes** for performance
6. **Implement token blacklisting** for additional security
7. **Add rate limiting** per user/IP
8. **Use environment-specific** configurations

## License

ISC 