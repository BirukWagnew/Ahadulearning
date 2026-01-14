import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PendingApproval from "./components/instructor/PendingApproval";
import UserDetails from "./pages/Userdetails";
import { Toaster } from "./components/ui/sonner";
import { toast } from "react-toastify";
import {
  connectSocket,
  listenForForceLogout,
  disconnectSocket,
} from "./socket";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OTPVerification from "./pages/OTPVerification";
import OTPSend from "./pages/OTPSend";
import RegisterOTPSend from "./pages/RegisterOTPSend";
import VerifyOTP from "./pages/VerifyOTP";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import VerifyPayment from "./../src/components/Payment/VerifyPayment";
import Payment from "./components/Payment/Payment";
import GetCertified from "./components/course details/GetCertified";
import LearnLesson from "./pages/LearnLesson";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiesPolicy from "./pages/CookiesPolicy";

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    window.scroll(0, 0);

    if (token && userId) {
      // Connect socket and register user
      connectSocket(userId);

      // Listen for force logout events (like when admin blocks user)
      listenForForceLogout((data) => {
        toast.error(data.message || "You have been logged out");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        if (data.reason === "blocked") {
          navigate("/login?blocked=true", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
        window.location.reload();
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [navigate]);

  return (
    <>
      <Routes>
        {/* Public routes with layout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Index />
            </MainLayout>
          }
        />
        <Route
          path="/courses"
          element={
            <MainLayout>
              <Courses />
            </MainLayout>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <MainLayout>
              <CourseDetails />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout>
              <Login />
            </MainLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <MainLayout>
              <Signup />
            </MainLayout>
          }
        />
        <Route
          path="/about"
          element={
            <MainLayout>
              <About />
            </MainLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <MainLayout>
              <Contact />
            </MainLayout>
          }
        />

        {/* Authentication flow routes */}
        <Route
          path="/forgot-password"
          element={
            <MainLayout>
              <ForgotPassword />
            </MainLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <MainLayout>
              <ResetPassword />
            </MainLayout>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <MainLayout>
              <OTPVerification />
            </MainLayout>
          }
        />
        <Route
          path="/send-otp"
          element={
            <MainLayout>
              <OTPSend />
            </MainLayout>
          }
        />
        <Route
          path="/certificate/:courseId/:studentId"
          element={
            <MainLayout>
              <GetCertified />
            </MainLayout>
          }
        />

        {/* Registration-specific OTP routes */}
        <Route
          path="/signup/send-otp-Registration"
          element={
            <MainLayout>
              <RegisterOTPSend />
            </MainLayout>
          }
        />
        <Route
          path="/signup/verify-otp"
          element={
            <MainLayout>
              <VerifyOTP />
            </MainLayout>
          }
        />

        {/* Instructor approval */}
        <Route
          path="/pending-approval"
          element={
            <MainLayout>
              <PendingApproval />
            </MainLayout>
          }
        />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/verify-payment/:tx_ref" element={<VerifyPayment />} />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Payment />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/learn/:courseId/lesson/:lessonId"
          element={
            <ProtectedRoute requiredRole="student">
              <MainLayout>
                <LearnLesson />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected routes without layout */}
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/instructor-dashboard" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/terms" 
          element={
            <MainLayout>
              <TermsOfService />
            </MainLayout>
          } 
        />
        <Route 
          path="/privacy" 
          element={
            <MainLayout>
              <PrivacyPolicy />
            </MainLayout>
          } 
        />
        <Route 
          path="/cookies" 
          element={
            <MainLayout>
              <CookiesPolicy />
            </MainLayout>
          } 
        />
        <Route 
          path="/users/:userId" 
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          } 
        />
      </Routes>

      <Toaster />
    </>
  );
};

export default App;
