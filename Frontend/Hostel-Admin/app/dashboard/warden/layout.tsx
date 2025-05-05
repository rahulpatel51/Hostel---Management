import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Bell, LogOut, User, Shield } from "lucide-react"
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
      
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar role="warden" />
        <div className="flex-1 flex flex-col pl-0 lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-900 px-6">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Warden Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                  4
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" alt="Warden" />
                      <AvatarFallback>WD</AvatarFallback>
                    </Avatar>
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
                    <Link href="/dashboard/warden/profile" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/" className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Link>
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
  )
}