import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export const OverviewTab = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?._id) return;

      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/enrollments/${user._id}/courses`, {
          withCredentials: true
        });
        
        console.log("Enrolled courses response:", response.data);
        
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

      setIsLoading(true);
      const updatedProgressMap = {};

      try {
        await Promise.all(
          courses.map(async (course) => {
            try {
              const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/progress/${user._id}/${course._id}`, {
                withCredentials: true
              });
              updatedProgressMap[course._id] = res.data;
            } catch (err) {
              console.error(`Progress fetch failed for course ${course._id}:`, err);
              // If no progress exists yet, create a default progress entry
              if (err.response?.status === 404) {
                updatedProgressMap[course._id] = {
                  progressPercentage: 0,
                  completedLessons: [],
                  totalLessons: 0,
                  lastAccessed: null,
                };
              } else {
                updatedProgressMap[course._id] = {
                  progressPercentage: 0,
                  completedLessons: [],
                  totalLessons: 0,
                  lastAccessed: null,
                  error: err instanceof Error ? err.message : "Failed to fetch progress",
                };
              }
            }
          })
        );
      } catch (error) {
        console.error("Failed to fetch progress for courses:", error);
      } finally {
        setProgressMap(updatedProgressMap);
        setIsLoading(false);
      }
    };

    fetchAllProgress();
  }, [user, courses]);

  // Calculate course statistics
  const completedCourses = courses.filter(
    (c) => progressMap[c._id]?.progressPercentage === 100
  ).length;
  const inProgressCourses = courses.filter(
    (c) =>
      progressMap[c._id]?.progressPercentage > 0 &&
      progressMap[c._id]?.progressPercentage < 100
  ).length;
  const upcomingCourses = courses.filter(
    (c) => progressMap[c._id]?.progressPercentage === 0
  ).length;

  // Filter in-progress courses for "Continue Learning" (limit to 2)
  const continueLearningCourses = courses
    .filter(
      (c) => {
        const progress = progressMap[c._id];
        return progress && (progress.progressPercentage > 0 || progress.completedLessons?.length > 0);
      }
    )
    .slice(0, 2);

  const getLastAccessedDate = (lastAccessed) => {
    if (!lastAccessed) return "Never";
    try {
      return new Date(lastAccessed).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* User Information */}
      <div className="bg-fidel-50 dark:bg-fidel-950/20 p-4 rounded-lg border border-fidel-200 dark:border-fidel-800">
        <h3 className="font-semibold text-fidel-800 dark:text-fidel-200 mb-3">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-fidel-600 dark:text-fidel-400 font-medium">Student ID</p>
            <p className="text-fidel-800 dark:text-fidel-200 font-mono text-xs">{user?._id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-fidel-600 dark:text-fidel-400 font-medium">Enrolled Courses</p>
            <p className="text-fidel-800 dark:text-fidel-200 font-semibold">{courses.length}</p>
          </div>
        </div>
      </div>

      {/* Welcome banner */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-fidel-100 dark:bg-fidel-900/20 rounded-full opacity-70 dark:opacity-30 -z-10"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Welcome back, {user?.name || "Student"}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your courses today.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 shadow-sm">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {completedCourses}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 shadow-sm">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {inProgressCourses}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 shadow-sm">
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {upcomingCourses}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue learning */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          Continue Learning
        </h3>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : continueLearningCourses.length === 0 ? (
          <div className="glass-card p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No in-progress courses to display.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continueLearningCourses.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="glass-card p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {course.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last accessed:{" "}
                      {getLastAccessedDate(progressMap[course._id]?.lastAccessed)}
                    </p>
                    <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          progressMap[course._id]?.progressPercentage > 50
                            ? "bg-blue-500"
                            : "bg-purple-500"
                        )}
                        style={{
                          width: `${progressMap[course._id]?.progressPercentage || 0}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {progressMap[course._id]?.progressPercentage || 0}% complete
                      </span>
                      <span className="font-medium text-fidel-500">Continue</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Not Started Courses */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          Not Started
        </h3>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          (() => {
            const notStartedCourses = courses.filter(
              (c) => {
                const progress = progressMap[c._id];
                return progress && progress.progressPercentage === 0 && !progress.error;
              }
            );
            
            return notStartedCourses.length === 0 ? (
              <div className="glass-card p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No courses waiting to be started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notStartedCourses.map((course, i) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="glass-card p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {course.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Enrolled on{" "}
                          {new Date(course.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                        <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gray-300 dark:bg-gray-600"
                            style={{ width: "0%" }}
                          ></div>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                          <span className="text-muted-foreground">0% complete</span>
                          <span className="font-medium text-fidel-500">Start Course</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()
        )}
      </section>

      {/* Achievements */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedCourses > 0 ? (
            <>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h4 className="font-medium text-slate-900 dark:text-white">Course Completer</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Completed {completedCourses} course{completedCourses !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-medium text-slate-900 dark:text-white">Dedicated Learner</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Enrolled in {courses.length} course{courses.length !== 1 ? 's' : ''}
                </p>
              </div>
              {progressMap && Object.values(progressMap).some(p => p.progressPercentage >= 50) && (
                <div className="glass-card p-4 text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Halfway Hero</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Progressed 50%+ in courses
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full glass-card p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Start Your Learning Journey!
              </h4>
              <p className="text-sm text-muted-foreground">
                Complete your first course to unlock achievements.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};