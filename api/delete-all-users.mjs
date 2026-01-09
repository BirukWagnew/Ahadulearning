import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function deleteAllUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/fidelhub');
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

    const User = mongoose.model('DeleteAllUsers', userSchema);

    // Find all users
    const allUsers = await User.find({});
    
    console.log(`📊 Found ${allUsers.length} users in database:`);
    
    let deletedCount = 0;

    for (const user of allUsers) {
      await User.deleteOne({ _id: user._id });
      console.log(`🗑️ DELETED: ${user.email} (${user.role})`);
      deletedCount++;
    }

    console.log(`\n📋 Summary:`);
    console.log(`🗑️ Deleted users: ${deletedCount}`);
    console.log(`📊 Total processed: ${allUsers.length}`);

    // Verify all users are deleted
    const remainingUsers = await User.find({});
    
    if (remainingUsers.length === 0) {
      console.log(`\n✅ SUCCESS: All users have been deleted!`);
      console.log(`📊 Remaining users: ${remainingUsers.length}`);
    } else {
      console.log(`\n⚠️ WARNING: ${remainingUsers.length} users still remain:`);
      remainingUsers.forEach(user => {
        console.log(`❌ ${user.email} (${user.role})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

deleteAllUsers();
