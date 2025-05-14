"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BedDouble,
  Bell,
  ClipboardList,
  Info,
  MessageSquare,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  UserCheck,
  AlertCircle,
  FileSearch,
  AlertTriangle,
  Check,
  X,
  Plus,
  Home,
  Stethoscope,
  CalendarDays,
  PanelLeft,
  Tag,
  BarChart3,
  Percent,
  Building2,
  DoorClosed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types
interface Student {
  userId: any
  _id: string
  studentId: string
  name: string
  status: "Active" | "Pending" | "Inactive"
  room?: {
    block: string
    roomNumber: string
  }
}

interface LeaveApplication {
  priority: string
  _id: string
  student: Student
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  leaveType: string
  destination: string
  contactDuringLeave: string
  parentApproval: boolean
  documents: string[]
  remarks?: string
  approvedBy?: {
    name: string
  }
  approvalDate?: string
  createdAt: string
}

interface Complaint {
  _id: string
  student: Student
  type: string
  description: string
  status: "pending" | "in-progress" | "resolved"
  createdAt: string
  priority: "low" | "medium" | "high"
}

interface Notice {
  _id: string
  title: string
  content: string
  category: "general" | "academic" | "hostel" | "event" | "emergency" | "other"
  importance: "normal" | "important" | "urgent"
  publishedBy: {
    _id: string
    fullName: string
  }
  targetAudience: ("all" | "students" | "wardens" | "admin")[]
  attachments: string[]
  expiryDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PendingApproval {
  _id: string
  type: string
  student: Student
  details?: string
  reason?: string
  createdAt: string
  priority?: "low" | "medium" | "high"
}

interface Room {
  _id: string
  block: string
  roomNumber: string
  floor: string
  capacity: number
  occupiedCount: number
  type: string
  gender: "Male" | "Female"
  status: "Available" | "Full" | "Maintenance"
}

interface RoomOccupancyStats {
  totalRooms: number
  occupiedRooms: number
  maintenanceRooms: number
  availableRooms: number
  occupancyRate: number
  maleRooms: {
    total: number
    occupied: number
    available: number
  }
  femaleRooms: {
    total: number
    occupied: number
    available: number
  }
  blockStats: {
    [key: string]: {
      total: number
      occupied: number
      available: number
      occupancyRate: number
    }
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState({
    students: true,
    leaves: true,
    complaints: true,
    notices: true,
    approvals: true,
    rooms: true,
  })
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    occupiedRooms: 0,
    pendingLeaves: 0,
    activeComplaints: 0,
    highPriorityNotices: 0,
  })
  const [students, setStudents] = useState<Student[]>([])
  const [leaves, setLeaves] = useState<LeaveApplication[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomStats, setRoomStats] = useState<RoomOccupancyStats>({
    totalRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    availableRooms: 0,
    occupancyRate: 0,
    maleRooms: {
      total: 0,
      occupied: 0,
      available: 0,
    },
    femaleRooms: {
      total: 0,
      occupied: 0,
      available: 0,
    },
    blockStats: {},
  })

