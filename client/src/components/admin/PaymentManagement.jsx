import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, FileText, FileDown, Check, X, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        // Fetch payments and withdrawals in parallel
        const [paymentsResponse, withdrawalsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/payments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/withdrawals`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Handle payments response with better error handling
        if (paymentsResponse.data?.success) {
          setTransactions(paymentsResponse.data.payments || []);
        } else if (paymentsResponse.data?.payments) {
          setTransactions(paymentsResponse.data.payments);
        } else {
          console.error("Payments API response:", paymentsResponse.data);
          setTransactions([]);
        }

        // Handle withdrawals response with better error handling
        if (withdrawalsResponse.data?.success) {
          setPayoutRequests(withdrawalsResponse.data.withdrawals || []);
        } else if (withdrawalsResponse.data?.withdrawals) {
          setPayoutRequests(withdrawalsResponse.data.withdrawals);
        } else {
          console.error("Withdrawals API response:", withdrawalsResponse.data);
          setPayoutRequests([]);
        }

      } catch (err) {
        console.error("Error fetching payment data:", err);
        setError("Failed to fetch payment data");
        toast.error("Failed to load payment data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fidel-600"></div>
        <span className="ml-2 text-gray-600">Loading payment data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading payment data</p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    const studentName = transaction.studentId?.name || '';
    const courseTitle = transaction.courseId?.title || '';
    const transactionId = transaction._id || transaction.tx_ref || '';
    
    return (
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Filter payout requests based on search query
  const filteredPayouts = payoutRequests.filter(payout => {
    const instructorName = payout.user?.name || payout.instructor || '';
    const payoutId = payout._id || payout.reference || '';
    
    return (
      instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payoutId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  const handleApprovePayout = async (payoutId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/withdrawals/approve/${payoutId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success(`Withdrawal ${payoutId} approved successfully`);
        // Update the local state to reflect the change
        setPayoutRequests(prev => 
          prev.map(payout => 
            payout._id === payoutId 
              ? { ...payout, status: 'success' }
              : payout
          )
        );
      } else {
        toast.error(response.data?.message || "Failed to approve withdrawal");
      }
    } catch (error) {
      console.error("Error approving payout:", error);
      toast.error(`Failed to approve withdrawal: ${error.response?.data?.message || error.message}`);
    }
  };
  
  const handleRejectPayout = async (payoutId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const reason = prompt("Please enter rejection reason:");
      if (!reason) return;

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/withdrawals/reject/${payoutId}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success(`Withdrawal ${payoutId} rejected successfully`);
        // Update the local state to reflect the change
        setPayoutRequests(prev => 
          prev.map(payout => 
            payout._id === payoutId 
              ? { ...payout, status: 'failed', responseMessage: reason }
              : payout
          )
        );
      } else {
        toast.error(response.data?.message || "Failed to reject withdrawal");
      }
    } catch (error) {
      console.error("Error rejecting payout:", error);
      toast.error(`Failed to reject withdrawal: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/payments/report?format=csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Report API Response:", response.data);

      // Handle different response formats
      let csvData;
      if (typeof response.data === 'string') {
        // Direct CSV string response
        csvData = response.data;
      } else if (response.data?.data && typeof response.data.data === 'string') {
        // Nested CSV string response
        csvData = response.data.data;
      } else if (response.data?.summary && response.data?.payments && response.data?.withdrawals) {
        // JSON response - convert to CSV manually
        const { summary, payments, withdrawals } = response.data;
        
        // Create CSV headers
        const headers = ['Type,ID,Date,User,Amount,Status'];
        
        // Convert payments to CSV rows
        const paymentRows = payments.map(p => [
          'Payment',
          p._id || p.tx_ref || '',
          new Date(p.createdAt || Date.now()).toLocaleDateString(),
          p.studentId?.name || 'N/A',
          p.amount?.toFixed(2) || '0.00',
          p.status || 'unknown'
        ]);
        
        // Convert withdrawals to CSV rows
        const withdrawalRows = withdrawals.map(w => [
          'Withdrawal',
          w._id || w.reference || '',
          new Date(w.createdAt || Date.now()).toLocaleDateString(),
          w.user?.name || 'N/A',
          w.amount?.toFixed(2) || '0.00',
          w.status || 'unknown'
        ]);
        
        // Combine all rows
        const allRows = [headers.join(','), ...paymentRows, ...withdrawalRows];
        csvData = allRows.join('\n');
      } else {
        console.error("Unexpected response format:", response.data);
        toast.error("Invalid response format from server");
        return;
      }

      // Create download link for CSV
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Payment report generated and downloaded");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate payment report");
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "approved":
        return (
          <span className="flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <Check size={12} className="mr-1" />
            {status === "completed" ? "Completed" : "Approved"}
          </span>
        );
      case "failed":
      case "rejected":
        return (
          <span className="flex items-center text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <X size={12} className="mr-1" />
            {status === "failed" ? "Failed" : "Rejected"}
          </span>
        );
      case "refunded":
        return (
          <span className="flex items-center text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Check size={12} className="mr-1" />
            Refunded
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <AlertCircle size={12} className="mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Payment Management</CardTitle>
        <CardDescription>Manage transactions and instructor payouts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions" onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="payouts">Instructor Payouts</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-9 w-full md:w-64" 
                  placeholder={activeTab === "transactions" ? "Search transactions..." : "Search payouts..."} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="icon">
                <FileDown size={16} />
              </Button>
              <Button variant="outline">
                <FileText size={16} className="mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
          
          <TabsContent value="transactions" className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fidel-600"></div>
                <span className="ml-2 text-gray-600">Loading transactions...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium text-center">Error loading payment data</p>
                <p className="text-gray-500 text-sm mt-2 text-center max-w-md">{error}</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-mono text-xs">{transaction._id}</TableCell>
                        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.studentId?.name || 'N/A'}</TableCell>
                        <TableCell>{transaction.courseId?.title || 'N/A'}</TableCell>
                        <TableCell className="font-mono">${transaction.amount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{transaction.instructorId?.name || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent value="payouts" className="mt-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-mono text-xs">{payout.id}</TableCell>
                      <TableCell>{payout.date}</TableCell>
                      <TableCell>{payout.instructor}</TableCell>
                      <TableCell className="font-mono">${payout.amount.toFixed(2)}</TableCell>
                      <TableCell>{payout.courses}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        {payout.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="h-8 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprovePayout(payout.id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                              onClick={() => handleRejectPayout(payout.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {payout.status !== "pending" && (
                          <Button variant="outline" size="sm" className="h-8">
                            <FileText size={14} className="mr-1" />
                            Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {activeTab === "transactions" ? (
            <>Showing <span className="font-medium">{filteredTransactions.length}</span> of <span className="font-medium">{transactions.length}</span> transactions</>
          ) : (
            <>Showing <span className="font-medium">{filteredPayouts.length}</span> of <span className="font-medium">{payoutRequests.length}</span> payout requests</>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PaymentManagement;