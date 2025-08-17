const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8000/api';
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

// Test data
const testFinanceData = {
  title: "Test Finance Basics Content",
  description: "This is a test finance basics content for debugging",
  videoUrl: "https://example.com/test-video.mp4",
  videoTitle: "Test Video Title",
  videoDescription: "Test video description",
  difficulty: "beginner",
  estimatedTime: 30,
  tags: ["test", "debug", "finance"],
  prerequisites: ["Basic knowledge"],
  learningObjectives: ["Learn debugging"]
};

// Test functions
const testCreateFinanceBasics = async () => {
  try {
    console.log('🧪 Testing POST /api/financial/finance-basics...');
    
    const response = await axios.post(`${BASE_URL}/financial/finance-basics`, testFinanceData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST successful:', response.status);
    console.log('📝 Response data:', response.data);
    
    return response.data.data._id; // Return the created content ID
  } catch (error) {
    console.error('❌ POST failed:', error.response?.data || error.message);
    return null;
  }
};

const testGetFinanceBasics = async () => {
  try {
    console.log('\n🧪 Testing GET /api/financial/finance-basics...');
    
    const response = await axios.get(`${BASE_URL}/financial/finance-basics`, {
      params: {
        page: 1,
        limit: 10,

      }
    });
    
    console.log('✅ GET successful:', response.status);
    console.log('📝 Response data:', response.data);
    console.log(`📊 Found ${response.data.data.content.length} content items`);
    
    return response.data.data.content;
  } catch (error) {
    console.error('❌ GET failed:', error.response?.data || error.message);
    return [];
  }
};

const testDebugEndpoint = async () => {
  try {
    console.log('\n🧪 Testing GET /api/financial/finance-basics/debug...');
    
    const response = await axios.get(`${BASE_URL}/financial/finance-basics/debug`);
    
    console.log('✅ Debug endpoint successful:', response.status);
    console.log('📝 Response data:', response.data);
    console.log(`📊 Total content in database: ${response.data.totalCount}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Debug endpoint failed:', error.response?.data || error.message);
    return [];
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Finance API Debug Tests...\n');
  
  // Test 1: Create content
  const createdId = await testCreateFinanceBasics();
  
  if (createdId) {
    console.log(`\n✅ Content created with ID: ${createdId}`);
    
    // Wait a bit for database to sync
    console.log('⏳ Waiting 2 seconds for database sync...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Get content (filtered)
    const filteredContent = await testGetFinanceBasics();
    
    // Test 3: Get content (unfiltered - debug)
    const allContent = await testDebugEndpoint();
    
    // Analysis
    console.log('\n📊 ANALYSIS:');
    console.log(`- Content created: ${createdId ? 'YES' : 'NO'}`);
    console.log(`- Filtered GET found: ${filteredContent.length} items`);
    console.log(`- Debug endpoint found: ${allContent.length} items`);
    
    if (filteredContent.length === 0 && allContent.length > 0) {
      console.log('\n🔍 ISSUE IDENTIFIED:');
      console.log('Content exists in database but GET endpoint is not returning it.');
      console.log('This suggests a filtering issue (isPublished, difficulty, etc.)');
    } else if (allContent.length === 0) {
      console.log('\n🔍 ISSUE IDENTIFIED:');
      console.log('No content found in database. Check if data is actually being saved.');
    } else {
      console.log('\n✅ Everything working correctly!');
    }
  } else {
    console.log('\n❌ Cannot proceed with tests - content creation failed');
  }
};

// Check if axios is available
try {
  require('axios');
  runTests();
} catch (error) {
  console.log('❌ Axios not available. Install it with: npm install axios');
  console.log('Or run the tests manually using Postman/curl');
  
  console.log('\n📋 MANUAL TESTING INSTRUCTIONS:');
  console.log('1. POST to: http://localhost:8000/api/financial/finance-basics');
  console.log('2. GET from: http://localhost:8000/api/financial/finance-basics');
  console.log('3. Debug endpoint: http://localhost:8000/api/financial/finance-basics/debug');
  console.log('\n📝 Sample POST data:');
  console.log(JSON.stringify(testFinanceData, null, 2));
}
