"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Download, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Trash, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

type Notice = {
  _id: string;
  title: string;
  content: string;
  category: "general" | "academic" | "hostel" | "event" | "emergency" | "other";
  importance: "normal" | "important" | "urgent";
  publishedBy: {
    _id: string;
    fullName: string;
  };
  targetAudience: ("all" | "students" | "wardens" | "admin")[];
  attachments: string[];
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL = "http://localhost:5000/api/notices";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error("Session expired. Please login again.");
        // Redirect to login page
        window.location.href = '/login';
      } else if (error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default function NoticesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    category: "general" as "general" | "academic" | "hostel" | "event" | "emergency" | "other",
    importance: "normal" as "normal" | "important" | "urgent",
    targetAudience: ["all"] as ("all" | "students" | "wardens" | "admin")[],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    attachments: [] as string[],
  });

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Notification options
  const [notificationOptions, setNotificationOptions] = useState({
    email: true,
    sms: false,
    push: true,
    customMessage: "",
  });

  // Fetch notices from backend
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data } = await api.get("/");
        if (data.success) {
          setNotices(data.data);
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                          notice.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesTab = activeTab === "all" ? 
                      notice.isActive : 
                      activeTab === "archive" ? 
                      !notice.isActive : 
                      true;

    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const { data } = await api.post("/", newNotice);
      if (data.success) {
        setNotices([data.data, ...notices]);
        resetNewNoticeForm();
        setActiveTab("all");
        toast.success("Notice published successfully");
      }
    } catch (error) {
      console.error("Error creating notice:", error);
    }
  };

  const resetNewNoticeForm = () => {
    setNewNotice({
      title: "",
      content: "",
      category: "general",
      importance: "normal",
      targetAudience: ["all"],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      attachments: [],
    });
  };

  const handleUpdateNotice = async () => {
    if (!selectedNotice) return;
    
    try {
      const { data } = await api.put(`/${selectedNotice._id}`, selectedNotice);
      if (data.success) {
        setNotices(notices.map(notice => 
          notice._id === selectedNotice._id ? data.data : notice
        ));
        setIsEditDialogOpen(false);
        toast.success("Notice updated successfully");
      }
    } catch (error) {
      console.error("Error updating notice:", error);
    }
  };

  const handleDeleteNotice = async () => {
    if (!selectedNotice) return;
    
    try {
      const { data } = await api.delete(`/${selectedNotice._id}`);
      if (data.success) {
        setNotices(notices.filter(notice => notice._id !== selectedNotice._id));
        setIsDeleteDialogOpen(false);
        toast.success("Notice deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting notice:", error);
    }
  };

  const toggleNoticeStatus = async (noticeId: string, isActive: boolean) => {
    try {
      const { data } = await api.patch(`/${noticeId}/status`, { isActive });
      if (data.success) {
        setNotices(notices.map(notice => 
          notice._id === noticeId ? { ...notice, isActive } : notice
        ));
        toast.success(`Notice ${isActive ? "activated" : "archived"}`);
      }
    } catch (error) {
      console.error("Error toggling notice status:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("attachment", file);

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const { data } = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (data.success) {
        setNewNotice({
          ...newNotice,
          attachments: [...newNotice.attachments, data.fileUrl],
        });
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...newNotice.attachments];
    updatedAttachments.splice(index, 1);
    setNewNotice({
      ...newNotice,
      attachments: updatedAttachments,
    });
  };

  const sendNotifications = async () => {
    if (!selectedNotice) return;
    
    try {
      const { data } = await api.post(`/${selectedNotice._id}/notify`, notificationOptions);
      if (data.success) {
        toast.success("Notifications sent successfully");
        setIsNotifyDialogOpen(false);
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAudienceChange = (value: string) => {
    if (value === "all") {
      setNewNotice({ ...newNotice, targetAudience: ["all"] });
    } else {
      setNewNotice({ 
        ...newNotice, 
        targetAudience: newNotice.targetAudience.includes("all") 
          ? [value as "students" | "wardens" | "admin"] 
          : newNotice.targetAudience.includes(value as any)
            ? newNotice.targetAudience.filter(a => a !== value)
            : [...newNotice.targetAudience, value as "students" | "wardens" | "admin"]
      });
    }
  };

  const isAudienceSelected = (audience: string) => {
    return newNotice.targetAudience.includes("all") 
      ? audience === "all"
      : newNotice.targetAudience.includes(audience as any);
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "event":
        return "secondary";
      case "emergency":
        return "destructive";
      case "academic":
        return "default";
      case "hostel":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading && notices.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-5 w-[400px]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notices Management</h1>
        <p className="text-muted-foreground">
          Create and manage notices and announcements for your institution
        </p>
      </div>

      <Tabs 
        defaultValue="all" 
        className="w-full" 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Notices</TabsTrigger>
          <TabsTrigger value="create">Create Notice</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notices by title, content or ID..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Notices</CardTitle>
                <CardDescription>
                  Showing {filteredNotices.length} of {notices.length} notices
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading notices...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotices.length > 0 ? (
                        filteredNotices.map((notice) => (
                          <TableRow key={notice._id} className="hover:bg-muted/50">
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {notice.title}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getCategoryBadgeVariant(notice.category)}>
                                {notice.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(notice.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(notice.expiryDate)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={notice.isActive ? "default" : "secondary"}
                                >
                                  {notice.isActive ? "Active" : "Archived"}
                                </Badge>
                                <Badge
                                  variant={
                                    notice.importance === "urgent"
                                      ? "destructive"
                                      : notice.importance === "important"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {notice.importance}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedNotice(notice);
                                      setIsViewDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedNotice({...notice});
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedNotice(notice);
                                      setIsNotifyDialogOpen(true);
                                    }}
                                  >
                                    <Bell className="mr-2 h-4 w-4" />
                                    Notify
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      toggleNoticeStatus(notice._id, !notice.isActive);
                                    }}
                                  >
                                    {notice.isActive ? (
                                      <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Archive
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setSelectedNotice(notice);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell 
                            colSpan={6} 
                            className="text-center py-12 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-8 w-8" />
                              <p className="text-lg font-medium">
                                No notices found
                              </p>
                              <p className="text-sm">
                                Try adjusting your search or filters
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Notice</CardTitle>
              <CardDescription>
                Fill out the form below to create a new notice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Notice Title *</Label>
                <Input 
                  id="title" 
                  placeholder="Enter notice title" 
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={newNotice.category}
                    onValueChange={(value) => setNewNotice({
                      ...newNotice, 
                      category: value as "general" | "academic" | "hostel" | "event" | "emergency" | "other"
                    })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importance">Importance *</Label>
                  <Select
                    value={newNotice.importance}
                    onValueChange={(value) => setNewNotice({
                      ...newNotice, 
                      importance: value as "normal" | "important" | "urgent"
                    })}
                  >
                    <SelectTrigger id="importance">
                      <SelectValue placeholder="Select importance level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Audience *</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={isAudienceSelected("all") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAudienceChange("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={isAudienceSelected("students") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAudienceChange("students")}
                  >
                    Students
                  </Button>
                  <Button
                    variant={isAudienceSelected("wardens") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAudienceChange("wardens")}
                  >
                    Wardens
                  </Button>
                  <Button
                    variant={isAudienceSelected("admin") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAudienceChange("admin")}
                  >
                    Admin
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    id="expiryDate" 
                    min={new Date().toISOString().split('T')[0]}
                    value={newNotice.expiryDate}
                    onChange={(e) => setNewNotice({...newNotice, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Notice Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter notice content here..."
                  className="min-h-[200px]"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="attachment"
                      className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                      <input
                        id="attachment"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {isUploading && (
                      <div className="flex-1">
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                  </div>

                  {newNotice.attachments.length > 0 && (
                    <div className="border rounded-lg divide-y">
                      {newNotice.attachments.map((attachment, index) => (
                        <div key={index} className="p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {attachment.split('/').pop()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetNewNoticeForm();
                    setActiveTab("all");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateNotice}
                  disabled={!newNotice.title || !newNotice.content}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Notice
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Archived Notices</CardTitle>
              <CardDescription>
                Past notices that have expired or been manually archived
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading archived notices...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Expired</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notices.filter(notice => !notice.isActive).length > 0 ? (
                        notices
                          .filter(notice => !notice.isActive)
                          .map((notice) => (
                            <TableRow key={notice._id} className="hover:bg-muted/50">
                              <TableCell className="font-medium max-w-[200px] truncate">
                                {notice.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getCategoryBadgeVariant(notice.category)}>
                                  {notice.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {formatDate(notice.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {formatDate(notice.expiryDate)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedNotice(notice);
                                        setIsViewDialogOpen(true);
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => toggleNoticeStatus(notice._id, true)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      Activate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => {
                                        setSelectedNotice(notice);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell 
                            colSpan={5} 
                            className="text-center py-12 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Eye className="h-8 w-8" />
                              <p className="text-lg font-medium">
                                No archived notices found
                              </p>
                              <p className="text-sm">
                                Notices will appear here when archived
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Notice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNotice?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge variant={getCategoryBadgeVariant(selectedNotice?.category || "general")}>
                {selectedNotice?.category}
              </Badge>
              <span>•</span>
              <span>Published: {selectedNotice && formatDate(selectedNotice.createdAt)}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {selectedNotice.targetAudience.join(", ")}
                </Badge>
                <Badge
                  variant={
                    selectedNotice.importance === "urgent"
                      ? "destructive"
                      : selectedNotice.importance === "important"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {selectedNotice.importance}
                </Badge>
                <Badge
                  variant={selectedNotice.isActive ? "default" : "secondary"}
                >
                  {selectedNotice.isActive ? "Active" : "Archived"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Expires: {formatDate(selectedNotice.expiryDate)}
                </span>
              </div>
              
              <Separator />
              
              <div className="prose dark:prose-invert max-w-none">
                {selectedNotice.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="grid gap-2">
                      {selectedNotice.attachments.map((attachment, index) => (
                        <a 
                          key={index} 
                          href={attachment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          Attachment {index + 1} - {attachment.split('/').pop()}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published By:</span>
                  <span className="font-medium">
                    {selectedNotice.publishedBy?.fullName || "System"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">
                    {formatDate(selectedNotice.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
            <DialogDescription>
              Make changes to the notice below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={selectedNotice.title}
                  onChange={(e) => setSelectedNotice({
                    ...selectedNotice,
                    title: e.target.value
                  })}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={selectedNotice.category}
                    onValueChange={(value) => setSelectedNotice({
                      ...selectedNotice,
                      category: value as "general" | "academic" | "hostel" | "event" | "emergency" | "other"
                    })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-importance">Importance *</Label>
                  <Select
                    value={selectedNotice.importance}
                    onValueChange={(value) => setSelectedNotice({
                      ...selectedNotice,
                      importance: value as "normal" | "important" | "urgent"
                    })}
                  >
                    <SelectTrigger id="edit-importance">
                      <SelectValue placeholder="Select importance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Target Audience *</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedNotice.targetAudience.includes("all") ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNotice({
                      ...selectedNotice,
                      targetAudience: ["all"]
                    })}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedNotice.targetAudience.includes("students") ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNotice({
                      ...selectedNotice,
                      targetAudience: selectedNotice.targetAudience.includes("all")
                        ? ["students"]
                        : selectedNotice.targetAudience.includes("students")
                          ? selectedNotice.targetAudience.filter(a => a !== "students")
                          : [...selectedNotice.targetAudience, "students"]
                    })}
                  >
                    Students
                  </Button>
                  <Button
                    variant={selectedNotice.targetAudience.includes("wardens") ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNotice({
                      ...selectedNotice,
                      targetAudience: selectedNotice.targetAudience.includes("all")
                        ? ["wardens"]
                        : selectedNotice.targetAudience.includes("wardens")
                          ? selectedNotice.targetAudience.filter(a => a !== "wardens")
                          : [...selectedNotice.targetAudience, "wardens"]
                    })}
                  >
                    Wardens
                  </Button>
                  <Button
                    variant={selectedNotice.targetAudience.includes("admin") ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNotice({
                      ...selectedNotice,
                      targetAudience: selectedNotice.targetAudience.includes("all")
                        ? ["admin"]
                        : selectedNotice.targetAudience.includes("admin")
                          ? selectedNotice.targetAudience.filter(a => a !== "admin")
                          : [...selectedNotice.targetAudience, "admin"]
                    })}
                  >
                    Admin
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-expiry-date">Expiry Date *</Label>
                <Input
                  id="edit-expiry-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedNotice.expiryDate.split('T')[0]}
                  onChange={(e) => setSelectedNotice({
                    ...selectedNotice,
                    expiryDate: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content *</Label>
                <Textarea
                  id="edit-content"
                  className="min-h-[150px]"
                  value={selectedNotice.content}
                  onChange={(e) => setSelectedNotice({
                    ...selectedNotice,
                    content: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-active"
                    checked={selectedNotice.isActive}
                    onCheckedChange={(checked) => setSelectedNotice({
                      ...selectedNotice,
                      isActive: Boolean(checked)
                    })}
                  />
                  <Label htmlFor="edit-active" className="text-sm font-medium leading-none">
                    Active Notice
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedNotice.isActive 
                    ? "This notice is currently visible to users" 
                    : "This notice is archived and not visible"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNotice}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Notice Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently delete this notice?
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-4">
                <div className="bg-destructive/10 p-2 rounded-md">
                  <Trash className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h4 className="font-medium">{selectedNotice.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Published: {formatDate(selectedNotice.createdAt)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires: {formatDate(selectedNotice.expiryDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteNotice}
            >
              Delete Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send additional notifications for this notice to selected channels
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Notification Channels</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify-email"
                      checked={notificationOptions.email}
                      onCheckedChange={(checked) => setNotificationOptions({
                        ...notificationOptions,
                        email: Boolean(checked)
                      })}
                    />
                    <Label htmlFor="notify-email" className="font-normal">
                      Email Notification
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify-sms"
                      checked={notificationOptions.sms}
                      onCheckedChange={(checked) => setNotificationOptions({
                        ...notificationOptions,
                        sms: Boolean(checked)
                      })}
                    />
                    <Label htmlFor="notify-sms" className="font-normal">
                      SMS Notification
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notify-push"
                      checked={notificationOptions.push}
                      onCheckedChange={(checked) => setNotificationOptions({
                        ...notificationOptions,
                        push: Boolean(checked)
                      })}
                    />
                    <Label htmlFor="notify-push" className="font-normal">
                      Push Notification
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-message">Custom Message (optional)</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Add a custom message to include with the notification"
                  className="min-h-[100px]"
                  value={notificationOptions.customMessage}
                  onChange={(e) => setNotificationOptions({
                    ...notificationOptions,
                    customMessage: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNotifyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={sendNotifications}
              disabled={!notificationOptions.email && !notificationOptions.sms && !notificationOptions.push}
            >
              <Bell className="mr-2 h-4 w-4" />
              Send Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}