import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdmin() {
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
      status: String
    }, { collection: 'users' });

    const User = mongoose.model('UserCheck', userSchema);

    // Check if admin exists
    const admin = await User.findOne({ email: 'admin@ahadulearning.com' });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.name);
      console.log('🔷 Role:', admin.role);
      console.log('✅ Approved:', admin.isApproved);
      console.log('📊 Status:', admin.status);
      console.log('🔐 Password exists:', !!admin.password);
    } else {
      console.log('❌ No admin user found with email: admin@ahadulearning.com');
      
      // List all users to see what exists
      const allUsers = await User.find({});
      console.log('📊 Total users in database:', allUsers.length);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

checkAdmin();
