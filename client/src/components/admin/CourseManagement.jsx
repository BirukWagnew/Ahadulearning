import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Eye, Users, BookOpen, DollarSign, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("🔍 Courses API Response:", response.data);

        // Handle different response formats
        if (Array.isArray(response.data)) {
          // Direct array response (from enhanced backend)
          setCourses(response.data);
        } else if (response.data?.courses) {
          // Wrapped object response (fallback for old format)
          setCourses(response.data.courses);
        } else if (response.data) {
          // Direct data response
          setCourses(response.data);
        } else {
          console.log("❌ Invalid courses API response:", response.data);
          toast.error("Invalid API response format");
          setCourses([]);
        }
      } catch (error) {
        console.error("❌ Error fetching courses:", error);
        toast.error(`Failed to load courses: ${error.response?.data?.message || error.message}`);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/courses/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleCloseCourseDetail = () => {
    setSelectedCourse(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fidel-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Course Details</h3>
              <Button variant="ghost" size="sm" onClick={handleCloseCourseDetail}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Course Title</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCourse.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Instructor</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCourse.instructor?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">${selectedCourse.price || 'Free'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Students Enrolled</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCourse.enrolledStudents || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Total Lessons</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCourse.totalLessons || 0}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCourse.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCourse.status || 'active'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Created Date</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{new Date(selectedCourse.createdAt || selectedCourse.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={handleCloseCourseDetail}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">
            Manage all courses on the platform
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Courses</CardTitle>
          <CardDescription>
            Find courses by title or instructor name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>
            Manage course content, pricing, and enrollment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No courses found
              </p>
              <p className="text-sm text-slate-500">
                {searchQuery ? "Try adjusting your search terms" : "No courses have been created yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course, index) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <BookOpen size={16} className="text-fidel-500" />
                        {course.title}
                      </div>
                    </TableCell>
                    <TableCell>{course.instructor?.name}</TableCell>
                    <TableCell>${course.price || 'Free'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users size={16} className="text-slate-400" />
                        {course.enrolledStudents || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {course.status || 'active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(course.createdAt || course.updatedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCourse(course)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => alert('Edit functionality coming soon!')}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteCourse(course._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;
