import { motion } from "framer-motion";
import { X, Trophy, Star, Target, Award, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AchievementsModal = ({ isOpen, onClose, user, courses, progressMap }) => {
  if (!isOpen) return null;

  // Calculate achievements based on user data
  const completedCourses = courses.filter(
    (c) => progressMap[c._id]?.progressPercentage === 100
  ).length;
  
  const inProgressCourses = courses.filter(
    (c) =>
      progressMap[c._id]?.progressPercentage > 0 &&
      progressMap[c._id]?.progressPercentage < 100
  ).length;

  const totalCoursesEnrolled = courses.length;
  
  // Calculate total lessons completed across all courses
  const totalLessonsCompleted = Object.values(progressMap).reduce(
    (total, progress) => total + (progress.completedLessons?.length || 0),
    0
  );

  // Calculate total study time (estimated - 15 minutes per lesson)
  const estimatedStudyHours = Math.round((totalLessonsCompleted * 15) / 60);

  // Check for specific achievements
  const achievements = [
    {
      id: "first_course",
      title: "Course Starter",
      description: "Enrolled in your first course",
      icon: BookOpen,
      unlocked: totalCoursesEnrolled >= 1,
      color: "bg-blue-500",
      date: totalCoursesEnrolled >= 1 ? "Achieved!" : "Not yet achieved"
    },
    {
      id: "course_completer",
      title: "Course Completer",
      description: `Completed ${completedCourses} course${completedCourses !== 1 ? 's' : ''}`,
      icon: Trophy,
      unlocked: completedCourses >= 1,
      color: "bg-green-500",
      date: completedCourses >= 1 ? "Achieved!" : "Not yet achieved"
    },
    {
      id: "dedicated_learner",
      title: "Dedicated Learner",
      description: `Enrolled in ${totalCoursesEnrolled} course${totalCoursesEnrolled !== 1 ? 's' : ''}`,
      icon: Award,
      unlocked: totalCoursesEnrolled >= 3,
      color: "bg-purple-500",
      date: totalCoursesEnrolled >= 3 ? "Achieved!" : `${totalCoursesEnrolled}/3 courses`
    },
    {
      id: "halfway_hero",
      title: "Halfway Hero",
      description: "Progressed 50%+ in multiple courses",
      icon: Target,
      unlocked: Object.values(progressMap).some(p => p.progressPercentage >= 50),
      color: "bg-orange-500",
      date: Object.values(progressMap).some(p => p.progressPercentage >= 50) ? "Achieved!" : "Keep progressing!"
    },
    {
      id: "time_investor",
      title: "Time Investor",
      description: `Studied for ${estimatedStudyHours}+ hours`,
      icon: Clock,
      unlocked: estimatedStudyHours >= 10,
      color: "bg-cyan-500",
      date: estimatedStudyHours >= 10 ? "Achieved!" : `${estimatedStudyHours}/10 hours`
    },
    {
      id: "star_learner",
      title: "Star Learner",
      description: "Completed 5+ courses",
      icon: Star,
      unlocked: completedCourses >= 5,
      color: "bg-yellow-500",
      date: completedCourses >= 5 ? "Achieved!" : `${completedCourses}/5 courses`
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Achievements
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {unlockedCount} of {totalCount} achievements unlocked
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Progress Overview */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {completedCourses}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {inProgressCourses}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalLessonsCompleted}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Lessons Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {estimatedStudyHours}h
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Study Time</div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6 overflow-auto max-h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border ${
                    achievement.unlocked
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-60"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        achievement.unlocked
                          ? achievement.color
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`${
                          achievement.unlocked ? "text-white" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`text-xs font-medium ${
                            achievement.unlocked
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {achievement.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Star size={12} className="text-yellow-900 fill-yellow-900" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {unlockedCount === 0 && (
            <div className="text-center py-12">
              <Trophy size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No Achievements Yet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Start learning and completing courses to unlock achievements!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
