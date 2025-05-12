"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Filter, Search, XCircle, Loader2, CalendarDays, Home, Stethoscope, Clock, User, Phone, FileText, ChevronRight, MapPin, AlertCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

type Student = {
  _id: string;
  userId: {
    username: string;
    profilePicture?: string;
  };
  name: string;
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
  leaveType: string;
  destination: string;
  contactDuringLeave: string;
  parentApproval: boolean;
  documents: string[];
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
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Get leave type icon
  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4 text-blue-500" />;
      case 'medical':
        return <Stethoscope className="h-4 w-4 text-red-500" />;
      default:
        return <CalendarDays className="h-4 w-4 text-purple-500" />;
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">{status}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{status}</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">{status}</Badge>;
    }
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
      filtered = filtered.filter(app => {
        const studentName = app.student.name?.toLowerCase() || '';
        const roomNumber = app.student.roomId?.roomNumber?.toLowerCase() || '';
        const reason = app.reason?.toLowerCase() || '';
        
        return (
          studentName.includes(term) || 
          roomNumber.includes(term) ||
          reason.includes(term)
        );
      });
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
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:5000/api/admin/leave/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  const openApplicationDetails = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-cal">Leave Approvals</h1>
        <p className="text-muted-foreground text-sm">Manage and approve student leave applications</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name,  room, or reason..."
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
            <XCircle className="mr-2 h-4 w-4" />
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Clock className="h-5 w-5" />
                    Pending Leave Applications
                  </CardTitle>
                  <CardDescription>Leave applications awaiting your approval</CardDescription>
                </div>
                <Badge variant="outline" className="px-2 py-1 bg-white dark:bg-gray-900 text-blue-800 dark:text-blue-200">
                  {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2">Loading applications...</span>
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
                <div className="rounded-b-md border">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                      <TableRow>
                        <TableHead className="w-[200px]">Student</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow 
                          key={leave._id} 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          onClick={() => openApplicationDetails(leave)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                                <AvatarImage src={leave.student.userId.profilePicture} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLeaveTypeIcon(leave.leaveType)}
                              <span className="capitalize">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {leave.student.roomId ? 
                              <Badge variant="outline">
                                {leave.student.roomId.block}-{leave.student.roomId.roomNumber}
                              </Badge> : 
                              'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(leave.startDate)}</span>
                              <span className="text-xs text-muted-foreground">to {formatDate(leave.endDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {calculateDuration(leave.startDate, leave.endDate)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(leave._id, 'approved');
                                }}
                                disabled={isLoading}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(leave._id, 'rejected');
                                }}
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="h-5 w-5" />
                    Approved Leave Applications
                  </CardTitle>
                  <CardDescription>Leave applications that have been approved</CardDescription>
                </div>
                <Badge variant="outline" className="px-2 py-1 bg-white dark:bg-gray-900 text-green-800 dark:text-green-200">
                  {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2">Loading applications...</span>
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
                <div className="rounded-b-md border">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                      <TableRow>
                        <TableHead className="w-[200px]">Student</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Approved On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow 
                          key={leave._id} 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          onClick={() => openApplicationDetails(leave)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                                <AvatarImage src={leave.student.userId.profilePicture} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLeaveTypeIcon(leave.leaveType)}
                              <span className="capitalize">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {leave.student.roomId ? 
                              <Badge variant="outline">
                                {leave.student.roomId.block}-{leave.student.roomId.roomNumber}
                              </Badge> : 
                              'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(leave.startDate)}</span>
                              <span className="text-xs text-muted-foreground">to {formatDate(leave.endDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {calculateDuration(leave.startDate, leave.endDate)}
                            </Badge>
                          </TableCell>
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-t-lg border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <XCircle className="h-5 w-5" />
                    Rejected Leave Applications
                  </CardTitle>
                  <CardDescription>Leave applications that have been rejected</CardDescription>
                </div>
                <Badge variant="outline" className="px-2 py-1 bg-white dark:bg-gray-900 text-red-800 dark:text-red-200">
                  {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2">Loading applications...</span>
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
                <div className="rounded-b-md border">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                      <TableRow>
                        <TableHead className="w-[200px]">Student</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Rejected On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow 
                          key={leave._id} 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          onClick={() => openApplicationDetails(leave)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                                <AvatarImage src={leave.student.userId.profilePicture} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLeaveTypeIcon(leave.leaveType)}
                              <span className="capitalize">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {leave.student.roomId ? 
                              <Badge variant="outline">
                                {leave.student.roomId.block}-{leave.student.roomId.roomNumber}
                              </Badge> : 
                              'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(leave.startDate)}</span>
                              <span className="text-xs text-muted-foreground">to {formatDate(leave.endDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {calculateDuration(leave.startDate, leave.endDate)}
                            </Badge>
                          </TableCell>
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

      {/* Application Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedApplication.student.userId.profilePicture} />
                    <AvatarFallback>{selectedApplication.student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{selectedApplication.student.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedApplication.student.roomId && (
                        <Badge variant="outline" className="text-xs">
                          {selectedApplication.student.roomId.block}-{selectedApplication.student.roomId.roomNumber}
                        </Badge>
                      )}
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <CalendarDays className="h-5 w-5" />
                      Leave Details
                    </h3>
                    <div className="mt-3 space-y-3 pl-7">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="flex items-center gap-1 font-medium">
                          {getLeaveTypeIcon(selectedApplication.leaveType)}
                          <span className="capitalize">{selectedApplication.leaveType}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">From:</span>
                        <span className="font-medium">{formatDate(selectedApplication.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">To:</span>
                        <span className="font-medium">{formatDate(selectedApplication.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {calculateDuration(selectedApplication.startDate, selectedApplication.endDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Applied On:</span>
                        <span className="font-medium">
                          {formatDate(selectedApplication.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
                      <MapPin className="h-5 w-5" />
                      Destination
                    </h3>
                    <div className="mt-3 space-y-3 pl-7">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Going to:</span>
                        <span className="font-medium text-right max-w-[150px]">
                          {selectedApplication.destination}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Parent Approval:</span>
                        <span>
                          {selectedApplication.parentApproval ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Not Approved
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-medium flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <User className="h-5 w-5" />
                      Contact Information
                    </h3>
                    <div className="mt-3 space-y-3 pl-7">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Contact During Leave:</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="h-4 w-4" />
                          {selectedApplication.contactDuringLeave}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-medium flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <FileText className="h-5 w-5" />
                      Reason & Remarks
                    </h3>
                    <div className="mt-3 space-y-4 pl-7">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                        <p className="p-3 bg-white dark:bg-gray-900 rounded-md text-sm">
                          {selectedApplication.reason}
                        </p>
                      </div>
                      {selectedApplication.remarks && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Remarks:</p>
                          <p className="p-3 bg-white dark:bg-gray-900 rounded-md text-sm">
                            {selectedApplication.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedApplication.status === 'pending' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h3 className="font-medium flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-5 w-5" />
                        Pending Action
                      </h3>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                          onClick={() => {
                            handleStatusUpdate(selectedApplication._id, 'approved');
                            setIsDialogOpen(false);
                          }}
                          disabled={isLoading}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                          onClick={() => {
                            handleStatusUpdate(selectedApplication._id, 'rejected');
                            setIsDialogOpen(false);
                          }}
                          disabled={isLoading}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedApplication.status !== 'pending' && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-medium flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Info className="h-5 w-5" />
                        Decision Information
                      </h3>
                      <div className="mt-3 space-y-3 pl-7">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {selectedApplication.status === 'approved' ? 'Approved By:' : 'Rejected By:'}
                          </span>
                          <span className="font-medium">
                            {selectedApplication.approvedBy?.name || 'System'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {selectedApplication.status === 'approved' ? 'Approved On:' : 'Rejected On:'}
                          </span>
                          <span className="font-medium">
                            {selectedApplication.approvalDate ? formatDate(selectedApplication.approvalDate) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}