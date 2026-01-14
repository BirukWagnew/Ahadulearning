import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  Layers,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import CourseEarnings from "./analytics/CourseEarnings";
import CourseRatingsFeedback from "./analytics/CourseRatingsFeedback";
import StudentProgressCompletion from "./analytics/StudentProgressCompletion";
import StudentEnrollmentsPerCourse from "./analytics/StudentEnrollmentsPerCourse";

const PlatformAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState("30days");
  const [paymentMethod, setPaymentMethod] = useState("chapa");
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  
  // State for real data
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real platform data
  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          setError("Authentication required");
          return;
        }

        console.log("Fetching analytics data...");
        
        // Fetch platform overview
        const overviewResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/admin/graphs/overview`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Analytics response:", overviewResponse.data);

        if (overviewResponse.data?.success) {
          setPlatformData(overviewResponse.data);
          setError(null);
        } else {
          throw new Error(overviewResponse.data?.message || "Failed to fetch platform data");
        }
      } catch (error) {
        console.error("Error fetching platform data:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to load analytics data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, []);

  const resetDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Get platform stats from real data or fallback
  const getPlatformStats = () => {
    if (!platformData?.overview) return [];
    
    const { overview } = platformData;
    return [
      {
        title: "Total Users",
        value: formatNumber(overview.totalUsers || 0),
        icon: Users,
        change: "+12.5%",
        chart: "up",
        dataKey: "students",
      },
      {
        title: "Total Instructors",
        value: formatNumber(overview.totalInstructors || 0),
        icon: BookOpen,
        change: "+4.3%",
        chart: "up",
        dataKey: "instructors",
      },
      {
        title: "Total Courses",
        value: formatNumber(overview.totalCourses || 0),
        icon: Layers,
        change: "+7.8%",
        chart: "up",
        dataKey: "students",
      },
      {
        title: "Total Revenue",
        value: formatCurrency(overview.totalRevenue || 0),
        icon: DollarSign,
        change: "+18.2%",
        chart: "up",
        dataKey: "students",
      },
    ];
  };

  // Get user growth data
  const getUserGrowthData = () => {
    if (!platformData?.userGrowth || !Array.isArray(platformData.userGrowth)) return [];
    return platformData.userGrowth.map(item => ({
      name: item._id,
      students: item.students || 0,
      instructors: item.instructors || 0,
      total: item.total || 0,
    }));
  };

  // Get monthly revenue data
  const getMonthlyRevenueData = () => {
    if (!platformData?.monthlyRevenue || !Array.isArray(platformData.monthlyRevenue)) return [];
    return platformData.monthlyRevenue.map(item => ({
      month: item._id,
      revenue: item.revenue || 0,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>
                  Loading analytics data...
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fidel-500 border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>
                  Error loading analytics data
                </CardDescription>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-red-500 text-center">Error: {error}</p>
              <div className="text-sm text-gray-500 text-center max-w-md">
                <p>Please check:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>You are logged in as an admin</li>
                  <li>Your internet connection is stable</li>
                  <li>The backend server is running</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>
                Real-time insights into platform performance
              </CardDescription>
            </div>
          </div>
        </CardHeader>  
        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {getPlatformStats().map((stat, index) => (
              <Card
                key={stat.title}
                className="border-none shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-fidel-50 dark:bg-slate-800">
                      <stat.icon
                        size={18}
                        className="text-fidel-500 dark:text-fidel-400"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp size={14} className="text-green-500" />
                      <p className="text-xs text-green-500">
                        {stat.change} vs previous period
                      </p>
                    </div>
                  </div>
                  {/* Small Area Chart */}
                  <div className="mt-4 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={getUserGrowthData()}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop stopColor="#8884d8" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="user-growth">User Growth</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getUserGrowthData()}>
                          <CartesianGrid strokeDasharray="3 3 0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="students" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="instructors" 
                            stroke="#82ca9d" 
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getMonthlyRevenueData()}>
                          <CartesianGrid strokeDasharray="3 3 0" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="revenue" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="user-growth">
              <div className="space-y-4">
                <StudentProgressCompletion />
              </div>
            </TabsContent>

            <TabsContent value="revenue">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Statistics</CardTitle>
                    <CardDescription>
                      Track your platform's financial performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <h4 className="text-2xl font-bold">{formatCurrency(platformData?.overview?.totalRevenue || 0)}</h4>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                        </div>
                        <div className="text-center">
                          <h4 className="text-2xl font-bold">{formatNumber(platformData?.overview?.totalEnrollments || 0)}</h4>
                          <p className="text-sm text-muted-foreground">Total Enrollments</p>
                        </div>
                        <div className="text-center">
                          <h4 className="text-2xl font-bold">{formatNumber(platformData?.overview?.totalCourses || 0)}</h4>
                          <p className="text-sm text-muted-foreground">Total Courses</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="enrollments">
              <div className="space-y-4">
                <StudentEnrollmentsPerCourse />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAnalytics;