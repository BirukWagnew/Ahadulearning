import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function verifyAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ahadulearning');
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

    const User = mongoose.model('UserVerify', userSchema);

    // Check admin verification status
    const admin = await User.findOne({ email: 'admin@ahadulearning.com' });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.name);
      console.log('🔷 Role:', admin.role);
      console.log('✅ Approved:', admin.isApproved);
      console.log('📊 Status:', admin.status);
      console.log('🔐 Verified:', admin.isVerified);
      
      if (!admin.isVerified) {
        console.log('🔧 Admin user is not verified. Verifying now...');
        admin.isVerified = true;
        await admin.save();
        console.log('✅ Admin user verified successfully!');
      } else {
        console.log('✅ Admin user is already verified');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

verifyAdmin();
