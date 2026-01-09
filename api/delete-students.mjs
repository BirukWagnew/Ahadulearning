import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function deleteStudentAccounts() {
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

    const User = mongoose.model('DeleteStudents', userSchema);

    // Find all student accounts
    const students = await User.find({ role: 'student' });

    console.log(`📊 Found ${students.length} student accounts:`);
    
    let deletedCount = 0;

    for (const student of students) {
      await User.deleteOne({ _id: student._id });
      console.log(`🗑️ DELETED: ${student.email} (student)`);
      deletedCount++;
    }

    console.log(`\n📋 Summary:`);
    console.log(`🗑️ Deleted student accounts: ${deletedCount}`);

    // Show remaining users
    const remainingUsers = await User.find({});
    
    console.log(`\n📋 Remaining users:`);
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

deleteStudentAccounts();
