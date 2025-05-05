"use client";

import { useState } from "react";
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
import { Bell, Calendar, Download, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@radix-ui/react-dropdown-menu";

type Notice = {
  id: string;
  title: string;
  category: "General" | "Academic" | "Events" | "Maintenance";
  content: string;
  audience: "All" | "Students" | "Staff" | "Specific Blocks";
  publishDate: string;
  expiryDate: string;
  status: "Active" | "Scheduled" | "Expired" | "Draft";
  notify: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
};

export default function NoticesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: "NOT001",
      title: "Hostel Day Celebration",
      category: "Events",
      content: "Annual hostel day celebration will be held on May 15th. All students are invited.",
      audience: "All",
      publishDate: "2023-05-05",
      expiryDate: "2023-05-20",
      status: "Active",
      notify: {
        email: true,
        sms: false,
        push: true
      }
    },
    {
      id: "NOT002",
      title: "Internet Maintenance Schedule",
      category: "Maintenance",
      content: "Internet services will be unavailable from 10PM to 2AM on May 10th for maintenance.",
      audience: "All",
      publishDate: "2023-05-04",
      expiryDate: "2023-05-10",
      status: "Active",
      notify: {
        email: true,
        sms: true,
        push: true
      }
    },
    {
      id: "NOT003",
      title: "Fee Payment Deadline",
      category: "General",
      content: "Last date for fee payment is May 15th. Late payments will incur a penalty.",
      audience: "Students",
      publishDate: "2023-05-03",
      expiryDate: "2023-05-15",
      status: "Active",
      notify: {
        email: true,
        sms: false,
        push: false
      }
    },
    {
      id: "NOT004",
      title: "Room Inspection Notice",
      category: "General",
      content: "Quarterly room inspections will be conducted on May 8th. Please keep your rooms clean.",
      audience: "Students",
      publishDate: "2023-05-02",
      expiryDate: "2023-05-08",
      status: "Expired",
      notify: {
        email: false,
        sms: false,
        push: true
      }
    },
    {
      id: "NOT005",
      title: "Summer Vacation Schedule",
      category: "Academic",
      content: "Hostel will remain closed during summer vacation from June 1st to July 15th.",
      audience: "All",
      publishDate: "2023-06-01",
      expiryDate: "2023-07-15",
      status: "Scheduled",
      notify: {
        email: true,
        sms: true,
        push: true
      }
    },
    {
      id: "NOT006",
      title: "Mess Menu Update",
      category: "General",
      content: "New mess menu will be implemented from next week. Check notice board for details.",
      audience: "All",
      publishDate: "2023-04-30",
      expiryDate: "2023-05-30",
      status: "Active",
      notify: {
        email: false,
        sms: false,
        push: false
      }
    },
  ]);

  const [newNotice, setNewNotice] = useState<Omit<Notice, "id">>({
    title: "",
    category: "General",
    content: "",
    audience: "All",
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "Draft",
    notify: {
      email: false,
      sms: false,
      push: false
    }
  });

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notice.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                          notice.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesTab = activeTab === "all" ? 
                      notice.status !== "Draft" : 
                      activeTab === "archive" ? 
                      notice.status === "Expired" : 
                      activeTab === "create";

    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleCreateNotice = () => {
    const newId = `NOT${(notices.length + 1).toString().padStart(3, '0')}`;
    const noticeToAdd = { ...newNotice, id: newId, status: "Active" as const };
    setNotices([...notices, noticeToAdd]);
    resetNewNoticeForm();
    setActiveTab("all");
  };

  const handleSaveDraft = () => {
    const newId = `NOT${(notices.length + 1).toString().padStart(3, '0')}`;
    const noticeToAdd = { ...newNotice, id: newId, status: "Draft" as const };
    setNotices([...notices, noticeToAdd]);
    resetNewNoticeForm();
    setActiveTab("all");
  };

  const resetNewNoticeForm = () => {
    setNewNotice({
      title: "",
      category: "General",
      content: "",
      audience: "All",
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Draft",
      notify: {
        email: false,
        sms: false,
        push: false
      }
    });
  };

  const handleUpdateNotice = () => {
    if (!selectedNotice) return;
    
    setNotices(notices.map(notice => 
      notice.id === selectedNotice.id ? selectedNotice : notice
    ));
    setIsEditDialogOpen(false);
  };

  const handleDeleteNotice = () => {
    if (!selectedNotice) return;
    
    setNotices(notices.filter(notice => notice.id !== selectedNotice.id));
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notices Management</h1>
        <p className="text-muted-foreground">Create and manage notices and announcements for students and staff.</p>
      </div>

      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
                placeholder="Search notices..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
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
                Reset
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Notices</CardTitle>
                <CardDescription>Showing {filteredNotices.length} of {notices.length} notices</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotices.length > 0 ? (
                    filteredNotices.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell className="font-medium">{notice.id}</TableCell>
                        <TableCell className="font-medium">{notice.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              notice.category === "Events"
                                ? "border-purple-600 text-purple-800 dark:text-purple-400 dark:border-purple-500"
                                : notice.category === "Maintenance"
                                  ? "border-amber-600 text-amber-800 dark:text-amber-400 dark:border-amber-500"
                                  : notice.category === "Academic"
                                    ? "border-blue-600 text-blue-800 dark:text-blue-400 dark:border-blue-500"
                                    : "border-gray-600 text-gray-800 dark:text-gray-400 dark:border-gray-500"
                            }
                          >
                            {notice.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(notice.publishDate)}</TableCell>
                        <TableCell>{formatDate(notice.expiryDate)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              notice.status === "Active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                : notice.status === "Scheduled"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400"
                            }
                          >
                            {notice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setSelectedNotice(notice);
                                setIsViewDialogOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedNotice({...notice});
                                setIsEditDialogOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedNotice(notice);
                                setIsNotifyDialogOpen(true);
                              }}>
                                <Bell className="mr-2 h-4 w-4" />
                                Notify
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
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
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No notices found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Notice</CardTitle>
              <CardDescription>Create a new notice or announcement for students and staff</CardDescription>
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
                      category: value as "General" | "Academic" | "Events" | "Maintenance"
                    })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Select
                    value={newNotice.audience}
                    onValueChange={(value) => setNewNotice({
                      ...newNotice, 
                      audience: value as "All" | "Students" | "Staff" | "Specific Blocks"
                    })}
                  >
                    <SelectTrigger id="audience">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Students">Students Only</SelectItem>
                      <SelectItem value="Staff">Staff Only</SelectItem>
                      <SelectItem value="Specific Blocks">Specific Blocks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Publish Date *</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      id="publishDate" 
                      value={newNotice.publishDate}
                      onChange={(e) => setNewNotice({...newNotice, publishDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      id="expiryDate" 
                      value={newNotice.expiryDate}
                      onChange={(e) => setNewNotice({...newNotice, expiryDate: e.target.value})}
                    />
                  </div>
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
                <Label>Notification Options</Label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="sendEmail" 
                    checked={newNotice.notify.email}
                    onChange={(e) => setNewNotice({
                      ...newNotice,
                      notify: {...newNotice.notify, email: e.target.checked}
                    })}
                  />
                  <Label htmlFor="sendEmail" className="text-sm font-normal">
                    Send email notification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="sendSMS" 
                    checked={newNotice.notify.sms}
                    onChange={(e) => setNewNotice({
                      ...newNotice,
                      notify: {...newNotice.notify, sms: e.target.checked}
                    })}
                  />
                  <Label htmlFor="sendSMS" className="text-sm font-normal">
                    Send SMS notification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pushNotification"
                    checked={newNotice.notify.push}
                    onChange={(e) => setNewNotice({
                      ...newNotice,
                      notify: {...newNotice.notify, push: e.target.checked}
                    })}
                  />
                  <Label htmlFor="pushNotification" className="text-sm font-normal">
                    Send push notification
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft}
                  disabled={!newNotice.title || !newNotice.content}
                >
                  Save as Draft
                </Button>
                <Button 
                  onClick={handleCreateNotice}
                  disabled={!newNotice.title || !newNotice.content}
                >
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
              <CardDescription>Past notices that have expired or been archived</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.filter(notice => notice.status === "Expired").length > 0 ? (
                    notices
                      .filter(notice => notice.status === "Expired")
                      .map((notice) => (
                        <TableRow key={notice.id}>
                          <TableCell className="font-medium">{notice.id}</TableCell>
                          <TableCell>{notice.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600 text-gray-800 dark:text-gray-400 dark:border-gray-500">
                              {notice.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(notice.publishDate)}</TableCell>
                          <TableCell>{formatDate(notice.expiryDate)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedNotice(notice);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No archived notices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Notice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedNotice?.title}</DialogTitle>
            <DialogDescription>
              {selectedNotice?.category} • Published: {selectedNotice && formatDate(selectedNotice.publishDate)}
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedNotice.audience}
                </Badge>
                <Badge
                  className={
                    selectedNotice.status === "Active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : selectedNotice.status === "Scheduled"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                  }
                >
                  {selectedNotice.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Expires: {formatDate(selectedNotice.expiryDate)}
                </span>
              </div>
              
              <Separator />
              
              <div className="prose dark:prose-invert">
                {selectedNotice.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Notification Sent:</Label>
                <div className="flex gap-4">
                  {selectedNotice.notify.email && (
                    <Badge variant="outline" className="gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Email
                    </Badge>
                  )}
                  {selectedNotice.notify.sms && (
                    <Badge variant="outline" className="gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      SMS
                    </Badge>
                  )}
                  {selectedNotice.notify.push && (
                    <Badge variant="outline" className="gap-1">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      Push
                    </Badge>
                  )}
                  {!selectedNotice.notify.email && !selectedNotice.notify.sms && !selectedNotice.notify.push && (
                    <span className="text-sm text-muted-foreground">No notifications sent</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
            <DialogDescription>
              Make changes to the notice. Click save when you're done.
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
                      category: value as "General" | "Academic" | "Events" | "Maintenance"
                    })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-audience">Audience *</Label>
                  <Select
                    value={selectedNotice.audience}
                    onValueChange={(value) => setSelectedNotice({
                      ...selectedNotice,
                      audience: value as "All" | "Students" | "Staff" | "Specific Blocks"
                    })}
                  >
                    <SelectTrigger id="edit-audience">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Students">Students</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Specific Blocks">Specific Blocks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-publish-date">Publish Date *</Label>
                  <Input
                    id="edit-publish-date"
                    type="date"
                    value={selectedNotice.publishDate}
                    onChange={(e) => setSelectedNotice({
                      ...selectedNotice,
                      publishDate: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-expiry-date">Expiry Date *</Label>
                  <Input
                    id="edit-expiry-date"
                    type="date"
                    value={selectedNotice.expiryDate}
                    onChange={(e) => setSelectedNotice({
                      ...selectedNotice,
                      expiryDate: e.target.value
                    })}
                  />
                </div>
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
                <Label>Notification Options</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-email"
                    checked={selectedNotice.notify.email}
                    onChange={(e) => setSelectedNotice({
                      ...selectedNotice,
                      notify: {
                        ...selectedNotice.notify,
                        email: e.target.checked
                      }
                    })}
                  />
                  <Label htmlFor="edit-email" className="text-sm font-normal">
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-sms"
                    checked={selectedNotice.notify.sms}
                    onChange={(e) => setSelectedNotice({
                      ...selectedNotice,
                      notify: {
                        ...selectedNotice.notify,
                        sms: e.target.checked
                      }
                    })}
                  />
                  <Label htmlFor="edit-sms" className="text-sm font-normal">
                    SMS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-push"
                    checked={selectedNotice.notify.push}
                    onChange={(e) => setSelectedNotice({
                      ...selectedNotice,
                      notify: {
                        ...selectedNotice.notify,
                        push: e.target.checked
                      }
                    })}
                  />
                  <Label htmlFor="edit-push" className="text-sm font-normal">
                    Push Notification
                  </Label>
                </div>
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
            <DialogTitle>Delete Notice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-2">
              <p className="font-medium">{selectedNotice.title}</p>
              <p className="text-sm text-muted-foreground">
                Published: {formatDate(selectedNotice.publishDate)} • Expires: {formatDate(selectedNotice.expiryDate)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotice}>
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
              Send additional notifications for this notice
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Channels</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notify-email"
                    checked={selectedNotice.notify.email}
                    onChange={(e) => setSelectedNotice({
                      ...selectedNotice,
                      notify: {
                        ...selectedNotice.notify,
                        email: e.target.checked
                      }
                    })}
                  />
                  <Label htmlFor="notify-email" className="text-sm font-normal">
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notify-sms"
                    checked={selectedNotice.notify.sms}
                    onChange={(e) => setSelectedNotice({
                      ...selectedNotice,
                      notify: {
                        ...selectedNotice.notify,
                        sms: e.target.checked
                      }
                    })}
                  />
                  <Label htmlFor="notify-sms" className="text-sm font-normal">
                    SMS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notify-push"
                    checked={selectedNotice.notify.push}
                    onChange={(e) => setSelectedNotice({
                      ...selectedNotice,
                      notify: {
                        ...selectedNotice.notify,
                        push: e.target.checked
                      }
                    })}
                  />
                  <Label htmlFor="notify-push" className="text-sm font-normal">
                    Push Notification
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-message">Custom Message (optional)</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Add a custom message to include with the notification"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // In a real app, you would send the notifications here
              setIsNotifyDialogOpen(false);
            }}>
              Send Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}