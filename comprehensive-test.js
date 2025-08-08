const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:8000/api';

let accessToken = '';

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null, headers = {}) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...headers
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test authentication
const testAuth = async () => {
  console.log('🔐 Testing Authentication...');
  
  try {
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Comprehensive Test User',
      email: `comprehensive${timestamp}@example.com`,
      mobileNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      password: 'password123'
    };
    
    console.log('📝 Registering new user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    console.log('✅ User registered:', registerResponse.data.message);
    
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    accessToken = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    console.log('👤 User data:', loginResponse.data.data.user);
    
  } catch (error) {
    console.error('❌ Auth error:', error.response?.data || error.message);
    throw error;
  }
};

// Test file upload
const testFileUpload = async () => {
  console.log('\n📁 Testing File Upload System...');
  
  try {
    // Create test files
    fs.writeFileSync('test-document.txt', 'This is a test document for file upload functionality.');
    fs.writeFileSync('test-image.txt', 'This is a test image file content.');
    
    // Upload single file
    console.log('📤 Uploading single file...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-document.txt'));
    formData.append('description', 'Test document for API testing');
    formData.append('tags', 'test,document,api');
    
    const uploadResponse = await makeAuthenticatedRequest('POST', '/files/upload', formData, {
      'Content-Type': 'multipart/form-data'
    });
    
    console.log('✅ File uploaded successfully');
    console.log('📄 File data:', uploadResponse.data.data);
    
    // Upload multiple files
    console.log('📤 Uploading multiple files...');
    const multiFormData = new FormData();
    multiFormData.append('files', fs.createReadStream('test-document.txt'));
    multiFormData.append('files', fs.createReadStream('test-image.txt'));
    multiFormData.append('description', 'Multiple test files');
    multiFormData.append('tags', 'test,multiple,files');
    
    const multiUploadResponse = await makeAuthenticatedRequest('POST', '/files/upload-multiple', multiFormData, {
      'Content-Type': 'multipart/form-data'
    });
    
    console.log('✅ Multiple files uploaded successfully');
    console.log('📄 Files uploaded:', multiUploadResponse.data.data.length);
    
    // Get all files
    console.log('📋 Getting all files...');
    const filesResponse = await makeAuthenticatedRequest('GET', '/files');
    console.log('✅ Files retrieved:', filesResponse.data.data.files.length, 'files');
    
    return uploadResponse.data.data.id;
    
  } catch (error) {
    console.error('❌ File upload error:', error.response?.data || error.message);
    throw error;
  }
};

// Test video upload
const testVideoUpload = async () => {
  console.log('\n🎥 Testing Video Upload System...');
  
  try {
    // Create a test video file
    fs.writeFileSync('test-video.txt', 'This is a test video file content for Cloudinary upload.');
    
    console.log('📤 Uploading test video to Cloudinary...');
    const formData = new FormData();
    formData.append('video', fs.createReadStream('test-video.txt'));
    formData.append('title', 'Test Video for Cloudinary');
    formData.append('description', 'This is a test video uploaded to Cloudinary');
    formData.append('tags', 'test,video,cloudinary');
    formData.append('isPublic', 'true');
    
    const uploadResponse = await makeAuthenticatedRequest('POST', '/videos/upload', formData, {
      'Content-Type': 'multipart/form-data'
    });
    
    console.log('✅ Video uploaded successfully to Cloudinary');
    console.log('🎬 Video data:', uploadResponse.data.data);
    
    // Get all videos
    console.log('📋 Getting all videos...');
    const videosResponse = await makeAuthenticatedRequest('GET', '/videos');
    console.log('✅ Videos retrieved:', videosResponse.data.data.videos.length, 'videos');
    
    return uploadResponse.data.data.id;
    
  } catch (error) {
    console.error('❌ Video upload error:', error.response?.data || error.message);
    throw error;
  }
};

