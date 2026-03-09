import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function deleteAdminAndInstructorAccounts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ahadulearning');
    console.log('✅ Connected to database');

    // Simple user schema to access users
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      password: String,
      isApproved: Boolean,
      status: String,
      isVerified: Boolean
    }, { collection: 'users' });

    const User = mongoose.model('DeleteUsers', userSchema);

    // Find all admin and instructor accounts
    const adminAndInstructors = await User.find({
      role: { $in: ['admin', 'instructor'] }
    });

    console.log(`📊 Found ${adminAndInstructors.length} admin/instructor accounts:`);
    
    let deletedCount = 0;
    let protectedCount = 0;

    for (const user of adminAndInstructors) {
      if (user.email === 'birukwagnew13@gmail.com') {
        console.log(`🔒 PROTECTED: ${user.email} (${user.role}) - NOT DELETED`);
        protectedCount++;
      } else {
        await User.deleteOne({ _id: user._id });
        console.log(`🗑️ DELETED: ${user.email} (${user.role})`);
        deletedCount++;
      }
    }

    console.log(`\n📋 Summary:`);
    console.log(`✅ Protected accounts: ${protectedCount}`);
    console.log(`🗑️ Deleted accounts: ${deletedCount}`);
    console.log(`📊 Total processed: ${adminAndInstructors.length}`);

    // Show remaining users
    const remainingUsers = await User.find({
      role: { $in: ['admin', 'instructor'] }
    });
    
    console.log(`\n📋 Remaining admin/instructor accounts:`);
    remainingUsers.forEach(user => {
      console.log(`✅ ${user.email} (${user.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

deleteAdminAndInstructorAccounts();
