"use client"

import React, { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, LogOut, User, Settings, ChevronDown, Shield } from 'lucide-react'
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

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        if (!token) {
          router.push("/login/admin")
          return
        }

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data?.success && response.data.data?.user) {
          setProfile(response.data.data.user)
        } else {
          throw new Error("Failed to fetch admin profile")
        }

        // Fetch notifications count
        try {
          const notificationsResponse = await axios.get(
            "http://localhost:5000/api/admin/notifications/count",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          setNotificationCount(notificationsResponse.data?.count || 0)
        } catch (error) {
          console.log("Notifications endpoint not available")
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

    fetchAdminProfile()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/login/admin")
    toast.success("Logged out successfully")
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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
                        <AvatarImage src={profile?.profilePicture || "/placeholder.svg"} alt={`${profile?.firstName} ${profile?.lastName}`} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {profile ? getInitials(profile.firstName, profile.lastName) : "AD"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="hidden md:inline text-sm font-medium">
                      {loading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        profile ? `${profile.firstName} ${profile.lastName}` : "Admin User"
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
                          <p className="text-xs text-muted-foreground">
                            {profile?.email || "admin@hostelhub.com"}
                          </p>
                          {profile?.adminCode && (
                            <p className="text-xs text-muted-foreground">
                              Admin Code: {profile.adminCode}
                            </p>
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
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
