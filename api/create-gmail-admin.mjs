import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createGmailAdmin() {
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

    const User = mongoose.model('GmailAdmin', userSchema);

    // Create admin with Gmail address
    console.log('🔧 Creating admin with Gmail address...');
    const hashedPassword = await bcrypt.hash('GmailAdmin789!@#', 12);
    
    const admin = new User({
      name: 'Gmail Administrator',
      email: 'fidelhub.admin@gmail.com',
      role: 'admin',
      password: hashedPassword,
      isApproved: true,
      status: 'active',
      isVerified: true
    });
    
    await admin.save();
    
    console.log('✅ Gmail admin user created successfully!');
    console.log('📧 Email: fidelhub.admin@gmail.com');
    console.log('🔑 Password: GmailAdmin789!@#');
    console.log('🌐 URL: http://localhost:5173/admin-dashboard');
    
    console.log('\n📝 Instructions:');
    console.log('1. Create a Gmail account: fidelhub.admin@gmail.com');
    console.log('2. Use the password: GmailAdmin789!@#');
    console.log('3. Login to admin dashboard with these credentials');
    console.log('4. You can then approve instructor applications');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

createGmailAdmin();
