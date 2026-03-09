import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ahadulearning');
    console.log('✅ Connected to database');

    // Simple user schema to check all users
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      status: String,
      isApproved: Boolean,
      createdAt: Date
    }, { collection: 'users' });

    const User = mongoose.model('CheckUsers', userSchema);

    // Get all users
    const allUsers = await User.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Status: ${user.status}`);
      console.log(`      Approved: ${user.isApproved}`);
      console.log(`      Created: ${user.createdAt}`);
      console.log('');
    });

    // Count by role
    const students = await User.countDocuments({ role: 'student' });
    const instructors = await User.countDocuments({ role: 'instructor' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    console.log('📈 User Statistics:');
    console.log(`   Students: ${students}`);
    console.log(`   Instructors: ${instructors}`);
    console.log(`   Admins: ${admins}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

checkAllUsers();
