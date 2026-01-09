import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const listPendingInstructors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const pendingInstructors = await User.find({ 
      role: 'instructor', 
      isApproved: false 
    }).select('name email _id status createdAt');
    
    if (pendingInstructors.length === 0) {
      console.log('No pending instructors found.');
    } else {
      console.log('Pending Instructors:');
      pendingInstructors.forEach((instructor, index) => {
        console.log(`${index + 1}. ID: ${instructor._id}`);
        console.log(`   Name: ${instructor.name}`);
        console.log(`   Email: ${instructor.email}`);
        console.log(`   Status: ${instructor.status}`);
        console.log(`   Created: ${instructor.createdAt}`);
        console.log('---');
      });
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

const approveInstructor = async (instructorId) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const instructor = await User.findByIdAndUpdate(
      instructorId,
      { 
        isApproved: true, 
        status: 'active' 
      },
      { new: true }
    );
    
    if (instructor) {
      console.log(`✅ Approved instructor: ${instructor.name} (${instructor.email})`);
    } else {
      console.log('❌ Instructor not found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Command line usage
const command = process.argv[2];
const instructorId = process.argv[3];

if (command === 'list') {
  listPendingInstructors();
} else if (command === 'approve' && instructorId) {
  approveInstructor(instructorId);
} else {
  console.log('Usage:');
  console.log('  node approveInstructor.js list                    # List pending instructors');
  console.log('  node approveInstructor.js approve <instructorId>  # Approve specific instructor');
}
