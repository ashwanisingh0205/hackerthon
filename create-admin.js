const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const config = require('./config/config');

// Connect to database
const mongoURI = 'mongodb+srv://ashwanikumar13628:Ashwani151717@cluster0.tgfgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Fin-Guard-DB'
});

const createFirstAdmin = async () => {
  try {
    console.log('🔌 Connecting to database...');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.username);
      process.exit(0);
    }

    // Create first admin (super admin)
    const adminData = {
      username: 'superadmin',
      password: 'superadmin123',
      fullName: 'Super Administrator',
      email: 'superadmin@example.com',
      role: 'super_admin',
      permissions: [
        'manage_users',
        'manage_content', 
        'manage_admins',
        'view_analytics',
        'manage_settings'
      ]
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ First admin created successfully!');
    console.log('📋 Admin details:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Email: ${admin.email}`);
    console.log('\n🔑 Use these credentials to login at /api/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run the script
createFirstAdmin();
