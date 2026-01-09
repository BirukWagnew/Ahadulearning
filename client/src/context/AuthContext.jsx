import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`,
          {},
          { withCredentials: true }
        );
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      console.log('🔍 AuthContext Login - Full response:', res.data);
      console.log('🔍 AuthContext Login - User:', res.data.user);
      console.log('🔍 AuthContext Login - Token:', res.data.token);
      
      // Store token in localStorage for admin components
      if (res.data.token) {
        console.log('🔍 Storing token in localStorage...');
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        console.log('✅ Token stored successfully');
        
        // Verify it was stored
        const storedToken = localStorage.getItem("token");
        console.log('🔍 Verification - Token in localStorage:', storedToken ? 'YES' : 'NO');
      } else {
        console.log('❌ No token in response');
      }
      
      // Update user state
      setUser(res.data.user);
      toast.success("Login successful!");
  
      // Navigate to the appropriate dashboard
      navigate(getDashboardPath(res.data.user?.role));
  
      return res.data;
    } catch (error) {
      console.error('❌ AuthContext Login Error:', error);
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  // Logout function
  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Logout failed";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Helper function to get dashboard path
  const getDashboardPath = (role) => {
    switch (role) {
      case "student": return "/student-dashboard";
      case "instructor": return "/instructor-dashboard";
      case "admin": return "/admin-dashboard";
      default: return "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};