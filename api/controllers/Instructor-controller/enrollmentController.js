import Enrollment from '../../models/Enrollment.js';
import Progress from '../../models/Progress.js';
import Course from '../../models/Course.js';
import mongoose from 'mongoose';

export const enrollStudent = async (req, res) => {
  const { studentId, courseId } = req.body;

  try {
    // Check if the student is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
    
    if (existingEnrollment) {
      return res.status(400).json({ error: "Student is already enrolled in this course" });
    }

    // Create new enrollment if not already enrolled
    const enrollment = await Enrollment.create(req.body);

    // Create initial progress record for the enrolled course
    try {
      const course = await Course.findById(courseId).populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          model: 'Lesson'
        }
      });

      if (course) {
        const totalLessons = course.modules.reduce((count, mod) => {
          return count + (mod.lessons ? mod.lessons.length : 0);
        }, 0);

        // Only create progress if the course has lessons
        if (totalLessons > 0) {
          await Progress.create({
            studentId: new mongoose.Types.ObjectId(studentId),
            courseId: new mongoose.Types.ObjectId(courseId),
            completedLessons: [],
            totalLessons,
            progressPercentage: 0
          });
        }
      }
    } catch (progressError) {
      console.error('Failed to create initial progress record:', progressError);
      // Don't fail the enrollment if progress creation fails
    }

    res.status(201).json(enrollment);
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const checkEnrollment = async (req, res) => {
  const { studentId, courseId } = req.params;

  try {
    const enrollment = await Enrollment.findOne({ studentId, courseId }).populate('paymentId');

    if (enrollment) {
      res.json({ access: true });
    } else {
      res.json({ access: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getEnrolledCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const authenticatedUserId = req.user._id;
    const authenticatedUserRole = req.user.role;

    // Authorization check: users can only view their own enrolled courses
    // Admins and instructors can view any student's courses
    if (authenticatedUserRole === 'student' && String(authenticatedUserId) !== String(studentId)) {
      return res.status(403).json({ error: 'You can only view your own enrolled courses' });
    }

    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        select: 'title thumbnail category level createdAt updatedAt',
        populate: {
          path: 'instructor',
          select: 'name profilePicture',
        },
      })
      .populate({
        path: 'paymentId',
        select: 'status',
      })
      .exec();

    const successfulEnrollments = enrollments.filter(enrollment => {
      // For paid courses, check payment status
      if (enrollment.paymentId) {
        return enrollment.paymentId.status === 'success' && enrollment.courseId;
      }
      // For free courses (no paymentId), just check if course exists
      return enrollment.courseId;
    });

    if (successfulEnrollments.length === 0) {
      return res.status(200).json([]);
    }

    const courses = successfulEnrollments.map(enrollment => enrollment.courseId);

    const uniqueCourses = Array.from(new Set(courses.map(course => course._id.toString())))
      .map(id => courses.find(course => course._id.toString() === id))
      .filter(course => course !== null && course !== undefined);

    return res.status(200).json(uniqueCourses);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


