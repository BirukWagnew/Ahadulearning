import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaBan, FaUnlock } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, UserCheck, UserX, Eye } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UserManagement = ({ onViewUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        console.log("🔍 Making API call to:", `${API_BASE_URL}/api/admin/all-users`);
        console.log("🔍 Token exists:", !!token);
        console.log("🔍 Token length:", token.length);
        console.log("🔍 Token preview:", token.substring(0, 20) + "...");

        const response = await axios.get(
          `${API_BASE_URL}/api/admin/all-users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("🔍 Full API Response:", response);
        console.log("🔍 Response data:", response.data);
        console.log("🔍 Response status:", response.status);

        if (response.data?.success && response.data?.users) {
          setUsers(response.data.users);
          console.log("✅ Users loaded successfully:", response.data.users.length);
        } else if (response.data?.users) {
          // Fallback for old format
          setUsers(response.data.users);
          console.log("✅ Users loaded successfully (old format):", response.data.users.length);
        } else {
          console.log("❌ Invalid API Response:", response.data);
          toast.error("Invalid API response format");
          setUsers([]);
        }
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        console.error("❌ Error response:", error.response?.data);
        
        const errorMessage = error.response?.data?.message || error.message || "Failed to load user data";
        toast.error(errorMessage);
        setUsers([]);
        
        // Additional help for authentication errors
        if (error.response?.status === 401) {
          toast.error("Authentication failed. Please log out and log back in as an admin.");
        } else if (error.response?.status === 403) {
          toast.error("Access denied. Admin privileges required.");
        }
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === "all" || user.role === filterRole;

        const userStatus = user.status.toLowerCase();
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "active" && userStatus === "active") ||
          (filterStatus === "pending" && userStatus === "pending") ||
          (filterStatus === "blocked" && userStatus === "blocked");

        return matchesSearch && matchesRole && matchesStatus;
      })
    : [];

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

      toast.success(`User #${userId} has been approved`);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isApproved: true, status: "active" }
            : user
        )
      );
    } catch (error) {
      console.error(`Error approving User #${userId}:`, error);
      toast.error(`Failed to approve User #${userId}`);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/reject-instructor/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.error(`User #${userId} has been rejected`);
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Failed to reject user");
    }
  };

  const handleViewUser = (userId) => {
    onViewUser(userId);
  };

  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/block/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("User blocked successfully");
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, blocked: true, status: "blocked" }
            : user
        )
      );
    } catch (error) {
      console.error("Error blocking user:", error);
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

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/unblock/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success(response.data.message || "User unblocked successfully");
      const nextStatus = response.data?.user?.status || "active";
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, blocked: false, status: nextStatus }
            : user
        )
      );
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error(`Failed to unblock user: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage all users across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={filterStatus === "all" ? "default" : "ghost"}
            onClick={() => setFilterStatus("all")}
            className="whitespace-nowrap"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "ghost"}
            onClick={() => setFilterStatus("active")}
            className="whitespace-nowrap"
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "ghost"}
            onClick={() => setFilterStatus("pending")}
            className="whitespace-nowrap"
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "blocked" ? "default" : "ghost"}
            onClick={() => setFilterStatus("blocked")}
            className="whitespace-nowrap"
          >
            Blocked
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-9 w-full md:w-64"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="instructor">Instructors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter size={16} />
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers
                .sort((a, b) => {
                  if (a.role === "student" && b.role !== "student") return -1;
                  if (a.role !== "student" && b.role === "student") return 1;
                  if (a.status === "Active" && b.status !== "Active") return -1;
                  if (a.status !== "Active" && b.status === "Active") return 1;
                  return 0;
                })
                .map((user) => {
                  const userStatus = user.status.toLowerCase();
                  const isPendingInstructor = user.role === "instructor" && userStatus === "pending";
                  return (
                    <TableRow
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell>#{user._id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="capitalize">{user.role}</span>
                      </TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewUser(user._id)}
                            className="h-8 w-8"
                          >
                            <Eye size={16} />
                          </Button>

                          {isPendingInstructor && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApproveUser(user._id)}
                                className="h-8 w-8 text-green-600"
                              >
                                <UserCheck size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRejectUser(user._id)}
                                className="h-8 w-8 text-red-600"
                              >
                                <UserX size={16} />
                              </Button>
                            </>
                          )}

                          {userStatus === "active" && !user.blocked && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleBlockUser(user._id)}
                              className="h-8 w-8 text-yellow-600"
                            >
                              <FaBan size={16} />
                            </Button>
                          )}

                          {(userStatus === "blocked" || user.blocked) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnblockUser(user._id)}
                              className="h-8 w-8 text-green-600"
                            >
                              <FaUnlock size={16} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{filteredUsers.length}</span> of{" "}
          <span className="font-medium">{users.length}</span> users
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-fidel-50 dark:bg-slate-800"
          >
            1
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserManagement;
