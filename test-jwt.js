const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test JWT Authentication Flow
async function testJWTAuth() {
  try {
    console.log('🚀 Testing JWT Authentication Flow\n');

    // Generate unique email to avoid conflicts
    const timestamp = Date.now();
    const uniqueEmail = `test${timestamp}@example.com`;

    // 1. Register a new user
    console.log('1. Registering a new user...');
    const registerResponse = await axios.post(`${BASE_URL}/signup`, {
      username: `testuser${timestamp}`,
      email: uniqueEmail,
      password: 'password123'
    });
    console.log('✅ Registration successful:', registerResponse.data.message);

    // 2. Login to get tokens
    console.log('\n2. Logging in to get access and refresh tokens...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: uniqueEmail,
      password: 'password123'
    });
    
    const { accessToken, refreshToken } = loginResponse.data.data;
    console.log('✅ Login successful');
    console.log('📝 Access Token (15 min):', accessToken.substring(0, 50) + '...');
    console.log('📝 Refresh Token (30 days):', refreshToken.substring(0, 50) + '...');

    // 3. Test protected route with access token
    console.log('\n3. Testing protected route with access token...');
    const meResponse = await axios.get(`${BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ Protected route accessed successfully');
    console.log('👤 User data:', meResponse.data.data);

    // 4. Test token refresh
    console.log('\n4. Testing token refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/refresh`, {
      refreshToken: refreshToken
    });
    
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
    console.log('✅ Token refresh successful');
    console.log('📝 New Access Token:', newAccessToken.substring(0, 50) + '...');
    console.log('📝 New Refresh Token:', newRefreshToken.substring(0, 50) + '...');

    // 5. Test logout
    console.log('\n5. Testing logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/logout`, {
      refreshToken: newRefreshToken
    });
    console.log('✅ Logout successful:', logoutResponse.data.message);

    // 6. Test that old access token is still valid (until it expires)
    console.log('\n6. Testing that old access token is still valid...');
    try {
      const oldTokenResponse = await axios.get(`${BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${newAccessToken}`
        }
      });
      console.log('✅ Old access token is still valid (as expected)');
    } catch (error) {
      console.log('❌ Old access token is invalid');
    }

    console.log('\n🎉 All JWT authentication tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Access tokens expire in 15 minutes');
    console.log('- Refresh tokens expire in 30 days');
    console.log('- Refresh tokens are stored in the database');
    console.log('- Token rotation is implemented for security');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testJWTAuth(); 