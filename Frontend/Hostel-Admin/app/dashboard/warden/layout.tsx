"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, LogOut, User, Shield, ChevronDown } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

export default function WardenDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Head>
        <title>Warden Portal | Hostel Management System</title>
        <meta name="description" content="Warden dashboard for managing hostel activities" />
      </Head>

      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/30 dark:via-gray-900 dark:to-purple-950/20">
        <Sidebar role="warden" />
        <div className="flex-1 flex flex-col pl-0 lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-indigo-100 dark:border-indigo-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 shadow-sm">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Warden Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Button
                variant="outline"
                size="icon"
                className="relative border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
              >
                <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-[10px] text-white p-0 min-w-0">
                  4
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative flex items-center gap-2 rounded-full px-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  >
                    <Avatar className="h-8 w-8 border-2 border-indigo-200 dark:border-indigo-800">
                      <AvatarImage
                        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
                        alt="Warden"
                      />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        WD
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">Warden User</span>
                    <ChevronDown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Warden User</p>
                      <p className="text-xs text-muted-foreground">warden@hostelhub.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/warden/profile" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" className="w-full cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Log out</span>
                    </Link>
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
