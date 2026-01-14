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
import { Search, Plus, Edit, Trash2, Eye, Users, BookOpen, DollarSign, X, Mail, Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

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
          `${API_BASE_URL}/api/admin/courses?publish=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("🔍 Courses API Response:", response.data);

        let coursesData = [];
        
        // Handle different response formats from backend
        if (Array.isArray(response.data?.courses)) {
          coursesData = response.data.courses;
        } else if (Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If it's an object but doesn't have courses array, check if it's the courses array directly
          if (Array.isArray(response.data)) {
            coursesData = response.data;
          } else {
            console.log("❌ Unexpected response structure:", response.data);
            toast.error("Unexpected API response structure");
            setCourses([]);
            return;
          }
        } else {
          console.log("❌ Invalid courses API response:", response.data);
          toast.error("Invalid API response format");
          setCourses([]);
          return;
        }

        console.log("📚 Courses data received:", coursesData.length, "courses");

        // Ensure coursesData is an array before mapping
        if (!Array.isArray(coursesData)) {
          console.error("❌ coursesData is not an array:", coursesData);
          toast.error("Invalid courses data format");
          setCourses([]);
          return;
        }

        // Fetch enrollment data for each course
        const coursesWithEnrollment = await Promise.all(
          coursesData.map(async (course) => {
            let enrolledStudents = 0;
            let students = [];
            
            // Use the working admin endpoint
            try {
              const enrollmentResponse = await axios.get(
                `${API_BASE_URL}/api/admin/courses/${course._id}/students`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              
              console.log(`✅ Enrollment data from /api/admin/courses/${course._id}/students:`, enrollmentResponse.data);
              
              // Handle different response formats
              if (Array.isArray(enrollmentResponse.data?.students)) {
                students = enrollmentResponse.data.students;
              } else if (Array.isArray(enrollmentResponse.data)) {
                students = enrollmentResponse.data;
              } else if (enrollmentResponse.data?.students) {
                students = enrollmentResponse.data.students;
              }
              
              enrolledStudents = students.length;
              console.log(`📊 Course ${course.title}: ${enrolledStudents} students found`);
            } catch (error) {
              console.log(`❌ Failed to fetch enrollment for course ${course._id}:`, error.response?.status);
              // Set 0 as fallback
              enrolledStudents = 0;
            }
            
            return {
              ...course,
              enrolledStudents: enrolledStudents,
              students: students
            };
          })
        );

        setCourses(coursesWithEnrollment);
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
        `${API_BASE_URL}/api/admin/courses/${courseId}`,
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

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCourse(null);
  };

  const handleUpdateCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/courses/${editingCourse._id}`,
        editingCourse,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update courses list with updated course
      setCourses(courses.map(course => 
        course._id === editingCourse._id ? response.data : course
      ));
      
      toast.success("Course updated successfully");
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
    }
  };

  const handleCloseCourseDetail = () => {
    setSelectedCourse(null);
  };

  const fetchEnrolledStudents = async (courseId) => {
    setIsLoadingStudents(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      let students = [];
      
      // Use the working admin endpoint
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/courses/${courseId}/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(`🔍 Enrolled Students API Response:`, response.data);

        // Handle different response formats
        if (Array.isArray(response.data?.students)) {
          students = response.data.students;
        } else if (Array.isArray(response.data)) {
          students = response.data;
        } else if (response.data?.students) {
          students = response.data.students;
        }
      } catch (error) {
        console.log(`❌ Failed to fetch students for course ${courseId}:`, error.response?.status);
        students = [];
      }

      console.log(`📊 Final student count: ${students.length}`);
      setEnrolledStudents(students);
    } catch (error) {
      console.error("❌ Error fetching enrolled students:", error);
      toast.error(`Failed to load students: ${error.response?.data?.message || error.message}`);
      setEnrolledStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleViewStudents = (course) => {
    setSelectedCourse(course);
    // Use pre-fetched students data if available, otherwise fetch fresh data
    if (course.students && course.students.length > 0) {
      setEnrolledStudents(course.students);
      setShowStudentsModal(true);
    } else {
      // Fallback to fetching fresh data
      setShowStudentsModal(true);
      fetchEnrolledStudents(course._id);
    }
  };

  const handleCloseStudentsModal = () => {
    setShowStudentsModal(false);
    setEnrolledStudents([]);
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
      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Edit Course</h3>
              <Button variant="ghost" size="sm" onClick={handleCloseEditModal}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={editingCourse.title || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingCourse.category || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={editingCourse.level || ''} onValueChange={(value) => setEditingCourse({...editingCourse, level: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingCourse.price || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, price: parseFloat(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editingCourse.status || 'active'} onValueChange={(value) => setEditingCourse({...editingCourse, status: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea
                  id="requirements"
                  value={(editingCourse.requirements || []).join('\n')}
                  onChange={(e) => setEditingCourse({...editingCourse, requirements: e.target.value.split('\n').filter(r => r.trim())})}
                  className="mt-1"
                  rows={3}
                  placeholder="Enter requirements, one per line"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={handleCloseEditModal}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCourse}>
                Update Course
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && !showStudentsModal && (
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
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCourse.description}</p>
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

      {/* Enrolled Students Modal */}
      {showStudentsModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Enrolled Students</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedCourse.title} ({enrolledStudents.length} students)
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseStudentsModal}>
                ×
              </Button>
            </div>
            
            {isLoadingStudents ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fidel-500 border-t-transparent"></div>
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No students enrolled in this course yet
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.map((student, index) => (
                    <TableRow key={student._id || index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-fidel-100 dark:bg-fidel-900/30 flex items-center justify-center">
                            <span className="text-xs font-medium text-fidel-600 dark:text-fidel-400">
                              {student.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST'}
                            </span>
                          </div>
                          {student.name || 'Unknown Student'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail size={14} className="text-slate-400" />
                          <span className="text-sm">{student.email || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm">
                            {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-fidel-500 rounded-full"
                              style={{ width: `${student.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {student.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.progress === 100
                              ? 'bg-green-100 text-green-800'
                              : student.progress > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {student.progress === 100 ? 'Completed' : student.progress > 0 ? 'In Progress' : 'Not Started'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={handleCloseStudentsModal}>
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
                        <span className="cursor-pointer hover:text-fidel-600" onClick={() => handleViewStudents(course)}>
                          {course.enrolledStudents || 0}
                        </span>
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
                          onClick={() => handleEditCourse(course)}
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
