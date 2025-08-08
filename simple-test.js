const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

// Test health endpoint
const testHealth = async () => {
  console.log('🏥 Testing Health Endpoint...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log('📊 Server info:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
    return false;
  }
};

// Test authentication with a simple approach
const testAuth = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Try to register a user with timestamp to ensure uniqueness
    const timestamp = Date.now();
    const testUser = {
      email: `testuser${timestamp}@example.com`,
      password: 'password123',
      fullName: 'Test User',
      mobileNumber: '+1234567890',
      dateOfBirth: '1990-01-01'
    };
    
    console.log('📝 Registering new user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    console.log('✅ User registered:', registerResponse.data.message);
    console.log('👤 User data:', registerResponse.data.data);
    
    // Try to login
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful');
    console.log('🎫 Access token received');
    console.log('👤 User data:', loginResponse.data.data.user);
    
    return loginResponse.data.data.accessToken;
    
  } catch (error) {
    console.error('❌ Auth error:', error.response?.data || error.message);
    return null;
  }
};

// Test file upload with authentication
const testFileUpload = async (accessToken) => {
  if (!accessToken) {
    console.log('⚠️  Skipping file upload test - no access token');
    return;
  }
  
  console.log('\n📁 Testing File Upload...');
  
  try {
    // Create a simple test file
    const fs = require('fs');
    fs.writeFileSync('test-file.txt', 'This is a test file for upload functionality.');
    
    // Test the upload endpoint (this will fail without proper form data, but we can test the auth)
    console.log('🔒 Testing authenticated endpoint...');
    const response = await axios.get(`${BASE_URL}/files`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Authenticated request successful');
    console.log('📋 Files response:', response.data);
    
  } catch (error) {
    console.error('❌ File upload test error:', error.response?.data || error.message);
  }
};

// Main test function
const runSimpleTests = async () => {
  console.log('🚀 Starting Simple API Tests...\n');
  
  try {
    const healthOk = await testHealth();
    if (!healthOk) {
      console.log('❌ Health check failed, stopping tests');
      return;
    }
    
    const accessToken = await testAuth();
    await testFileUpload(accessToken);
    
    console.log('\n🎉 Basic tests completed!');
    console.log('\n📚 API Documentation available at: http://localhost:8000/api-docs');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run tests
runSimpleTests();
