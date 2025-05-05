"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Pencil, 
  Save, 
  Upload, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Shield,
  User,
  Calendar,
  Key,
  AlertCircle,
  Settings2
} from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60");
  const [formData, setFormData] = useState({
    name: "Rahul Sharma",
    email: "rahul.sharma@hosteladmin.com",
    phone: "+91 9876543210",
    role: "Warden",
    hostel: "Boys Hostel A",
    bio: "Hostel warden with 5+ years of experience managing student accommodations.",
    notifications: true,
    securityAlerts: true,
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast({
          title: "Success",
          description: "Profile image updated successfully",
          className: "bg-emerald-500 text-white border-0"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully",
      className: "bg-emerald-500 text-white border-0"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side - Profile Card */}
        <div className="w-full md:w-1/3">
          <Card className="border-indigo-100 shadow-sm bg-gradient-to-b from-white to-indigo-50">
            <CardHeader className="items-center pb-0">
              <div className="relative">
                <Avatar className="h-40 w-40 border-4 border-indigo-200 shadow-md">
                  <AvatarImage src={profileImage} alt="Admin Profile" />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-3xl font-medium">
                    {formData.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute -bottom-2 right-2 bg-indigo-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors">
                    <Upload className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <CardTitle className="mt-6 text-center text-2xl font-bold text-gray-800">
                {formData.name}
              </CardTitle>
              <div className="flex items-center gap-1 mt-2 px-4 py-1 bg-indigo-100 rounded-full">
                <Shield className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">{formData.role}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{formData.hostel}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Mail className="h-5 w-5 text-indigo-500" />
                  <span className="text-gray-700">{formData.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Phone className="h-5 w-5 text-indigo-500" />
                  <span className="text-gray-700">{formData.phone}</span>
                </div>
              </div>
              <Separator className="my-6 bg-indigo-100" />
              <div className="flex justify-center">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className={`gap-2 ${isEditing ? "border-indigo-600 text-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
                >
                  <Pencil className="h-4 w-4" />
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Settings Forms */}
        <div className="w-full md:w-2/3 space-y-6">
          {/* Personal Information */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostel" className="text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Hostel
                  </Label>
                  <Select disabled={!isEditing}>
                    <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder={formData.hostel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boys Hostel A">Boys Hostel A</SelectItem>
                      <SelectItem value="Boys Hostel B">Boys Hostel B</SelectItem>
                      <SelectItem value="Girls Hostel A">Girls Hostel A</SelectItem>
                      <SelectItem value="Girls Hostel B">Girls Hostel B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-700 flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter new password"
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-indigo-600" />
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">Notification Preferences</CardTitle>
                  <CardDescription>Configure how you receive notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  <div>
                    <Label className="text-gray-800">Email Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Receive important updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.notifications}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, notifications: checked })
                  }
                  disabled={!isEditing}
                  className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-indigo-600" />
                  <div>
                    <Label className="text-gray-800">Security Alerts</Label>
                    <p className="text-sm text-gray-600">
                      Get notified about security issues
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.securityAlerts}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, securityAlerts: checked })
                  }
                  disabled={!isEditing}
                  className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}