import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Download,
  Mail,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Ban,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/layout/UserAvatar";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UserDetail = ({ userId, onBack, embedded = false }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data?.user || response.data);
      } catch (error) {
        toast.error("Failed to fetch user data");
        console.error("Axios error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleDownload = async (fileUrl) => {
    if (!fileUrl) {
      toast.error("No file available to download");
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // The DB stores something like: "uploads\\cvs\\user-xxx.pdf"
      // Server serves it via: /uploads/cvs/user-xxx.pdf
      const normalized = String(fileUrl).replace(/\\/g, "/");

      let relativePath = normalized;
      if (relativePath.startsWith("/")) relativePath = relativePath.slice(1);

      // If only a filename was stored, assume it lives in /uploads/cvs
      if (!relativePath.includes("/")) {
        relativePath = `uploads/cvs/${relativePath}`;
      }

      const filePath = `${baseUrl}/${relativePath}`;

      const filename = relativePath.split("/").pop();

      // Fetch the file
      // NOTE: /uploads is served as a static public route. Adding Authorization
      // headers triggers a CORS preflight that may be blocked by the server.
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Convert to blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create temporary anchor element for download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CV downloaded successfully");
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error(`Failed to download CV: ${error.message}`);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/admin/approve-instructor/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData((prev) => ({ ...prev, status: "active", isApproved: true }));
      toast.success(`User #${userId} has been approved`);

      // Refetch to ensure UI matches backend state
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data?.user || response.data);
      } catch (e) {
        // Ignore refetch failure; UI was already updated optimistically
      }
    } catch (error) {
      console.error(
        `Error approving User #${userId}:`,
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || `Failed to approve User #${userId}`);
    }
  };

  const handleRejectUser = async (user) => {
    const userId = user?._id;
    if (!userId) {
      toast.error("User ID is missing");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/api/admin/reject-instructor/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData((prev) => ({ ...prev, status: "blocked", isApproved: false }));
      toast.success(`User #${userId} has been rejected`);

      // Refetch to ensure UI matches backend state
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data?.user || response.data);
      } catch (e) {
        // Ignore refetch failure; UI was already updated optimistically
      }
    } catch (error) {
      console.error(
        "Error rejecting user:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to reject user");
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const blockUrl = `${API_BASE_URL}/api/admin/block/${userId}`;
      console.log("🔒 Blocking user at URL:", blockUrl);
      console.log("🔒 User ID:", userId);

      const response = await axios.put(
        blockUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Block response:", response.data);
      toast.success("User blocked successfully");
      setUserData((prev) => ({ ...prev, status: "blocked" }));
    } catch (error) {
      console.error("❌ Error blocking user:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error URL:", error.config?.url);
      toast.error(`Failed to block user: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const unblockUrl = `${API_BASE_URL}/api/admin/unblock/${userId}`;
      console.log("🔓 Unblocking user at URL:", unblockUrl);
      console.log("🔓 User ID:", userId);

      const response = await axios.put(
        unblockUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("✅ Unblock response:", response.data);
      toast.success(response.data.message || "User unblocked successfully");
      setUserData((prev) => ({ ...prev, status: "active" }));
    } catch (error) {
      console.error("❌ Error unblocking user:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error URL:", error.config?.url);
      toast.error(`Failed to unblock user: ${error.response?.data?.message || error.message}`);
    }
  };

  const getUserInitials = () => {
    if (!userData?.name) return "";
    const nameParts = userData.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0];
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fidel-500"></div>
      </div>
    );
  }

  if (!userData) {
    return <div className="text-center">User not found</div>;
  }


  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Approved";
      case "blocked":
        return "Blocked";
      case "pending":
        return "Pending Approval";
      default:
        return "Unknown";
    }
  };

  return (
    <div className={embedded ? "" : "container mx-auto py-8 px-4"}>
    {!embedded && (
      <div className="flex justify-start mb-6">
      <Button variant="ghost" onClick={onBack}>
        <ChevronLeft size={16} className="mr-2" />
        Back to User Management
      </Button>
    </div>
    
    )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24">
                <UserAvatar getUserInitials={getUserInitials} />
              </div>
            </div>
            <CardTitle>{userData.name}</CardTitle>
            <CardDescription>
              <span className="capitalize">{userData.role}</span>
              <div className="flex items-center justify-center mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    userData.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : userData.status === "blocked"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {getStatusLabel(userData.status)}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail size={16} className="text-muted-foreground mr-2" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="text-muted-foreground mr-2" />
                <span>
                  Joined {new Date(userData.createdAt).toLocaleDateString()}
                </span>
              </div>
              {userData.phone && (
                <div className="flex items-center">
                  <User size={16} className="text-muted-foreground mr-2" />
                  <span>{userData.phone}</span>
                </div>
              )}
            </div>

            <Separator className="my-6" />


            {userData.role === "instructor" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Documents</h3>
                {userData.cv && (
                  <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                    <div className="flex items-center">
                      <FileText
                        size={16}
                        className="text-muted-foreground mr-2"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {userData.cv.split("/").pop()}
                        </p>
                        <p className="text-xs text-muted-foreground">CV</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(userData.cv)}
                      className="h-8 w-8"
                    >
                      <Download size={16} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {userData.status === "pending" ? (
              <>
                <Button
                  className="w-full flex items-center"
                  onClick={() => handleApproveUser(userData._id)}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve User
                </Button>
                <Button
                  variant="destructive"
                  className="w-full flex items-center"
                  onClick={() => handleRejectUser(userData)}
                >
                  <XCircle size={16} className="mr-2" />
                  Reject User
                </Button>
              </>
            ) : userData.status === "active" ? (
              <Button
                variant="outline"
                className="w-full flex items-center text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-950/30"
                onClick={() => handleBlockUser(userData._id)}
              >
                <Ban size={16} className="mr-2" />
                Block User
              </Button>
            ) : userData.status === "blocked" ? (
              <Button
                variant="outline"
                className="w-full flex items-center text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30"
                onClick={() => handleUnblockUser(userData._id)}
              >
                <Unlock size={16} className="mr-2" />
                Unblock User
              </Button>
            ) : null}
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Complete profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                {userData.role === "instructor" && (
                  <TabsTrigger value="expertise">Expertise</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                {userData.bio && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Bio</h3>
                    <p className="text-sm text-muted-foreground">
                      {userData.bio}
                    </p>
                  </div>
                )}
                {userData.address && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Address</h3>
                    <p className="text-sm text-muted-foreground">
                      {userData.address}
                    </p>
                  </div>
                )}
              </TabsContent>

              {userData.role === "instructor" && (
                <TabsContent value="expertise">
                  <div className="space-y-4">
                    {userData.expertise && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">
                          Areas of Expertise
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userData.expertise}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
