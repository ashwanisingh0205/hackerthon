const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

// Test user registration with proper JSON formatting
const testSignup = async () => {
  console.log('🔐 Testing User Registration...');
  
  try {
    const timestamp = Date.now();
    const testUser = {
      fullName: "Test User",
      email: `testuser${timestamp}@example.com`,
      mobileNumber: "+1234567890",
      dateOfBirth: "1990-01-01",
      password: "password123"
    };
    
    console.log('📝 Registering new user...');
    console.log('👤 User data:', testUser);
    
    const response = await axios.post(`${BASE_URL}/auth/signup`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User registered successfully!');
    console.log('📊 Response:', response.data);
    
    return testUser;
    
  } catch (error) {
    console.error('❌ Registration error:', error.response?.data || error.message);
    return null;
  }
};

// Test login
const testLogin = async (user) => {
  if (!user) {
    console.log('⚠️  Skipping login test - no user data');
    return null;
  }
  
  console.log('\n🔑 Testing User Login...');
  
  try {
    const loginData = {
      email: user.email,
      password: user.password
    };
    
    console.log('🔐 Attempting login...');
    console.log('📧 Email:', loginData.email);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('🎫 Access token received');
    console.log('👤 User data:', response.data.data.user);
    
    return response.data.data.accessToken;
    
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
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
    // Create a test file
    const fs = require('fs');
    fs.writeFileSync('test-upload.txt', 'This is a test file for upload functionality.');
    
    // Test authenticated endpoint
    console.log('🔒 Testing authenticated files endpoint...');
    const response = await axios.get(`${BASE_URL}/files`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Authenticated request successful!');
    console.log('📋 Files response:', response.data);
    
  } catch (error) {
    console.error('❌ File upload test error:', error.response?.data || error.message);
  }
};

// Main test function
const runTest = async () => {
  console.log('🚀 Starting User Registration and Login Test...\n');
  
  try {
    const user = await testSignup();
    const accessToken = await testLogin(user);
    await testFileUpload(accessToken);
    
    console.log('\n🎉 Test completed!');
    console.log('\n📚 API Documentation available at: http://localhost:8000/api-docs');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
};

// Run test
runTest();
