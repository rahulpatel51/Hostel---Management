"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Bell, LogOut, User, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

interface AdminProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  role: string;
  adminCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/login/admin");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.success && response.data.data?.user) {
          setProfile(response.data.data.user);
        } else {
          throw new Error("Failed to fetch admin profile");
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
          );
          setNotificationCount(notificationsResponse.data?.count || 0);
        } catch (error) {
          console.log("Notifications endpoint not available");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          router.push("/login/admin");
        } else {
          toast.error("Failed to load admin profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/login/admin");
    toast.success("Logged out successfully");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

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
      
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar role="admin" />
        <div className="flex-1 flex flex-col pl-0 lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-900 px-6">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">
                    {notificationCount}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    {loading ? (
                      <Skeleton className="h-9 w-9 rounded-full" />
                    ) : (
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.profilePicture} alt={`${profile?.firstName} ${profile?.lastName}`} />
                        <AvatarFallback>
                          {profile ? getInitials(profile.firstName, profile.lastName) : "AD"}
                        </AvatarFallback>
                      </Avatar>
                    )}
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
                        <Link href="/dashboard/admin/settings" className="w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 pt-4 bg-gray-50 dark:bg-gray-950">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}