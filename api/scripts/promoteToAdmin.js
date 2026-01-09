import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const promoteToAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the user by email
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      return;
    }
    
    console.log(`📋 Found user:`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Current Status: ${user.status}`);
    console.log(`   Is Approved: ${user.isApproved}`);
    
    // Check if user is already an admin
    if (user.role === 'admin') {
      console.log(`ℹ️  User "${email}" is already an admin`);
      await mongoose.connection.close();
      return;
    }
    
    // Update the user to admin
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        role: 'admin',
        status: 'active',
        isApproved: true
      },
      { new: true }
    );
    
    console.log(`✅ Successfully promoted "${email}" to admin!`);
    console.log(`📋 Updated user info:`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`   New Status: ${updatedUser.status}`);
    console.log(`   Is Approved: ${updatedUser.isApproved}`);
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// List all instructors first
const listInstructors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const instructors = await User.find({ role: 'instructor' })
      .select('name email _id status isApproved createdAt')
      .sort({ createdAt: -1 });
    
    if (instructors.length === 0) {
      console.log('❌ No instructors found in the database');
    } else {
      console.log(`📋 Found ${instructors.length} instructor(s):`);
      console.log('');
      instructors.forEach((instructor, index) => {
        console.log(`${index + 1}. ${instructor.name}`);
        console.log(`   Email: ${instructor.email}`);
        console.log(`   ID: ${instructor._id}`);
        console.log(`   Status: ${instructor.status}`);
        console.log(`   Approved: ${instructor.isApproved}`);
        console.log(`   Created: ${instructor.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Command line usage
const command = process.argv[2];
const email = process.argv[3];

if (command === 'list') {
  listInstructors();
} else if (command === 'promote' && email) {
  promoteToAdmin(email);
} else {
  console.log('Usage:');
  console.log('  node promoteToAdmin.js list                    # List all instructors');
  console.log('  node promoteToAdmin.js promote <email>          # Promote instructor to admin');
  console.log('');
  console.log('Examples:');
  console.log('  node promoteToAdmin.js list');
  console.log('  node promoteToAdmin.js promote instructor@example.com');
}
