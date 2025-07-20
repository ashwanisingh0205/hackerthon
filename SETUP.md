# Industry-Standard Authentication Backend

A clean, production-ready authentication backend with proper separation of concerns, industry best practices, and comprehensive API documentation.

## 🏗️ Architecture

```
├── config/
│   ├── database.js    # Database connection
│   ├── config.js      # Centralized configuration
│   └── swagger.js     # Swagger documentation config
├── controllers/
│   └── authController.js  # Business logic
├── middleware/
│   └── errorHandler.js    # Error handling
├── models/
│   └── User.js           # Database model
├── routes/
│   └── auth.js           # Route definitions
├── utils/
│   └── asyncHandler.js   # Async error handling
├── app.js                # Main application
└── package.json          # Dependencies
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/auth-app
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB**

4. **Run server:**
   ```bash
   npm run dev
   ```

5. **View API Documentation:**
   - Open your browser and go to: `http://localhost:8000/api-docs`
   - Interactive Swagger UI with full API documentation

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/health` - Health check

### Documentation
- `GET /api-docs` - Interactive API documentation

## 🔧 Features

- ✅ **Separation of Concerns**: Controllers, routes, models separated
- ✅ **Centralized Configuration**: All settings in config files
- ✅ **Error Handling**: Consistent error responses
- ✅ **Security**: Helmet, CORS, rate limiting
- ✅ **Database**: MongoDB with Mongoose
- ✅ **Password Hashing**: bcrypt with configurable rounds
- ✅ **Async Handling**: No try-catch blocks needed
- ✅ **Production Ready**: Environment-based configuration
- ✅ **API Documentation**: Swagger UI with interactive docs
- ✅ **OpenAPI 3.0**: Modern API specification

## 📝 Example Usage

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📚 API Documentation

The API includes comprehensive Swagger documentation:

- **Interactive UI**: Test endpoints directly from the browser
- **Request/Response Examples**: See exact data formats
- **Error Responses**: Understand all possible error cases
- **Schema Definitions**: Clear data models
- **Authentication**: Detailed endpoint descriptions

Visit `http://localhost:5000/api-docs` to explore the full documentation.

## 🛡️ Security Features

- Password hashing with bcrypt
- Input validation
- Rate limiting
- Security headers with Helmet
- CORS protection
- Error handling without exposing internals
- API documentation with security considerations 