  const [lastUpdatedTime, setLastUpdatedTime] = useState("")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  })

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("adminToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/login")
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        })
      }
      return Promise.reject(error)
    },
  )

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/login")
      return
    }
    fetchDashboardData()
  }, [])

  useEffect(() => {
    setLastUpdatedTime(
      new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    )
  }, [])

  // Calculate room statistics
  const calculateRoomStats = (roomsData: Room[]) => {
    const stats: RoomOccupancyStats = {
      totalRooms: roomsData.length,
      occupiedRooms: roomsData.filter((r) => r.status === "Full").length,
      maintenanceRooms: roomsData.filter((r) => r.status === "Maintenance").length,
      availableRooms: roomsData.filter((r) => r.status === "Available").length,
      occupancyRate: 0,
      maleRooms: {
        total: 0,
        occupied: 0,
        available: 0,
      },
      femaleRooms: {
        total: 0,
        occupied: 0,
        available: 0,
      },
      blockStats: {},
    }

    // Calculate total beds and occupied beds
    let totalBeds = 0
    let occupiedBeds = 0

    roomsData.forEach((room) => {
      totalBeds += room.capacity
      occupiedBeds += room.occupiedCount

      // Gender stats
      if (room.gender === "Male") {
        stats.maleRooms.total++
        if (room.status === "Full") stats.maleRooms.occupied++
        if (room.status === "Available") stats.maleRooms.available++
      } else if (room.gender === "Female") {
        stats.femaleRooms.total++
        if (room.status === "Full") stats.femaleRooms.occupied++
        if (room.status === "Available") stats.femaleRooms.available++
      }

      // Block stats
      if (!stats.blockStats[room.block]) {
        stats.blockStats[room.block] = {
          total: 0,
          occupied: 0,
          available: 0,
          occupancyRate: 0,
        }
      }

      stats.blockStats[room.block].total++
      if (room.status === "Full") stats.blockStats[room.block].occupied++
      if (room.status === "Available") stats.blockStats[room.block].available++
    })

    // Calculate occupancy rates
    stats.occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0

    Object.keys(stats.blockStats).forEach((block) => {
      const blockRooms = roomsData.filter((r) => r.block === block)
      let blockTotalBeds = 0
      let blockOccupiedBeds = 0

      blockRooms.forEach((room) => {
        blockTotalBeds += room.capacity
        blockOccupiedBeds += room.occupiedCount
      })

      stats.blockStats[block].occupancyRate = blockTotalBeds > 0 ? (blockOccupiedBeds / blockTotalBeds) * 100 : 0
    })

    return stats
  }

  // Fetch data from API
  const fetchDashboardData = async () => {
    try {
      setLoading({
        students: true,
        leaves: true,
        complaints: true,
        notices: true,
        approvals: true,
        rooms: true,
      })

      const [studentsRes, leavesRes, complaintsRes, noticesRes, approvalsRes, roomsRes] = await Promise.all([
        api.get("/admin/students").catch(() => ({ data: { data: [] } })),
        api
          .get("/admin/leave")
          .catch(() => ({ data: { data: [] } })), // Fetch all leaves
        api
          .get("/admin/complaints")
          .catch(() => ({ data: { data: [] } })), // Fetch all complaints
        api.get("/notices?limit=5").catch(() => ({ data: { data: [] } })),
        api.get("/admin/approvals/pending").catch(() => ({ data: { data: [] } })),
        api
          .get("/rooms")
          .catch(() => ({ data: { data: [] } })), // Fetch all rooms
      ])

      setStudents(studentsRes.data.data)
      setLeaves(leavesRes.data.data)
      setComplaints(complaintsRes.data.data)
      setNotices(noticesRes.data.data)
      setPendingApprovals(approvalsRes.data.data)
      setRooms(roomsRes.data.data)

      // Calculate room statistics
      const roomStats = calculateRoomStats(roomsRes.data.data)
      setRoomStats(roomStats)

      const activeStudents = studentsRes.data.data.filter((s: { status: string }) => s.status === "Active").length
      const occupiedRooms = studentsRes.data.data.filter((s: { room: any }) => s.room).length
      const pendingLeaves = leavesRes.data.data.filter((l: { status: string }) => l.status === "pending").length
      const activeComplaints = complaintsRes.data.data.filter(
        (c: { status: string }) => c.status === "pending" || c.status === "in-progress",
      ).length
      const highPriorityNotices = noticesRes.data.data.filter(
        (n: { importance: string }) => n.importance === "urgent",
      ).length

      setStats({
        totalStudents: studentsRes.data.data.length,
        activeStudents,
        occupiedRooms,
        pendingLeaves,
        activeComplaints,
        highPriorityNotices,
      })
    } catch (error) {
      console.error("Dashboard error:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading({
        students: false,
        leaves: false,
        complaints: false,
        notices: false,
        approvals: false,
        rooms: false,
      })
    }
  }

  // Update the handleApproveLeave function to match the API endpoint in the leave approvals page
  const handleApproveLeave = async (leaveId: string) => {
    try {
      await api.put(`/admin/leave/${leaveId}`, {
        status: "approved",
      })
      toast({
        title: "Success",
        description: "Leave approved",
        className: "bg-green-500 text-white border-0",
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve leave",
        variant: "destructive",
      })
    }
  }

  // Update the handleRejectLeave function to match the API endpoint in the leave approvals page
  const handleRejectLeave = async (leaveId: string) => {
    try {
      await api.put(`/admin/leave/${leaveId}`, {
        status: "rejected",
      })
      toast({
        title: "Success",
        description: "Leave rejected",
        className: "bg-green-500 text-white border-0",
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject leave",
        variant: "destructive",
      })
    }
  }

  // Update the handleResolveComplaint function to match the API endpoint in the complaints management page
  const handleResolveComplaint = async (complaintId: string) => {
    try {
      await api.put(`/admin/complaints/${complaintId}`, {
        status: "resolved",
      })
      toast({
        title: "Success",
        description: "Complaint resolved",
        className: "bg-green-500 text-white border-0",
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve complaint",
        variant: "destructive",
      })
    }
  }

  const handleApproveRequest = async (approvalId: string) => {
    try {
      await api.patch(`/admin/approvals/${approvalId}`, { status: "approved" })
      toast({
        title: "Success",
        description: "Request approved",
        className: "bg-green-500 text-white border-0",
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async (approvalId: string) => {
    try {
      await api.patch(`/admin/approvals/${approvalId}`, { status: "rejected" })
      toast({
        title: "Success",
        description: "Request rejected",
        className: "bg-green-500 text-white border-0",
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-200",
        border: "border-yellow-200 dark:border-yellow-800",
        icon: <Clock className="h-3 w-3 mr-1" />,
      },
      in_progress: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-200",
        border: "border-blue-200 dark:border-blue-800",
        icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
      },
      resolved: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-200",
        border: "border-green-200 dark:border-green-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      rejected: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-200",
        border: "border-red-200 dark:border-red-800",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
      approved: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-200",
        border: "border-green-200 dark:border-green-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      high: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-200",
        border: "border-red-200 dark:border-red-800",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
      },
      medium: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-200",
        border: "border-amber-200 dark:border-amber-800",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      low: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-200",
        border: "border-blue-200 dark:border-blue-800",
        icon: <Info className="h-3 w-3 mr-1" />,
      },
      available: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-800 dark:text-emerald-200",
        border: "border-emerald-200 dark:border-emerald-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      full: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-200",
        border: "border-purple-200 dark:border-purple-800",
        icon: <Info className="h-3 w-3 mr-1" />,
      },
      maintenance: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-200",
        border: "border-amber-200 dark:border-amber-800",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
      },
    }

    const statusKey = status.toLowerCase().replace("-", "_") as keyof typeof variants
    const variant = variants[statusKey] || variants.pending

    return (
      <Badge
        className={`${variant.bg} ${variant.text} border ${variant.border} flex items-center gap-1 text-xs shadow-sm`}
      >
        {variant.icon}
        {status.replace("_", " ")}
      </Badge>
    )
  }

  const getPriorityBadge = (priority?: string) => {
    const variants = {
      high: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-200",
        border: "border-red-200 dark:border-red-800",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
      },
      medium: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-200",
        border: "border-amber-200 dark:border-amber-800",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
      low: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-200",
        border: "border-blue-200 dark:border-blue-800",
        icon: <Info className="h-3 w-3 mr-1" />,
      },
    }

    // Default to low priority if not provided
    const priorityKey = (priority?.toLowerCase() || "low") as keyof typeof variants
    const variant = variants[priorityKey] || variants.low

    return (
      <Badge
        className={`${variant.bg} ${variant.text} border ${variant.border} flex items-center gap-1 text-xs shadow-sm`}
      >
        {variant.icon}
        {priorityKey}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Leave":
        return (
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        )
      case "Complaint":
        return (
          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        )
      case "Approval":
        return (
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
            <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
        )
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        )
    }
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`
  }

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4 text-blue-500" />
      case "medical":
        return <Stethoscope className="h-4 w-4 text-red-500" />
      default:
        return <CalendarDays className="h-4 w-4 text-purple-500" />
    }
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "event":
        return "secondary"
      case "emergency":
        return "destructive"
      case "academic":
        return "default"
      case "hostel":
        return "outline"
      default:
        return "outline"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "event":
        return <Calendar className="h-4 w-4" />
      case "emergency":
        return <AlertCircle className="h-4 w-4" />
      case "academic":
        return <ClipboardList className="h-4 w-4" />
      case "hostel":
        return <PanelLeft className="h-4 w-4" />
      case "general":
        return <Info className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "urgent":
        return "text-red-500 dark:text-red-400"
      case "important":
        return "text-amber-500 dark:text-amber-400"
      default:
        return "text-green-500 dark:text-green-400"
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20 p-6 -mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-2 border-b border-purple-100 dark:border-purple-800/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-emerald-400">
              Hostel Management Dashboard
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Overview of hostel operations, pending requests, and important notices. Manage students, rooms, and
              administrative tasks efficiently.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-purple-200 hover:bg-purple-50 text-purple-700 dark:border-purple-800/30 dark:hover:bg-purple-900/20 dark:text-purple-400"
              asChild
            >
              <Link href="/dashboard/admin/rooms">
                <BedDouble className="h-4 w-4 mr-2" />
                Room Management
              </Link>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
              asChild
            >
              <Link href="/dashboard/admin/students">
                <Users className="h-4 w-4 mr-2" />
                Manage Students
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* System Alert */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800/30 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full border border-blue-200 dark:border-blue-800/50">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <AlertTitle className="text-blue-800 dark:text-blue-200 font-medium">
              System Maintenance Scheduled
            </AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              The system will be undergoing maintenance on May 15th from 2:00 AM to 4:00 AM.
              <Button variant="link" size="sm" className="h-auto p-0 ml-2 text-blue-800 dark:text-blue-300">
                Learn more
              </Button>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Students"
          value={loading.students ? <Loader2 className="h-6 w-6 animate-spin text-purple-500" /> : stats.totalStudents}
          change={`${stats.activeStudents} active`}
          icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          link="/dashboard/admin/students"
          linkText="Manage Students"
          borderColor="border-purple-200 dark:border-purple-800/30"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          textColor="text-purple-600 dark:text-purple-400"
          percent={(stats.activeStudents / (stats.totalStudents || 1)) * 100}
        />
        <MetricCard
          title="Room Occupancy"
          value={
            loading.rooms ? (
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            ) : (
              `${roomStats.occupiedRooms} / ${roomStats.totalRooms}`
            )
          }
          change={`${Math.round(roomStats.occupancyRate)}% occupied`}
          icon={<BedDouble className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          link="/dashboard/admin/roomAllocation"
          linkText="View Rooms"
          borderColor="border-emerald-200 dark:border-emerald-800/30"
          bgColor="bg-emerald-50 dark:bg-emerald-900/20"
          textColor="text-emerald-600 dark:text-emerald-400"
          percent={roomStats.occupancyRate}
        />
        <MetricCard
          title="Pending Leaves"
          value={loading.leaves ? <Loader2 className="h-6 w-6 animate-spin text-amber-500" /> : stats.pendingLeaves}
          change={`${stats.pendingLeaves > 0 ? "Needs attention" : "All clear"}`}
          icon={<ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          link="/dashboard/admin/leave"
          linkText="Review Leaves"
          warning={stats.pendingLeaves > 0}
          borderColor="border-amber-200 dark:border-amber-800/30"
          bgColor="bg-amber-50 dark:bg-amber-900/20"
          textColor="text-amber-600 dark:text-amber-400"
          percent={stats.pendingLeaves > 0 ? 75 : 0}
        />
        <MetricCard
          title="Active Complaints"
          value={
            loading.complaints ? <Loader2 className="h-6 w-6 animate-spin text-orange-500" /> : stats.activeComplaints
          }
          change={`${stats.activeComplaints > 0 ? "Needs resolution" : "All clear"}`}
          icon={<MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
          link="/dashboard/admin/complaints"
          linkText="Handle Complaints"
          warning={stats.activeComplaints > 0}
          borderColor="border-orange-200 dark:border-orange-800/30"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
          textColor="text-orange-600 dark:text-orange-400"
          percent={stats.activeComplaints > 0 ? 75 : 0}
        />
      </div>

      {/* Room Occupancy Stats */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Room Occupancy Overview */}
        <Card className="border-emerald-200 dark:border-emerald-800/30 shadow-md lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800/30">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Room Occupancy Overview
                </CardTitle>
                <CardDescription>Current status of all hostel rooms</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 shadow-sm"
                asChild
              >
                <Link href="/dashboard/admin/rooms">View All Rooms</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading.rooms ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Occupancy */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-emerald-900 dark:text-emerald-100">Overall Occupancy</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {Math.round(roomStats.occupancyRate)}%
                      </span>
                      <Percent className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30">
                          {roomStats.occupiedRooms} occupied rooms
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30">
                          {roomStats.totalRooms} total rooms
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <div
                        style={{ width: `${roomStats.occupancyRate}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 dark:bg-emerald-600"
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Room Status Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800/30">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Available</h4>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {roomStats.availableRooms} rooms
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={(roomStats.availableRooms / roomStats.totalRooms) * 100}
                        className="h-2 bg-emerald-100 dark:bg-emerald-900/50"
                      />
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800/30">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">Occupied</h4>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {roomStats.occupiedRooms} rooms
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={(roomStats.occupiedRooms / roomStats.totalRooms) * 100}
                        className="h-2 bg-purple-100 dark:bg-purple-900/50"
                      />
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800/30">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">Maintenance</h4>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {roomStats.maintenanceRooms} rooms
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={(roomStats.maintenanceRooms / roomStats.totalRooms) * 100}
                        className="h-2 bg-amber-100 dark:bg-amber-900/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Block-wise Occupancy */}
                <div className="space-y-3">
                  <h3 className="font-medium text-emerald-900 dark:text-emerald-100">Block-wise Occupancy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(roomStats.blockStats).map(([block, stats]) => (
                      <div
                        key={block}
                        className="flex items-center gap-3 p-3 border border-emerald-200 dark:border-emerald-800/30 rounded-lg"
                      >
                        <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Block {block}</h4>
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              {Math.round(stats.occupancyRate)}%
                            </span>
                          </div>
                          <div className="mt-1">
                            <Progress
                              value={stats.occupancyRate}
                              className="h-1.5 bg-emerald-100 dark:bg-emerald-900/50"
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                            <span>{stats.occupied} occupied</span>
                            <span>{stats.total} total</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-emerald-50/50 dark:bg-emerald-950/10 border-t border-emerald-100 dark:border-emerald-800/20 py-3 px-6">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-emerald-700 dark:text-emerald-300">
                Last updated: {lastUpdatedTime}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                onClick={fetchDashboardData}
              >
                <Loader2 className="h-3 w-3 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Recent Room Activities */}
        <Card className="border-purple-200 dark:border-purple-800/30 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-b border-purple-200 dark:border-purple-800/30">
            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <DoorClosed className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Recent Room Activity
            </CardTitle>
            <CardDescription>Latest room allocations and changes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-purple-100 dark:divide-purple-800/20">
              {loading.rooms ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  {rooms.slice(0, 4).map((room) => (
                    <div
                      key={room._id}
                      className="p-4 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/50">
                          <BedDouble className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              Room Number {room.roomNumber}
                            </h3>
                            {getStatusBadge(room.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {room.type} | {room.floor} | {room.gender}
                          </div>
                          <div className="mt-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-full bg-purple-100 dark:bg-purple-900/30 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-purple-500 dark:bg-purple-600"
                                      style={{ width: `${(room.occupiedCount / room.capacity) * 100}%` }}
                                    ></div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {room.occupiedCount} of {room.capacity} beds occupied (
                                    {Math.round((room.occupiedCount / room.capacity) * 100)}%)
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="flex justify-between mt-1 text-xs text-purple-700 dark:text-purple-300">
                              <span>{room.occupiedCount} occupied</span>
                              <span>{room.capacity} capacity</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {rooms.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-3">
                        <BedDouble className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-muted-foreground">No rooms available</p>
                      <p className="text-xs text-muted-foreground mt-1">Add rooms to get started</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-purple-50/50 dark:bg-purple-950/10 border-t border-purple-100 dark:border-purple-800/20 py-3 px-6">
            <Button
              variant="outline"
              className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 shadow-sm"
              asChild
            >
              <Link href="/dashboard/admin/rooms">Manage All Rooms</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tabs Section */}
      <Card className="border-indigo-200 dark:border-indigo-800/30 shadow-md overflow-hidden">
        <Tabs defaultValue="approvals" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/10 dark:to-indigo-900/20 p-1 rounded-lg">
              <TabsTrigger
                value="approvals"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Pending Approvals
              </TabsTrigger>
              <TabsTrigger
                value="leaves"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Leave Requests
              </TabsTrigger>
              <TabsTrigger
                value="complaints"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Complaints
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals" className="p-0">
            <div className="divide-y divide-indigo-100 dark:divide-indigo-800/20">
              {loading.approvals || loading.leaves || loading.complaints ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  {[
                    ...pendingApprovals.map((item) => ({
                      ...item,
                      type: "Approval",
                      date: item.createdAt,
                      originalType: item.type,
                      priority: item.priority || "medium",
                    })),
                    ...leaves
                      .filter((leave) => leave.status === "pending")
                      .map((item) => ({
                        ...item,
                        type: "Leave",
                        date: item.createdAt,
                        priority: item.priority || "medium",
                      })),
                    ...complaints
                      .filter((c) => c.status === "pending" || c.status === "in-progress")
                      .map((item) => ({
                        ...item,
                        type: "Complaint",
                        date: item.createdAt,
                        priority: item.priority || "medium",
                      })),
                  ]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={`${item.type}-${item._id}`}
                        className="p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                      >
                        <div className="flex gap-3 items-start">
                          {getTypeIcon(item.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.type === "Approval" && "originalType" in item
                                  ? `${item.originalType} Approval`
                                  : item.type}
                              </h3>
                              <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                            </div>
                            {item.type === "Leave" && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {"startDate" in item && "endDate" in item
                                  ? formatDateRange(item.startDate, item.endDate)
                                  : "N/A"}
                              </p>
                            )}
                            {item.type === "Complaint" && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {"description" in item ? item.description : ""}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {getPriorityBadge(item.priority)}
                              {item.type === "Complaint" && "status" in item && getStatusBadge(item.status)}
                              {"student" in item && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-indigo-200 dark:border-indigo-800/30 shadow-sm"
                                >
                                  {item.student.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {item.type === "Approval" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 shadow-sm"
                                  onClick={() => handleApproveRequest(item._id)}
                                >
                                  <Check className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-red-500 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 shadow-sm"
                                  onClick={() => handleRejectRequest(item._id)}
                                >
                                  <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {item.type === "Leave" && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800/30 shadow-sm"
                                  variant="outline"
                                  onClick={() => handleApproveLeave(item._id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800/30 shadow-sm"
                                  variant="outline"
                                  onClick={() => handleRejectLeave(item._id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {item.type === "Complaint" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-800 shadow-sm"
                                onClick={() => handleResolveComplaint(item._id)}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {pendingApprovals.length === 0 &&
                    leaves.filter((leave) => leave.status === "pending").length === 0 &&
                    complaints.filter((c) => c.status === "pending" || c.status === "in-progress").length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3">
                          <FileSearch className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-muted-foreground">No pending items</p>
                        <p className="text-xs text-muted-foreground mt-1">All tasks are up to date</p>
                      </div>
                    )}
                </>
              )}
            </div>
            <div className="p-4 border-t border-indigo-100 dark:border-indigo-800/20 text-center">
              <Button
                variant="outline"
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 shadow-sm"
                asChild
              >
                <Link href="/dashboard/admin/approvals">View all pending items</Link>
              </Button>
            </div>
          </TabsContent>

          {/* Leave Requests Tab */}
          <TabsContent value="leaves" className="p-0">
            <div className="divide-y divide-purple-100 dark:divide-purple-800/20">
              {loading.leaves ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : leaves.filter((leave) => leave.status === "pending").length > 0 ? (
                leaves
                  .filter((leave) => leave.status === "pending")
                  .map((leave) => (
                    <div
                      key={leave._id}
                      className="p-4 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
                    >
                      <div className="flex gap-3 items-start">
                        <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                          <AvatarImage
                            src={
                              leave.student.userId?.profilePicture ||
                              `https://ui-avatars.com/api/?name=${leave.student.name || "/placeholder.svg"}&background=random`
                            }
                            alt={leave.student.name}
                          />
                          <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {leave.student.name}
                              {leave.student.room && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-purple-200 dark:border-purple-800/30"
                                >
                                  {leave.student.room.block}-{leave.student.room.roomNumber}
                                </Badge>
                              )}
                            </h3>
                            <span className="text-xs text-muted-foreground">{formatDate(leave.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDateRange(leave.startDate, leave.endDate)} (
                            {calculateDuration(leave.startDate, leave.endDate)})
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs line-clamp-1 border-purple-200 dark:border-purple-800/30 shadow-sm"
                            >
                              {leave.reason}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs line-clamp-1 border-purple-200 dark:border-purple-800/30 shadow-sm"
                            >
                              To: {leave.destination}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800/30 shadow-sm"
                            variant="outline"
                            onClick={() => handleApproveLeave(leave._id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800/30 shadow-sm"
                            variant="outline"
                            onClick={() => handleRejectLeave(leave._id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-3">
                    <FileSearch className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-muted-foreground">No pending leave requests</p>
                  <p className="text-xs text-muted-foreground mt-1">All leave requests are processed</p>
                </div>
              )}

              {/* Approved Leaves Section */}
              {leaves.filter((leave) => leave.status === "approved").length > 0 && (
                <>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Recently Approved Leaves
                    </h3>
                  </div>
                  {leaves
                    .filter((leave) => leave.status === "approved")
                    .slice(0, 3)
                    .map((leave) => (
                      <div
                        key={leave._id}
                        className="p-4 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
                      >
                        <div className="flex gap-3 items-start">
                          <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${leave.student.name}.png`}
                              alt={leave.student.name}
                            />
                            <AvatarFallback>{leave.student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {leave.student.name}
                                {leave.student.room && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-green-200 dark:border-green-800/30"
                                  >
                                    {leave.student.room.block}-{leave.student.room.roomNumber}
                                  </Badge>
                                )}
                              </h3>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Approved
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDateRange(leave.startDate, leave.endDate)} (
                              {calculateDuration(leave.startDate, leave.endDate)})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
            <div className="p-4 border-t border-purple-100 dark:border-purple-800/20 text-center">
              <Button
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 shadow-sm"
                asChild
              >
                <Link href="/dashboard/admin/leave">View all leave requests</Link>
              </Button>
            </div>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="p-0">
            <div className="divide-y divide-orange-100 dark:divide-orange-800/20">
              {loading.complaints ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : complaints.filter((complaint) => complaint.status === "pending" || complaint.status === "in-progress")
                  .length > 0 ? (
                complaints
                  .filter((complaint) => complaint.status === "pending" || complaint.status === "in-progress")
                  .map((complaint) => (
                    <div
                      key={complaint._id}
                      className="p-4 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/30">
                          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {complaint.type || "Complaint"}
                            </h3>
                            <span className="text-xs text-muted-foreground">{formatDate(complaint.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{complaint.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {getPriorityBadge(complaint.priority)}
                            {getStatusBadge(complaint.status)}
                            <Badge variant="outline" className="text-xs border-orange-200 dark:border-orange-800/30">
                              {complaint.student?.name || "Student"}
                            </Badge>
                            {complaint.student?.room && (
                              <Badge variant="outline" className="text-xs border-orange-200 dark:border-orange-800/30">
                                {complaint.student.room.block}-{complaint.student.room.roomNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-800 shadow-sm"
                          onClick={() => handleResolveComplaint(complaint._id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-full mb-3">
                    <FileSearch className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-muted-foreground">No active complaints</p>
                  <p className="text-xs text-muted-foreground mt-1">All complaints are resolved</p>
                </div>
              )}

              {/* Resolved Complaints Section */}
              {complaints.filter((complaint) => complaint.status === "resolved").length > 0 && (
                <>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Recently Resolved Complaints
                    </h3>
                  </div>
                  {complaints
                    .filter((complaint) => complaint.status === "resolved")
                    .slice(0, 3)
                    .map((complaint) => (
                      <div
                        key={complaint._id}
                        className="p-4 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
                      >
                        <div className="flex gap-3 items-start">
                          <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                            <AvatarImage
                              src={
                                complaint.student?.userId?.profilePicture ||
                                `https://ui-avatars.com/api/?name=${complaint.student?.name || "User"}&background=random`
                              }
                              alt={complaint.student?.name || "Student"}
                            />
                            <AvatarFallback>{(complaint.student?.name || "S").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {complaint.type || "Complaint"}
                              </h3>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Resolved
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{complaint.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
            <div className="p-4 border-t border-orange-100 dark:border-orange-800/20 text-center">
              <Button
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 shadow-sm"
                asChild
              >
                <Link href="/dashboard/admin/complaints">View all complaints</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Notices Section */}
      <Card className="border-blue-200 dark:border-blue-800/30 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-b border-blue-200 dark:border-blue-800/30">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Important Notices
              </CardTitle>
              <CardDescription>Latest announcements for students</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1 shadow-sm dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
              asChild
            >
              <Link href="/dashboard/admin/notices">
                <Plus className="h-4 w-4" /> Create Notice
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-blue-100 dark:divide-blue-800/20">
            {loading.notices ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : notices.length > 0 ? (
              notices
                .filter((notice) => notice.isActive)
                .slice(0, 5)
                .map((notice) => (
                  <div key={notice._id} className="p-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                    <div className="flex gap-3 items-start">
                      <div
                        className={`p-2 rounded-full ${
                          notice.importance === "urgent"
                            ? "bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
                            : notice.importance === "important"
                              ? "bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30"
                              : "bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30"
                        }`}
                      >
                        {getCategoryIcon(notice.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            <span
                              className={`inline-block h-2 w-2 rounded-full mr-2 ${getImportanceColor(notice.importance)}`}
                            ></span>
                            {notice.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">{formatDate(notice.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge
                            variant={getCategoryBadgeVariant(notice.category)}
                            className="flex items-center gap-1.5 capitalize"
                          >
                            {getCategoryIcon(notice.category)}
                            {notice.category}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="capitalize flex items-center gap-1.5 border-blue-200 dark:border-blue-800/30"
                          >
                            <Users className="h-3 w-3" />
                            {notice.targetAudience.join(", ")}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`
                          ${
                            notice.importance === "urgent"
                              ? "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                              : notice.importance === "important"
                                ? "border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                : "border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          }
                          shadow-sm
                        `}
                        asChild
                      >
                        <Link href={`/dashboard/admin/notices`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-3">
                  <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-muted-foreground">No notices available</p>
                <p className="text-xs text-muted-foreground mt-1">Create a notice to inform students</p>
                <Button
                  variant="outline"
                  className="mt-4 border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1 shadow-sm dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  asChild
                >
                  <Link href="/dashboard/admin/notices/create">
                    <Plus className="h-4 w-4" /> Create Notice
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: React.ReactNode
  change: string
  icon: React.ReactNode
  link: string
  linkText: string
  warning?: boolean
  borderColor?: string
  bgColor?: string
  textColor?: string
  percent?: number
}

function MetricCard({
  title,
  value,
  change,
  icon,
  link,
  linkText,
  warning,
  borderColor = "border-gray-200",
  bgColor = "bg-gray-50/50",
  textColor = "text-gray-600",
  percent = 0,
}: MetricCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 ${borderColor} overflow-hidden`}
    >
      <CardHeader className={`flex flex-row items-center justify-between pb-3 space-y-0 relative z-10`}>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bgColor} border ${borderColor}`}>{icon}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <div
          className={`flex items-center gap-1 text-xs mt-1 ${warning ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
        >
          {warning ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{change}</span>
        </div>

        {percent > 0 && (
          <div className="mt-3 space-y-1">
            <Progress
              value={percent}
              className={`h-1.5 ${warning ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-800"}`}
            />
            <div className="text-xs text-muted-foreground">
              {Math.round(percent)}% {warning ? "Attention needed" : "Complete"}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className={`mt-4 h-9 w-full ${borderColor} hover:${bgColor} ${textColor} shadow-sm`}
          asChild
        >
          <Link href={link}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
