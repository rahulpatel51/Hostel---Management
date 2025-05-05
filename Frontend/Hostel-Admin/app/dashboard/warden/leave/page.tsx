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

type LeaveApplication = {
  id: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
  };
  room: string;
  fromDate: string;
  toDate: string;
  duration: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  actionDate?: string;
};

export default function LeaveApprovalsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);

  // Mock data fetch - replace with actual API call
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData: LeaveApplication[] = [
          {
            id: '1',
            student: { id: "ST2023003", name: "Michael Johnson", avatar: "/placeholder-user.jpg" },
            room: "C-310",
            fromDate: "May 10, 2023",
            toDate: "May 15, 2023",
            duration: "5 days",
            reason: "Family function",
            status: "pending"
          },
          {
            id: '2',
            student: { id: "ST2023034", name: "Priya Patel", avatar: "/placeholder-user.jpg" },
            room: "B-205",
            fromDate: "May 12, 2023",
            toDate: "May 14, 2023",
            duration: "2 days",
            reason: "Medical appointment",
            status: "pending"
          },
          {
            id: '3',
            student: { id: "ST2023056", name: "Amit Kumar", avatar: "/placeholder-user.jpg" },
            room: "A-101",
            fromDate: "May 15, 2023",
            toDate: "May 20, 2023",
            duration: "5 days",
            reason: "Personal emergency",
            status: "pending"
          },
          {
            id: '4',
            student: { id: "ST2023078", name: "Neha Singh", avatar: "/placeholder-user.jpg" },
            room: "A-204",
            fromDate: "May 18, 2023",
            toDate: "May 22, 2023",
            duration: "4 days",
            reason: "Sister's wedding",
            status: "pending"
          },
          {
            id: '5',
            student: { id: "ST2023012", name: "Rahul Sharma", avatar: "/placeholder-user.jpg" },
            room: "B-201",
            fromDate: "May 5, 2023",
            toDate: "May 8, 2023",
            duration: "3 days",
            reason: "Family function",
            status: "approved",
            actionDate: "May 2, 2023"
          },
          {
            id: '6',
            student: { id: "ST2023045", name: "Vikram Reddy", avatar: "/placeholder-user.jpg" },
            room: "B-112",
            fromDate: "May 7, 2023",
            toDate: "May 9, 2023",
            duration: "2 days",
            reason: "Medical appointment",
            status: "approved",
            actionDate: "May 3, 2023"
          },
          {
            id: '7',
            student: { id: "ST2023089", name: "Suresh Verma", avatar: "/placeholder-user.jpg" },
            room: "D-102",
            fromDate: "May 1, 2023",
            toDate: "May 10, 2023",
            duration: "9 days",
            reason: "Personal work",
            status: "rejected",
            actionDate: "April 28, 2023"
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
        app.student.id.toLowerCase().includes(term) ||
        app.room.toLowerCase().includes(term) ||
        app.reason.toLowerCase().includes(term)
      );
    }
    
    // Apply tab filter
    filtered = filtered.filter(app => activeTab === 'pending' ? app.status === 'pending' : 
                                  activeTab === 'approved' ? app.status === 'approved' : 
                                  app.status === 'rejected');
    
    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, leaveApplications, activeTab]);

  const handleApprove = (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setLeaveApplications(prev => prev.map(app => 
          app.id === id ? { ...app, status: 'approved', actionDate: new Date().toLocaleDateString() } : app
        ));
        toast({
          title: "Success",
          description: "Leave application approved",
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleReject = (id: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setLeaveApplications(prev => prev.map(app => 
          app.id === id ? { ...app, status: 'rejected', actionDate: new Date().toLocaleDateString() } : app
        ));
        toast({
          title: "Success",
          description: "Leave application rejected",
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive"
      });
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
            placeholder="Search by name, ID, room, or reason..."
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
                        <TableRow key={leave.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={leave.student.avatar} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                                <p className="text-sm text-muted-foreground">{leave.student.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{leave.room}</TableCell>
                          <TableCell>{leave.fromDate}</TableCell>
                          <TableCell>{leave.toDate}</TableCell>
                          <TableCell>{leave.duration}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                                onClick={() => handleApprove(leave.id)}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                                onClick={() => handleReject(leave.id)}
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
                        <TableHead>Approved On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={leave.student.avatar} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                                <p className="text-sm text-muted-foreground">{leave.student.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{leave.room}</TableCell>
                          <TableCell>{leave.fromDate}</TableCell>
                          <TableCell>{leave.toDate}</TableCell>
                          <TableCell>{leave.duration}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                          <TableCell>{leave.actionDate}</TableCell>
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
                        <TableHead>Rejected On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={leave.student.avatar} alt={leave.student.name} />
                                <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{leave.student.name}</p>
                                <p className="text-sm text-muted-foreground">{leave.student.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{leave.room}</TableCell>
                          <TableCell>{leave.fromDate}</TableCell>
                          <TableCell>{leave.toDate}</TableCell>
                          <TableCell>{leave.duration}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                          <TableCell>{leave.actionDate}</TableCell>
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