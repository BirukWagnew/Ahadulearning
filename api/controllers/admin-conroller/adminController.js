import User from '../../models/User.js';
import mongoose from 'mongoose';
import { sendEmail } from '../../Email Service/emailService.js'; 
import Course from '../../models/Course.js';
import { deleteFromCloudinary } from '../../services/cloudStorage.js';
import Payment from '../../models/Payment.js';
import Withdrawal from '../../models/Withdrawal.js';
import Enrollment from '../../models/Enrollment.js';
import Progress from '../../models/Progress.js';

export const approveInstructor = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Instructor not found" });
        }

        if (user.role !== 'instructor') {
            return res.status(400).json({ message: "User is not an instructor" });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: "Instructor is already approved" });
        }

        user.isApproved = true;
        user.status = 'active';
        await user.save();

          const subject = 'Your Account Has Been Approved';
          const text = `Dear ${user.name},\n\nYour account has been approved by the admin. You can now access the platform as an instructor. If you have any questions, please contact support.`;
          const htmlContent = `
            <h1>Account Approved</h1>
            <p>Dear ${user.name},</p>
            <p>Your account has been approved by the admin. You can now access the platform as an instructor.</p>
            <p>If you have any questions, please contact support.</p>
          `;

          await sendEmail(user.email, subject, text, htmlContent);


        res.json({ message: "Instructor approved successfully!" });

    } catch (error) {
        console.error("Error approving instructor:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllCoursesAdmin = async (req, res) => {
  try {
    const { publish } = req.query;
    
    let filter = {};
    if (publish === 'true') {
      filter.published = true;
    }
    
    console.log("🔍 Admin courses filter:", filter);
    
    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    console.log("📚 Found courses:", courses.length);

    // Always return consistent structure
    return res.status(200).json({ 
      success: true,
      courses: courses 
    });
  } catch (error) {
    console.error('Error fetching courses (admin):', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching courses',
      courses: [] 
    });
  }
};

export const deleteCourseAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.thumbnail?.publicId) {
      await deleteFromCloudinary(course.thumbnail.publicId);
    }

    await course.deleteOne();
    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course (admin):', error);
    return res.status(500).json({ message: 'Server error while deleting course' });
  }
};

