import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, Mail, Star } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

// Create axios instance with auth headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const InstructorsTab = () => {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch instructors from enrolled courses
  useEffect(() => {
    const fetchInstructors = async () => {
      if (!user?._id) return;

      setIsLoading(true);
      try {
        // First get enrolled courses
        const coursesResponse = await api.get(`/api/enrollments/${user._id}/courses`);
        const courses = coursesResponse.data;
        
        // Extract unique instructors from courses
        const uniqueInstructors = [];
        const instructorIds = new Set();
        
        courses.forEach(course => {
          if (course.instructor && !instructorIds.has(course.instructor._id)) {
            instructorIds.add(course.instructor._id);
            uniqueInstructors.push({
              _id: course.instructor._id,
              name: course.instructor.name,
              email: course.instructor.email,
              profilePicture: course.instructor.profilePicture,
              bio: course.instructor.bio || "Passionate educator dedicated to helping students achieve their goals.",
              courses: courses.filter(c => c.instructor?._id === course.instructor._id).length
            });
          }
        });
        
        setInstructors(uniqueInstructors);
      } catch (error) {
        console.error("Failed to fetch instructors:", error);
        toast.error("Failed to load instructors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructors();
  }, [user]);

  // Handle contact instructor
  const handleContactInstructor = (instructor) => {
    // Open email client with instructor's email
    const subject = encodeURIComponent(`Question about your courses from ${user?.name || 'A Student'}`);
    const body = encodeURIComponent(`Hi ${instructor.name},\n\nI'm a student enrolled in your courses and would like to ask you a question.\n\nThank you,\n${user?.name || 'A Student'}`);
    
    const mailtoUrl = `mailto:${instructor.email}?subject=${subject}&body=${body}`;
    
    // Open email client
    window.open(mailtoUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-white">
        Your Instructors
      </h2>
      
      {instructors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No Instructors Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Once you enroll in courses, you'll see your instructors here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor, index) => (
            <motion.div
              key={instructor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Instructor Profile */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  {instructor.profilePicture ? (
                    <img
                      src={instructor.profilePicture}
                      alt={instructor.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <Users className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {instructor.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {instructor.courses} {instructor.courses === 1 ? 'course' : 'courses'}
                  </p>
                </div>
              </div>

              {/* Instructor Bio */}
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                {instructor.bio}
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-slate-300 fill-current'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  4.5 (12 reviews)
                </span>
              </div>

              {/* Contact Button */}
              <button 
                onClick={() => handleContactInstructor(instructor)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Instructor</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
