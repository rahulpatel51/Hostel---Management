"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, XCircle, MessageSquare, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  response?: string;
};

export default function StudentComplaintsPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'Maintenance'
  });

  // Mock student data
  const student = {
    id: 'ST2023001',
    name: 'Rahul Sharma',
    room: 'A-101',
    profileImg: 'https://randomuser.me/api/portraits/men/1.jpg'
  };

  const categories = ['Maintenance', 'Furniture', 'Internet', 'Housekeeping', 'Electrical', 'Other'];

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for the current student
        const mockComplaints: Complaint[] = [
          {
            id: 'CP2023001',
            title: 'Water leakage in bathroom',
            description: 'There is continuous water leakage from the ceiling in the common bathroom',
            category: 'Maintenance',
            status: 'pending',
            createdAt: '2023-05-10T09:30:00Z'
          },
          {
            id: 'CP2023002',
            title: 'Broken chair in study room',
            description: 'Chair in the study room has broken legs and is unsafe to use',
            category: 'Furniture',
            status: 'in-progress',
            createdAt: '2023-05-08T14:15:00Z',
            updatedAt: '2023-05-09T10:20:00Z',
            response: 'We have ordered replacement parts. Expected resolution in 3-5 days.'
          },
          {
            id: 'CP2023003',
            title: 'No hot water supply',
            description: 'No hot water in the morning for the past 3 days',
            category: 'Maintenance',
            status: 'resolved',
            createdAt: '2023-05-05T07:45:00Z',
            updatedAt: '2023-05-07T16:30:00Z',
            response: 'Boiler issue fixed. Hot water supply restored.'
          },
          {
            id: 'CP2023004',
            title: 'WiFi not working',
            description: 'Unable to connect to hostel WiFi since yesterday evening',
            category: 'Internet',
            status: 'rejected',
            createdAt: '2023-05-03T18:20:00Z',
            updatedAt: '2023-05-04T11:15:00Z',
            response: 'Issue was with your device settings. IT confirmed network working normally.'
          }
        ];

        setComplaints(mockComplaints);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your complaints",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [toast]);

  const handleSubmitComplaint = async () => {
    if (!newComplaint.title || !newComplaint.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newComplaintObj: Complaint = {
        id: `CP${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        title: newComplaint.title,
        description: newComplaint.description,
        category: newComplaint.category,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      setComplaints(prev => [newComplaintObj, ...prev]);
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been successfully submitted",
        className: "bg-green-500 text-white border-0"
      });
      
      // Reset form
      setNewComplaint({
        title: '',
        description: '',
        category: 'Maintenance'
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your complaint",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Complaints</h1>
            <CardDescription className="text-muted-foreground">
              Submit and track your hostel complaints
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit New Complaint</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={newComplaint.category} 
                    onValueChange={(value) => setNewComplaint({...newComplaint, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue..."
                    rows={5}
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitComplaint}
                    disabled={isSubmitting || !newComplaint.title || !newComplaint.description}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Complaint"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-gray-900 dark:text-white">Your Complaints</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
              <p>You haven't submitted any complaints yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit Your First Complaint
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow>
                  <TableHead className="w-[200px]">Complaint</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10">
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
                    <TableCell>
                      {formatDate(complaint.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {complaint.updatedAt ? formatDate(complaint.updatedAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Complaint Details Modal */}
      {complaints.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Complaint Details</h2>
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="border-gray-200 dark:border-gray-800">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{complaint.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{complaint.category}</Badge>
                      {getStatusBadge(complaint.status)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted: {formatDate(complaint.createdAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{complaint.description}</p>
                  </div>
                  
                  {complaint.response && (
                    <div>
                      <h3 className="font-medium mb-2">
                        {complaint.status === 'rejected' ? 'Reason for Rejection' : 'Resolution Details'}
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                        <p className="text-muted-foreground">{complaint.response}</p>
                      </div>
                    </div>
                  )}
                  
                  {complaint.updatedAt && (
                    <div className="text-sm text-muted-foreground">
                      Last updated: {formatDate(complaint.updatedAt)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}