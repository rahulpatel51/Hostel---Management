"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, XCircle, MessageSquare, PlusCircle } from "lucide-react";
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
  comments?: {
    id: string;
    text: string;
    createdAt: string;
    author: string;
  }[];
};

export default function StudentComplaintsPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState('');
  
  // Form state
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'Maintenance'
  });

  const categories = ['Maintenance', 'Furniture', 'Internet', 'Housekeeping', 'Electrical', 'Other'];

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/student/complaints', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch complaints');
        }
        
        const data = await response.json();
        
        // Handle different response structures
        const complaintsArray = Array.isArray(data) 
          ? data 
          : data.data || data.complaints || [];
        
        if (!Array.isArray(complaintsArray)) {
          throw new Error('Invalid data format received from server');
        }

        setComplaints(complaintsArray);
      } catch (error: any) {
        console.error('Fetch error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load complaints",
          variant: "destructive"
        });
        setComplaints([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, [toast]);

  const fetchComplaintDetails = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/complaints/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch complaint details');
      }
      
      const data = await response.json();
      setSelectedComplaint(data);
    } catch (error: any) {
      console.error('Error fetching details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load complaint details",
        variant: "destructive"
      });
    }
  };

  const handleSubmitComplaint = async () => {
    if (!newComplaint.title.trim() || !newComplaint.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/student/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newComplaint.title,
          description: newComplaint.description,
          category: newComplaint.category
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Handle server-side validation errors
        if (response.status === 400 || response.status === 422) {
          throw new Error(responseData.message || 'Validation failed');
        }
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }
      
      setComplaints(prev => [responseData, ...prev]);
      toast({
        title: "Success",
        description: "Complaint submitted successfully",
        variant: "default"
      });
      
      // Reset form
      setNewComplaint({
        title: '',
        description: '',
        category: 'Maintenance'
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit complaint",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !selectedComplaint) {
      toast({
        title: "Validation Error",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/student/complaints/${selectedComplaint.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            text: newComment
          })
        }
      );
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }
      
      // Update the selected complaint with new comments
      setSelectedComplaint(responseData);
      setNewComment('');
      
      toast({
        title: "Success",
        description: "Comment added successfully",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Comment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
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
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Complaints</h1>
            <p className="text-muted-foreground">Submit and track your hostel complaints</p>
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
                  <label className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Brief description of the issue"
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
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
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Provide detailed information..."
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
                    disabled={isSubmitting || !newComplaint.title.trim() || !newComplaint.description.trim()}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="bg-muted/50">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <CardTitle>Your Complaints</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <MessageSquare className="h-8 w-8" />
                <p>No complaints found</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Submit a Complaint
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[200px]">Complaint</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow 
                      key={complaint.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => fetchComplaintDetails(complaint.id)}
                    >
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

        {selectedComplaint && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Complaint Details</h2>
            <Card>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{selectedComplaint.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{selectedComplaint.category}</Badge>
                      {getStatusBadge(selectedComplaint.status)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted: {formatDate(selectedComplaint.createdAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedComplaint.description}</p>
                </div>
                
                {selectedComplaint.response && (
                  <div>
                    <h3 className="font-medium mb-2">
                      {selectedComplaint.status === 'rejected' ? 'Reason for Rejection' : 'Resolution'}
                    </h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p>{selectedComplaint.response}</p>
                    </div>
                  </div>
                )}
                
                {selectedComplaint.comments && selectedComplaint.comments.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Comments</h3>
                    <div className="space-y-3">
                      {selectedComplaint.comments.map((comment) => (
                        <div key={comment.id} className="bg-muted p-4 rounded-lg">
                          <div className="flex justify-between">
                            <p className="font-medium">{comment.author}</p>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Add Comment</h3>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}