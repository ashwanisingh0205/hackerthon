const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkDatabase = async () => {
  console.log('🔍 Checking Database Connection...');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');
    
    // Check if we can access the User model
    console.log('📊 Checking User model...');
    const userCount = await User.countDocuments();
    console.log('👥 Total users in database:', userCount);
    
    // Try to find existing users
    const users = await User.find().limit(5);
    console.log('📋 Sample users:', users.map(u => ({
      id: u._id,
      email: u.email,
      fullName: u.fullName,
      createdAt: u.createdAt
    })));
    
    // Test creating a user
    console.log('🧪 Testing user creation...');
    const testUser = new User({
      fullName: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('🆔 Test user ID:', testUser._id);
    
    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('🧹 Test user cleaned up');
    
    console.log('🎉 Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
};

checkDatabase();
