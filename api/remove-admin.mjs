import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function removeAdmin() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/ahadulearning');
    console.log('✅ Connected to database');

    // Import User model
    const User = (await import('./models/User.js')).default;

    // Find and delete admin user
    const adminUser = await User.findOne({ email: 'admin@ahadulearning.com' });
    
    if (adminUser) {
      console.log('👤 Found admin user:', adminUser.email);
      console.log('🗑️ Deleting admin user...');
      
      await User.deleteOne({ email: 'admin@ahadulearning.com' });
      console.log('✅ Admin user deleted successfully!');
      console.log('🔄 Admin page is now back to normal');
    } else {
      console.log('ℹ️ No admin user found with email: admin@ahadulearning.com');
    }

    // Show remaining users
    const allUsers = await User.find({});
    console.log(`\n📊 Total users remaining: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

removeAdmin();
