// components/home/TestimonialCard.jsx
import { motion } from "framer-motion";
import { Star, Calendar, Award, TrendingUp } from "lucide-react";

const TestimonialCard = ({ index }) => {
  const testimonials = [
    {
      quote:
        "The quality of courses and interactive nature of Ahadu Learning has exceeded my expectations. I've been able to learn at my own pace while still feeling connected to instructors and peers.",
      name: "Abebe Z",
      role: "Computer Science Student",
      rating: 5,
      date: "2026-01-12",
      course: "Advanced React Development",
      achievement: "Top Performer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      quote:
        "The quality of courses and interactive nature of Ahadu Learning has exceeded my expectations. I've been able to learn at my own pace while still feeling connected to instructors and peers.",
      name: "Abebe Z",
      role: "Computer Science Student",
      rating: 5,
      date: "2026-01-12",
      course: "Advanced React Development",
      achievement: "Top Performer",
      image: "https://images.unsplash.com/photo-1507591064342-7a1fe5d0d7e?w=150&h=150&fit=crop&crop=face"
    },
    {
      quote:
        "The student services integration is what sets Ahadu Learning apart. Being able to manage my dormitory application and transcript requests in the same place I take my courses has saved me so much time and hassle.",
      name: "Alemitu T",
      role: "Psychology Major",
      rating: 4,
      date: "2025-12-31",
      course: "Introduction to Psychology",
      achievement: "Dedicated Student",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
  ];

  const { quote, name, role, rating, date, course, achievement, image } = testimonials[index - 1];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating
            ? "text-amber-400 fill-amber-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="glass-card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-800 w-full"
    >
      {/* Header with rating and date */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {renderStars(rating)}
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
            {rating}.0
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={12} className="mr-1" />
          {formatDate(date)}
        </div>
      </div>

      {/* Achievement Badge */}
      <div className="flex items-center mb-3">
        <Award size={14} className="text-purple-500 mr-2" />
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
          {achievement}
        </span>
      </div>

      {/* Quote */}
      <p className="text-slate-600 dark:text-slate-300 mb-6 italic leading-relaxed text-sm sm:text-base">
        "{quote}"
      </p>

      {/* Course Info */}
      <div className="mb-4">
        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mb-2">
          <TrendingUp size={12} className="mr-1" />
          <span className="font-medium">Course: {course}</span>
        </div>
      </div>

      {/* Student Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center">
          <div className="relative mr-4">
            <img
              src={image}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            {/* Fallback initials */}
            <div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-fidel-400 to-fidel-600 flex items-center justify-center text-white font-semibold absolute inset-0"
              style={{ display: 'none' }}
            >
              {name.charAt(0)}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
              {name}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
        
        {/* Verified Badge */}
        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          Verified
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
