const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User.js');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ahadulearning');
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@ahadulearning.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}`);
      console.log(`   isApproved: ${existingAdmin.isApproved}`);
      
      // Check if admin is blocked
      if (existingAdmin.status === 'blocked') {
        console.log('⚠️  Admin user is BLOCKED. Unblocking...');
        existingAdmin.status = 'active';
        await existingAdmin.save();
        console.log('✅ Admin user unblocked successfully');
      }
      
      // Check if admin is approved
      if (!existingAdmin.isApproved) {
        console.log('⚠️  Admin user is not approved. Approving...');
        existingAdmin.isApproved = true;
        await existingAdmin.save();
        console.log('✅ Admin user approved successfully');
      }
      
    } else {
      // Create new admin user
      console.log('🔧 Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
      
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin@ahadulearning.com',
        role: 'admin',
        password: hashedPassword,
        isApproved: true,
        status: 'active'
      });
      
      await adminUser.save();
      
      console.log('✅ Admin user created successfully:');
      console.log(`   Email: admin@ahadulearning.com`);
      console.log(`   Password: Admin123!@#`);
      console.log(`   Role: admin`);
      console.log(`   Status: active`);
      console.log(`   isApproved: true`);
    }

    // List all admin users
    const allAdmins = await User.find({ role: 'admin' });
    console.log(`\n📊 Total admin users: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - Status: ${admin.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdminUser();
