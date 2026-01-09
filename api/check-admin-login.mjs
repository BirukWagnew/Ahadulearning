import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/fidelhub');
    console.log('✅ Connected to database');

    // Simple user schema to check admin
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      password: String,
      isApproved: Boolean,
      status: String,
      isVerified: Boolean
    }, { collection: 'users' });

    const User = mongoose.model('CheckAdmin', userSchema);

    // Check admin user
    const admin = await User.findOne({ email: 'birukwagnew13@gmail.com' });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.name);
      console.log('🔷 Role:', admin.role);
      console.log('✅ Approved:', admin.isApproved);
      console.log('📊 Status:', admin.status);
      console.log('🔐 Verified:', admin.isVerified);
      console.log('🔑 Password exists:', !!admin.password);
      
      // Test password comparison
      const isMatch = await bcrypt.compare('BirukAdmin123!@#', admin.password);
      console.log('🔑 Password match:', isMatch);
      
      if (!isMatch) {
        console.log('❌ Password is incorrect! Updating password...');
        const hashedPassword = await bcrypt.hash('BirukAdmin123!@#', 12);
        admin.password = hashedPassword;
        await admin.save();
        console.log('✅ Password updated successfully!');
      }
    } else {
      console.log('❌ Admin user not found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

checkAdminLogin();
