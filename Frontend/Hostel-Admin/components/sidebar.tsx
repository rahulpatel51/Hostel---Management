"use client"

import { cn } from "@/lib/utils"
import {
  BedDouble,
  Bell,
  Calendar,
  ClipboardCheck,
  Clock,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserCog,
  Users,
  Utensils,
  Shield,
  LayoutDashboard,
  BookOpen,
  DollarSign,
  FileCheck,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  role: "student" | "admin" | "warden"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const studentLinks = [
    { name: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { name: "Room Details", href: "/dashboard/student/room", icon: BedDouble },
    { name: "Attendance", href: "/dashboard/student/attendance", icon: Clock },
    { name: "Fee Payment", href: "/dashboard/student/fees", icon: DollarSign },
    { name: "Mess Menu", href: "/dashboard/student/mess", icon: Utensils },
    { name: "Leave Application", href: "/dashboard/student/leave", icon: Calendar },
    { name: "Complaints", href: "/dashboard/student/complaints", icon: MessageSquare },
    { name: "Notices", href: "/dashboard/student/notices", icon: Bell },
    { name: "Profile", href: "/dashboard/student/profile", icon: Settings },
  ]

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Student Management", href: "/dashboard/admin/students", icon: Users },
    { name: "Staff Management", href: "/dashboard/admin/staff", icon: Users },
    { name: "Room Management", href: "/dashboard/admin/rooms", icon: BedDouble },
    { name: "Room Allocation", href: "/dashboard/admin/roomAllocation", icon: FileCheck },
    { name: "Attendance", href: "/dashboard/admin/attendance", icon: ClipboardCheck },
    { name: "Leave Approvals", href: "/dashboard/admin/leave", icon: Calendar },
    { name: "Complaints", href: "/dashboard/admin/complaints", icon: MessageSquare },
    // { name: "Disciplinary Actions", href: "/dashboard/admin/discipline", icon: AlertTriangle },
    { name: "Notices", href: "/dashboard/admin/notices", icon: Bell },
    { name: "Profile", href: "/dashboard/admin/settings", icon: UserCog },
  ]

  const wardenLinks = [
    { name: "Dashboard", href: "/dashboard/warden", icon: LayoutDashboard },
    { name: "Student Management", href: "/dashboard/warden/students", icon: Users },
    { name: "Room Management", href: "/dashboard/warden/rooms", icon: BedDouble },
    { name: "Leave Approvals", href: "/dashboard/warden/leave", icon: Calendar },
    { name: "Attendance", href: "/dashboard/warden/attendance", icon: ClipboardCheck },
    { name: "Complaints", href: "/dashboard/warden/complaints", icon: MessageSquare },
    { name: "Disciplinary Actions", href: "/dashboard/warden/discipline", icon: AlertTriangle },
    { name: "Mess Menu", href: "/dashboard/warden/mess-menu", icon: Utensils },
    { name: "Notices", href: "/dashboard/warden/notices", icon: Bell },
    { name: "Settings", href: "/dashboard/warden/settings", icon: Settings },
  ]

  const links = role === "student" ? studentLinks : role === "admin" ? adminLinks : wardenLinks

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="ml-2 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 transition-colors duration-300"
          >
            <Menu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/50 dark:via-gray-900 dark:to-purple-950/50 border-r border-indigo-100 dark:border-indigo-900/50"
        >
          <MobileSidebar links={links} pathname={pathname} role={role} setOpen={setOpen} />
        </SheetContent>
      </Sheet>
      <div className="hidden fixed top-0 bottom-0 left-0 border-r border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/50 dark:via-gray-900 dark:to-purple-950/50 lg:block w-72 shrink-0 z-30 shadow-sm">
        <DesktopSidebar links={links} pathname={pathname} role={role} />
      </div>
    </>
  )
}

interface SidebarLinkProps {
  links: { name: string; href: string; icon: any }[]
  pathname: string
  role: "student" | "admin" | "warden"
  setOpen?: (open: boolean) => void
}

function MobileSidebar({ links, pathname, role, setOpen }: SidebarLinkProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-20 items-center border-b border-indigo-100 dark:border-indigo-900/50 px-6">
        <Link
          href={`/dashboard/${role}`}
          className="flex items-center gap-3 font-semibold group"
          onClick={() => setOpen?.(false)}
        >
          {role === "student" ? (
            <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
          ) : role === "admin" ? (
            <Shield className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <UserCog className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
          )}
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
              {role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </span>
            <span className="text-xs text-indigo-500 dark:text-indigo-300 font-medium">Hostel Management System</span>
          </div>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-6">
        <nav className="grid gap-1.5 px-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen?.(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/20 hover:shadow-md hover:translate-x-1",
                pathname === link.href
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 shadow-inner dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              <link.icon
                className={cn(
                  "h-5 w-5 transition-colors duration-300",
                  pathname === link.href ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400",
                )}
              />
              <span className="font-medium">{link.name}</span>
              {pathname === link.href && (
                <ChevronRight className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              )}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t border-indigo-100 dark:border-indigo-900/50 p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 bg-white/80 dark:bg-gray-900/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300 border-indigo-200 dark:border-indigo-800"
          asChild
        >
          <Link href="/">
            <LogOut className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium">Logout</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

function DesktopSidebar({ links, pathname, role }: SidebarLinkProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-20 items-center border-b border-indigo-100 dark:border-indigo-900/50 px-6">
        <Link href={`/dashboard/${role}`} className="flex items-center gap-3 font-semibold group">
          {role === "student" ? (
            <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
          ) : role === "admin" ? (
            <Shield className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <UserCog className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
          )}
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
              {role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </span>
            <span className="text-xs text-indigo-500 dark:text-indigo-300 font-medium">Hostel Management System</span>
          </div>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-6">
        <nav className="grid gap-1.5 px-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/20 hover:shadow-md hover:translate-x-1",
                pathname === link.href
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 shadow-inner dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              <link.icon
                className={cn(
                  "h-5 w-5 transition-colors duration-300",
                  pathname === link.href ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400",
                )}
              />
              <span className="font-medium">{link.name}</span>
              {pathname === link.href && (
                <ChevronRight className="ml-auto h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              )}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t border-indigo-100 dark:border-indigo-900/50 p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 bg-white/80 dark:bg-gray-900/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300 border-indigo-200 dark:border-indigo-800"
          asChild
        >
          <Link href="/">
            <LogOut className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium">Logout</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
