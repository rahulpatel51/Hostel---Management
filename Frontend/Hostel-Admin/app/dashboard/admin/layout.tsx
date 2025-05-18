"use client"

import React, { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, LogOut, User, ChevronDown, Shield, Calendar, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Head from "next/head"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { Badge } from "@/components/ui/badge"

interface AdminProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  profilePicture?: string
  role: string
  adminCode: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

interface PendingItem {
  roomNumber: any
  _id: string
  type: "leave" | "complaint"
  status: "pending" | "approved" | "rejected" | "resolved"
  title: string
  student?: {
    name: string
    studentId: string
  }
  createdAt: string
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactElement<{ onActionComplete?: () => void }>
}) {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const notificationRef = useRef<HTMLDivElement>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        router.push("/login/admin")
        return
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data?.success && response.data.data?.user) {
        setProfile(response.data.data.user)
      } else {
        throw new Error("Failed to fetch admin profile")
      }
    } catch (error) {
      console.error("Profile fetch error:", error)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        router.push("/login/admin")
      } else {
        toast.error("Failed to load admin profile")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingItems = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) return

      // Only fetch pending leaves and complaints
      const [leavesRes, complaintsRes] = await Promise.all([
        axios
          .get(`${API_BASE_URL}/admin/leave?status=pending`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch((error) => {
            console.error("Error fetching leaves:", error)
            return { data: { data: [] } }
          }),

        axios
          .get(`${API_BASE_URL}/admin/complaints?status=pending`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch((error) => {
            console.error("Error fetching complaints:", error)
            return { data: { data: [] } }
          }),
    ])

    // Helper function to safely extract data
    const getData = (response: any) => {
      const data = response?.data?.data || response?.data || []
      return Array.isArray(data) ? data : []
    }

    // Transform leaves data
    const pendingLeaves: PendingItem[] = getData(leavesRes)
      .filter((leave: any) => leave.status === "pending")
      .map((leave: any): PendingItem => ({
        _id: leave._id,
        type: "leave",
        status: "pending",
        title: `${leave.student?.name || "Student"} - Leave Request`,
        student: leave.student || { name: "Unknown", studentId: "N/A" },
        roomNumber: leave.student?.roomId || { roomNumber: "N/A" },
        createdAt: leave.createdAt || new Date().toISOString(),
      }))

    // Transform complaints data
    const pendingComplaints: PendingItem[] = getData(complaintsRes)
      .filter((complaint: any) => complaint.status === "pending")
      .map((complaint: any): PendingItem => ({
        _id: complaint._id,
        type: "complaint",
        status: "pending",
        title: complaint.title || "Complaint",
        student: {
          name: complaint.submittedBy?.email?.split('@')[0] || "Unknown",
          studentId: complaint.submittedBy?.studentId || "N/A"
        },
        roomNumber: { roomNumber: complaint.roomNumber || "N/A" },
        createdAt: complaint.createdAt || new Date().toISOString(),
      }))

    // Combine and sort items by creation date (newest first)
    const allPendingItems = [...pendingLeaves, ...pendingComplaints]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setPendingItems(allPendingItems)
  } catch (error) {
    console.error("Failed to fetch pending items:", error)
    toast.error("Failed to load pending items. Please try again.")
  }
}

const handleNotificationClick = (item: PendingItem) => {
  setShowNotifications(false) // Close notifications first
  
  // Use setTimeout to ensure the UI updates before navigation
  setTimeout(() => {
    switch (item.type) {
      case "leave":
        router.push(`/dashboard/admin/leave?id=${item._id}`)
        break
      case "complaint":
        router.push(`/dashboard/admin/complaints?id=${item._id}`)
        break
    }
  }, 100)
}

  const handleActionComplete = () => {
    fetchPendingItems()
  }

  useEffect(() => {
    fetchAdminProfile()
    fetchPendingItems()

    const interval = setInterval(fetchPendingItems, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Function to handle clicks outside the notification dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    // Function to handle scroll events
    const handleScroll = () => {
      if (showNotifications) {
        setShowNotifications(false)
      }
    }

    // Function to handle escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showNotifications) {
        setShowNotifications(false)
      }
    }

    // Add event listeners if notifications are shown
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("scroll", handleScroll, true)
      document.addEventListener("keydown", handleEscKey)
    }

    // Clean up event listeners
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("scroll", handleScroll, true)
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [showNotifications])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/login/admin")
    toast.success("Logged out successfully")
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "complaint":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Head>
        <title>
          {profile
            ? `${profile.firstName} ${profile.lastName} | Admin Portal`
            : "Admin Portal | Hostel Management System"}
        </title>
        <meta name="description" content="Administrative dashboard for managing hostel operations" />
      </Head>

      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/30 dark:via-gray-900 dark:to-purple-950/20">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col pl-0 lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-indigo-100 dark:border-indigo-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 shadow-sm">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />

              {/* Pending Items Dropdown */}
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  {pendingItems.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-[10px] text-white p-0 min-w-0">
                      {pendingItems.length}
                    </Badge>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-30">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-white">Pending Items</h3>
                      <p className="text-xs text-muted-foreground">{pendingItems.length} items requiring attention</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {pendingItems.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No pending items</div>
                      ) : (
                        pendingItems.map((item) => (
                          <div
                            key={`${item.type}-${item._id}`}
                            className="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => handleNotificationClick(item)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">{getNotificationIcon(item.type)}</div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.student?.studentId || "N/A"} • {new Date(item.createdAt).toLocaleString()}
                                </p>
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {item.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 dark:text-indigo-400"
                        onClick={() => {
                          setShowNotifications(false)
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative flex items-center gap-2 rounded-full px-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  >
                    {loading ? (
                      <Skeleton className="h-8 w-8 rounded-full" />
                    ) : (
                      <Avatar className="h-8 w-8 border-2 border-indigo-200 dark:border-indigo-800">
                        <AvatarImage
                          src={profile?.profilePicture || "/placeholder.svg"}
                          alt={`${profile?.firstName} ${profile?.lastName}`}
                        />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {profile ? getInitials(profile.firstName, profile.lastName) : "AD"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="hidden md:inline text-sm font-medium">
                      {loading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : profile ? (
                        `${profile.firstName} ${profile.lastName}`
                      ) : (
                        "Admin User"
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  {loading ? (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        <User className="mr-2 h-4 w-4" />
                        <Skeleton className="h-4 w-3/4" />
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {profile ? `${profile.firstName} ${profile.lastName}` : "Admin User"}
                          </p>
                          <p className="text-xs text-muted-foreground">{profile?.email || "admin@hostelhub.com"}</p>
                          {profile?.adminCode && (
                            <p className="text-xs text-muted-foreground">Admin Code: {profile.adminCode}</p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/admin/settings" className="w-full cursor-pointer">
                          <User className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 pt-4 bg-transparent">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-gray-900 p-6 shadow-sm">
                {React.isValidElement(children) &&
                  React.cloneElement(children, {
                    onActionComplete: handleActionComplete,
                  })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
