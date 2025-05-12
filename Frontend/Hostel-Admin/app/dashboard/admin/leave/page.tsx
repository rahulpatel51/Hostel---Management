"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Filter, Search, XCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

type Student = {
  _id: string;
  userId: {
    username: string;
    profilePicture?: string;
  };
  name: string;
  rollNumber: string;
  roomId?: {
    roomNumber: string;
    block: string;
  };
};

type LeaveApplication = {
  _id: string;
  student: Student;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  approvedBy?: {
    name: string;
  };
  approvalDate?: string;
  createdAt: string;
};

export default function LeaveApprovalsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate duration between two dates
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Fetch leave applications from API
  useEffect(() => {
   const fetchLeaveApplications = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('adminToken'); 

    const response = await fetch('http://localhost:5000/api/admin/leave', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      setLeaveApplications(data.data);
    } else {
      throw new Error(data.message || 'Failed to fetch leave applications');
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to load leave applications',
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};


    fetchLeaveApplications();
  }, [toast]);

  // Filter applications based on search term and status
  useEffect(() => {
    let filtered = leaveApplications;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.student.name.toLowerCase().includes(term) || 
        app.student.rollNumber.toLowerCase().includes(term) ||
        (app.student.roomId?.roomNumber.toLowerCase().includes(term) ?? false) ||
        app.reason.toLowerCase().includes(term)
      );
    }
    
    // Apply tab filter
    filtered = filtered.filter(app => activeTab === 'pending' ? app.status === 'pending' : 
                                  activeTab === 'approved' ? app.status === 'approved' : 
                                  app.status === 'rejected');
    
    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, leaveApplications, activeTab]);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected', remarks = '') => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('adminToken'); // Get token from localStorage

    const response = await fetch(`http://localhost:5000/api/admin/leave/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Add token in Authorization header
      },
      body: JSON.stringify({ status, remarks }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to update leave status');
    }

    // Update local state with the updated leave application
    setLeaveApplications(prev => 
      prev.map(app => app._id === id ? data.data : app)
    );

    toast({
      title: "Success",
      description: `Leave application ${status}`,
    });
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to update application',
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Leave Approvals</h1>
        <p className="text-muted-foreground">Manage and approve student leave applications</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, roll number, room, or reason..."
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending
            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
              {leaveApplications.filter(app => app.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            Approved
            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
              {leaveApplications.filter(app => app.status === 'approved').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Rejected
            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
              {leaveApplications.filter(app => app.status === 'rejected').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pending Leave Applications
                <Badge variant="outline" className="px-2 py-0.5">
                  {filteredApplications.length} applications
                </Badge>
              </CardTitle>
              <CardDescription>Leave applications awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Search className="h-8 w-8" />
                  <p>No pending leave applications found</p>
                  <Button variant="ghost" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[200px]">Student</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>From Date</TableHead>
                        <TableHead>To Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={leave.student.userId.profilePicture} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                                <p className="text-sm text-muted-foreground">{leave.student.rollNumber}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {leave.student.roomId ? 
                              `${leave.student.roomId.block}-${leave.student.roomId.roomNumber}` : 
                              'N/A'}
                          </TableCell>
                          <TableCell>{formatDate(leave.startDate)}</TableCell>
                          <TableCell>{formatDate(leave.endDate)}</TableCell>
                          <TableCell>{calculateDuration(leave.startDate, leave.endDate)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                                onClick={() => handleStatusUpdate(leave._id, 'approved')}
                                disabled={isLoading}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                                disabled={isLoading}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Approved Leave Applications
                <Badge variant="outline" className="px-2 py-0.5">
                  {filteredApplications.length} applications
                </Badge>
              </CardTitle>
              <CardDescription>Leave applications that have been approved</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Search className="h-8 w-8" />
                  <p>No approved leave applications found</p>
                  <Button variant="ghost" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[200px]">Student</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>From Date</TableHead>
                        <TableHead>To Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Approved On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={leave.student.userId.profilePicture} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                                <p className="text-sm text-muted-foreground">{leave.student.rollNumber}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {leave.student.roomId ? 
                              `${leave.student.roomId.block}-${leave.student.roomId.roomNumber}` : 
                              'N/A'}
                          </TableCell>
                          <TableCell>{formatDate(leave.startDate)}</TableCell>
                          <TableCell>{formatDate(leave.endDate)}</TableCell>
                          <TableCell>{calculateDuration(leave.startDate, leave.endDate)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                          <TableCell>{leave.approvedBy?.name || 'System'}</TableCell>
                          <TableCell>{leave.approvalDate ? formatDate(leave.approvalDate) : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Rejected Leave Applications
                <Badge variant="outline" className="px-2 py-0.5">
                  {filteredApplications.length} applications
                </Badge>
              </CardTitle>
              <CardDescription>Leave applications that have been rejected</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Search className="h-8 w-8" />
                  <p>No rejected leave applications found</p>
                  <Button variant="ghost" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[200px]">Student</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>From Date</TableHead>
                        <TableHead>To Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Rejected On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={leave.student.userId.profilePicture} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                                <p className="text-sm text-muted-foreground">{leave.student.rollNumber}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {leave.student.roomId ? 
                              `${leave.student.roomId.block}-${leave.student.roomId.roomNumber}` : 
                              'N/A'}
                          </TableCell>
                          <TableCell>{formatDate(leave.startDate)}</TableCell>
                          <TableCell>{formatDate(leave.endDate)}</TableCell>
                          <TableCell>{calculateDuration(leave.startDate, leave.endDate)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{leave.remarks || 'N/A'}</TableCell>
                          <TableCell>{leave.approvalDate ? formatDate(leave.approvalDate) : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}