import {
  ChevronRight,
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { resolveMediaUrl } from "@/lib/media";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const CourseHeader = ({
  course,
  instructorName,
  total,
  totalDuration,
  onTryFreePreview,
  freeVideoLessons,
}) => {
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, avgRating: "N/A" });
  const [reviewError, setReviewError] = useState(null);
  const navigate = useNavigate();

  const thumbnailPlaceholder =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
        <rect width='100%' height='100%' fill='#e2e8f0'/>
        <g fill='#64748b' font-family='Arial, sans-serif' font-size='20'>
          <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>No image</text>
        </g>
      </svg>`
    );

  const rawThumbnail =
    typeof course?.thumbnail === "string" ? course.thumbnail : course?.thumbnail?.url;
  const resolvedThumbnailSrc =
    resolveMediaUrl(rawThumbnail, API_BASE_URL) || thumbnailPlaceholder;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Check if already enrolled
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        if (!user?._id || !course?._id || !token) return;

        const res = await axios.get(
          `${API_BASE_URL}/api/enrollments/check?studentId=${user._id}&courseId=${course._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.isEnrolled === true) {
          setIsEnrolled(true);
        }
      } catch (error) {
        console.error("Enrollment check error:", error?.response?.data || error.message);
      }
    };

    if (user?._id && course?._id && token) {
      checkEnrollment();
    }
  }, [user, course]);

  // Fetch student count
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        if (!course?._id) return;
        const res = await axios.post(
          `${API_BASE_URL}/api/courses/${course._id}/student-count`,
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setStudentCount(res.data.studentCount);
      } catch (err) {
        console.error("Failed to fetch student count", err);
      }
    };

    if (course._id) {
      fetchStudentCount();
    }
  }, [course._id, token]);

  // Fetch review stats
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        if (!course?._id) return;
        const res = await axios.get(`${API_BASE_URL}/api/review/${course._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setReviewStats(
          res.data.reviewStats || { totalReviews: 0, avgRating: "N/A" }
        );
      } catch (error) {
        console.error("Failed to fetch review stats:", error?.response?.data || error.message);
        setReviewError("Failed to load reviews");
        setReviewStats({ totalReviews: 0, avgRating: "N/A" });
      }
    };

    if (course._id) {
      fetchReviewStats();
    }
  }, [course._id, token]);

  const handleEnroll = async () => {
    setLoading(true);

    console.log('Enroll button clicked');
    console.log('Course price:', course.price);
    console.log('Course data:', course);

    try {
      // If not logged in, redirect to login with enrollment intent
      if (!user?.email || !user?.name) {
        console.log('User not logged in, redirecting to login');
        // Store enrollment intent for after login
        localStorage.setItem('enrollmentIntent', JSON.stringify({
          courseId: course._id,
          courseTitle: course.title,
          coursePrice: course.price
        }));

        // Show a more user-friendly message
        if (confirm('To enroll in this course, you need to log in or create an account. Would you like to proceed?')) {
          navigate('/login', {
            state: {
              from: 'courseEnrollment',
              courseId: course._id,
              courseTitle: course.title
            }
          });
        }
        return;
      }

      // Check if course is free (price === 0) or premium (price > 0)
      if (course.price === 0) {
        console.log('Free course enrollment path');
        // Free course - enroll directly without payment
        try {
          const res = await axios.post(
            `${API_BASE_URL}/api/enrollments`,
            {
              courseId: course._id,
              studentId: user._id
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.data) {
            // Enrollment successful, refresh the page or update state
            window.location.reload();
          } else {
            alert("Enrollment failed.");
          }
        } catch (enrollError) {
          console.error("Free course enrollment error:", enrollError?.response?.data || enrollError.message);
          alert("Enrollment failed: " + (enrollError?.response?.data?.message || "Unknown error"));
        }
      } else {
        console.log('Premium course payment initiation path');
        console.log('Payment data:', {
          amount: course.price,
          courseId: course._id,
          email: user.email,
          fullName: user.name,
        });
        // Premium course - initiate payment
        const res = await axios.post(
          `${API_BASE_URL}/api/payment/initiate`,
          {
            amount: course.price,
            courseId: course._id,
            email: user.email,
            fullName: user.name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Payment response:', res.data);

        if (res.data?.checkoutUrl) {
          console.log('Redirecting to checkout URL:', res.data.checkoutUrl);
          window.location.replace(res.data.checkoutUrl);
        } else {
          console.error('No checkout URL in response:', res.data);
          alert("Payment initiation failed.");
        }
      }
    } catch (error) {
      console.error("Enrollment error:", error?.response?.data || error.message);
      alert("Enrollment failed: " + (error?.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-fidel-600 text-white py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <div className="flex-1">
            <div className="mb-4">
              <Link
                to="/courses"
                className="text-fidel-100 hover:text-white text-sm inline-flex items-center"
              >
                <ChevronRight size={16} className="rotate-180 mr-1" />
                Back to Courses
              </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-fidel-100 mb-6">
              {course.description?.split("\n\n")[0] || course.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <Star size={18} className="text-yellow-300 fill-yellow-300 mr-1" />
                <span className="font-medium">
                  {reviewStats.avgRating}
                </span>
                <span className="text-fidel-200 ml-1">
                  ({reviewStats.totalReviews.toLocaleString()} ratings)
                </span>
              </div>
              <div className="flex items-center">
                <Users size={18} className="mr-1" />
                <span>{studentCount.toLocaleString()} students</span>
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-1" />
                <span>{course.totalDuration}</span>
              </div>
              <div className="flex items-center">
                <BookOpen size={18} className="mr-1" />
                <span>{total} lessons</span>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-white/20 mr-3 flex items-center justify-center">
                <span className="text-xl font-medium">
                  {instructorName
                    .split(" ")
                    .map((n) => n[0].toUpperCase())
                    .join("")}
                </span>
              </div>
              <div>
                <div className="font-medium">Created by {instructorName}</div>
                <div className="text-sm text-fidel-200">
                  Last updated:{" "}
                  {new Date(course.updatedAt || course.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isEnrolled && (
            <div className="md:w-96">
              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl">
                <img
                  src={resolvedThumbnailSrc || thumbnailPlaceholder}
                  alt={course.title}
                  className="w-full h-52 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = thumbnailPlaceholder;
                  }}
                />

                <div className="p-6">
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      ETB {course.price?.toLocaleString() || "Free"}
                    </span>
                  </div>

                  <Button
                    className="w-full mb-3 bg-fidel-600 hover:bg-fidel-700"
                    onClick={handleEnroll}
                    disabled={loading}
                  >
                    {loading 
                      ? "Processing..." 
                      : course.price === 0 
                        ? "Enroll for Free" 
                        : `Enroll for ETB ${course.price?.toLocaleString()}`}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full mb-6 text-black"
                    onClick={onTryFreePreview}
                    disabled={freeVideoLessons.length === 0}
                  >
                    Try Free Preview
                    {freeVideoLessons.length === 0 && (
                      <span className="sr-only">(no free videos available)</span>
                    )}
                  </Button>

                  <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-muted-foreground" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center">
                      <Award size={16} className="mr-2 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare size={16} className="mr-2 text-muted-foreground" />
                      <span>Direct instructor support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};