"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Bell,
  User,
  LogOut,
  GraduationCap,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  MessageSquare,
  X,
} from "lucide-react"
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
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

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
  roomId: string | null
  createdAt: string
  updatedAt: string
}

interface Notification {
  id: string
  type: "leave" | "complaint" | "notice" | "attendance"
  title: string
  message: string
  read: boolean
  link: string
  entityId: string
  createdAt: string
}

const NOTIFICATION_STORAGE_KEY = "student_notifications"

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Load notifications from localStorage on initial render
  useEffect(() => {
    const savedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications)
      setNotifications(parsed)
      setNotificationCount(parsed.filter((n: Notification) => !n.read).length)
    } else {
      // Initialize with mock data if no saved notifications
      initializeMockNotifications()
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  const initializeMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "leave",
        title: "Leave Request Approved",
        message: "Your leave request for home visit has been approved",
        read: false,
        link: "/dashboard/student/leave",
        entityId: "682792223b1ede91426bc71b",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "2",
        type: "complaint",
        title: "Complaint Resolved",
        message: "Your maintenance complaint about room lighting has been resolved",
        read: false,
        link: "/dashboard/student/complaints",
        entityId: "582792223b1ede91426bc72c",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "3",
        type: "notice",
        title: "New Notice Posted",
        message: "Important notice regarding upcoming hostel maintenance",
        read: false,
        link: "/dashboard/student/notices",
        entityId: "782792223b1ede91426bc73d",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: "4",
        type: "attendance",
        title: "Attendance Marked",
        message: "Your attendance has been marked for today",
        read: true,
        link: "/dashboard/student/attendance",
        entityId: "882792223b1ede91426bc74e",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ]
    setNotifications(mockNotifications)
    setNotificationCount(mockNotifications.filter(n => !n.read).length)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        const profileResponse = await axios.get("http://localhost:5000/api/student/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (profileResponse.data?.success) {
          setProfile(profileResponse.data.data)
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
        if (error.response?.status === 401) {
          localStorage.removeItem("token")
          router.push("/login")
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: error.response?.data?.message || error.message || "Failed to load profile data",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast, router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
  }

  // Mark all notifications as read when dropdown is opened
  const handleDropdownOpen = (open: boolean) => {
    setDropdownOpen(open)
    if (open) {
      markAllAsRead()
    }
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    setNotificationCount(0)
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated))
  }

  const markAsRead = async (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    setNotifications(updated)
    setNotificationCount(prev => Math.max(0, prev - 1))
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated))
  }

  const deleteNotification = (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId)
    setNotifications(updated)
    
    // Update count if the deleted notification was unread
    const deletedNotification = notifications.find(n => n.id === notificationId)
    if (deletedNotification && !deletedNotification.read) {
      setNotificationCount(prev => Math.max(0, prev - 1))
    }
    
    // Update localStorage
    if (updated.length === 0) {
      localStorage.removeItem(NOTIFICATION_STORAGE_KEY)
    } else {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated))
    }

    toast({
      title: "Notification deleted",
      variant: "default",
    })
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    const url = `${notification.link}?id=${notification.entityId}`
    router.push(url)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave":
        return <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      case "complaint":
        return <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      case "notice":
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case "attendance":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
    }
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Head>
        <title>{profile ? `${profile.name} | Student Portal` : "Student Portal | Hostel Management System"}</title>
        <meta name="description" content="Student dashboard for hostel residents" />
      </Head>

      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/30 dark:via-gray-900 dark:to-purple-950/20">
        <Sidebar role="student" />
        <div className="flex-1 flex flex-col pl-0 lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-indigo-100 dark:border-indigo-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 shadow-sm">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Student Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <DropdownMenu onOpenChange={handleDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  >
                    <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    {notificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-[10px] text-white p-0 min-w-0">
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {notificationCount > 0 && !dropdownOpen && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAllAsRead()
                        }}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {loading ? (
                    <div className="p-4 text-center">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="relative group">
                          <DropdownMenuItem
                            className="cursor-pointer flex items-start gap-2 p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 pr-8"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && !dropdownOpen && (
                              <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1"></div>
                            )}
                          </DropdownMenuItem>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                            aria-label="Delete notification"
                          >
                            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-2">
                        <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                        <AvatarImage src={profile?.image || "/placeholder.svg"} alt={profile?.name} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {profile ? getInitials(profile.name) : "ST"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="hidden md:inline text-sm font-medium">
                      {loading ? <Skeleton className="h-4 w-20" /> : profile?.name || "Student"}
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
                          <p className="text-sm font-medium">{profile?.name || "Student Name"}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email || "student@example.com"}</p>
                          {profile?.course && profile?.year && (
                            <p className="text-xs text-muted-foreground">
                              {profile.course}, {profile.year}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/student/profile" className="w-full cursor-pointer">
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
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}