// Test quiz system
const testQuiz = async () => {
  console.log('\n📝 Testing Quiz System...');
  
  try {
    // Create quiz
    console.log('📝 Creating comprehensive quiz...');
    const quizData = {
      title: 'Comprehensive JavaScript Test',
      description: 'A comprehensive test quiz for JavaScript fundamentals',
      questions: [
        {
          question: 'What is JavaScript?',
          options: ['A programming language', 'A markup language', 'A styling language', 'A database'],
          correctAnswer: 0,
          explanation: 'JavaScript is a programming language used for web development.'
        },
        {
          question: 'Which of the following is NOT a JavaScript data type?',
          options: ['String', 'Number', 'Boolean', 'Float'],
          correctAnswer: 3,
          explanation: 'Float is not a JavaScript data type. JavaScript has Number which includes both integers and floating-point numbers.'
        },
        {
          question: 'How do you declare a variable in JavaScript?',
          options: ['var', 'let', 'const', 'All of the above'],
          correctAnswer: 3,
          explanation: 'JavaScript has three ways to declare variables: var, let, and const.'
        },
        {
          question: 'What is the result of 2 + "2" in JavaScript?',
          options: ['4', '22', 'NaN', 'Error'],
          correctAnswer: 1,
          explanation: 'JavaScript performs type coercion, converting the number to a string and concatenating them.'
        }
      ],
      timeLimit: 15,
      passingScore: 75,
      category: 'Programming',
      tags: 'javascript,programming,comprehensive',
      isPublic: true
    };
    
    const createResponse = await makeAuthenticatedRequest('POST', '/quizzes', quizData, {
      'Content-Type': 'application/json'
    });
    
    console.log('✅ Quiz created successfully');
    console.log('📊 Quiz data:', createResponse.data.data);
    
    const quizId = createResponse.data.data.id;
    
    // Get quiz for taking
    console.log('📖 Getting quiz for taking...');
    const getQuizResponse = await makeAuthenticatedRequest('GET', `/quizzes/${quizId}`);
    console.log('✅ Quiz retrieved for taking');
    console.log('❓ Questions:', getQuizResponse.data.data.questions.length);
    
    // Submit quiz answers
    console.log('📝 Submitting quiz answers...');
    const answers = [0, 3, 3, 1]; // Correct answers for the quiz
    const submitResponse = await makeAuthenticatedRequest('POST', `/quizzes/${quizId}/submit`, {
      answers: answers
    }, {
      'Content-Type': 'application/json'
    });
    
    console.log('✅ Quiz submitted successfully');
    console.log('📊 Results:', submitResponse.data.data);
    
    // Get quiz with answers (for creator)
    console.log('📋 Getting quiz with answers...');
    const answersResponse = await makeAuthenticatedRequest('GET', `/quizzes/${quizId}/answers`);
    console.log('✅ Quiz with answers retrieved');
    console.log('📊 Quiz statistics:', {
      attempts: answersResponse.data.data.attempts,
      averageScore: answersResponse.data.data.averageScore
    });
    
  } catch (error) {
    console.error('❌ Quiz error:', error.response?.data || error.message);
    throw error;
  }
};

// Test health endpoint
const testHealth = async () => {
  console.log('\n🏥 Testing Health Endpoint...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log('📊 Server info:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
  }
};

// Clean up test files
const cleanup = () => {
  console.log('\n🧹 Cleaning up test files...');
  const filesToDelete = [
    'test-document.txt',
    'test-image.txt',
    'test-video.txt',
    'test-file.txt',
    'test-upload.txt'
  ];
  
  filesToDelete.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️  Deleted ${file}`);
    }
  });
  
  console.log('✅ Cleanup completed');
};

// Main test function
const runComprehensiveTests = async () => {
  console.log('🚀 Starting Comprehensive API Tests...\n');
  
  try {
    await testHealth();
    await testAuth();
    await testFileUpload();
    await testVideoUpload();
    await testQuiz();
    
    console.log('\n🎉 All comprehensive tests completed successfully!');
    console.log('\n📚 API Documentation available at: http://localhost:8000/api-docs');
    console.log('\n🔗 Test your API endpoints:');
    console.log('   - File Upload: POST /api/files/upload');
    console.log('   - Video Upload: POST /api/videos/upload');
    console.log('   - Quiz Creation: POST /api/quizzes');
    console.log('   - Quiz Taking: GET /api/quizzes/:id');
    console.log('   - Quiz Submission: POST /api/quizzes/:id/submit');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  } finally {
    cleanup();
  }
};

// Run tests
runComprehensiveTests();
