"use client"

import { cn } from "@/lib/utils"
import {
  BedDouble,
  Bell,
  Book,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserCog,
  Users,
  Utensils,
  Wrench,
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
    { name: "Dashboard", href: "/dashboard/student", icon: Home },
    { name: "Room Details", href: "/dashboard/student/room", icon: BedDouble },
    { name: "Academics", href: "/dashboard/student/academics", icon: Book },
    { name: "Attendance", href: "/dashboard/student/attendance", icon: Clock },
    { name: "Fee Payment", href: "/dashboard/student/fees", icon: CreditCard },
    { name: "Mess Menu", href: "/dashboard/student/mess", icon: Utensils },
    { name: "Leave Application", href: "/dashboard/student/leave", icon: Calendar },
    { name: "Complaints", href: "/dashboard/student/complaints", icon: MessageSquare },
    { name: "Disciplinary Actions", href: "/dashboard/student/discipline", icon: ClipboardList },
    { name: "Notices", href: "/dashboard/student/notices", icon: Bell },
    { name: "Profile", href: "/dashboard/student/profile", icon: Settings },
    // { name: "Account Settings", href: "/dashboard/student/account-settings", icon: UserCog }
  ];

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard/admin", icon: Home },
    { name: "Student Management", href: "/dashboard/admin/students", icon: Users },
    { name: "Room Allocation", href: "/dashboard/admin/rooms", icon: BedDouble },
    { name: "Fee Management", href: "/dashboard/admin/fees", icon: CreditCard },
    { name: "Staff Management", href: "/dashboard/admin/staff", icon: Users },
    { name: "Complaints", href: "/dashboard/admin/complaints", icon: MessageSquare },
    { name: "Disciplinary Actions", href: "/dashboard/admin/discipline", icon: ClipboardList },
    { name: "Notices", href: "/dashboard/admin/notices", icon: Bell },
    // { name: "Reports", href: "/dashboard/admin/reports", icon: FileText },
    { name: "Profile", href: "/dashboard/admin/settings", icon: UserCog },
  ]

  const wardenLinks = [
    { name: "Dashboard", href: "/dashboard/warden", icon: Home },
    { name: "Student Management", href: "/dashboard/warden/students", icon: Users },
    { name: "Room Allocation", href: "/dashboard/warden/rooms", icon: BedDouble },
    { name: "Leave Approvals", href: "/dashboard/warden/leave", icon: Calendar },
    { name: "Attendance", href: "/dashboard/warden/attendance", icon: ClipboardCheck },
    { name: "Complaints", href: "/dashboard/warden/complaints", icon: MessageSquare },
    { name: "Disciplinary Actions", href: "/dashboard/warden/discipline", icon: ClipboardList },
    { name: "Mess Menu", href: "/dashboard/warden/mess-menu", icon: Utensils },
    { name: "Notices", href: "/dashboard/warden/notices", icon: Bell },
    // { name: "Reports", href: "/dashboard/warden/reports", icon: FileText },
    { name: "Settings", href: "/dashboard/warden/settings", icon: Settings },
  ];

  const links = role === "student" ? studentLinks : role === "admin" ? adminLinks : wardenLinks

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="ml-2 hover:bg-teal-100 dark:hover:bg-gray-800">
            <Menu className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-teal-100 dark:border-gray-700">
          <MobileSidebar links={links} pathname={pathname} role={role} setOpen={setOpen} />
        </SheetContent>
      </Sheet>
      <div className="hidden fixed top-0 bottom-0 left-0 border-r bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 lg:block w-72 shrink-0 z-30">
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
      <div className="flex h-16 items-center border-b border-teal-100 dark:border-gray-700 px-4">
        <Link
          href={`/dashboard/${role}`}
          className="flex items-center gap-2 font-semibold group"
          onClick={() => setOpen?.(false)}
        >
          {role === "student" ? (
            <BedDouble className="h-6 w-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          ) : role === "admin" ? (
            <Users className="h-6 w-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          ) : (
            <ClipboardList className="h-6 w-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
            {role.charAt(0).toUpperCase() + role.slice(1)} Portal
          </span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen?.(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-teal-100/80 dark:hover:bg-gray-800/90 hover:shadow-sm hover:translate-x-1",
                pathname === link.href
                  ? "bg-teal-100 text-teal-800 shadow-inner dark:bg-gray-800 dark:text-teal-400"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              <link.icon className={cn(
                "h-5 w-5 transition-colors",
                pathname === link.href 
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-gray-500 dark:text-gray-400"
              )} />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t border-teal-100 dark:border-gray-700 p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 hover:bg-teal-100 dark:hover:bg-gray-800 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          asChild
        >
          <Link href="/">
            <LogOut className="h-4 w-4 text-teal-600 dark:text-teal-400" />
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
      <div className="flex h-16 items-center border-b border-teal-100 dark:border-gray-700 px-4">
        <Link 
          href={`/dashboard/${role}`} 
          className="flex items-center gap-2 font-semibold group"
        >
          {role === "student" ? (
            <BedDouble className="h-6 w-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          ) : role === "admin" ? (
            <Users className="h-6 w-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          ) : (
            <ClipboardList className="h-6 w-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
            {role.charAt(0).toUpperCase() + role.slice(1)} Portal
          </span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-teal-100/80 dark:hover:bg-gray-800/90 hover:shadow-sm hover:translate-x-1",
                pathname === link.href
                  ? "bg-teal-100 text-teal-800 shadow-inner dark:bg-gray-800 dark:text-teal-400"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              <link.icon className={cn(
                "h-5 w-5 transition-colors",
                pathname === link.href 
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-gray-500 dark:text-gray-400"
              )} />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t border-teal-100 dark:border-gray-700 p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 hover:bg-teal-100 dark:hover:bg-gray-800 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          asChild
        >
          <Link href="/">
            <LogOut className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="font-medium">Logout</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}