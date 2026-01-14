import Enrollment from '../../models/Enrollment.js';
import Course from '../../models/Course.js';
import User from '../../models/User.js';
import Payment from '../../models/Payment.js';
import mongoose from 'mongoose';

export const getStudentEnrollmentsPerCourse = async (req, res) => {
  try {
    const courses = await Course.find().select('_id title category');

    const data = await Promise.all(
      courses.map(async (course) => {
        const count = await Enrollment.countDocuments({ courseId: course._id });
        return {
          courseId: course._id,
          courseTitle: course.title,
          category: course.category,
          enrollments: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      courses: data
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch enrollment data', error: err.message });
  }
};

// Get platform overview statistics
export const getPlatformOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Payment.countDocuments({ status: 'success' })
    ]);

    // Calculate total revenue
    const revenueData = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const actualRevenue = revenueData[0]?.total || 0;

    // Get user growth data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt"
            }
          },
          students: {
            $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] }
          },
          instructors: {
            $sum: { $cond: [{ $eq: ["$role", "instructor"] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get monthly revenue data
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt"
            }
          },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments,
        totalRevenue: actualRevenue
      },
      userGrowth: userGrowthData,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error getting platform overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform overview', 
      error: error.message 
    });
  }
};

// Get course enrollment statistics
export const getCourseEnrollments = async (req, res) => {
  try {
    const courses = await Course.find().select('_id title category');

    const data = await Promise.all(
      courses.map(async (course) => {
        const count = await Enrollment.countDocuments({ courseId: course._id });
        return {
          courseId: course._id,
          courseTitle: course.title,
          category: course.category,
          enrollments: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      courses: data
    });
  } catch (error) {
    console.error('Error getting course enrollments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch course enrollments', 
      error: error.message 
    });
  }
};

// Get user statistics by role
export const getUserStatistics = async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      userStats
    });
  } catch (error) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user statistics', 
      error: error.message 
    });
  }
};

// Get revenue statistics
export const getRevenueStatistics = async (req, res) => {
  try {
    const { period } = req.query;
    
    let dateFilter = {};
    if (period === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    } else if (period === '90days') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      dateFilter = { createdAt: { $gte: ninetyDaysAgo } };
    } else if (period === '1year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: oneYearAgo } };
    }

    const revenueStats = await Payment.aggregate([
      { $match: { status: 'success', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'success', ...dateFilter } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt"
            }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      revenueStats: revenueStats[0] || { totalRevenue: 0, totalTransactions: 0, averageTransaction: 0 },
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error getting revenue statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch revenue statistics', 
      error: error.message 
    });
  }
};
