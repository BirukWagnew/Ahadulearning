import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createSecondAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/fidelhub');
    console.log('✅ Connected to database');

    // Simple user schema for admin creation
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      password: String,
      isApproved: Boolean,
      status: String,
      isVerified: Boolean
    }, { collection: 'users' });

    const User = mongoose.model('SecondAdmin', userSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin2@fidelhub.com' });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists:');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔷 Role:', existingAdmin.role);
      console.log('✅ Approved:', existingAdmin.isApproved);
      console.log('📊 Status:', existingAdmin.status);
      console.log('🔐 Verified:', existingAdmin.isVerified);
    } else {
      // Create second admin user
      console.log('🔧 Creating second admin user...');
      const hashedPassword = await bcrypt.hash('Admin456!@#', 12);
      
      const admin = new User({
        name: 'Secondary Administrator',
        email: 'admin2@fidelhub.com',
        role: 'admin',
        password: hashedPassword,
        isApproved: true,
        status: 'active',
        isVerified: true
      });
      
      await admin.save();
      
      console.log('✅ Second admin user created successfully!');
      console.log('📧 Email: admin2@fidelhub.com');
      console.log('🔑 Password: Admin456!@#');
      console.log('🌐 URL: http://localhost:5173/admin-dashboard');
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
    console.log('🔌 Disconnected from database');
  }
}

createSecondAdmin();
