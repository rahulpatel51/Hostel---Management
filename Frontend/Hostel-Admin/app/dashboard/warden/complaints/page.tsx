"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertCircle, CheckCircle2, Clock, XCircle, MessageSquare, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type Complaint = {
  id: string;
  student: {
    id: string;
    name: string;
    room: string;
    profileImg: string;
  };
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
};

export default function ComplaintsManagementPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data with profile images from randomuser.me
        const mockComplaints: Complaint[] = [
          {
            id: 'CP2023001',
            student: {
              id: 'ST2023001',
              name: 'Rahul Sharma',
              room: 'A-101',
              profileImg: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            title: 'Water leakage in bathroom',
            description: 'There is continuous water leakage from the ceiling in the common bathroom',
            category: 'Maintenance',
            status: 'pending',
            createdAt: '2023-05-10T09:30:00Z'
          },
          {
            id: 'CP2023002',
            student: {
              id: 'ST2023002',
              name: 'Priya Patel',
              room: 'A-102',
              profileImg: 'https://randomuser.me/api/portraits/women/1.jpg'
            },
            title: 'Broken chair in study room',
            description: 'Chair in the study room has broken legs and is unsafe to use',
            category: 'Furniture',
            status: 'in-progress',
            createdAt: '2023-05-08T14:15:00Z',
            updatedAt: '2023-05-09T10:20:00Z'
          },
          {
            id: 'CP2023003',
            student: {
              id: 'ST2023003',
              name: 'Amit Kumar',
              room: 'B-201',
              profileImg: 'https://randomuser.me/api/portraits/men/2.jpg'
            },
            title: 'No hot water supply',
            description: 'No hot water in the morning for the past 3 days',
            category: 'Maintenance',
            status: 'resolved',
            createdAt: '2023-05-05T07:45:00Z',
            updatedAt: '2023-05-07T16:30:00Z'
          },
          {
            id: 'CP2023004',
            student: {
              id: 'ST2023004',
              name: 'Neha Singh',
              room: 'B-202',
              profileImg: 'https://randomuser.me/api/portraits/women/2.jpg'
            },
            title: 'WiFi not working',
            description: 'Unable to connect to hostel WiFi since yesterday evening',
            category: 'Internet',
            status: 'rejected',
            createdAt: '2023-05-03T18:20:00Z',
            updatedAt: '2023-05-04T11:15:00Z'
          },
          {
            id: 'CP2023005',
            student: {
              id: 'ST2023005',
              name: 'Vikram Reddy',
              room: 'C-301',
              profileImg: 'https://randomuser.me/api/portraits/men/3.jpg'
            },
            title: 'Cleaning issues in corridor',
            description: 'Corridor outside my room has not been cleaned for 2 days',
            category: 'Housekeeping',
            status: 'pending',
            createdAt: '2023-05-09T12:40:00Z'
          }
        ];

        setComplaints(mockComplaints);
        setFilteredComplaints(mockComplaints);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load complaints",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [toast]);

  useEffect(() => {
    let filtered = complaints;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(complaint => 
        complaint.title.toLowerCase().includes(term) || 
        complaint.description.toLowerCase().includes(term) ||
        complaint.student.name.toLowerCase().includes(term) ||
        complaint.student.room.toLowerCase().includes(term)
      );
    }
    
    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, categoryFilter, complaints]);

  const updateStatus = (id: string, newStatus: Complaint['status']) => {
    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setComplaints(prev => prev.map(complaint => 
          complaint.id === id ? { 
            ...complaint, 
            status: newStatus,
            updatedAt: new Date().toISOString()
          } : complaint
        ));
        toast({
          title: "Status Updated",
          description: `Complaint status changed to ${newStatus}`,
          className: "bg-green-500 text-white border-0"
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          In Progress
        </Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Resolved
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const categories = [...new Set(complaints.map(c => c.category))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Complaints Management</h1>
        <CardDescription className="text-muted-foreground">
          View and manage student complaints
        </CardDescription>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search complaints..."
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
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category, index) => (
                <SelectItem key={index} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setCategoryFilter('all');
          }}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-gray-900 dark:text-white">Student Complaints</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Search className="h-8 w-8" />
              <p>No complaints found matching your criteria</p>
              <Button variant="ghost" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead className="w-[200px]">Student</TableHead>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={complaint.student.profileImg} alt={complaint.student.name} />
                          <AvatarFallback>{complaint.student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{complaint.student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {complaint.student.room} • {complaint.student.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{complaint.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {complaint.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{complaint.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(complaint.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select 
                        value={complaint.status} 
                        onValueChange={(value) => updateStatus(complaint.id, value as Complaint['status'])}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
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
}