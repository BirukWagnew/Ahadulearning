
import TestimonialCard from "./TestimonialCard";
import { motion } from "framer-motion";
import { Star, TrendingUp, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Testimonials = () => {
  const navigate = useNavigate();
  
  // Recent ratings data
  const recentRatings = [
    { name: "Overall Rating", rating: 4.8, total: "50+" },
    { name: "Course Quality", rating: 4.9, total: "50+" },
    { name: "Student Support", rating: 4.7, total: "50+" },
    { name: "Platform Experience", rating: 4.8, total: "50+" }
  ];

  const handleStartLearning = () => {
    // Navigate to courses page or signup if not logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/courses');
    } else {
      navigate('/signup');
    }
  };

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating)
            ? "text-amber-400 fill-amber-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-fidel-50 dark:bg-fidel-900/30 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="text-fidel-600 dark:text-fidel-400 text-sm font-medium">
              Student Voices
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white"
          >
            What Our Students Say About Ahadu Learning
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Hear from students who have experienced the difference Ahadu Learning
            makes in their educational journey.
          </motion.p>
        </div>

        {/* Recent Ratings Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Recent Ratings & Statistics
            </h3>
            <p className="text-muted-foreground">
              Real-time feedback from our learning community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentRatings.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  <div className="flex items-center text-amber-400">
                    <Star size={16} className="fill-amber-400" />
                    <span className="ml-1 font-bold text-amber-600 dark:text-amber-400">
                      {item.rating}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(item.rating)}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Users size={14} className="mr-1" />
                  <span>{typeof item.total === 'string' ? item.total : item.total.toLocaleString()} reviews</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Featured Student Stories
            </h3>
            <p className="text-muted-foreground">
              Success stories from our diverse student community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 3].map((i) => (
              <TestimonialCard key={i} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-fidel-500 to-fidel-600 p-8 rounded-2xl shadow-xl">
            <Award className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">
              Join Our Success Story
            </h3>
            <p className="text-fidel-100 mb-6 max-w-md mx-auto">
              Become part of our growing community of learners and start your journey with Ahadu Learning today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartLearning}
                className="bg-white text-fidel-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Learning
              </button>
              <button 
                onClick={handleViewAllCourses}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-fidel-600 transition-all"
              >
                View All Courses
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
