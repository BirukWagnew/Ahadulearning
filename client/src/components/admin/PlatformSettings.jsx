import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const PlatformSettings = () => {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState({
    name: "",
    email: "",
    bio: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view your profile");
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const apiUrl = `${API_BASE_URL}/api/users/profile`;

      try {
        setIsLoading(true);
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const userData = response.data;
        console.log("Fresh user data fetched:", userData);
        setUser(userData);
        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
        }));
      }  catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || error.message || "Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchUserData();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    try {
      console.log("Sending profile update request...");
      console.log("Form data being sent:", {
        name: formData.name,
        email: formData.email,
        bio: formData.bio
      });

      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        {
          name: formData.name,
          email: formData.email,
          bio: formData.bio
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Profile update response:", response);
      console.log("Response data:", response.data);

      setIsLoading(false);
      toast.success("Profile updated successfully!");

      // Refresh global auth user so Navbar updates immediately
      try {
        console.log("Refreshing global user context...");
        await refreshUser();
        console.log("Global user context refreshed");
      } catch (refreshError) {
        console.error("Failed to refresh global user:", refreshError);
        // Continue with local state update even if global refresh fails
      }

      // Re-sync local page state from response
      if (response?.data?.user) {
        console.log("Updating local state from response.data.user");
        const updatedUser = response.data.user;
        setUser(updatedUser);
        
        // Update form data with new values
        setFormData((prev) => ({
          ...prev,
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          bio: updatedUser.bio || "",
        }));
      } else if (response?.data) {
        console.log("Updating local state from response.data");
        // Handle alternative response structure
        const updatedUser = response.data;
        setUser(updatedUser);
        
        setFormData((prev) => ({
          ...prev,
          name: updatedUser.name || prev.name,
          email: updatedUser.email || prev.email,
          bio: updatedUser.bio || prev.bio,
        }));
      } else {
        console.warn("Unexpected response structure:", response);
        // If response structure is unexpected, try to refresh user data
        console.log("Attempting to fetch fresh user data...");
        fetchUserData();
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/profile/password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      setIsLoading(false);
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      toast.success("Password updated successfully!");
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <div className="page-container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your personal details and public profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Your email address"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Updating..." : "Save Changes"}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={fetchUserData}
                        disabled={isLoading}
                        className="w-full mt-2"
                      >
                        Refresh Profile Data
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password for better security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          placeholder="Enter your current password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="Enter your new password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your new password"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Updating..." : "Change Password"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
