"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Filter,
  Search,
  XCircle,
  Loader2,
  CalendarDays,
  Home,
  Stethoscope,
  Clock,
  User,
  Phone,
  FileText,
  MapPin,
  AlertCircle,
  Info,
  Hash,
  Building,
  Layers,
  BookOpen,
  Mail,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"

type Student = {
  _id: string
  userId: {
    username: string
    profilePicture?: string
  }
  name: string
  studentId: string
  email?: string
  phone?: string
  course?: string
  year?: string
  roomId?: {
    _id: string
    roomNumber: string
    block: string
    floor?: string
  }
}

type LeaveApplication = {
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

export default function LeaveApprovalsPage({ onActionComplete }: { onActionComplete?: () => void }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [isDialogLoading, setIsDialogLoading] = useState(false)
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const leaveId = searchParams.get("id")

  // Check if dialog should be open based on URL
  const isDialogOpen = !!leaveId

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate duration between two dates
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`
  }

  // Get leave type icon
  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4 text-purple-500" />
      case "medical":
        return <Stethoscope className="h-4 w-4 text-emerald-500" />
      default:
        return <CalendarDays className="h-4 w-4 text-purple-500" />
    }
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            {status}
          </Badge>
        )
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">{status}</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{status}</Badge>
    }
  }

  // Get color theme based on tab
  const getTabTheme = (tab: string) => {
    switch (tab) {
      case "pending":
        return {
          border: "border-amber-200 dark:border-amber-800/30",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          text: "text-amber-800 dark:text-amber-200",
          icon: "text-amber-600",
          hover: "hover:bg-amber-50 dark:hover:bg-amber-900/10",
        }
      case "approved":
        return {
          border: "border-emerald-200 dark:border-emerald-800/30",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          text: "text-emerald-800 dark:text-emerald-200",
          icon: "text-emerald-600",
          hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/10",
        }
      case "rejected":
        return {
          border: "border-red-200 dark:border-red-800/30",
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-800 dark:text-red-200",
          icon: "text-red-600",
          hover: "hover:bg-red-50 dark:hover:bg-red-900/10",
        }
      default:
        return {
          border: "border-amber-200 dark:border-amber-800/30",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          text: "text-amber-800 dark:text-amber-200",
          icon: "text-amber-600",
          hover: "hover:bg-amber-50 dark:hover:bg-amber-900/10",
        }
    }
  }

  // Fetch leave applications from API
  useEffect(() => {
    const fetchLeaveApplications = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("adminToken")

        const response = await fetch("http://localhost:5000/api/admin/leave", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (data.success) {
          setLeaveApplications(data.data)

          // If there's a leaveId in the URL, find and set the selected application
          if (leaveId) {
            const application = data.data.find((app: LeaveApplication) => app._id === leaveId)
            if (application) {
              setSelectedApplication(application)
            } else {
              // If application not found, remove the ID from URL
              router.replace(pathname, { scroll: false })
            }
          }
        } else {
          throw new Error(data.message || "Failed to fetch leave applications")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load leave applications",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaveApplications()
  }, [toast, leaveId, pathname, router])

  // Filter applications based on search term and status
  useEffect(() => {
    let filtered = leaveApplications

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((app) => {
        const studentName = app.student.name?.toLowerCase() || ""
        const studentId = app.student.studentId?.toLowerCase() || ""
        const roomNumber = app.student.roomId?.roomNumber?.toLowerCase() || ""
        const reason = app.reason?.toLowerCase() || ""

        return (
          studentName.includes(term) || studentId.includes(term) || roomNumber.includes(term) || reason.includes(term)
        )
      })
    }

    // Apply tab filter
    filtered = filtered.filter((app) =>
      activeTab === "pending"
        ? app.status === "pending"
        : activeTab === "approved"
          ? app.status === "approved"
          : app.status === "rejected",
    )

    setFilteredApplications(filtered)
  }, [searchTerm, statusFilter, leaveApplications, activeTab])

  // Function to open application details
  const openApplicationDetails = (application: LeaveApplication) => {
    // Only update if it's a different application
    if (!selectedApplication || selectedApplication._id !== application._id) {
      setSelectedApplication(application)
      router.push(`${pathname}?id=${application._id}`, { scroll: false })
    }
  }

  // Function to close application details
  const closeDialog = () => {
    // Check if we're in the middle of processing
    if (processingApplicationId) {
      return // Don't close if we're processing
    }

    // Remove the query parameter first without triggering a full page reload
    router.replace(pathname, { scroll: false })
    // Then clear the selected application after a short delay
    setTimeout(() => {
      setSelectedApplication(null)
    }, 100)
  }

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected", remarks = "") => {
    // Set the processing application ID to show loading only for that specific button
    setProcessingApplicationId(id)

    try {
      const token = localStorage.getItem("adminToken")

      const response = await fetch(`http://localhost:5000/api/admin/leave/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, remarks }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to update leave status")
      }

      // Update local state with the updated leave application
      setLeaveApplications((prev) => prev.map((app) => (app._id === id ? data.data : app)))

      toast({
        title: "Success",
        description: `Leave application ${status}`,
      })

      // Notify parent component that an action was completed
      if (onActionComplete) {
        onActionComplete()
      }

      // Close the dialog after successful update
      closeDialog()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update application",
        variant: "destructive",
      })
    } finally {
      setProcessingApplicationId(null)
    }
  }

  // Render table row for an application
  const renderApplicationRow = (leave: LeaveApplication, theme: any) => (
    <TableRow
      key={leave._id}
      className={`cursor-pointer ${theme.hover} border-b ${theme.border}`}
      onClick={() => openApplicationDetails(leave)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className={`h-9 w-9 border ${theme.border}`}>
            <AvatarImage src={leave.student.userId.profilePicture || "/placeholder.svg"} alt={leave.student.name} />
            <AvatarFallback className={`${theme.bg} ${theme.text}`}>{leave.student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{leave.student.name}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`${theme.border} ${theme.bg} flex items-center gap-1 text-base font-medium`}
        >
          <Hash className={`h-4 w-4 ${theme.icon}`} />
          {leave.student.studentId}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getLeaveTypeIcon(leave.leaveType)}
          <span className="capitalize">{leave.leaveType}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{formatDate(leave.startDate)}</span>
          <span className="text-xs text-muted-foreground">to {formatDate(leave.endDate)}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={`${theme.bg} ${theme.text}`}>
          {calculateDuration(leave.startDate, leave.endDate)}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
      {activeTab === "pending" && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusUpdate(leave._id, "approved")
              }}
              disabled={processingApplicationId === leave._id}
            >
              {processingApplicationId === leave._id ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="mr-1 h-3 w-3" />
              )}
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation()
                handleStatusUpdate(leave._id, "rejected")
              }}
              disabled={processingApplicationId === leave._id}
            >
              {processingApplicationId === leave._id ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              Reject
            </Button>
          </div>
        </TableCell>
      )}
      {activeTab === "approved" && (
        <>
          <TableCell>{leave.approvedBy?.name || "System"}</TableCell>
          <TableCell>{leave.approvalDate ? formatDate(leave.approvalDate) : "N/A"}</TableCell>
        </>
      )}
      {activeTab === "rejected" && (
        <>
          <TableCell className="max-w-[200px] truncate">{leave.remarks || "N/A"}</TableCell>
          <TableCell>{leave.approvalDate ? formatDate(leave.approvalDate) : "N/A"}</TableCell>
        </>
      )}
    </TableRow>
  )

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20 p-6 rounded-lg border">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Leave Approvals
          </h1>
          <p className="text-muted-foreground">Manage and approve student leave applications</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500" />
            <Input
              type="search"
              placeholder="Search by name, ID, room, or reason..."
              className="w-full pl-10 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-500" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
              }}
              className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 bg-muted/80">
            <TabsTrigger
              value="pending"
              className="flex items-center gap-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-100"
            >
              Pending
              <Badge
                variant="secondary"
                className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              >
                {leaveApplications.filter((app) => app.status === "pending").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-100"
            >
              Approved
              <Badge
                variant="secondary"
                className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
              >
                {leaveApplications.filter((app) => app.status === "approved").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-900 dark:data-[state=active]:bg-red-900/30 dark:data-[state=active]:text-red-100"
            >
              Rejected
              <Badge
                variant="secondary"
                className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              >
                {leaveApplications.filter((app) => app.status === "rejected").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card className="border-amber-200 dark:border-amber-800/30 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 rounded-t-lg border-b border-amber-200 dark:border-amber-800/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <Clock className="h-5 w-5" />
                      Pending Leave Applications
                    </CardTitle>
                    <CardDescription>Leave applications awaiting your approval</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="px-2 py-1 bg-white dark:bg-gray-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/30"
                  >
                    {filteredApplications.length} {filteredApplications.length === 1 ? "application" : "applications"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <span className="ml-2">Loading applications...</span>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Search className="h-8 w-8" />
                    <p>No pending leave applications found</p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-b-md border border-amber-200 dark:border-amber-800/30">
                    <Table>
                      <TableHeader className="bg-amber-50 dark:bg-amber-900/20">
                        <TableRow className="border-b border-amber-200 dark:border-amber-800/30">
                          <TableHead className="w-[200px]">Student</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((leave) => renderApplicationRow(leave, getTabTheme("pending")))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card className="border-emerald-200 dark:border-emerald-800/30 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-t-lg border-b border-emerald-200 dark:border-emerald-800/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                      <CheckCircle className="h-5 w-5" />
                      Approved Leave Applications
                    </CardTitle>
                    <CardDescription>Leave applications that have been approved</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="px-2 py-1 bg-white dark:bg-gray-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/30"
                  >
                    {filteredApplications.length} {filteredApplications.length === 1 ? "application" : "applications"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <span className="ml-2">Loading applications...</span>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Search className="h-8 w-8" />
                    <p>No approved leave applications found</p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-b-md border border-emerald-200 dark:border-emerald-800/30">
                    <Table>
                      <TableHeader className="bg-emerald-50 dark:bg-emerald-900/20">
                        <TableRow className="border-b border-emerald-200 dark:border-emerald-800/30">
                          <TableHead className="w-[200px]">Student</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Approved By</TableHead>
                          <TableHead>Approved On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((leave) => renderApplicationRow(leave, getTabTheme("approved")))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <Card className="border-red-200 dark:border-red-800/30 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 rounded-t-lg border-b border-red-200 dark:border-red-800/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                      <XCircle className="h-5 w-5" />
                      Rejected Leave Applications
                    </CardTitle>
                    <CardDescription>Leave applications that have been rejected</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="px-2 py-1 bg-white dark:bg-gray-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800/30"
                  >
                    {filteredApplications.length} {filteredApplications.length === 1 ? "application" : "applications"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    <span className="ml-2">Loading applications...</span>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Search className="h-8 w-8" />
                    <p>No rejected leave applications found</p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-b-md border border-red-200 dark:border-red-800/30">
                    <Table>
                      <TableHeader className="bg-red-50 dark:bg-red-900/20">
                        <TableRow className="border-b border-red-200 dark:border-red-800/30">
                          <TableHead className="w-[200px]">Student</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead>Rejected On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((leave) => renderApplicationRow(leave, getTabTheme("rejected")))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Details Dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open && !processingApplicationId) {
              closeDialog()
            } else if (!open && processingApplicationId) {
              // Prevent dialog from closing during operations
              return false
            }
          }}
        >
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-purple-200 dark:border-purple-800/30">
            {selectedApplication ? (
              <>
                <DialogHeader className="border-b border-purple-100 dark:border-purple-800/20 pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800/30">
                      <AvatarImage src={selectedApplication.student.userId.profilePicture || "/placeholder.svg"} />
                      <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {selectedApplication.student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl text-purple-900 dark:text-purple-100 flex items-center gap-2">
                        {selectedApplication.student.name}
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs border-purple-200 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-900/20"
                        >
                          {getStatusBadge(selectedApplication.status)}
                        </Badge>
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-sm border-purple-200 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-900/20 flex items-center gap-1 font-medium"
                        >
                          <Hash className="h-4 w-4 text-purple-600" />
                          Student ID: {selectedApplication.student.studentId}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                {/* Student Information Card */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800/30 mt-4">
                  <h3 className="font-medium flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <User className="h-5 w-5" />
                    Student Information
                  </h3>
                  <Separator className="my-3 bg-indigo-200 dark:bg-indigo-800/50" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Hash className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Student ID</p>
                          <p className="font-medium text-lg">{selectedApplication.student.studentId}</p>
                        </div>
                      </div>

                      {selectedApplication.student.course && (
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Course</p>
                            <p className="font-medium">
                              {selectedApplication.student.course}
                              {selectedApplication.student.year && ` - Year ${selectedApplication.student.year}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedApplication.student.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{selectedApplication.student.email}</p>
                          </div>
                        </div>
                      )}

                      {selectedApplication.student.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{selectedApplication.student.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Room Information */}
                  {selectedApplication.student.roomId && (
                    <div className="mt-4 bg-white dark:bg-gray-900 p-4 rounded-md border border-indigo-100 dark:border-indigo-800/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Home className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-medium text-indigo-700 dark:text-indigo-300">Room Details</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-7">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Room Number</span>
                          <span className="font-medium flex items-center gap-1">
                            <Home className="h-3.5 w-3.5 text-indigo-600" />
                            {selectedApplication.student.roomId.roomNumber}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Block</span>
                          <span className="font-medium flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-indigo-600" />
                            {selectedApplication.student.roomId.block}
                          </span>
                        </div>

                        {selectedApplication.student.roomId.floor && (
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Floor</span>
                            <span className="font-medium flex items-center gap-1">
                              <Layers className="h-3.5 w-3.5 text-indigo-600" />
                              {selectedApplication.student.roomId.floor}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800/30">
                      <h3 className="font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <CalendarDays className="h-5 w-5" />
                        Leave Details
                      </h3>
                      <Separator className="my-3 bg-purple-200 dark:bg-purple-800/50" />
                      <div className="mt-3 space-y-3 pl-7">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <span className="flex items-center gap-1 font-medium">
                            {getLeaveTypeIcon(selectedApplication.leaveType)}
                            <span className="capitalize">{selectedApplication.leaveType}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">From:</span>
                          <span className="font-medium">{formatDate(selectedApplication.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">To:</span>
                          <span className="font-medium">{formatDate(selectedApplication.endDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Duration:</span>
                          <span className="font-medium">
                            {calculateDuration(selectedApplication.startDate, selectedApplication.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Applied On:</span>
                          <span className="font-medium">{formatDate(selectedApplication.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                      <h3 className="font-medium flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <MapPin className="h-5 w-5" />
                        Destination
                      </h3>
                      <Separator className="my-3 bg-emerald-200 dark:bg-emerald-800/50" />
                      <div className="mt-3 space-y-3 pl-7">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Going to:</span>
                          <span className="font-medium text-right max-w-[150px]">
                            {selectedApplication.destination}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Parent Approval:</span>
                          <span>
                            {selectedApplication.parentApproval ? (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Approved
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Not Approved
                              </Badge>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800/30">
                      <h3 className="font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Phone className="h-5 w-5" />
                        Contact Information
                      </h3>
                      <Separator className="my-3 bg-purple-200 dark:bg-purple-800/50" />
                      <div className="mt-3 space-y-3 pl-7">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Contact During Leave:</span>
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="h-4 w-4" />
                            {selectedApplication.contactDuringLeave}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800/30">
                      <h3 className="font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <FileText className="h-5 w-5" />
                        Reason & Remarks
                      </h3>
                      <Separator className="my-3 bg-purple-200 dark:bg-purple-800/50" />
                      <div className="mt-3 space-y-4 pl-7">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                          <p className="p-3 bg-white dark:bg-gray-900 rounded-md text-sm border border-purple-100 dark:border-purple-800/20">
                            {selectedApplication.reason}
                          </p>
                        </div>
                        {selectedApplication.remarks && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Remarks:</p>
                            <p className="p-3 bg-white dark:bg-gray-900 rounded-md text-sm border border-purple-100 dark:border-purple-800/20">
                              {selectedApplication.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedApplication.status === "pending" && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/30">
                        <h3 className="font-medium flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <AlertCircle className="h-5 w-5" />
                          Pending Action
                        </h3>
                        <Separator className="my-3 bg-amber-200 dark:bg-amber-800/50" />
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
                            onClick={() => {
                              handleStatusUpdate(selectedApplication._id, "approved")
                            }}
                            disabled={processingApplicationId === selectedApplication._id}
                          >
                            {processingApplicationId === selectedApplication._id ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-1 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                            onClick={() => {
                              handleStatusUpdate(selectedApplication._id, "rejected")
                            }}
                            disabled={processingApplicationId === selectedApplication._id}
                          >
                            {processingApplicationId === selectedApplication._id ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-1 h-4 w-4" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedApplication.status !== "pending" && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800/30">
                        <h3 className="font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
                          <Info className="h-5 w-5" />
                          Decision Information
                        </h3>
                        <Separator className="my-3 bg-purple-200 dark:bg-purple-800/50" />
                        <div className="mt-3 space-y-3 pl-7">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {selectedApplication.status === "approved" ? "Approved By:" : "Rejected By:"}
                            </span>
                            <span className="font-medium">{selectedApplication.approvedBy?.name || "System"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              {selectedApplication.status === "approved" ? "Approved On:" : "Rejected On:"}
                            </span>
                            <span className="font-medium">
                              {selectedApplication.approvalDate ? formatDate(selectedApplication.approvalDate) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
