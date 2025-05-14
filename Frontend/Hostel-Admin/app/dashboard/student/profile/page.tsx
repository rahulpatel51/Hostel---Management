"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save, Lock, User, Mail, Phone, Home, Calendar, BookOpen, Clock, ImageIcon, Shield, CheckCircle, XCircle } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"

interface Room {
  _id: string
  block: string
  roomNumber: string
  floor: string
  capacity: number
  occupiedCount: number
  roomType: string
  facilities: string[]
  status: string
  description: string
  price: number
  pricePeriod: string
  imageUrl: string
  createdAt: string
  updatedAt: string
  __v: number
  currentOccupancy: number
}

interface StudentProfile {
  _id: string
  studentId: string
  name: string
  email: string
  phone: string
  course: string
  year: string
  status: string
  address: string
  image: string
  faceId: string
  roomId: Room | null
  createdAt: string
  updatedAt: string
}

export default function StudentProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editProfile, setEditProfile] = useState<Partial<StudentProfile>>({})
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [imagePreview, setImagePreview] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:5000/api/student/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.data?.success && response.data.data) {
          const profileData = response.data.data
          setProfile(profileData)
          setEditProfile({
            phone: profileData.phone,
            address: profileData.address,
            image: profileData.image,
          })
        } else {
          throw new Error("Invalid response structure")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 2MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setEditProfile((prev) => ({ ...prev, image: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsUpdating(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        `http://localhost:5000/api/student/profile`,
        {
          phone: editProfile.phone || profile.phone,
          address: editProfile.address || profile.address,
          image: editProfile.image || profile.image,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data?.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                phone: editProfile.phone || prev.phone,
                address: editProfile.address || prev.address,
                image: editProfile.image || prev.image,
                updatedAt: new Date().toISOString(),
              }
            : null,
        )

        setImagePreview("")
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Profile updated successfully",
          className: "bg-green-500 text-white",
        })
      }
    } catch (error: any) {
      console.error("Update error:", error)
      let errorMessage = "Failed to update profile"
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        "http://localhost:5000/api/student/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast({
        title: "Success",
        description: "Password changed successfully",
        className: "bg-green-500 text-white",
      })
    } catch (error: any) {
      console.error("Password change error:", error)
      let errorMessage = "Failed to change password"
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime())
        ? "Not available"
        : date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
    } catch {
      return "Not available"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-4 text-indigo-600 dark:text-indigo-400">Loading profile...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load profile data</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-2 w-full max-w-xs mx-auto bg-indigo-50 dark:bg-indigo-950/30 p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm"
          >
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="mt-6 border-indigo-100 dark:border-indigo-900/50 shadow-md">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center relative group">
                <Avatar className="h-32 w-32 relative border-4 border-indigo-100 dark:border-indigo-900/50 shadow-md">
                  <AvatarImage
                    src={imagePreview || editProfile.image || profile.image}
                    alt={profile.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-3xl">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                  {isEditing && (
                    <label
                      htmlFor="profile-image-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <div className="text-white text-center p-2">
                        <ImageIcon className="w-8 h-8 mx-auto" />
                        <span className="text-xs mt-1">Change Photo</span>
                      </div>
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
                  <Badge
                    className={`h-3 w-3 rounded-full ${
                      profile.status === "Active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
              <CardTitle className="mt-4 text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {profile.name}
              </CardTitle>
              <CardDescription className="text-lg">
                {profile.course} • Year {profile.year}
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-6">
              <div className="flex justify-end mb-6">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setEditProfile({
                          phone: profile.phone,
                          address: profile.address,
                          image: profile.image,
                        })
                        setImagePreview("")
                      }}
                      disabled={isUpdating}
                      className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isUpdating}
                      className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                    >
                      {isUpdating ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="gap-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    <Pencil className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="space-y-8">
                {/* Academic Information */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                  <h3 className="font-medium flex items-center gap-2 text-lg mb-4 text-indigo-700 dark:text-indigo-400">
                    <BookOpen className="h-5 w-5" />
                    Academic Information
                  </h3>
                  <Separator className="my-2 bg-indigo-100 dark:bg-indigo-900/50" />
                  <div className="grid gap-4 mt-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Student ID</Label>
                      <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                        {profile.studentId}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Course</Label>
                      <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                        {profile.course}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Year</Label>
                      <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                        {profile.year}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Status</Label>
                      <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                        <Badge
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            profile.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
                          }`}
                        >
                          {profile.status === "Active" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {profile.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                  <h3 className="font-medium flex items-center gap-2 text-lg mb-4 text-indigo-700 dark:text-indigo-400">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <Separator className="my-2 bg-indigo-100 dark:bg-indigo-900/50" />
                  <div className="grid gap-4 mt-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Email</Label>
                      <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        {profile.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Phone</Label>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <Input
                            name="phone"
                            value={editProfile.phone || ""}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className="border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
                          />
                        </div>
                      ) : (
                        <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          {profile.phone || "Not provided"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-600 dark:text-gray-300">Address</Label>
                      {isEditing ? (
                        <Input
                          name="address"
                          value={editProfile.address || ""}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                          className="border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
                        />
                      ) : (
                        <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 whitespace-pre-line">
                          {profile.address || "Not provided"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Face ID</Label>
                      <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        {profile.faceId || "Not registered"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Assignment */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                  <h3 className="font-medium flex items-center gap-2 text-lg mb-4 text-indigo-700 dark:text-indigo-400">
                    <Home className="h-5 w-5" />
                    Room Assignment
                  </h3>
                  <Separator className="my-2 bg-indigo-100 dark:bg-indigo-900/50" />
                  {profile.roomId ? (
                    <div className="grid gap-4 mt-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-600 dark:text-gray-300">Room Number</Label>
                        <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                          {profile.roomId.roomNumber}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 dark:text-gray-300">Hostel Block</Label>
                        <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                          {profile.roomId.block}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 dark:text-gray-300">Floor</Label>
                        <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                          {profile.roomId.floor}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 dark:text-gray-300">Room Type</Label>
                        <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                          {profile.roomId.roomType}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No room assigned</p>
                    </div>
                  )}
                </div>

                {/* System Information */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                  <h3 className="font-medium flex items-center gap-2 text-lg mb-4 text-indigo-700 dark:text-indigo-400">
                    <Clock className="h-5 w-5" />
                    System Information
                  </h3>
                  <Separator className="my-2 bg-indigo-100 dark:bg-indigo-900/50" />
                  <div className="grid gap-4 mt-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Account Created</Label>
                      <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                        {formatDate(profile.createdAt)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Last Updated</Label>
                      <div className="p-3 rounded-md border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                        {formatDate(profile.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="mt-6 border-indigo-100 dark:border-indigo-900/50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </CardHeader>

            <CardContent className="mt-6">
              <div className="space-y-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                  <h3 className="font-medium mb-4 text-lg text-indigo-700 dark:text-indigo-400">Change Password</h3>
                  <Separator className="my-2 bg-indigo-100 dark:bg-indigo-900/50" />
                  <div className="grid gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Current Password</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className="border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handlePasswordChange}
                        disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
                        className="min-w-[150px] bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                      >
                        {isUpdating ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Updating...
                          </span>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                  <h3 className="font-medium mb-4 text-lg text-indigo-700 dark:text-indigo-400">Account Security</h3>
                  <Separator className="my-2 bg-indigo-100 dark:bg-indigo-900/50" />
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                      <div>
                        <h4 className="font-medium text-indigo-700 dark:text-indigo-400">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                      >
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                      <div>
                        <h4 className="font-medium text-indigo-700 dark:text-indigo-400">Login Activity</h4>
                        <p className="text-sm text-muted-foreground">View recent login attempts</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                      >
                        View Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
