const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:8000/api';

// Test user credentials
const testUser = {
  email: 'testuser2@example.com',
  password: 'password123',
  fullName: 'Test User 2',
  mobileNumber: '+1234567890',
  dateOfBirth: '1990-01-01'
};

let accessToken = '';
let refreshToken = '';

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
    if (headers['Content-Type'] === 'application/json') {
      config.data = data;
    } else {
      config.data = data;
    }
  }
  
  return axios(config);
};

// Test authentication
const testAuth = async () => {
  console.log('🔐 Testing Authentication...');
  
  try {
    // Register new user
    console.log('📝 Registering new user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    console.log('✅ User registered:', registerResponse.data.message);
    
    // Login
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    accessToken = loginResponse.data.data.accessToken;
    refreshToken = loginResponse.data.data.refreshToken;
    console.log('✅ Login successful');
    console.log('👤 User data:', loginResponse.data.data.user);
    
  } catch (error) {
    if (error.response?.data?.error?.includes('Duplicate')) {
      console.log('⚠️  User already exists, trying login...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      accessToken = loginResponse.data.data.accessToken;
      refreshToken = loginResponse.data.data.refreshToken;
      console.log('✅ Login successful');
      console.log('👤 User data:', loginResponse.data.data.user);
    } else {
      console.error('❌ Auth error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Test file upload
const testFileUpload = async () => {
  console.log('\n📁 Testing File Upload...');
  
  try {
    // Create test file
    fs.writeFileSync('test-document.txt', 'This is a test document for file upload functionality.');
    
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
  console.log('\n🎥 Testing Video Upload...');
  
  try {
    // Create a simple test video file (just a text file for testing)
    fs.writeFileSync('test-video.txt', 'This is a test video file content.');
    
    console.log('📤 Uploading test video...');
    const formData = new FormData();
    formData.append('video', fs.createReadStream('test-video.txt'));
    formData.append('title', 'Test Video');
    formData.append('description', 'This is a test video for API testing');
    formData.append('tags', 'test,video,api');
    formData.append('isPublic', 'true');
    
    const uploadResponse = await makeAuthenticatedRequest('POST', '/videos/upload', formData, {
      'Content-Type': 'multipart/form-data'
    });
    
    console.log('✅ Video uploaded successfully');
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

// Test quiz creation and taking
const testQuiz = async () => {
  console.log('\n📝 Testing Quiz System...');
  
  try {
    // Create quiz
    console.log('📝 Creating quiz...');
    const quizData = {
      title: 'JavaScript Basics Test',
      description: 'A test quiz for JavaScript fundamentals',
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
        }
      ],
      timeLimit: 10,
      passingScore: 70,
      category: 'Programming',
      tags: 'javascript,programming,test',
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
    const answers = [0, 3, 3]; // Correct answers for the quiz
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

// Main test function
const runTests = async () => {
  console.log('🚀 Starting API Tests...\n');
  
  try {
    await testHealth();
    await testAuth();
    await testFileUpload();
    await testVideoUpload();
    await testQuiz();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📚 API Documentation available at: http://localhost:8000/api-docs');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
};

// Run tests
runTests();
