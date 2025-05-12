"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, XCircle, MessageSquare, PlusCircle, Loader2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Complaint = {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  roomNumber: string;
  submittedBy: string;
  assignedTo?: string;
  images?: string[];
  comments?: {
    name: string;
    profileImg: string | Blob | undefined;
    _id: string;
    text: string;
   timestamp: string;
    author: { name: string };
  }[];
  response?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
};

export default function StudentComplaintsPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'Maintenance',
    roomNumber: ''
  });

  const categories = ['Maintenance', 'Cleanliness', 'Food', 'Security', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  useEffect(() => {
    fetchComplaints();
  }, []);

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
      
      // Ensure we're working with an array
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
      setComplaints([]); // Set to empty array instead of null/undefined
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!newComplaint.title.trim() || !newComplaint.description.trim() || !newComplaint.roomNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
        duration: 3000
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
          ...newComplaint,
          priority: 'medium' // Default priority
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit complaint');
      }

      const data = await response.json();
      
      // Show success toast
      toast({
        title: "Success!",
        description: "Your complaint has been submitted successfully",
        duration: 3000
      });
      
      // Reset form and close dialog
      setNewComplaint({
        title: '',
        description: '',
        category: 'Maintenance',
        roomNumber: ''
      });
      setIsDialogOpen(false);
      
      // Refresh the complaints list
      await fetchComplaints();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
        duration: 3000
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
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/student/complaints/${selectedComplaint._id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ text: newComment })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }

      const data = await response.json();
      setSelectedComplaint(data);
      setNewComment('');
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully",
        duration: 3000
      });
    } catch (error: any) {
      console.error('Comment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    const baseClasses = "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'pending':
        return (
          <Badge className={`${baseClasses} bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200`}>
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200`}>
            <AlertCircle className="h-3 w-3" /> In Progress
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200`}>
            <CheckCircle2 className="h-3 w-3" /> Resolved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200`}>
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Complaints</h1>
            <p className="text-gray-600 dark:text-gray-400">Submit and track your hostel complaints</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Submit New Complaint</DialogTitle>
                <DialogDescription>
                  Fill out the form below to submit a new complaint
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Brief description of the issue"
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
                    className="border-gray-300 dark:border-gray-600 focus-visible:ring-indigo-500"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Your room number"
                    value={newComplaint.roomNumber}
                    onChange={(e) => setNewComplaint({...newComplaint, roomNumber: e.target.value})}
                    className="border-gray-300 dark:border-gray-600 focus-visible:ring-indigo-500"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={newComplaint.category} 
                    onValueChange={(value) => setNewComplaint({...newComplaint, category: value})}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:ring-indigo-500">
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Provide detailed information about your complaint..."
                    rows={5}
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                    className="border-gray-300 dark:border-gray-600 focus-visible:ring-indigo-500"
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitComplaint}
                    disabled={isSubmitting || !newComplaint.title.trim() || !newComplaint.description.trim() || !newComplaint.roomNumber.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : "Submit Complaint"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Complaints Table */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-xl">Your Complaints</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <MessageSquare className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                <p className="text-lg text-gray-600 dark:text-gray-400">No complaints found</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Submit a Complaint
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="w-[200px] text-gray-700 dark:text-gray-300">Complaint</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Room</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow 
                      key={complaint._id} 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {complaint.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {complaint.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{complaint.roomNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
                          {complaint.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(complaint.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(complaint.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Complaint Details Dialog */}
<Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
  <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
    {selectedComplaint && (
      <>
        <DialogHeader>
          <DialogTitle className="text-2xl">{selectedComplaint.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{selectedComplaint.roomNumber}</Badge>
            <Badge variant="outline">{selectedComplaint.category}</Badge>
            {getStatusBadge(selectedComplaint.status)}
          </div>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-justify ">
              {selectedComplaint.description}
            </p>
          </div>
          
          {selectedComplaint.response && (
            <div className="space-y-2">
              <h3 className="font-medium text-lg">
                {selectedComplaint.status === 'rejected' ? 'Reason for Rejection' : 'Resolution'}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-line">
                {selectedComplaint.response}
              </div>
            </div>
          )}
          
          {selectedComplaint.comments && selectedComplaint.comments.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Comments</h3>
              <div className="space-y-3">
                {selectedComplaint.comments.map((comment) => (
                  <div 
                    key={comment._id} 
                    className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {comment.profileImg ? (
                          <img 
                            src={comment.profileImg} 
                            alt={comment.name || 'Student'}
                            className="h-10 w-10 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-800">
                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {comment.name || 'Student'}
                            </p>
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                              Student
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 shrink-0">
                            {formatDate(comment.timestamp)}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Add Comment</h3>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border-gray-300 dark:border-gray-600 focus-visible:ring-indigo-500"
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>
      </div>
    </div>
  );
}