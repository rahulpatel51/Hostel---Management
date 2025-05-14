"use client"

import React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, User, LogOut, GraduationCap, ChevronDown } from 'lucide-react'
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

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        // First fetch profile data
        const profileResponse = await axios.get(
          "http://localhost:5000/api/student/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (profileResponse.data?.success) {
          setProfile(profileResponse.data.data)
        }

        // Then try to fetch notifications (handle potential 404)
        try {
          const notificationsResponse = await axios.get(
            "http://localhost:5000/api/student/notifications/count",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          if (notificationsResponse.data?.success) {
            setNotificationCount(notificationsResponse.data.count)
          }
        } catch (notifError) {
          console.log("Notifications endpoint not available, using default count")
          setNotificationCount(0) // Default value if endpoint not found
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
            description:
              error.response?.data?.message ||
              error.message ||
              "Failed to load profile data",
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
        <title>
          {profile
            ? `${profile.name} | Student Portal`
            : "Student Portal | Hostel Management System"}
        </title>
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
              <Button variant="outline" size="icon" className="relative border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-[10px] text-white p-0 min-w-0">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2 rounded-full px-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
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
                      {loading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        profile?.name || "Student"
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
                            {profile?.name || "Student Name"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profile?.email || "student@example.com"}
                          </p>
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
