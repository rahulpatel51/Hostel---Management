"use client";

import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Download, MoreHorizontal, Search, UserPlus, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

// Configure Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api/admin",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admintoken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access - please login again");
    }
    return Promise.reject(error);
  }
);

type Warden = {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    isActive: boolean;
    lastLogin?: string;
  };
  name: string;
  email: string;
  employeeId: string;
  contactNumber: string;
  qualification: string;
  assignedBlocks: string[];
  image?: string;
  status: "Active" | "On Leave" | "Inactive";
  joinDate: string;
  address: string;
  aadhaar: string;
};

export default function StaffManagementPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
  
  // Selected staff states
  const [selectedWarden, setSelectedWarden] = useState<Warden | null>(null);
  const [editedWarden, setEditedWarden] = useState<Partial<Warden> | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newStatus, setNewStatus] = useState<"Active" | "On Leave" | "Inactive">("Active");

  // New staff form state
  const [newWarden, setNewWarden] = useState({
    name: "",
    email: "",
    employeeId: "",
    contactNumber: "",
    qualification: "",
    assignedBlocks: [] as string[],
    status: "Active" as const,
    joinDate: new Date().toISOString().split('T')[0],
    address: "",
    aadhaar: "",
    password: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch wardens from backend
  useEffect(() => {
    const fetchWardens = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/wardens");
        // Ensure the response data is an array
        const data = Array.isArray(response.data) ? response.data : [];
        setWardens(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching wardens:", err);
        const errorMessage = axios.isAxiosError(err) 
          ? err.response?.data?.message || "Network error occurred"
          : "Failed to fetch wardens";
        
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWardens();
  }, [toast]);

  const filteredWardens = wardens.filter(warden => {
    const matchesSearch = warden.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         warden.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warden.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && warden.status === "Active") ||
                      (activeTab === "inactive" && warden.status !== "Active");
    
    return matchesSearch && matchesTab;
  });

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleAddWarden = async () => {
    try {
      setIsLoading(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append("name", newWarden.name);
      formData.append("email", newWarden.email);
      formData.append("employeeId", newWarden.employeeId);
      formData.append("contactNumber", newWarden.contactNumber);
      formData.append("qualification", newWarden.qualification);
      formData.append("status", newWarden.status);
      formData.append("joinDate", newWarden.joinDate);
      formData.append("address", newWarden.address);
      formData.append("aadhaar", newWarden.aadhaar);
      formData.append("password", newWarden.password);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.post("/wardens", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setWardens([...wardens, response.data]);
      
      toast({
        title: "Success",
        description: `Warden ${newWarden.name} added successfully`,
      });

      // Reset form
      setNewWarden({
        name: "",
        email: "",
        employeeId: "",
        contactNumber: "",
        qualification: "",
        assignedBlocks: [],
        status: "Active",
        joinDate: new Date().toISOString().split('T')[0],
        address: "",
        aadhaar: "",
        password: ""
      });
      setImageFile(null);
      setIsAddStaffOpen(false);
    } catch (error) {
      console.error("Error adding warden:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to add warden"
        : "An unexpected error occurred";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (warden: Warden) => {
    setSelectedWarden(warden);
    setIsViewProfileOpen(true);
  };

  const handleEditProfile = (warden: Warden) => {
    setEditedWarden({...warden});
    setIsEditProfileOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!editedWarden || !editedWarden._id) return;

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      if (editedWarden.name) formData.append("name", editedWarden.name);
      if (editedWarden.email) formData.append("email", editedWarden.email);
      if (editedWarden.employeeId) formData.append("employeeId", editedWarden.employeeId);
      if (editedWarden.contactNumber) formData.append("contactNumber", editedWarden.contactNumber);
      if (editedWarden.qualification) formData.append("qualification", editedWarden.qualification);
      if (editedWarden.address) formData.append("address", editedWarden.address);
      if (editedWarden.aadhaar) formData.append("aadhaar", editedWarden.aadhaar);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.put(`/wardens/${editedWarden._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setWardens(wardens.map(w => w._id === editedWarden._id ? response.data : w));
      
      toast({
        title: "Success",
        description: `Warden ${editedWarden.name} updated successfully`,
      });

      setIsEditProfileOpen(false);
      setImageFile(null);
    } catch (error) {
      console.error("Error updating warden:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update warden"
        : "An unexpected error occurred";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedWarden || !newPassword) return;

    try {
      setIsLoading(true);
      await api.patch(`/wardens/${selectedWarden._id}/password`, {
        newPassword
      });

      toast({
        title: "Success",
        description: `Password reset for ${selectedWarden.name}`,
      });

      setIsResetPassOpen(false);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to reset password"
        : "An unexpected error occurred";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedWarden) return;

    try {
      setIsLoading(true);
      const response = await api.patch(`/wardens/${selectedWarden._id}/status`, { status: newStatus });
      const updatedWarden = response.data;

      setWardens((prevWardens) =>
        prevWardens.map((warden) =>
          warden._id === updatedWarden._id ? updatedWarden : warden
        )
      );

      toast({
        title: "Success",
        description: `Status updated to ${newStatus} for ${selectedWarden.name}`,
      });

      setIsStatusChangeOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to update status"
        : "An unexpected error occurred";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWarden = async (wardenId: string) => {
    try {
      setIsLoading(true);
      await api.delete(`/wardens/${wardenId}`);

      setWardens(wardens.filter(w => w._id !== wardenId));
      
      toast({
        title: "Success",
        description: "Warden deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting warden:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to delete warden"
        : "An unexpected error occurred";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20 p-6 rounded-lg border">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Warden Management
          </h1>
          <p className="text-muted-foreground">Manage hostel wardens and their details</p>
        </div>

        {/* Search and Add Staff */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search wardens..."
              className="w-full pl-8 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto gap-1 bg-purple-600 hover:bg-purple-700 text-white">
                <UserPlus className="h-4 w-4" />
                Add Warden
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800/30">
              <DialogHeader>
                <DialogTitle className="text-purple-900 dark:text-purple-100">Add New Warden</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new warden. They will receive login credentials.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right text-purple-700 dark:text-purple-300">
                    Photo
                  </Label>
                  <div className="col-span-3 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-purple-200 dark:border-purple-800/30">
                      <AvatarImage src={imageFile ? URL.createObjectURL(imageFile) : "/placeholder-user.jpg"} />
                      <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">PH</AvatarFallback>
                    </Avatar>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="col-span-2 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-purple-700 dark:text-purple-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={newWarden.name}
                    onChange={(e) => setNewWarden({...newWarden, name: e.target.value})}
                    className="col-span-3 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employeeId" className="text-right text-purple-700 dark:text-purple-300">
                    Employee ID
                  </Label>
                  <Input
                    id="employeeId"
                    value={newWarden.employeeId}
                    onChange={(e) => setNewWarden({...newWarden, employeeId: e.target.value})}
                    className="col-span-3 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-purple-700 dark:text-purple-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newWarden.email}
                    onChange={(e) => setNewWarden({...newWarden, email: e.target.value})}
                    className="col-span-3 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                    placeholder="official email for login"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right text-purple-700 dark:text-purple-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newWarden.password}
                    onChange={(e) => setNewWarden({...newWarden, password: e.target.value})}
                    className="col-span-3 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                    placeholder="temporary password"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contactNumber" className="text-right text-purple-700 dark:text-purple-300">
                    Contact
                  </Label>
                  <Input
                    id="contactNumber"
                    value={newWarden.contactNumber}
                    onChange={(e) => setNewWarden({...newWarden, contactNumber: e.target.value})}
                    className="col-span-3 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="qualification" className="text-right text-purple-700 dark:text-purple-300">
                    Qualification
                  </Label>
                  <Input
                    id="qualification"
                    value={newWarden.qualification}
                    onChange={(e) => setNewWarden({...newWarden, qualification: e.target.value})}
                    className="col-span-3 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="aadhaar" className="text-right text-purple-700 dark:text-purple-300">
                    Aadhaar
                  </Label>
                  <Input
                    id="aadhaar"
                    value={newWarden.aadhaar}
                    onChange={(e) => setNewWarden({...newWarden, aadhaar: e.target.value})}
                    className="col-span-3 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right text-purple-700 dark:text-purple-300">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={newWarden.address}
                    onChange={(e) => setNewWarden({...newWarden, address: e.target.value})}
                    className="col-span-3 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddStaffOpen(false);
                    setNewWarden({
                      name: "",
                      email: "",
                      employeeId: "",
                      contactNumber: "",
                      qualification: "",
                      assignedBlocks: [],
                      status: "Active",
                      joinDate: new Date().toISOString().split('T')[0],
                      address: "",
                      aadhaar: "",
                      password: ""
                    });
                    setImageFile(null);
                  }}
                  className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleAddWarden}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </div>
                  ) : "Add Warden"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/80">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-100"
            >
              All Wardens
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-100"
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="inactive" 
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-100"
            >
              Inactive
            </TabsTrigger>
          </TabsList>

          {/* All Wardens Tab */}
          <TabsContent value="all" className="mt-4">
            <Card className="border-purple-200 dark:border-purple-800/30 shadow-sm">
              <CardHeader className="bg-purple-50 dark:bg-purple-950/20 rounded-t-lg border-b border-purple-100 dark:border-purple-800/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-purple-900 dark:text-purple-100">Warden List</CardTitle>
                  <CardDescription>
                    Showing {filteredWardens.length} of {wardens.length} wardens
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1 border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading && wardens.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : error ? (
                  <div className="flex justify-center py-8 text-red-500">
                    <p>{error}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-purple-50/50 dark:bg-purple-950/10">
                      <TableRow className="border-purple-100 dark:border-purple-800/20 hover:bg-purple-50 dark:hover:bg-purple-900/10">
                        <TableHead className="w-[100px] text-purple-700 dark:text-purple-300">ID</TableHead>
                        <TableHead className="text-purple-700 dark:text-purple-300">Warden</TableHead>
                        <TableHead className="text-purple-700 dark:text-purple-300">Contact</TableHead>
                        <TableHead className="hidden md:table-cell text-purple-700 dark:text-purple-300">Qualification</TableHead>
                        <TableHead className="text-purple-700 dark:text-purple-300">Status</TableHead>
                        <TableHead className="text-right text-purple-700 dark:text-purple-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWardens.length > 0 ? (
                        filteredWardens.map((warden) => (
                          <TableRow key={warden._id} className="border-purple-100 dark:border-purple-800/20 hover:bg-purple-50/50 dark:hover:bg-purple-900/10">
                            <TableCell className="font-medium text-purple-900 dark:text-purple-100">{warden.employeeId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border-2 border-purple-200 dark:border-purple-800/30">
                                  <AvatarImage src={warden.image || warden.userId?.profilePicture} alt={warden.name} />
                                  <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">{warden.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-purple-900 dark:text-purple-100">{warden.name}</div>
                                  <div className="text-sm text-purple-600/70 dark:text-purple-300/70">{warden.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-purple-900 dark:text-purple-100">{warden.contactNumber}</TableCell>
                            <TableCell className="hidden md:table-cell text-purple-900 dark:text-purple-100">{warden.qualification}</TableCell>
                            <TableCell>
                              <Badge
                                variant={warden.status === "Active" ? "default" : "outline"}
                                className={
                                  warden.status === "Active"
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : warden.status === "On Leave"
                                      ? "text-amber-800 border-amber-600 dark:text-amber-400 dark:border-amber-500"
                                      : "text-red-800 border-red-600 dark:text-red-400 dark:border-red-500"
                                }
                              >
                                {warden.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-purple-200 dark:border-purple-800/30 bg-white dark:bg-gray-950">
                                  <DropdownMenuLabel className="text-purple-900 dark:text-purple-100">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    onClick={() => handleViewProfile(warden)}
                                    className="text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                                  >
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditProfile(warden)}
                                    className="text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                                  >
                                    Edit Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedWarden(warden);
                                      setIsResetPassOpen(true);
                                    }}
                                    className="text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                                  >
                                    Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedWarden(warden);
                                      setNewStatus(warden.status === "Active" ? "On Leave" : "Active");
                                      setIsStatusChangeOpen(true);
                                    }}
                                    className="text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                                  >
                                    {warden.status === "Active" ? "Mark On Leave" : "Mark Active"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                                    onClick={() => {
                                      setSelectedWarden(warden);
                                      setNewStatus("Inactive");
                                      setIsStatusChangeOpen(true);
                                    }}
                                  >
                                    Deactivate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                                    onClick={() => handleDeleteWarden(warden._id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="border-purple-100 dark:border-purple-800/20">
                          <TableCell colSpan={6} className="text-center py-8 text-purple-600/70 dark:text-purple-300/70">
                            No wardens found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status-specific tabs */}
          {["active", "inactive"].map((status) => (
            <TabsContent key={status} value={status} className="mt-4">
              <Card className={status === "active" ? 
                "border-emerald-200 dark:border-emerald-800/30 shadow-sm" : 
                "border-amber-200 dark:border-amber-800/30 shadow-sm"
              }>
                <CardHeader className={status === "active" ? 
                  "bg-emerald-50 dark:bg-emerald-950/20 rounded-t-lg border-b border-emerald-100 dark:border-emerald-800/20" : 
                  "bg-amber-50 dark:bg-amber-950/20 rounded-t-lg border-b border-amber-100 dark:border-amber-800/20"
                }>
                  <CardTitle className={status === "active" ? 
                    "text-emerald-900 dark:text-emerald-100" : 
                    "text-amber-900 dark:text-amber-100"
                  }>
                    {status === "active" ? "Active Wardens" : "Inactive Wardens"}
                  </CardTitle>
                  <CardDescription>
                    {status === "active" 
                      ? "Currently active wardens" 
                      : "Deactivated or inactive wardens"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className={`h-8 w-8 animate-spin ${status === "active" ? "text-emerald-500" : "text-amber-500"}`} />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className={status === "active" ? 
                        "bg-emerald-50/50 dark:bg-emerald-950/10" : 
                        "bg-amber-50/50 dark:bg-amber-950/10"
                      }>
                        <TableRow className={status === "active" ? 
                          "border-emerald-100 dark:border-emerald-800/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/10" : 
                          "border-amber-100 dark:border-amber-800/20 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                        }>
                          <TableHead className={`w-[100px] ${status === "active" ? 
                            "text-emerald-700 dark:text-emerald-300" : 
                            "text-amber-700 dark:text-amber-300"
                          }`}>ID</TableHead>
                          <TableHead className={status === "active" ? 
                            "text-emerald-700 dark:text-emerald-300" : 
                            "text-amber-700 dark:text-amber-300"
                          }>Warden</TableHead>
                          <TableHead className={status === "active" ? 
                            "text-emerald-700 dark:text-emerald-300" : 
                            "text-amber-700 dark:text-amber-300"
                          }>Contact</TableHead>
                          <TableHead className={status === "active" ? 
                            "text-emerald-700 dark:text-emerald-300" : 
                            "text-amber-700 dark:text-amber-300"
                          }>Status</TableHead>
                          <TableHead className={`text-right ${status === "active" ? 
                            "text-emerald-700 dark:text-emerald-300" : 
                            "text-amber-700 dark:text-amber-300"
                          }`}>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWardens
                          .filter(w => status === "active" ? w.status === "Active" : w.status !== "Active")
                          .map((warden) => (
                            <TableRow key={warden._id} className={status === "active" ? 
                              "border-emerald-100 dark:border-emerald-800/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10" : 
                              "border-amber-100 dark:border-amber-800/20 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                            }>
                              <TableCell className={`font-medium ${status === "active" ? 
                                "text-emerald-900 dark:text-emerald-100" : 
                                "text-amber-900 dark:text-amber-100"
                              }`}>{warden.employeeId}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className={`h-9 w-9 ${status === "active" ? 
                                    "border-2 border-emerald-200 dark:border-emerald-800/30" : 
                                    "border-2 border-amber-200 dark:border-amber-800/30"
                                  }`}>
                                    <AvatarImage src={warden.image || warden.userId?.profilePicture} alt={warden.name} />
                                    <AvatarFallback className={status === "active" ? 
                                      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" : 
                                      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                    }>{warden.name.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className={`font-medium ${status === "active" ? 
                                      "text-emerald-900 dark:text-emerald-100" : 
                                      "text-amber-900 dark:text-amber-100"
                                    }`}>{warden.name}</div>
                                    <div className={`text-sm ${status === "active" ? 
                                      "text-emerald-600/70 dark:text-emerald-300/70" : 
                                      "text-amber-600/70 dark:text-amber-300/70"
                                    }`}>{warden.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className={status === "active" ? 
                                "text-emerald-900 dark:text-emerald-100" : 
                                "text-amber-900 dark:text-amber-100"
                              }>{warden.contactNumber}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={warden.status === "Active" ? "default" : "outline"}
                                  className={
                                    warden.status === "Active"
                                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : warden.status === "On Leave"
                                        ? "text-amber-800 border-amber-600 dark:text-amber-400 dark:border-amber-500"
                                        : "text-red-800 border-red-600 dark:text-red-400 dark:border-red-500"
                                  }
                                >
                                  {warden.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className={status === "active" ? 
                                      "hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : 
                                      "hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                    }>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className={status === "active" ? 
                                    "border-emerald-200 dark:border-emerald-800/30 bg-white dark:bg-gray-950" : 
                                    "border-amber-200 dark:border-amber-800/30 bg-white dark:bg-gray-950"
                                  }>
                                    <DropdownMenuLabel className={status === "active" ? 
                                      "text-emerald-900 dark:text-emerald-100" : 
                                      "text-amber-900 dark:text-amber-100"
                                    }>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem 
                                      onClick={() => handleViewProfile(warden)}
                                      className={`cursor-pointer ${status === "active" ? 
                                        "text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : 
                                        "text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                      }`}
                                    >
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleEditProfile(warden)}
                                      className={`cursor-pointer ${status === "active" ? 
                                        "text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : 
                                        "text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                      }`}
                                    >
                                      Edit Profile
                                    </DropdownMenuItem>
                                    {status === "inactive" && (
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          setSelectedWarden(warden);
                                          setNewStatus("Active");
                                          setIsStatusChangeOpen(true);
                                        }}
                                        className="text-emerald-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer"
                                      >
                                        Activate
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* View Profile Dialog */}
      <Dialog open={isViewProfileOpen} onOpenChange={setIsViewProfileOpen}>
        <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800/30">
          <DialogHeader>
            <DialogTitle className="text-purple-900 dark:text-purple-100">Warden Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedWarden?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedWarden && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-purple-200 dark:border-purple-800/30">
                  <AvatarImage src={selectedWarden.image || selectedWarden.userId?.profilePicture} />
                  <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">{selectedWarden.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">{selectedWarden.name}</h3>
                  <p className="text-sm text-purple-600/70 dark:text-purple-300/70">{selectedWarden.employeeId}</p>
                  <Badge
                    variant={selectedWarden.status === "Active" ? "default" : "outline"}
                    className="mt-1"
                  >
                    {selectedWarden.status}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-purple-100 dark:bg-purple-800/20" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-purple-700 dark:text-purple-300">Employee ID</Label>
                  <p className="text-purple-900 dark:text-purple-100">{selectedWarden.employeeId}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-purple-700 dark:text-purple-300">Email</Label>
                  <p className="text-purple-900 dark:text-purple-100">{selectedWarden.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-purple-700 dark:text-purple-300">Contact</Label>
                  <p className="text-purple-900 dark:text-purple-100">{selectedWarden.contactNumber}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-purple-700 dark:text-purple-300">Qualification</Label>
                  <p className="text-purple-900 dark:text-purple-100">{selectedWarden.qualification}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-purple-700 dark:text-purple-300">Join Date</Label>
                  <p className="text-purple-900 dark:text-purple-100">{new Date(selectedWarden.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-purple-700 dark:text-purple-300">Aadhaar</Label>
                  <p className="text-purple-900 dark:text-purple-100">{selectedWarden.aadhaar}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-purple-700 dark:text-purple-300">Assigned Blocks</Label>
                  <p className="text-purple-900 dark:text-purple-100">{selectedWarden.assignedBlocks.join(", ") || "None"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-purple-700 dark:text-purple-300">Address</Label>
                <p className="text-purple-900 dark:text-purple-100">{selectedWarden.address}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[600px] border-purple-200 dark:border-purple-800/30">
          <DialogHeader>
            <DialogTitle className="text-purple-900 dark:text-purple-100">Edit Profile</DialogTitle>
            <DialogDescription>
              Update details for {editedWarden?.name}
            </DialogDescription>
          </DialogHeader>
          {editedWarden && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-purple-200 dark:border-purple-800/30">
                  <AvatarImage src={editedWarden.image || editedWarden.userId?.profilePicture} />
                  <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">{editedWarden.name?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-name" className="text-purple-700 dark:text-purple-300">Name</Label>
                  <Input
                    id="edit-name"
                    value={editedWarden.name || ""}
                    onChange={(e) => setEditedWarden({...editedWarden, name: e.target.value})}
                    className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-employeeId" className="text-purple-700 dark:text-purple-300">Employee ID</Label>
                  <Input
                    id="edit-employeeId"
                    value={editedWarden.employeeId || ""}
                    onChange={(e) => setEditedWarden({...editedWarden, employeeId: e.target.value})}
                    className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-email" className="text-purple-700 dark:text-purple-300">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editedWarden.email || ""}
                    onChange={(e) => setEditedWarden({...editedWarden, email: e.target.value})}
                    className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-contact" className="text-purple-700 dark:text-purple-300">Contact</Label>
                  <Input
                    id="edit-contact"
                    value={editedWarden.contactNumber || ""}
                    onChange={(e) => setEditedWarden({...editedWarden, contactNumber: e.target.value})}
                    className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-qualification" className="text-purple-700 dark:text-purple-300">Qualification</Label>
                  <Input
                    id="edit-qualification"
                    value={editedWarden.qualification || ""}
                    onChange={(e) => setEditedWarden({...editedWarden, qualification: e.target.value})}
                    className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-aadhaar" className="text-purple-700 dark:text-purple-300">Aadhaar</Label>
                  <Input
                    id="edit-aadhaar"
                    value={editedWarden.aadhaar || ""}
                    onChange={(e) => setEditedWarden({...editedWarden, aadhaar: e.target.value})}
                    className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="edit-address" className="text-purple-700 dark:text-purple-300">Address</Label>
                  <Input
                    id="edit-address"
                    value={editedWarden.address || ""}
                    onChange={(e) => setEditedWarden({...editedWarden, address: e.target.value})}
                    className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditProfileOpen(false)}
              className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </div>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPassOpen} onOpenChange={setIsResetPassOpen}>
        <DialogContent className="sm:max-w-[425px] border-purple-200 dark:border-purple-800/30">
          <DialogHeader>
            <DialogTitle className="text-purple-900 dark:text-purple-100">Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedWarden?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="new-password" className="text-purple-700 dark:text-purple-300">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsResetPassOpen(false);
                setNewPassword("");
              }}
              className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={isLoading || !newPassword}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </div>
              ) : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isStatusChangeOpen} onOpenChange={setIsStatusChangeOpen}>
        <DialogContent className="sm:max-w-[425px] border-purple-200 dark:border-purple-800/30">
          <DialogHeader>
            <DialogTitle className="text-purple-900 dark:text-purple-100">Change Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedWarden?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-purple-700 dark:text-purple-300">Select New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as any)}>
                <SelectTrigger className="w-full border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="border-purple-200 dark:border-purple-800/30 bg-white dark:bg-gray-950">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus === "Inactive" && (
              <p className="text-sm text-red-600">
                Warning: Deactivating will revoke this warden's access to the system.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusChangeOpen(false)}
              className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStatusChange} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              ) : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
