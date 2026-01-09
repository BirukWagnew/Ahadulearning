const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple admin user creation
async function createAdmin() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/fidelhub');
    console.log('✅ Connected to database');

    // Define user schema inline
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      password: String,
      isApproved: Boolean,
      status: String
    });

    const User = mongoose.model('User', userSchema);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@fidelhub.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Status:', existingAdmin.status);
      console.log('Approved:', existingAdmin.isApproved);
      
      // Update admin if needed
      if (existingAdmin.status === 'blocked') {
        existingAdmin.status = 'active';
        await existingAdmin.save();
        console.log('✅ Admin unblocked');
      }
      
      if (!existingAdmin.isApproved) {
        existingAdmin.isApproved = true;
        await existingAdmin.save();
        console.log('✅ Admin approved');
      }
    } else {
      // Create new admin
      console.log('🔧 Creating new admin user...');
      const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
      
      const admin = new User({
        name: 'System Administrator',
        email: 'admin@fidelhub.com',
        role: 'admin',
        password: hashedPassword,
        isApproved: true,
        status: 'active'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@fidelhub.com');
      console.log('Password: Admin123!@#');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

createAdmin();
