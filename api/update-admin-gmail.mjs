import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function updateAdminToGmail() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ahadulearning');
    console.log('✅ Connected to database');

    // Simple user schema for admin update
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      password: String,
      isApproved: Boolean,
      status: String,
      isVerified: Boolean
    }, { collection: 'users' });

    const User = mongoose.model('UpdateAdmin', userSchema);

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'birukwagnew13@gmail.com' });
    
    if (existingUser) {
      console.log('ℹ️ User already exists with email: birukwagnew13@gmail.com');
      console.log('👤 Name:', existingUser.name);
      console.log('🔷 Current Role:', existingUser.role);
      
      // Update existing user to admin role
      if (existingUser.role !== 'admin') {
        console.log('🔧 Updating user role to admin...');
        existingUser.role = 'admin';
        existingUser.isApproved = true;
        existingUser.status = 'active';
        existingUser.isVerified = true;
        await existingUser.save();
        console.log('✅ User updated to admin successfully!');
      }
    } else {
      // Create new admin with your Gmail
      console.log('🔧 Creating admin with your Gmail address...');
      const hashedPassword = await bcrypt.hash('BirukAdmin123!@#', 12);
      
      const admin = new User({
        name: 'Biruk Administrator',
        email: 'birukwagnew13@gmail.com',
        role: 'admin',
        password: hashedPassword,
        isApproved: true,
        status: 'active',
        isVerified: true
      });
      
      await admin.save();
      console.log('✅ Admin user created with your Gmail!');
    }
    
    console.log('\n🎯 Admin Credentials:');
    console.log('📧 Email: birukwagnew13@gmail.com');
    console.log('🔑 Password: BirukAdmin123!@#');
    console.log('🌐 Dashboard: http://localhost:5173/admin-dashboard');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Go to: http://localhost:5173/login');
    console.log('2. Login with: birukwagnew13@gmail.com');
    console.log('3. Password: BirukAdmin123!@#');
    console.log('4. Access admin dashboard to approve instructors');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

updateAdminToGmail();
