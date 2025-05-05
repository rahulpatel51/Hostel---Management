"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Save, Lock, Image as ImageIcon, User, Mail, Phone, Home, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogHeader } from '@/components/ui/dialog';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@radix-ui/react-dialog';

type StudentProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  room: string;
  profileImg: string;
  joinDate: string;
  department: string;
  course: string;
};

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile>({
    id: 'ST2023001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@college.edu',
    phone: '+91 9876543210',
    room: 'A-101',
    profileImg: 'https://randomuser.me/api/portraits/men/1.jpg',
    joinDate: '2023-07-15',
    department: 'Computer Science',
    course: 'B.Tech'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<StudentProfile>({...profile});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditProfile(prev => ({ ...prev, [name]: value }));
  };

  const saveProfileChanges = async () => {
    setIsProfileLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(editProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved",
        className: "bg-green-500 text-white border-0"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
        className: "bg-green-500 text-white border-0"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const updateProfileImage = (url: string) => {
    setIsProfileLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setProfile(prev => ({ ...prev, profileImg: url }));
        setEditProfile(prev => ({ ...prev, profileImg: url }));
        toast({
          title: "Profile Image Updated",
          description: "Your profile picture has been changed",
          className: "bg-green-500 text-white border-0"
        });
        setIsProfileLoading(false);
      }, 800);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive"
      });
      setIsProfileLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profile.profileImg} alt={profile.name} />
                    <AvatarFallback>
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Update Profile Image</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="imageUrl">Image URL</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="imageUrl"
                                  placeholder="Paste image URL"
                                  value={editProfile.profileImg}
                                  onChange={(e) => setEditProfile({...editProfile, profileImg: e.target.value})}
                                />
                                <Button 
                                  onClick={() => updateProfileImage(editProfile.profileImg)}
                                  disabled={!editProfile.profileImg}
                                >
                                  <Save className="mr-2 h-4 w-4" />
                                  Save
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Tip: Use services like Imgur or PostImage to upload your photo
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
              <CardTitle className="mt-4">{profile.name}</CardTitle>
              <CardDescription>{profile.department} • {profile.course}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h3>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditing(false);
                        setEditProfile(profile);
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={saveProfileChanges}
                        disabled={isProfileLoading}
                      >
                        {isProfileLoading ? "Saving..." : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                <Separator />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={editProfile.name}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
                      {profile.name}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editProfile.email}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {profile.email}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={editProfile.phone}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {profile.phone}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room">Room Number</Label>
                  {isEditing ? (
                    <Input
                      id="room"
                      name="room"
                      value={editProfile.room}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      {profile.room}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Input
                      id="department"
                      name="department"
                      value={editProfile.department}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="p-2 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
                      {profile.department}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  {isEditing ? (
                    <Input
                      id="course"
                      name="course"
                      value={editProfile.course}
                      onChange={handleProfileChange}
                    />
                  ) : (
                    <div className="p-2 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
                      {profile.course}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(profile.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Change your password and manage account security
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <Separator />
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={changePassword}
                      disabled={isPasswordLoading || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {isPasswordLoading ? "Updating..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Account Security</h3>
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <h4 className="font-medium">Login Activity</h4>
                      <p className="text-sm text-muted-foreground">
                        View recent login attempts
                      </p>
                    </div>
                    <Button variant="outline">View Logs</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}