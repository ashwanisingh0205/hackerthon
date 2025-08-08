# Docker Setup for Authentication Backend

This document provides instructions for running the authentication backend using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Development Environment

1. **Start the application with MongoDB:**
   ```bash
   npm run docker:compose:build
   ```

2. **Access the application:**
   - Backend API: http://localhost:8000
   - Swagger Documentation: http://localhost:8000/api-docs
   - MongoDB: localhost:27017

3. **Stop the application:**
   ```bash
   npm run docker:compose:down
   ```

### Production Environment

1. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your-super-secure-jwt-secret-key
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

2. **Start the production application:**
   ```bash
   npm run docker:compose:prod:build
   ```

## Manual Docker Commands

### Build and Run Individual Containers

1. **Build the Docker image:**
   ```bash
   npm run docker:build
   ```

2. **Run the container:**
   ```bash
   npm run docker:run
   ```

### Docker Compose Commands

1. **Start services:**
   ```bash
   docker-compose up
   ```

2. **Start services in detached mode:**
   ```bash
   docker-compose up -d
   ```

3. **Rebuild and start services:**
   ```bash
   docker-compose up --build
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Environment Variables

### Development
- `NODE_ENV=development`
- `PORT=8000`
- `MONGODB_URI=mongodb://mongo:27017/auth-app`
- `JWT_SECRET=your-secret-key-change-in-production`
- `CORS_ORIGIN=http://localhost:3000`

### Production
- `NODE_ENV=production`
- `PORT=8000`
- `MONGODB_URI=mongodb://mongo:27017/auth-app`
- `JWT_SECRET=${JWT_SECRET}` (from .env file)
- `CORS_ORIGIN=${CORS_ORIGIN}` (from .env file)

## Volumes

- **MongoDB Data:** `mongodb_data` - Persists MongoDB data
- **Uploads:** `./uploads:/app/uploads` - Maps local uploads directory to container

## Ports

- **Backend API:** 8000
- **MongoDB:** 27017

## Security Notes

1. **JWT Secret:** Always use a strong, unique JWT secret in production
2. **Environment Variables:** Never commit sensitive environment variables to version control
3. **CORS:** Configure CORS origin properly for your frontend domain
4. **MongoDB:** In production, consider using a managed MongoDB service instead of the containerized version

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :8000
   # Kill the process or change the port in docker-compose.yml
   ```

2. **MongoDB connection issues:**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongo
   ```

3. **Permission issues with uploads:**
   ```bash
   # Ensure uploads directory exists and has proper permissions
   mkdir -p uploads/others
   chmod 755 uploads
   ```

### Useful Commands

```bash
# View running containers
docker ps

# View container logs
docker logs <container_id>

# Access container shell
docker exec -it <container_id> sh

# Remove all containers and volumes
docker-compose down -v

# Clean up unused Docker resources
docker system prune -a
```
