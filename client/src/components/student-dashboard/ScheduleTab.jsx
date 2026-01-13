import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, Clock, BookOpen, Play } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { resolveMediaUrl } from "@/lib/media";

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

export const ScheduleTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?._id) return;

      setIsLoading(true);
      try {
        const response = await api.get(`/api/enrollments/${user._id}/courses`);
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          setCourses(response.data);
        } else if (response.data?.courses && Array.isArray(response.data.courses)) {
          setCourses(response.data.courses);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          setCourses(response.data.data);
        } else {
          console.error("Unexpected response format:", response.data);
          setCourses([]);
        }
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  // Fetch progress for all courses
  useEffect(() => {
    const fetchAllProgress = async () => {
      if (!user?._id || courses.length === 0) return;

      const updatedProgressMap = {};

      try {
        await Promise.all(
          courses.map(async (course) => {
            try {
              const res = await api.get(`/api/progress/${user._id}/${course._id}`);
              updatedProgressMap[course._id] = {
                progressPercentage: res.data.progressPercentage || 0,
                completedLessons: res.data.completedLessons || [],
                totalLessons: res.data.totalLessons || 0,
                lastAccessed: res.data.lastAccessed || null,
              };
            } catch (err) {
              console.error(`Progress fetch failed for course ${course._id}:`, err);
              updatedProgressMap[course._id] = {
                progressPercentage: 0,
                completedLessons: [],
                totalLessons: 0,
                lastAccessed: null,
                error: err instanceof Error ? err.message : "Failed to fetch progress",
              };
            }
          })
        );
      } catch (error) {
        console.error("Failed to fetch progress for courses:", error);
      } finally {
        setProgressMap(updatedProgressMap);
      }
    };

    fetchAllProgress();
  }, [user, courses]);

  // Get next lesson for each course and handle continue button
  const getNextLesson = (course) => {
    const progress = progressMap[course._id];
    if (!progress || progress.progressPercentage === 100) return null;
    
    // For now, return a placeholder - this can be enhanced with actual lesson data
    return {
      title: "Continue Learning",
      duration: "30 min",
      type: "video"
    };
  };

  // Handle continue button click
  const handleContinueLearning = (course) => {
    // Get the first lesson of the course to continue learning
    if (course.modules && course.modules.length > 0 && course.modules[0].lessons && course.modules[0].lessons.length > 0) {
      const firstLesson = course.modules[0].lessons[0];
      navigate(`/learn/${course._id}/lesson/${firstLesson._id}`);
    } else {
      // If no lessons found, navigate to course details
      navigate(`/courses/${course._id}`);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not started";
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-2 text-gray-600">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Schedule
        </h2>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No courses enrolled yet
          </h3>
          <p className="text-muted-foreground">
            Enroll in courses to see your learning schedule here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course, index) => {
            const progress = progressMap[course._id];
            const nextLesson = getNextLesson(course);
            
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                        {course.title}
                      </h3>
                      <span className="ml-3 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {course.level}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      Last accessed: {formatDate(progress?.lastAccessed)}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {progress?.progressPercentage || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress?.progressPercentage || 0}%`,
                            backgroundColor: progress?.progressPercentage > 50 ? '#10b981' : '#6366f1'
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Next Lesson */}
                    {nextLesson && progress?.progressPercentage < 100 && (
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                              {nextLesson.title}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {nextLesson.duration}
                            </div>
                          </div>
                          <button 
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={() => handleContinueLearning(course)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Completed Status */}
                    {progress?.progressPercentage === 100 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-center text-green-800 dark:text-green-400">
                          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Course Completed!</h4>
                            <p className="text-sm">Congratulations on finishing this course.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course Thumbnail */}
                  {(() => {
                    const raw =
                      typeof course.thumbnail === "string"
                        ? course.thumbnail
                        : course.thumbnail?.url;
                    if (!raw) return null;
                    const src = resolveMediaUrl(raw, API_BASE_URL);
                    if (!src) return null;
                    return (
                      <div className="ml-6">
                        <img
                          src={src}
                          alt={course.title}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
