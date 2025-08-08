const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
  console.log('🔧 Fixing Database Indexes...');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Drop the problematic index
    console.log('🗑️  Dropping old username index...');
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('✅ Old username index dropped successfully');
    } catch (error) {
      console.log('ℹ️  Username index not found or already dropped');
    }
    
    // Create new indexes for the current schema
    console.log('🔨 Creating new indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Email index created');
    
    // Update existing users to have fullName if they don't have it
    console.log('👥 Updating existing users...');
    const result = await db.collection('users').updateMany(
      { fullName: { $exists: false } },
      { $set: { fullName: 'User' } }
    );
    console.log(`✅ Updated ${result.modifiedCount} users`);
    
    console.log('🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
};

fixDatabase();