// Reject and delete instructor
export const rejectInstructor = async (req, res) => {
  try {
    const { id } = req.params; // Get instructor ID from URL params

    // Find the instructor by their ID
    const instructor = await User.findById(id);

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Check if the user is an instructor and is pending approval
    if (instructor.role !== 'instructor' || instructor.isApproved) {
      return res.status(400).json({ message: 'Instructor cannot be rejected or is already approved' });
    }

    // Delete the instructor from the database
    await User.findByIdAndDelete(id);

    const subject = 'Your Account Approval Has Been Rejected';
    const text = `Dear ${instructor.name},\n\nYour account approval has been rejected by the admin. You will not be able to access the platform as an instructor. If you have any questions, please contact support.`;
    const htmlContent = `
      <h1>Account Approval Rejected</h1>
      <p>Dear ${instructor.name},</p>
      <p>Your account approval has been rejected by the admin. You will not be able to access the platform as an instructor.</p>
      <p>If you have any questions, please contact support.</p>
    `;
    
    await sendEmail(instructor.email, subject, text, htmlContent);
    
    return res.status(200).json({ message: 'Instructor rejected and deleted successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// List all pending instructors for approval
export const listPendingInstructors = async (req, res) => {
  try {
    const pendingInstructors = await User.find({ role: 'instructor', isApproved: false })
      .select('name email phone expertise cv status createdAt');

    // Ensure we always return an array
    const instructorsArray = Array.isArray(pendingInstructors) ? pendingInstructors : [];

    return res.status(200).json({ 
      success: true,
      pendingInstructors: instructorsArray,
      count: instructorsArray.length 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message,
      pendingInstructors: [] 
    });
  }
};

//  List All Active Instructors
export const listActiveInstructors = async (req, res) => {
  try {
    const activeInstructors = await User.find({ role: 'instructor', isApproved: true })
      .select('name email phone status createdAt');

    res.status(200).json({ activeInstructors });

  } catch (error) {
    console.error("Error listing active instructors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  List ALL Users 
export const listAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email phone role status createdAt isApproved');

    // Ensure we always return an array
    const usersArray = Array.isArray(users) ? users : [];

    res.status(200).json({ 
      success: true,
      users: usersArray,
      count: usersArray.length 
    });

  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message,
      users: [] 
    });
  }
};

export const getUsersByRole = async (req, res) => {
  const { role } = req.params; 

  try {
    const users = await User.find({ role });

    if (users.length === 0) {
      return res.status(404).json({ message: `No users found with the role: ${role}` });
    }

    res.status(200).json({ users });

  } catch (error) {
    console.error("Error retrieving users by role:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const blockUser = async (req, res) => {
  try {
    console.log("🔒 Block user request received for ID:", req.params.id);
    console.log("🔒 Request method:", req.method);
    console.log("🔒 Request URL:", req.originalUrl);
    console.log("🔒 Request user:", req.user);
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid user ID:", id);
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await User.findById(id);
    if (!user) {
      console.log("User not found:", id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Found user to block:", user.name, user.email);

    // Block the user
    user.blocked = true;
    user.status = 'blocked';
    await user.save();
    
    console.log("User blocked successfully:", user.name);
    
    // Send email to the user about being blocked
    const subject = 'Your Account Has Been Blocked';
    const text = `Dear ${user.name},\n\nYour account has been blocked by the admin. You will not be able to access the platform until further notice. If you have any questions, please contact support.`;
    const htmlContent = `
      <h1>Account Blocked</h1>
      <p>Dear ${user.name},</p>
      <p>Your account has been blocked by the admin. You will not be able to access the platform until further notice.</p>
      <p>If you have any questions, please contact support.</p>
    `;
    
    // Ensure the email is sent asynchronously
    await sendEmail(user.email, subject, text, htmlContent);

    // Force logout via Socket.IO
    if (user.socketId) {
      req.io.to(user.socketId).emit("forceLogout", {
        message: "Your account has been blocked by the admin.",
        reason: "blocked"
      });
      console.log(`User ${id} was blocked and logged out.`);
      
      // Clear socketId after logout
      user.socketId = null;
      await user.save();
    } else {
      console.log(`User ${id} is not currently connected but is now blocked.`);
    }
    
    return res.status(200).json({ 
      message: "User blocked successfully.",
      userId: id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        blocked: user.blocked
      }
    });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    console.log(" Unblock user request received for ID:", req.params.id);
    console.log(" Request method:", req.method);
    console.log(" Request URL:", req.originalUrl);
    console.log(" Request user:", req.user);
    
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.blocked = false;

    // Repair legacy state: previous block logic incorrectly set isApproved=false for students/admins.
    if (user.role !== 'instructor' && !user.isApproved) {
      user.isApproved = true;
    }
    user.status = user.isApproved ? 'active' : 'pending';
    
    await user.save();

    const subject = 'Your Account Has Been Unblocked';
    const text = `Dear ${user.name},\n\nYour account has been unblocked by the admin. You can now access the platform again. If you have any questions, please contact support.`;
    const htmlContent = `
      <h1>Account Unblocked</h1>
      <p>Dear ${user.name},</p>
      <p>Your account has been unblocked by the admin. You can now access the platform again.</p>
      <p>If you have any questions, please contact support.</p>
    `;

    await sendEmail(user.email, subject, text, htmlContent);

    return res.status(200).json({ 
      message: 'User has been unblocked successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        blocked: user.blocked
      }
    });

  } catch (error) {
    console.error("Error unblocking user:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log user data to confirm it was fetched correctly
    console.log("Fetched User:", user);

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete any user (student or instructor)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the user first
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    // Delete user
    await User.findByIdAndDelete(id);
    
    return res.status(200).json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all payment transactions for admin
export const getPaymentTransactions = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('studentId', 'name email')
      .populate({
        path: 'courseId',
        select: 'title instructor',
        populate: { path: 'instructor', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments,
      count: payments.length
    });
  } catch (error) {
    console.error("Error fetching payment transactions:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all withdrawal requests for admin
export const getWithdrawalRequests = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('user', 'name email bankDetails')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      withdrawals,
      count: withdrawals.length
    });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve withdrawal request
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const withdrawal = await Withdrawal.findById(id).populate('user');
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal request is not pending' });
    }

    // Update withdrawal status
    withdrawal.status = 'success';
    await withdrawal.save();

    // Send email notification
    const subject = 'Withdrawal Request Approved';
    const text = `Dear ${withdrawal.user.name},\n\nYour withdrawal request of $${withdrawal.amount.toFixed(2)} has been approved. The funds will be transferred to your bank account within 2-3 business days.`;
    const htmlContent = `
      <h1>Withdrawal Approved</h1>
      <p>Dear ${withdrawal.user.name},</p>
      <p>Your withdrawal request of $${withdrawal.amount.toFixed(2)} has been approved.</p>
      <p>The funds will be transferred to your bank account within 2-3 business days.</p>
    `;

    await sendEmail(withdrawal.user.email, subject, text, htmlContent);

    res.status(200).json({
      success: true,
      message: 'Withdrawal request approved successfully',
      withdrawal
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject withdrawal request
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const withdrawal = await Withdrawal.findById(id).populate('user');
    
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: 'Withdrawal request is not pending' });
    }

    // Update withdrawal status
    withdrawal.status = 'failed';
    withdrawal.responseMessage = reason || 'Withdrawal request rejected by admin';
    await withdrawal.save();

    // Send email notification
    const subject = 'Withdrawal Request Rejected';
    const text = `Dear ${withdrawal.user.name},\n\nYour withdrawal request of $${withdrawal.amount.toFixed(2)} has been rejected.\n\nReason: ${reason || 'No reason provided'}`;
    const htmlContent = `
      <h1>Withdrawal Rejected</h1>
      <p>Dear ${withdrawal.user.name},</p>
      <p>Your withdrawal request of $${withdrawal.amount.toFixed(2)} has been rejected.</p>
      <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
    `;

    await sendEmail(withdrawal.user.email, subject, text, htmlContent);

    res.status(200).json({
      success: true,
      message: 'Withdrawal request rejected successfully',
      withdrawal
    });
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate payment report
export const generatePaymentReport = async (req, res) => {
  try {
    const { startDate, endDate, format } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { $gte: new Date(startDate) };
    if (endDate) dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };
    
    const payments = await Payment.find(dateFilter)
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    const withdrawals = await Withdrawal.find(dateFilter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalRevenue = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingWithdrawals = withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);

    const completedWithdrawals = withdrawals
      .filter(w => w.status === 'success')
      .reduce((sum, w) => sum + w.amount, 0);

    const reportData = {
      summary: {
        totalPayments: payments.length,
        totalRevenue,
        pendingWithdrawals,
        completedWithdrawals,
        totalWithdrawals: pendingWithdrawals + completedWithdrawals
      },
      payments,
      withdrawals
    };

    // Send different response based on format
    if (format === 'csv') {
      // Generate CSV (simplified for now)
      const csvData = [
        'Type,ID,Date,User,Amount,Status',
        ...payments.map(p => `Payment,${p._id},${p.createdAt},${p.studentId?.name || 'N/A'},${p.amount},${p.status}`),
        ...withdrawals.map(w => `Withdrawal,${w._id},${w.createdAt},${w.user?.name || 'N/A'},${w.amount},${w.status}`)
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payment-report.csv');
      res.send(csvData);
    } else {
      res.status(200).json({
        success: true,
        data: reportData
      });
    }
  } catch (error) {
    console.error("Error generating payment report:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get students enrolled in a specific course
export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Find all enrollments for this course and populate student data
    const enrollments = await Enrollment.find({ courseId })
      .populate('studentId', 'name email')
      .sort({ enrolledAt: -1 });

    // Get progress data for all students in this course
    const progressRecords = await Progress.find({ courseId })
      .populate('studentId', 'name email');

    // Transform the data to match expected format with progress
    const students = enrollments
      .filter(enrollment => enrollment.studentId) // Filter out null studentIds
      .map(enrollment => {
        const progress = progressRecords.find(p => 
          p.studentId && p.studentId._id.toString() === enrollment.studentId._id.toString()
        );
        
        return {
          _id: enrollment.studentId._id,
          name: enrollment.studentId.name,
          email: enrollment.studentId.email,
          enrolledAt: enrollment.enrolledAt,
          progress: progress ? progress.progressPercentage : 0,
          status: enrollment.status || 'active',
          completedLessons: progress ? progress.completedLessons : []
        };
      });

    res.status(200).json({
      success: true,
      students: students,
      count: students.length
    });
  } catch (error) {
    console.error('Error fetching course students:', error);
    res.status(500).json({ 
      message: 'Failed to fetch course students', 
      error: error.message 
    });
  }
};