"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Bell, User, LogOut, GraduationCap } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface StudentProfile {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  year: string;
  status: string;
  address: string;
  image: string;
  faceId: string;
  roomId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
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
        );

        if (profileResponse.data?.success) {
          setProfile(profileResponse.data.data);
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
          );
          if (notificationsResponse.data?.success) {
            setNotificationCount(notificationsResponse.data.count);
          }
        } catch (notifError) {
          console.log("Notifications endpoint not available, using default count");
          setNotificationCount(0); // Default value if endpoint not found
        }

      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description:
              error.response?.data?.message ||
              error.message ||
              "Failed to load profile data",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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

      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar role="student" />
        <div className="flex-1 flex flex-col pl-0 lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-900 px-6">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Student Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
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
                        <AvatarImage src={profile?.image} alt={profile?.name} />
                        <AvatarFallback>
                          {profile ? getInitials(profile.name) : "ST"}
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
                        <Link href="/dashboard/student/profile" className="w-full">
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
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}