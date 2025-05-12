"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Home,
  UserCheck,
  AlertCircle,
  FileSearch,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Check,
  X,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface Student {
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
  _id: string
  student: Student
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  priority?: "low" | "medium" | "high"
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
  description: string
  priority: "low" | "medium" | "high"
  createdAt: string
}

interface PendingApproval {
  _id: string
  type: string
  student: Student
  details?: string
  reason?: string
  createdAt: string
  priority: "low" | "medium" | "high"
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState({
    students: true,
    leaves: true,
    complaints: true,
    notices: true,
    approvals: true
  })
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    occupiedRooms: 0,
    pendingLeaves: 0,
    activeComplaints: 0,
    highPriorityNotices: 0
  })
  const [students, setStudents] = useState<Student[]>([])
  const [leaves, setLeaves] = useState<LeaveApplication[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  })

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }, error => {
    return Promise.reject(error)
  })

  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken')
        router.push('/login')
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive"
        })
      }
      return Promise.reject(error)
    }
  )

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading({
        students: true,
        leaves: true,
        complaints: true,
        notices: true,
        approvals: true
      })

      const [
        studentsRes,
        leavesRes,
        complaintsRes,
        noticesRes,
        approvalsRes
      ] = await Promise.all([
        api.get('/admin/students').catch(() => ({ data: { data: [] } })),
        api.get('/admin/leave?status=pending&limit=5').catch(() => ({ data: { data: [] } })),
        api.get('/admin/complaints?status=pending,in-progress&limit=5').catch(() => ({ data: { data: [] } })),
        api.get('/notices?limit=5').catch(() => ({ data: { data: [] } })),
        api.get('/admin/approvals/pending').catch(() => ({ data: { data: [] } }))
      ])

      setStudents(studentsRes.data.data)
      setLeaves(leavesRes.data.data)
      setComplaints(complaintsRes.data.data)
      setNotices(noticesRes.data.data)
      setPendingApprovals(approvalsRes.data.data)

      const activeStudents = studentsRes.data.data.filter((s: { status: string }) => s.status === "Active").length
      const occupiedRooms = studentsRes.data.data.filter((s: { room: any }) => s.room).length
      const pendingLeaves = leavesRes.data.data.length
      const activeComplaints = complaintsRes.data.data.length
      const highPriorityNotices = noticesRes.data.data.filter((n: { priority: string }) => n.priority === "high").length

      setStats({
        totalStudents: studentsRes.data.data.length,
        activeStudents,
        occupiedRooms,
        pendingLeaves,
        activeComplaints,
        highPriorityNotices
      })

    } catch (error) {
      console.error("Dashboard error:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading({
        students: false,
        leaves: false,
        complaints: false,
        notices: false,
        approvals: false
      })
    }
  }

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await api.patch(`/admin/leaves/${leaveId}`, { status: "approved" })
      toast({ 
        title: "Success", 
        description: "Leave approved",
        className: "bg-green-500 text-white border-0" 
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve leave",
        variant: "destructive"
      })
    }
  }

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await api.patch(`/admin/leaves/${leaveId}`, { status: "rejected" })
      toast({ 
        title: "Success", 
        description: "Leave rejected",
        className: "bg-green-500 text-white border-0" 
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject leave",
        variant: "destructive"
      })
    }
  }

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      await api.patch(`/admin/complaints/${complaintId}`, { status: "resolved" })
      toast({ 
        title: "Success", 
        description: "Complaint resolved",
        className: "bg-green-500 text-white border-0" 
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve complaint",
        variant: "destructive"
      })
    }
  }

  const handleApproveRequest = async (approvalId: string) => {
    try {
      await api.patch(`/admin/approvals/${approvalId}`, { status: "approved" })
      toast({ 
        title: "Success", 
        description: "Request approved",
        className: "bg-green-500 text-white border-0" 
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      })
    }
  }

  const handleRejectRequest = async (approvalId: string) => {
    try {
      await api.patch(`/admin/approvals/${approvalId}`, { status: "rejected" })
      toast({ 
        title: "Success", 
        description: "Request rejected",
        className: "bg-green-500 text-white border-0" 
      })
      fetchDashboardData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      case "in-progress":
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> In Progress
        </Badge>
      case "resolved":
        return <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Resolved
        </Badge>
      case "approved":
        return <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
          <ThumbsUp className="h-3 w-3 mr-1" /> Approved
        </Badge>
      case "rejected":
        return <Badge variant="destructive" className="text-xs">
          <ThumbsDown className="h-3 w-3 mr-1" /> Rejected
        </Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" /> High
        </Badge>
      case "medium":
        return <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <AlertCircle className="h-3 w-3 mr-1" /> Medium
        </Badge>
      case "low":
        return <Badge variant="secondary" className="text-xs">
          <Info className="h-3 w-3 mr-1" /> Low
        </Badge>
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Leave":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "Complaint":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "Approval":
        return <UserCheck className="h-4 w-4 text-blue-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
            Hostel Management Dashboard
          </h1>
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md">
            <Link href="/dashboard/admin/quick-actions">
              Quick Actions
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Overview of hostel operations, pending requests, and important notices
        </p>
      </div>

      {/* System Alert */}
      <Alert className="bg-blue-50/80 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
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
          value={loading.students ? <Loader2 className="h-6 w-6 animate-spin text-indigo-500" /> : stats.totalStudents}
          change={`${stats.activeStudents} active`}
          icon={<Users className="h-5 w-5 text-indigo-600" />}
          link="/dashboard/admin/students"
          linkText="Manage Students"
          borderColor="border-indigo-200"
          bgColor="bg-indigo-50/50"
        />
        <MetricCard
          title="Room Occupancy"
          value={loading.students ? <Loader2 className="h-6 w-6 animate-spin text-blue-500" /> : `${stats.occupiedRooms} / ${stats.totalStudents}`}
          change={`${Math.round((stats.occupiedRooms / stats.totalStudents) * 100)}% occupied`}
          icon={<BedDouble className="h-5 w-5 text-blue-600" />}
          link="/dashboard/admin/rooms"
          linkText="View Rooms"
          borderColor="border-blue-200"
          bgColor="bg-blue-50/50"
        />
        <MetricCard
          title="Pending Leaves"
          value={loading.leaves ? <Loader2 className="h-6 w-6 animate-spin text-amber-500" /> : stats.pendingLeaves}
          change={`${stats.pendingLeaves > 0 ? 'Needs attention' : 'All clear'}`}
          icon={<ClipboardList className="h-5 w-5 text-amber-600" />}
          link="/dashboard/admin/leaves"
          linkText="Review Leaves"
          warning={stats.pendingLeaves > 0}
          borderColor="border-amber-200"
          bgColor="bg-amber-50/50"
        />
        <MetricCard
          title="Active Complaints"
          value={loading.complaints ? <Loader2 className="h-6 w-6 animate-spin text-orange-500" /> : stats.activeComplaints}
          change={`${stats.activeComplaints > 0 ? 'Needs resolution' : 'All clear'}`}
          icon={<MessageSquare className="h-5 w-5 text-orange-600" />}
          link="/dashboard/admin/complaints"
          linkText="Handle Complaints"
          warning={stats.activeComplaints > 0}
          borderColor="border-orange-200"
          bgColor="bg-orange-50/50"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Approvals Card */}
        <Card className="md:col-span-2 lg:col-span-1 border-indigo-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Last 5 items requiring your action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.approvals || loading.leaves || loading.complaints ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {[
                  ...pendingApprovals.map(item => ({
                    ...item,
                    type: 'Approval',
                    date: item.createdAt,
                    originalType: item.type,
                    priority: item.priority || 'medium'
                  })),
                  ...leaves.map(item => ({
                    ...item,
                    type: 'Leave',
                    date: item.createdAt,
                    priority: item.priority || 'medium'
                  })),
                  ...complaints.filter(c => c.status !== 'resolved').map(item => ({
                    ...item,
                    type: 'Complaint',
                    date: item.createdAt,
                    priority: item.priority || 'medium'
                  }))
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((item) => (
                    <div 
                      key={`${item.type}-${item._id}`} 
                      className={`
                        border rounded-lg p-3 hover:shadow-sm transition-shadow
                        ${item.type === 'Approval' ? 'border-indigo-200 bg-indigo-50/50' : 
                          item.type === 'Leave' ? 'border-purple-200 bg-purple-50/50' : 
                          'border-orange-200 bg-orange-50/50'}
                        dark:bg-opacity-10
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <h4 className="font-medium">
                              {item.type === 'Approval' && 'originalType' in item ? `${item.originalType} Approval` : item.type}
                            </h4>
                            {getPriorityBadge(item.priority)}
                          </div>
                          {item.type === 'Leave' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {'startDate' in item && 'endDate' in item ? formatDateRange(item.startDate, item.endDate) : 'N/A'}
                            </p>
                            )}
                          {item.type === 'Complaint' && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {'description' in item ? item.description : ''}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.date)}
                            </span>
                            {item.type === 'Complaint' && 'status' in item && getStatusBadge(item.status)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {item.type === 'Approval' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={() => handleApproveRequest(item._id)}
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => handleRejectRequest(item._id)}
                              >
                                <X className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {item.type === 'Leave' && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 w-8 p-0"
                                variant="outline"
                                onClick={() => handleApproveLeave(item._id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 w-8 p-0"
                                variant="outline"
                                onClick={() => handleRejectLeave(item._id)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {item.type === 'Complaint' && (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                              onClick={() => handleResolveComplaint(item._id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                }

                {pendingApprovals.length === 0 && leaves.length === 0 && 
                 complaints.filter(c => c.status !== 'resolved').length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <FileSearch className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">No pending items</p>
                  </div>
                )}
              </>
            )}
            <Button 
              variant="outline" 
              className="w-full mt-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-700 dark:hover:bg-indigo-900/20" 
              asChild
            >
              <Link href="/dashboard/admin/approvals">
                View all pending items
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Leaves Card */}
        <Card className="border-purple-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Calendar className="h-5 w-5 text-purple-600" />
              Recent Leave Requests
            </CardTitle>
            <CardDescription>Last 5 pending applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.leaves ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : leaves.length > 0 ? (
              leaves.map((leave) => (
                <div 
                  key={leave._id} 
                  className="border border-purple-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-purple-50/50 dark:bg-purple-900/10"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{leave.student.name}</h4>
                        {leave.priority && getPriorityBadge(leave.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateRange(leave.startDate, leave.endDate)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {leave.reason}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0"
                        variant="outline"
                        onClick={() => handleApproveLeave(leave._id)}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0"
                        variant="outline"
                        onClick={() => handleRejectLeave(leave._id)}
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileSearch className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground mt-2">No pending leave requests</p>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full mt-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-700 dark:hover:bg-purple-900/20" 
              asChild
            >
              <Link href="/dashboard/admin/leaves">
                View all leave requests
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Complaints Card */}
        <Card className="border-orange-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Recent Complaints
            </CardTitle>
            <CardDescription>Last 5 active complaints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading.complaints ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : complaints.length > 0 ? (
              complaints.map((complaint) => (
                <div 
                  key={complaint._id} 
                  className="border border-orange-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-orange-50/50 dark:bg-orange-900/10"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{complaint.type}</h4>
                        {getPriorityBadge(complaint.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {complaint.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {getStatusBadge(complaint.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(complaint.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={complaint.status === "resolved" ? "outline" : "default"}
                      className={complaint.status === "resolved" ? "border-orange-300 text-orange-600 hover:bg-orange-50" : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"}
                      onClick={() => complaint.status !== "resolved" && handleResolveComplaint(complaint._id)}
                    >
                      {complaint.status === "resolved" ? "View" : "Resolve"}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileSearch className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground mt-2">No active complaints</p>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full mt-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-700 dark:hover:bg-orange-900/20" 
              asChild
            >
              <Link href="/dashboard/admin/complaints">
                View all complaints
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notices Section */}
      <Card className="border-blue-200 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Bell className="h-5 w-5 text-blue-600" />
                Important Notices
              </CardTitle>
              <CardDescription>Latest announcements for students</CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1"
              asChild
            >
              <Link href="/dashboard/admin/notices/create">
                <Plus className="h-4 w-4" /> Create Notice
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading.notices ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-4">
              {notices.map((notice) => (
                <div 
                  key={notice._id} 
                  className={`
                    border rounded-lg p-4 hover:shadow-sm transition-shadow
                    ${notice.priority === 'high' ? 'border-red-200 bg-red-50/50' : 
                      notice.priority === 'medium' ? 'border-amber-200 bg-amber-50/50' : 
                      'border-blue-200 bg-blue-50/50'}
                    dark:bg-opacity-10
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{notice.title}</h4>
                        {getPriorityBadge(notice.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {notice.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Posted on {formatDate(notice.createdAt)}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:bg-blue-100"
                      asChild
                    >
                      <Link href={`/dashboard/admin/notices/${notice._id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground mt-2">No notices available</p>
              <Button 
                variant="outline" 
                className="mt-4 border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1" 
                asChild
              >
                <Link href="/dashboard/admin/notices/create">
                  <Plus className="h-4 w-4" /> Create Notice
                </Link>
              </Button>
            </div>
          )}
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
  bgColor = "bg-gray-50/50"
}: MetricCardProps) {
  return (
    <Card className={`hover:shadow-sm transition-shadow ${borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${bgColor}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center gap-1 text-xs mt-1 ${warning ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
          {warning ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          <span>{change}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`mt-4 h-8 w-full ${borderColor} hover:${bgColor} text-${borderColor.replace('border-', '').replace('-200', '-600')} hover:text-${borderColor.replace('border-', '').replace('-200', '-700')}`}
          asChild
        >
          <Link href={link}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}