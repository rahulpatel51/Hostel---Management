"use client";

import { useState, useEffect } from "react";
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
import { Download, MoreHorizontal, Search, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

// Configure Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
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
  userId: {
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
  const [editedWarden, setEditedWarden] = useState<Warden | null>(null);
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
        const response = await api.get("/admin/wardens");
        setWardens(response.data);
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
                      warden.status.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
    }
  };

  const handleAddWarden = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append("name", newWarden.name);
      formData.append("email", newWarden.email);
      formData.append("password", newWarden.password);
      formData.append("employeeId", newWarden.employeeId);
      formData.append("contactNumber", newWarden.contactNumber);
      formData.append("qualification", newWarden.qualification);
      formData.append("assignedBlocks", JSON.stringify(newWarden.assignedBlocks));
      formData.append("status", newWarden.status);
      formData.append("joinDate", newWarden.joinDate);
      formData.append("address", newWarden.address);
      formData.append("aadhaar", newWarden.aadhaar);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.post("/admin/wardens", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setWardens([...wardens, response.data]);
      setIsAddStaffOpen(false);
      resetNewWardenForm();
      
      toast({
        title: "Success",
        description: "Warden added successfully",
      });
    } catch (err) {
      console.error("Error adding warden:", err);
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to add warden"
        : "Failed to add warden";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewWardenForm = () => {
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
  };

  const handleViewProfile = (warden: Warden) => {
    setSelectedWarden(warden);
    setIsViewProfileOpen(true);
  };

  const handleEditProfile = (warden: Warden) => {
    setEditedWarden({...warden});
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editedWarden) return;
    
    try {
      setIsLoading(true);
      const response = await api.put(`/admin/wardens/${editedWarden._id}`, editedWarden);
      
      setWardens(wardens.map(w => 
        w._id === editedWarden._id ? response.data : w
      ));
      setIsEditProfileOpen(false);
      
      toast({
        title: "Success",
        description: "Warden updated successfully",
      });
    } catch (err) {
      console.error("Error updating warden:", err);
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to update warden"
        : "Failed to update warden";
      
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
      await api.post(`/admin/wardens/${selectedWarden._id}/reset-password`, {
        newPassword
      });
      
      setIsResetPassOpen(false);
      setNewPassword("");
      
      toast({
        title: "Success",
        description: "Password reset successfully",
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to reset password"
        : "Failed to reset password";
      
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
      const response = await api.patch(`/admin/wardens/${selectedWarden._id}/status`, {
        status: newStatus
      });
      
      setWardens(wardens.map(w => 
        w._id === selectedWarden._id ? response.data : w
      ));
      setIsStatusChangeOpen(false);
      
      toast({
        title: "Success",
        description: `Status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error changing status:", err);
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to change status"
        : "Failed to change status";
      
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
      await api.delete(`/admin/wardens/${wardenId}`);
      
      setWardens(wardens.filter(w => w._id !== wardenId));
      
      toast({
        title: "Success",
        description: "Warden deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting warden:", err);
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || "Failed to delete warden"
        : "Failed to delete warden";
      
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Warden Management</h1>
        <p className="text-muted-foreground">Manage hostel wardens and their details</p>
      </div>

      {/* Search and Add Staff */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search wardens..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto gap-1">
              <UserPlus className="h-4 w-4" />
              Add Warden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Warden</DialogTitle>
              <DialogDescription>
                Fill in the details for the new warden. They will receive login credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Photo
                </Label>
                <div className="col-span-3 flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={imageFile ? URL.createObjectURL(imageFile) : "/placeholder-user.jpg"} />
                    <AvatarFallback>PH</AvatarFallback>
                  </Avatar>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="col-span-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={newWarden.name}
                  onChange={(e) => setNewWarden({...newWarden, name: e.target.value})}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employeeId" className="text-right">
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  value={newWarden.employeeId}
                  onChange={(e) => setNewWarden({...newWarden, employeeId: e.target.value})}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newWarden.email}
                  onChange={(e) => setNewWarden({...newWarden, email: e.target.value})}
                  className="col-span-3"
                  placeholder="official email for login"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newWarden.password}
                  onChange={(e) => setNewWarden({...newWarden, password: e.target.value})}
                  className="col-span-3"
                  placeholder="temporary password"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactNumber" className="text-right">
                  Contact
                </Label>
                <Input
                  id="contactNumber"
                  value={newWarden.contactNumber}
                  onChange={(e) => setNewWarden({...newWarden, contactNumber: e.target.value})}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="qualification" className="text-right">
                  Qualification
                </Label>
                <Input
                  id="qualification"
                  value={newWarden.qualification}
                  onChange={(e) => setNewWarden({...newWarden, qualification: e.target.value})}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="aadhaar" className="text-right">
                  Aadhaar
                </Label>
                <Input
                  id="aadhaar"
                  value={newWarden.aadhaar}
                  onChange={(e) => setNewWarden({...newWarden, aadhaar: e.target.value})}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={newWarden.address}
                  onChange={(e) => setNewWarden({...newWarden, address: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddStaffOpen(false);
                resetNewWardenForm();
              }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleAddWarden}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Warden"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Wardens</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        {/* All Wardens Tab */}
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Warden List</CardTitle>
                <CardDescription>
                  Showing {filteredWardens.length} of {wardens.length} wardens
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading wardens...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center py-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Warden</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Qualification</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWardens.length > 0 ? (
                      filteredWardens.map((warden) => (
                        <TableRow key={warden._id}>
                          <TableCell className="font-medium">{warden.employeeId}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={warden.image || warden.userId?.profilePicture} alt={warden.name} />
                                <AvatarFallback>{warden.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{warden.name}</div>
                                <div className="text-sm text-muted-foreground">{warden.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{warden.contactNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">{warden.qualification}</TableCell>
                          <TableCell>
                            <Badge
                              variant={warden.status === "Active" ? "default" : "outline"}
                              className={
                                warden.status === "Active"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
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
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewProfile(warden)}>
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditProfile(warden)}>
                                  Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedWarden(warden);
                                  setIsResetPassOpen(true);
                                }}>
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedWarden(warden);
                                  setNewStatus(warden.status === "Active" ? "On Leave" : "Active");
                                  setIsStatusChangeOpen(true);
                                }}>
                                  {warden.status === "Active" ? "Mark On Leave" : "Mark Active"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedWarden(warden);
                                    setNewStatus("Inactive");
                                    setIsStatusChangeOpen(true);
                                  }}
                                >
                                  Deactivate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
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
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle>{status === "active" ? "Active Wardens" : "Inactive Wardens"}</CardTitle>
                <CardDescription>
                  {status === "active" 
                    ? "Currently active wardens" 
                    : "Deactivated or inactive wardens"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading wardens...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Warden</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWardens
                        .filter(w => status === "active" ? w.status === "Active" : w.status !== "Active")
                        .map((warden) => (
                          <TableRow key={warden._id}>
                            <TableCell className="font-medium">{warden.employeeId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={warden.image || warden.userId?.profilePicture} alt={warden.name} />
                                  <AvatarFallback>{warden.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{warden.name}</div>
                                  <div className="text-sm text-muted-foreground">{warden.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{warden.contactNumber}</TableCell>
                            <TableCell>
                              <Badge
                                variant={warden.status === "Active" ? "default" : "outline"}
                                className={
                                  warden.status === "Active"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
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
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewProfile(warden)}>
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditProfile(warden)}>
                                    Edit Profile
                                  </DropdownMenuItem>
                                  {status === "inactive" && (
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedWarden(warden);
                                      setNewStatus("Active");
                                      setIsStatusChangeOpen(true);
                                    }}>
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

      {/* View Profile Dialog */}
      <Dialog open={isViewProfileOpen} onOpenChange={setIsViewProfileOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Warden Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedWarden?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedWarden && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedWarden.image || selectedWarden.userId?.profilePicture} />
                  <AvatarFallback>{selectedWarden.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedWarden.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedWarden.employeeId}</p>
                  <Badge
                    variant={selectedWarden.status === "Active" ? "default" : "outline"}
                    className="mt-1"
                  >
                    {selectedWarden.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Employee ID</Label>
                  <p>{selectedWarden.employeeId}</p>
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <p>{selectedWarden.email}</p>
                </div>
                <div className="space-y-1">
                  <Label>Contact</Label>
                  <p>{selectedWarden.contactNumber}</p>
                </div>
                <div className="space-y-1">
                  <Label>Qualification</Label>
                  <p>{selectedWarden.qualification}</p>
                </div>
                <div className="space-y-1">
                  <Label>Join Date</Label>
                  <p>{new Date(selectedWarden.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <Label>Aadhaar</Label>
                  <p>{selectedWarden.aadhaar}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Assigned Blocks</Label>
                  <p>{selectedWarden.assignedBlocks.join(", ") || "None"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Address</Label>
                <p>{selectedWarden.address}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update details for {editedWarden?.name}
            </DialogDescription>
          </DialogHeader>
          {editedWarden && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={editedWarden.image || editedWarden.userId?.profilePicture} />
                  <AvatarFallback>{editedWarden.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setEditedWarden({
                          ...editedWarden,
                          image: URL.createObjectURL(file)
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editedWarden.name}
                    onChange={(e) => setEditedWarden({...editedWarden, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-employeeId">Employee ID</Label>
                  <Input
                    id="edit-employeeId"
                    value={editedWarden.employeeId}
                    onChange={(e) => setEditedWarden({...editedWarden, employeeId: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editedWarden.email}
                    onChange={(e) => setEditedWarden({...editedWarden, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-contact">Contact</Label>
                  <Input
                    id="edit-contact"
                    value={editedWarden.contactNumber}
                    onChange={(e) => setEditedWarden({...editedWarden, contactNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-qualification">Qualification</Label>
                  <Input
                    id="edit-qualification"
                    value={editedWarden.qualification}
                    onChange={(e) => setEditedWarden({...editedWarden, qualification: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-aadhaar">Aadhaar</Label>
                  <Input
                    id="edit-aadhaar"
                    value={editedWarden.aadhaar}
                    onChange={(e) => setEditedWarden({...editedWarden, aadhaar: e.target.value})}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input
                    id="edit-address"
                    value={editedWarden.address}
                    onChange={(e) => setEditedWarden({...editedWarden, address: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPassOpen} onOpenChange={setIsResetPassOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedWarden?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsResetPassOpen(false);
              setNewPassword("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isStatusChangeOpen} onOpenChange={setIsStatusChangeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedWarden?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
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
            <Button variant="outline" onClick={() => setIsStatusChangeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}