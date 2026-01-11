import { useEffect, useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { resolveMediaUrl } from "@/lib/media";

const PlatformSettings = () => {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState({
    profilePic: "",
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
  const [avatarPreview, setAvatarPreview] = useState(user.profilePic);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  useEffect(() => {
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
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
  
        const userData = response.data;
        console.log("API Response:", userData);
        setUser(userData);
        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
        }));
        const raw = userData.profilePic;
        const resolved = resolveMediaUrl(raw, API_BASE_URL);
        const fullProfilePicUrl = resolved
          ? `${resolved}${resolved.includes("?") ? "&" : "?"}v=${userData?.updatedAt || Date.now()}`
          : "";
  
      
         
        console.log("Profile Pic URL:", fullProfilePicUrl);
        setAvatarPreview(fullProfilePicUrl);
        console.log("Avatar Preview Set To:", fullProfilePicUrl);
      }  catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        

        toast.error(error.response?.data?.message || error.message || "Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }

    setIsAvatarLoading(true);
    setAvatarFile(file);

    // Use object URL for fast preview
    setAvatarPreview((prev) => {
      if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });

    setIsAvatarLoading(false);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview((prev) => {
      if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return "";
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("bio", formData.bio);

    // If user removed the avatar, tell backend to clear profilePic
    if (!avatarPreview) {
      formDataToSend.append("removeProfilePic", "true");
    }

    if (avatarFile) {
      formDataToSend.append("profilePic", avatarFile);
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 20000,
        }
      );

      setIsLoading(false);
      toast.success("Profile updated successfully!");

      // Refresh global auth user so Navbar/avatar updates immediately
      await refreshUser();

      // Re-sync local page state from response (handles new profilePic path)
      if (response?.data?.user) {
        setUser(response.data.user);
        const raw = response.data.user.profilePic;
        const resolved = resolveMediaUrl(raw, API_BASE_URL);
        const fullProfilePicUrl = resolved
          ? `${resolved}${resolved.includes("?") ? "&" : "?"}v=${response.data.user?.updatedAt || Date.now()}`
          : "";

        // Cleanup any blob URL preview
        setAvatarFile(null);
        setAvatarPreview((prev) => {
          if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
            URL.revokeObjectURL(prev);
          }
          return fullProfilePicUrl;
        });
      }
    } catch (error) {
      setIsLoading(false);
      const msg =
        error.code === "ECONNABORTED"
          ? "Update timed out. Please try again."
          : error.response?.data?.message || "Failed to update profile.";
      toast.error(msg);
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && typeof avatarPreview === "string" && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Profile picture" />
                  ) : (
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                      {getInitials(formData?.name || user?.name || "User")}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isAvatarLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <div className="w-full space-y-2">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 cursor-pointer"
                >
                  {avatarPreview ? "Change Avatar" : "Upload Avatar"}
                </label>

                {avatarPreview && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveAvatar}
                    className="w-full"
                    disabled={isAvatarLoading}
                  >
                    Remove Avatar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
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
                        disabled={isLoading || isAvatarLoading}
                        className="w-full"
                      >
                        {isLoading ? "Updating..." : "Save Changes"}
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
