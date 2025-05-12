"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Loader2, PlusCircle, CalendarDays, Clock, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isBefore } from "date-fns";

interface LeaveApplication {
  _id: string;
  student: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  destination: string;
  contactDuringLeave: string;
  parentApproval: boolean;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvalDate?: Date;
  remarks?: string;
  actualReturnDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface LeaveFormData {
  leaveType: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  reason: string;
  destination: string;
  contactDuringLeave: string;
  parentApproval: boolean;
}

export default function StudentLeavePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLeave, setNewLeave] = useState<LeaveFormData>({
    leaveType: 'home',
    startDate: undefined,
    endDate: undefined,
    reason: '',
    destination: '',
    contactDuringLeave: '',
    parentApproval: false
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calculateDuration = (from: Date, to: Date): string => {
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const validateDates = (from: Date | undefined, to: Date | undefined): boolean => {
    if (!from || !to) return false;
    if (isBefore(from, today)) return false;
    if (isBefore(to, from)) return false;
    return true;
  };

  const fetchLeaveApplications = async () => {
  setIsLoading(true);
  try {
    const response = await fetch('http://localhost:5000/api/student/leave', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch leave applications');
    }
    
    const data = await response.json();
    
    // Debugging: log the received data
    console.log('Received data:', data);
    
    // Check if data is an array or if it's an object containing an array
    let applications = Array.isArray(data) ? data : data.data || data.applications || [];
    
    if (!Array.isArray(applications)) {
      throw new Error('Invalid data format: expected an array of leave applications');
    }

    const formattedData = applications.map((app: any) => ({
      ...app,
      startDate: new Date(app.startDate),
      endDate: new Date(app.endDate),
      createdAt: new Date(app.createdAt),
      updatedAt: new Date(app.updatedAt),
      ...(app.approvalDate && { approvalDate: new Date(app.approvalDate) }),
      ...(app.actualReturnDate && { actualReturnDate: new Date(app.actualReturnDate) })
    }));

    setLeaveApplications(formattedData);
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    setLeaveApplications([]);
    toast({
      title: "Error",
      description: "Failed to load leave applications",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchLeaveApplications();
  }, []);

  const filteredApplications = leaveApplications.filter(app => 
    activeTab === 'all' ? true : app.status === activeTab
  );

  const handleSubmitLeave = async () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason || 
        !newLeave.destination || !newLeave.contactDuringLeave) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!validateDates(newLeave.startDate, newLeave.endDate)) {
      toast({
        title: "Error",
        description: "Invalid date selection. Please check your dates.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = editingId 
        ? `http://localhost:5000/api/student/leave/${editingId}`
        : 'http://localhost:5000/api/student/leave';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          leaveType: newLeave.leaveType,
          startDate: newLeave.startDate,
          endDate: newLeave.endDate,
          reason: newLeave.reason,
          destination: newLeave.destination,
          contactDuringLeave: newLeave.contactDuringLeave,
          parentApproval: newLeave.parentApproval,
          status: 'pending'
        })
      });

      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update leave application' : 'Failed to submit leave application');
      }

      await fetchLeaveApplications();
      
      toast({
        title: "Success",
        description: editingId ? "Leave application updated successfully" : "Leave application submitted successfully",
      });

      setNewLeave({
        leaveType: 'home',
        startDate: undefined,
        endDate: undefined,
        reason: '',
        destination: '',
        contactDuringLeave: '',
        parentApproval: false
      });
      setIsCreating(false);
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (app: LeaveApplication) => {
    setNewLeave({
      leaveType: app.leaveType,
      startDate: app.startDate,
      endDate: app.endDate,
      reason: app.reason,
      destination: app.destination,
      contactDuringLeave: app.contactDuringLeave,
      parentApproval: app.parentApproval
    });
    setEditingId(app._id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave application?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/student/leave/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete leave application');
      }
      
      await fetchLeaveApplications();
      toast({
        title: "Success",
        description: "Leave application deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete application',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setNewLeave({
      leaveType: 'home',
      startDate: undefined,
      endDate: undefined,
      reason: '',
      destination: '',
      contactDuringLeave: '',
      parentApproval: false
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" /> Approved
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <XCircle className="h-3 w-3 mr-1" /> Rejected
        </Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
          Cancelled
        </Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Pending
        </Badge>;
    }
  };

  const leaveTypeOptions = [
    { value: 'home', label: 'Home Leave' },
    { value: 'medical', label: 'Medical Leave' },
    { value: 'academic', label: 'Academic Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
            <CardDescription>
              Request and track your leave applications
            </CardDescription>
          </div>
          {!isCreating && (
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Leave Request
            </Button>
          )}
        </div>
      </div>

      {isCreating && (
        <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">
              {editingId ? 'Edit Leave Request' : 'New Leave Request'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Leave Type</label>
                  <label htmlFor="leaveType" className="block text-sm font-medium">Leave Type</label>
                  <select
                    id="leaveType"
                    value={newLeave.leaveType}
                    onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {leaveTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Parent Approval</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="parentApproval"
                      checked={newLeave.parentApproval}
                      onChange={(e) => setNewLeave({...newLeave, parentApproval: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="parentApproval" className="text-sm font-medium leading-none">
                      Parent has approved this leave
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {newLeave.startDate ? format(newLeave.startDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newLeave.startDate}
                        onSelect={(date) => {
                          if (date) {
                            setNewLeave(prev => ({
                              ...prev,
                              startDate: date,
                              endDate: prev.endDate && isBefore(prev.endDate, date) ? undefined : prev.endDate
                            }));
                          }
                        }}
                        disabled={(date) => isBefore(date, today)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {newLeave.startDate && isBefore(newLeave.startDate, today) && (
                    <p className="text-sm text-red-500">Start date cannot be in the past</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={!newLeave.startDate}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {newLeave.endDate ? format(newLeave.endDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newLeave.endDate}
                        onSelect={(date) => date && setNewLeave(prev => ({ ...prev, endDate: date }))}
                        disabled={(date) => 
                          !newLeave.startDate || 
                          isBefore(date, newLeave.startDate) ||
                          isBefore(date, today)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {newLeave.endDate && newLeave.startDate && isBefore(newLeave.endDate, newLeave.startDate) && (
                    <p className="text-sm text-red-500">End date must be after start date</p>
                  )}
                </div>
              </div>
              
              {newLeave.startDate && newLeave.endDate && validateDates(newLeave.startDate, newLeave.endDate) && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">
                      {format(newLeave.startDate, 'MMM d')} - {format(newLeave.endDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">
                      {calculateDuration(newLeave.startDate, newLeave.endDate)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Destination</label>
                  <input
                    type="text"
                    value={newLeave.destination}
                    onChange={(e) => setNewLeave({...newLeave, destination: e.target.value})}
                    placeholder="Where will you be during leave?"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Contact During Leave</label>
                  <input
                    type="text"
                    value={newLeave.contactDuringLeave}
                    onChange={(e) => setNewLeave({...newLeave, contactDuringLeave: e.target.value})}
                    placeholder="Phone number where you can be reached"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Reason for Leave</label>
                <Textarea
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  placeholder="Please provide details about your leave reason..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelForm}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitLeave}
              disabled={
                isLoading || 
                !newLeave.startDate || 
                !newLeave.endDate || 
                !newLeave.reason ||
                !newLeave.destination ||
                !newLeave.contactDuringLeave ||
                !validateDates(newLeave.startDate, newLeave.endDate)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingId ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                editingId ? 'Update Request' : 'Submit Request'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>
                    {filteredApplications.length} leave applications
                  </CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  Today: {format(today, 'MMM d, yyyy')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <CalendarDays className="h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No leave applications found</p>
                  <Button 
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create New Request
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Date Range</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow key={leave._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {leave.leaveType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-blue-600" />
                              {format(leave.startDate, 'MMM d')} - {format(leave.endDate, 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              {calculateDuration(leave.startDate, leave.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {leave.destination}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(leave.status)}
                              {leave.remarks && (
                                <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                                  {leave.remarks}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {leave.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEdit(leave)}
                                    className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDelete(leave._id)}
                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
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
      </Tabs>
    </div>
  );
}