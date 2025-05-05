"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Mail, 
  Phone, 
  User, 
  Lock,
  Shield,
  Settings as SettingsIcon,
  KeyRound,
  Edit,
  Image as ImageIcon,
  Calendar,
  Loader2,
  CheckCircle
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture: string;
  role: string;
  adminCode: string;
  isActive: boolean;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse {
  message: string;
  success: boolean;
  data: {
    user: AdminProfile;
    profileData: null;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePicture: "",
    role: "admin",
    adminCode: "226028",
    isActive: true,
    fullName: "",
    createdAt: "",
    updatedAt: ""
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState({
    profile: false,
    password: false,
    fetchProfile: false,
    imageUpload: false
  });
  const [tempImage, setTempImage] = useState("");

  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
      setIsLoading(prev => ({ ...prev, fetchProfile: true }));
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/login/admin");
          return;
        }

        const response = await axios.get<ApiResponse>("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.data.success || !response.data.data.user) {
          throw new Error("Invalid user data received");
        }

        const userData = response.data.data.user;

        setAdminProfile({
          _id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          profilePicture: userData.profilePicture,
          role: userData.role,
          adminCode: userData.adminCode,
          isActive: userData.isActive,
          fullName: userData.fullName,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          lastLogin: userData.lastLogin
        });

      } catch (error) {
        console.error("Profile fetch error:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            toast.error("Session expired. Please login again.");
            router.push("/login/admin");
          } else {
            toast.error(error.response?.data?.message || "Failed to fetch profile data");
          }
        } else if (error instanceof Error) {
          toast.error(error.message || "Failed to fetch profile data");
        }
      } finally {
        setIsLoading(prev => ({ ...prev, fetchProfile: false }));
      }
    };

    fetchAdminProfile();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsLoading(prev => ({ ...prev, imageUpload: true }));
      const file = e.target.files[0];
      
      // Create temporary URL for preview
      setTempImage(URL.createObjectURL(file));
      
      try {
        // In a real app, you would upload to your server here
        // const formData = new FormData();
        // formData.append('image', file);
        // const response = await axios.post('/api/upload', formData);
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll just use the temp URL
        setAdminProfile(prev => ({
          ...prev,
          profilePicture: URL.createObjectURL(file)
        }));
        
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        toast.error("Failed to upload image");
        console.error("Image upload error:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, imageUpload: false }));
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const saveProfile = async () => {
    setIsLoading(prev => ({ ...prev, profile: true }));
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/login/admin");
        return;
      }

      const response = await axios.put<ApiResponse>(
        "http://localhost:5000/api/auth/update-profile",
        {
          firstName: adminProfile.firstName,
          lastName: adminProfile.lastName,
          email: adminProfile.email,
          phone: adminProfile.phone,
          profilePicture: adminProfile.profilePicture
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.success && response.data?.data?.user) {
        toast.success("Profile updated successfully!", {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />
        });
        setIsProfileDialogOpen(false);
        setAdminProfile(prev => ({
          ...prev,
          ...response.data.data.user
        }));
      } else {
        throw new Error(response.data?.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update profile");
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(prev => ({ ...prev, password: true }));
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/login/admin");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.success) {
        toast.success("Password changed successfully!", {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />
        });
        setIsPasswordDialogOpen(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        throw new Error(response.data?.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to change password");
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Account Settings
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your account information and security settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 rounded-md"
          >
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 rounded-md"
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading.fetchProfile ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-primary/20">
                        <AvatarImage src={adminProfile.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-3xl font-semibold">
                          {adminProfile.firstName.charAt(0)}{adminProfile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => setIsProfileDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>

                  <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">First Name</Label>
                      <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700">
                        <p className="text-gray-900 dark:text-white font-medium">{adminProfile.firstName}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Last Name</Label>
                      <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700">
                        <p className="text-gray-900 dark:text-white font-medium">{adminProfile.lastName}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Email</Label>
                      <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <p className="text-gray-900 dark:text-white font-medium">{adminProfile.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Phone</Label>
                      <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <p className="text-gray-900 dark:text-white font-medium">
                          {adminProfile.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Admin Code</Label>
                      <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex items-center gap-3">
                        <KeyRound className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <p className="text-gray-900 dark:text-white font-medium">{adminProfile.adminCode}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">Status</Label>
                      <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700">
                        {adminProfile.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {adminProfile.lastLogin && (
                      <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">Last Login</Label>
                        <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700 flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-gray-900 dark:text-white font-medium">
                            {new Date(adminProfile.lastLogin).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-gray-900 dark:text-white">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-6 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Last changed {adminProfile.updatedAt ? new Date(adminProfile.updatedAt).toLocaleDateString() : "unknown"}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="gap-2 w-full md:w-auto"
                    onClick={() => setIsPasswordDialogOpen(true)}
                  >
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-6 bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" className="w-full md:w-auto">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
              <User className="h-5 w-5 text-primary" />
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              title="Upload Profile Picture"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={tempImage || adminProfile.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-3xl font-semibold">
                    {adminProfile.firstName.charAt(0)}{adminProfile.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isLoading.imageUpload && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={triggerFileInput}
                disabled={isLoading.imageUpload}
              >
                {isLoading.imageUpload ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    Change Profile Picture
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={adminProfile.firstName}
                  onChange={(e) => setAdminProfile(prev => ({
                    ...prev,
                    firstName: e.target.value
                  }))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={adminProfile.lastName}
                  onChange={(e) => setAdminProfile(prev => ({
                    ...prev,
                    lastName: e.target.value
                  }))}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={adminProfile.email}
                  onChange={(e) => setAdminProfile(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  className="pl-10 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={adminProfile.phone}
                  onChange={(e) => setAdminProfile(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                  className="pl-10 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsProfileDialogOpen(false)}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveProfile}
              disabled={isLoading.profile}
              className="gap-2"
            >
              {isLoading.profile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
              <KeyRound className="h-5 w-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Enter your current password and set a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="currentPassword" 
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="pl-10 bg-white dark:bg-gray-800"
                  placeholder="Enter current password"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="newPassword" 
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="pl-10 bg-white dark:bg-gray-800"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className="pl-10 bg-white dark:bg-gray-800"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordDialogOpen(false)}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={changePassword}
              disabled={isLoading.password}
              className="gap-2"
            >
              {isLoading.password ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}