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
import { format, addDays, isBefore, isAfter } from "date-fns";

type LeaveApplication = {
  id: string;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  actionDate?: Date;
  wardenComment?: string;
};

export default function StudentLeavePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLeave, setNewLeave] = useState({
    fromDate: undefined as Date | undefined,
    toDate: undefined as Date | undefined,
    reason: ''
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time part for accurate date comparison

  // Calculate duration in days
  const calculateDuration = (from: Date, to: Date) => {
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  // Date validation
  const validateDates = (from: Date | undefined, to: Date | undefined) => {
    if (!from || !to) return false;
    
    // From date must be today or later
    if (isBefore(from, today)) return false;
    
    // To date must be after from date
    if (isBefore(to, from)) return false;
    
    return true;
  };

  // Fetch leave applications
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData: LeaveApplication[] = [
          {
            id: '1',
            fromDate: addDays(today, 5),
            toDate: addDays(today, 7),
            reason: 'Family wedding in hometown',
            status: 'approved',
            actionDate: addDays(today, 3),
            wardenComment: 'Approved. Have a safe journey.'
          },
          {
            id: '2',
            fromDate: addDays(today, 10),
            toDate: addDays(today, 12),
            reason: 'Medical checkup at hospital',
            status: 'pending'
          },
          {
            id: '3',
            fromDate: addDays(today, -5),
            toDate: addDays(today, -3),
            reason: 'Personal family matter',
            status: 'rejected',
            actionDate: addDays(today, -7),
            wardenComment: 'Rejected. Please provide more details.'
          }
        ];
        
        setLeaveApplications(mockData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load leave applications",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredApplications = leaveApplications.filter(app => 
    activeTab === 'all' ? true : app.status === activeTab
  );

  const handleSubmitLeave = () => {
    if (!newLeave.fromDate || !newLeave.toDate || !newLeave.reason) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    if (!validateDates(newLeave.fromDate, newLeave.toDate)) {
      toast({
        title: "Error",
        description: "Invalid date selection. Please check your dates.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      setTimeout(() => {
        if (editingId) {
          // Update existing application
          setLeaveApplications(prev => prev.map(app => 
            app.id === editingId ? {
              ...app,
              fromDate: newLeave.fromDate!,
              toDate: newLeave.toDate!,
              reason: newLeave.reason,
              status: 'pending'
            } : app
          ));
          toast({
            title: "Success",
            description: "Leave application updated",
          });
        } else {
          // Create new application
          const newApplication: LeaveApplication = {
            id: `L${leaveApplications.length + 1}`,
            fromDate: newLeave.fromDate!,
            toDate: newLeave.toDate!,
            reason: newLeave.reason,
            status: 'pending'
          };
          setLeaveApplications(prev => [newApplication, ...prev]);
          toast({
            title: "Success",
            description: "Leave application submitted",
          });
        }

        // Reset form
        setNewLeave({
          fromDate: undefined,
          toDate: undefined,
          reason: ''
        });
        setIsCreating(false);
        setEditingId(null);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleEdit = (app: LeaveApplication) => {
    setNewLeave({
      fromDate: app.fromDate,
      toDate: app.toDate,
      reason: app.reason
    });
    setEditingId(app.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        setLeaveApplications(prev => prev.filter(app => app.id !== id));
        toast({
          title: "Success",
          description: "Leave application deleted",
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setNewLeave({
      fromDate: undefined,
      toDate: undefined,
      reason: ''
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
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Pending
        </Badge>;
    }
  };

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

      {/* Leave Request Form */}
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
                  <label className="block text-sm font-medium">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {newLeave.fromDate ? format(newLeave.fromDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newLeave.fromDate}
                        onSelect={(date) => {
                          if (date) {
                            setNewLeave(prev => ({
                              ...prev,
                              fromDate: date,
                              // Reset toDate if it's now before fromDate
                              toDate: prev.toDate && isBefore(prev.toDate, date) ? undefined : prev.toDate
                            }));
                          }
                        }}
                        disabled={(date) => isBefore(date, today)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {newLeave.fromDate && isBefore(newLeave.fromDate, today) && (
                    <p className="text-sm text-red-500">From date cannot be in the past</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={!newLeave.fromDate}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {newLeave.toDate ? format(newLeave.toDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newLeave.toDate}
                        onSelect={(date) => date && setNewLeave(prev => ({ ...prev, toDate: date }))}
                        disabled={(date) => 
                          !newLeave.fromDate || 
                          isBefore(date, newLeave.fromDate) ||
                          isBefore(date, today)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {newLeave.toDate && newLeave.fromDate && isBefore(newLeave.toDate, newLeave.fromDate) && (
                    <p className="text-sm text-red-500">To date must be after from date</p>
                  )}
                </div>
              </div>
              
              {newLeave.fromDate && newLeave.toDate && validateDates(newLeave.fromDate, newLeave.toDate) && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">
                      {format(newLeave.fromDate, 'MMM d')} - {format(newLeave.toDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">
                      {calculateDuration(newLeave.fromDate, newLeave.toDate)}
                    </span>
                  </div>
                </div>
              )}

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
                !newLeave.fromDate || 
                !newLeave.toDate || 
                !newLeave.reason ||
                !validateDates(newLeave.fromDate, newLeave.toDate)
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

      {/* Leave Applications Table */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
                        <TableHead>Date Range</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow key={leave.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-blue-600" />
                              {format(leave.fromDate, 'MMM d')} - {format(leave.toDate, 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              {calculateDuration(leave.fromDate, leave.toDate)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {leave.reason}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(leave.status)}
                              {leave.wardenComment && (
                                <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                                  {leave.wardenComment}
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
                                    onClick={() => handleDelete(leave.id)}
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