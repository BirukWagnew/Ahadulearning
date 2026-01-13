import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Star, Clock, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

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

export const CourseRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const coursePlaceholder =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
        <rect width='100%' height='100%' fill='#e2e8f0'/>
        <g fill='#64748b' font-family='Arial, sans-serif' font-size='20'>
          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>No image</text>
        </g>
      </svg>`
    );

  // Fetch course recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // Try to get personalized recommendations first
        let response;
        try {
          response = await api.get(`/api/courses/recommendations/${user._id}`);
        } catch (err) {
          // If personalized recommendations fail, get general courses
          console.log("Personalized recommendations not available, fetching general courses");
          response = await api.get('/api/courses?limit=6&sort=rating');
        }

        console.log("Course recommendations response:", response.data);
        
        // Handle different response formats
        let courses = [];
        if (Array.isArray(response.data)) {
          courses = response.data;
        } else if (response.data?.courses && Array.isArray(response.data.courses)) {
          courses = response.data.courses;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          courses = response.data.data;
        }

        // Filter out already enrolled courses and limit to 6 recommendations
        const enrolledCourseIds = await getEnrolledCourseIds();
        const filteredRecommendations = courses
          .filter(course => !enrolledCourseIds.includes(course._id))
          .slice(0, 6);

        setRecommendations(filteredRecommendations);
      } catch (error) {
        console.error("Failed to fetch course recommendations:", error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Helper function to get enrolled course IDs
  const getEnrolledCourseIds = async () => {
    try {
      const response = await api.get(`/api/enrollments/${user._id}/courses`);
      const courses = Array.isArray(response.data) ? response.data : 
                     response.data?.courses || response.data?.data || [];
      return courses.map(course => course._id);
    } catch (error) {
      console.error("Failed to get enrolled courses:", error);
      return [];
    }
  };

  const handleEnrollCourse = async (courseId) => {
    try {
      // First enroll in the course
      await api.post(`/api/enrollments/${user._id}/${courseId}`);
      
      // Get the course details to find the first lesson
      const courseResponse = await api.get(`/api/courses/${courseId}`);
      const course = courseResponse.data;
      
      // Find the first lesson from the first module
      let firstLessonId = null;
      if (course.modules && course.modules.length > 0) {
        const firstModule = course.modules[0];
        if (firstModule.lessons && firstModule.lessons.length > 0) {
          firstLessonId = firstModule.lessons[0]._id || firstModule.lessons[0].id;
        }
      }
      
      // Refresh recommendations to remove the enrolled course
      setRecommendations(prev => prev.filter(course => course._id !== courseId));
      
      // Navigate to the first lesson or course details if no lesson found
      if (firstLessonId) {
        navigate(`/learn/${courseId}/lesson/${firstLessonId}`);
      } else {
        // Fallback to course details if no lessons found
        navigate(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Failed to enroll in course:", error);
      // If enrollment fails, still navigate to course details
      navigate(`/courses/${courseId}`);
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return "Self-paced";
    if (duration.includes('hour')) return duration;
    return `${duration} hours`;
  };

  if (isLoading) {
    return (
      <section>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          Recommended Courses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <section>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          Recommended Courses
        </h3>
        <div className="glass-card p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No new recommendations
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Check back later for personalized course recommendations based on your learning progress.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recommended Courses
        </h3>
        <Button variant="ghost" size="sm" className="text-fidel-600 hover:text-fidel-700">
          View All
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((course, i) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="glass-card p-4 hover:shadow-md transition-all duration-200 group cursor-pointer"
            onClick={() => navigate(`/courses/${course._id}`)}
          >
            <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden mb-3">
              <img
                src={
                  (typeof course.thumbnail === 'string'
                    ? course.thumbnail
                    : course.thumbnail?.url) || coursePlaceholder
                }
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = coursePlaceholder;
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-slate-900 dark:text-white line-clamp-2 flex-1">
                  {course.title}
                </h4>
                {course.level && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)} flex-shrink-0`}>
                    {course.level}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {course.description || "Expand your knowledge with this comprehensive course"}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-3">
                  {course.instructor?.name && (
                    <div className="flex items-center">
                      <Users size={12} className="mr-1" />
                      <span>{course.instructor.name}</span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                  )}
                </div>
                {course.rating && (
                  <div className="flex items-center">
                    <Star size={12} className="mr-1 text-yellow-500 fill-yellow-500" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  ${course.price || 'Free'}
                </div>
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnrollCourse(course._id);
                  }}
                  className="bg-fidel-600 hover:bg-fidel-700"
                >
                  Enroll Now
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
