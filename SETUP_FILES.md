# File Upload, Video Upload, and Quiz System Setup

This guide will help you set up the file upload, video upload to Cloudinary, and quiz functionality.

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=8000
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/auth_backend

# Cloudinary Configuration (for video uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Cloudinary Setup

1. Sign up for a free Cloudinary account at https://cloudinary.com/
2. Get your Cloud Name, API Key, and API Secret from your dashboard
3. Add these credentials to your `.env` file

## Features Implemented

### 1. File Upload System
- **Local Storage**: Files are stored on the server in organized directories
- **Supported Formats**: Images, videos, audio, documents, and other file types
- **File Management**: Upload, download, update metadata, delete files
- **Search & Filter**: Search by name/description, filter by tags and file type
- **Pagination**: Efficient loading of large file collections

**API Endpoints:**
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files` - Get all files (with pagination and filtering)
- `GET /api/files/:id` - Get single file details
- `GET /api/files/:id/download` - Download file
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete file

### 2. Video Upload System (Cloudinary)
- **Cloud Storage**: Videos uploaded to Cloudinary for optimized streaming
- **Video Processing**: Automatic optimization and format conversion
- **Streaming URLs**: Get optimized streaming URLs for videos
- **Access Control**: Public/private video management
- **View Tracking**: Track video views

**API Endpoints:**
- `POST /api/videos/upload` - Upload video to Cloudinary
- `GET /api/videos` - Get all videos (with pagination and filtering)
- `GET /api/videos/:id` - Get single video details
- `GET /api/videos/:id/stream` - Get video streaming URL
- `PUT /api/videos/:id` - Update video metadata
- `DELETE /api/videos/:id` - Delete video

### 3. Quiz System
- **Quiz Creation**: Create quizzes with multiple choice questions
- **Question Management**: Add questions with options and correct answers
- **Quiz Taking**: Take quizzes and get immediate results
- **Scoring System**: Automatic scoring with pass/fail determination
- **Statistics**: Track attempts and average scores
- **Access Control**: Public/private quiz management

**API Endpoints:**
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes` - Get all quizzes (with pagination and filtering)
- `GET /api/quizzes/:id` - Get quiz for taking (without answers)
- `GET /api/quizzes/:id/answers` - Get quiz with answers (for creator)
- `POST /api/quizzes/:id/submit` - Submit quiz answers and get results
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

## File Structure

```
uploads/
├── images/          # Image files
├── videos/          # Video files (before Cloudinary upload)
├── audio/           # Audio files
├── documents/       # PDF and document files
└── others/          # Other file types
```

## Usage Examples

### Upload a File
```bash
curl -X POST http://localhost:8000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "description=Important document" \
  -F "tags=document,pdf,important"
```

### Upload a Video
```bash
curl -X POST http://localhost:8000/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@sample.mp4" \
  -F "title=Sample Video" \
  -F "description=This is a sample video" \
  -F "tags=sample,video" \
  -F "isPublic=true"
```

### Create a Quiz
```bash
curl -X POST http://localhost:8000/api/quizzes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Basics",
    "description": "Test your JavaScript knowledge",
    "questions": [
      {
        "question": "What is JavaScript?",
        "options": ["A programming language", "A markup language", "A styling language"],
        "correctAnswer": 0,
        "explanation": "JavaScript is a programming language used for web development."
      }
    ],
    "timeLimit": 30,
    "passingScore": 70,
    "category": "Programming",
    "tags": "javascript,programming",
    "isPublic": true
  }'
```

### Take a Quiz
```bash
curl -X POST http://localhost:8000/api/quizzes/QUIZ_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [0, 1, 2]
  }'
```

## Security Features

- **Authentication Required**: All endpoints require valid JWT tokens
- **File Access Control**: Users can only access their own files
- **Video Access Control**: Public/private video management
- **Quiz Access Control**: Public/private quiz management
- **File Type Validation**: Only allowed file types can be uploaded
- **File Size Limits**: Configurable file size limits
- **Rate Limiting**: Prevents abuse of upload endpoints

## Error Handling

The system includes comprehensive error handling for:
- Invalid file types
- File size limits exceeded
- Upload failures
- Access permission violations
- Database errors
- Cloudinary upload failures

## Performance Features

- **Pagination**: Efficient loading of large datasets
- **File Organization**: Automatic organization by file type
- **Cloudinary Optimization**: Automatic video optimization
- **Database Indexing**: Optimized queries with proper indexing
- **Error Recovery**: Graceful handling of upload failures
