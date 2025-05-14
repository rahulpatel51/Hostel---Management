"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Bell,
  Calendar,
  CreditCard,
  Info,
  MessageSquare,
  Utensils,
  Clock,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Home,
  ShieldAlert,
  Star,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import axios from "axios"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

type Complaint = {
  _id: string
  title: string
  status: "pending" | "in_progress" | "resolved" | "rejected"
  category: string
  createdAt: string
  description?: string
}

type LeaveApplication = {
  _id: string
  leaveType: string
  startDate: string
  endDate: string
  status: "pending" | "approved" | "rejected"
  reason: string
  createdAt: string
}

type StudentData = {
  _id: string
  studentId: string
  userId: string
  name: string
  email: string
  phone?: string
  course: string
  year: string
  status: string
  address?: string
  faceId?: string
  image?: string
  room?: {
    _id: string
    block: string
    roomNumber: string
    floor: string
    capacity: number
    occupiedCount: number
    roomType: string
    facilities: string[]
    description?: string
    price?: number
    pricePeriod?: string
    imageUrl?: string
    roomId: string
    status: string
    occupants: any[]
  }
  feeDue?: number
  feeDueDate?: string
}

type Notice = {
  _id: string
  title: string
  content: string
  category: string
  importance: "high" | "medium" | "low"
  createdAt: string
  expiryDate: string
  isActive: boolean
  publishedBy?: {
    fullName?: string
    profilePicture?: string
  }
}

interface Review {
  _id: string
  userId: string | { _id: string }
  userName: string
  profilePicture: string
  avatar: string
  comment: string
  rating: number
  createdAt: string
}

interface MenuItem {
  _id: string
  day: string
  date: string
  breakfast: string
  lunch: string
  snacks: string
  dinner: string
  averageRating: number
  reviews: Review[]
}

export default function StudentDashboard() {
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState({
    complaints: true,
    leaves: true,
    student: true,
    notices: true,
    mess: true,
  })
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null)
  const [studentRating, setStudentRating] = useState(0)
  const [studentComment, setStudentComment] = useState("")
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  // Current day and date for mess menu
  const currentDate = new Date()
  const currentDayName = currentDate.toLocaleDateString("en-US", { weekday: "long" })

  // Meal types configuration
  const mealTypes = [
    { icon: "🍳", title: "Breakfast", key: "breakfast" },
    { icon: "🍲", title: "Lunch", key: "lunch" },
    { icon: "☕", title: "Snacks", key: "snacks" },
    { icon: "🍛", title: "Dinner", key: "dinner" },
  ]

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Authentication required")

        // Fetch student and room data using the same API as room-details-page
        const studentRoomRes = await axios.get(`${API_BASE_URL}/student/room-info`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (studentRoomRes.data?.success) {
          const studentWithRoom = studentRoomRes.data.data.student
          setStudentData(studentWithRoom)

          // Fetch other data
          // Fetch complaints
          const complaintsRes = await axios.get(`${API_BASE_URL}/student/complaints`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setComplaints(complaintsRes.data.data || [])

          // Fetch leave applications
          const leavesRes = await axios.get(`${API_BASE_URL}/student/leave`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setLeaveApplications(leavesRes.data.data || [])

          // Fetch notices
          const noticesRes = await axios.get(`${API_BASE_URL}/notices`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setNotices(noticesRes.data.data || [])

          // Fetch mess menu
          const menuRes = await axios.get(`${API_BASE_URL}/menu`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const processedData = menuRes.data.data.map((item: MenuItem) => ({
            ...item,
            reviews:
              item.reviews?.map((review) => ({
                ...review,
                userId: typeof review.userId === "object" && review.userId !== null ? review.userId._id : review.userId,
              })) || [],
          }))
          setMenuItems(processedData)
        } else {
          throw new Error(studentRoomRes.data?.message || "Failed to fetch student data")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading({
          complaints: false,
          leaves: false,
          student: false,
          notices: false,
          mess: false,
        })
      }
    }

    fetchData()
  }, [toast])

  // Get urgent notices (active and high importance)
  const urgentNotices = notices
    .filter(
      (notice) =>
        notice.isActive &&
        notice.importance === "high" &&
        (!notice.expiryDate || new Date(notice.expiryDate) > new Date()),
    )
    .slice(0, 3)

  // Count pending items
  const pendingComplaintsCount = complaints.filter((c) => c.status === "pending").length
  const pendingLeavesCount = leaveApplications.filter((l) => l.status === "pending").length

  // Status badge component
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-200",
        icon: <Clock className="h-3 w-3" />,
      },
      in_progress: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-200",
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
      },
      resolved: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-200",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      rejected: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-200",
        icon: <XCircle className="h-3 w-3" />,
      },
      approved: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-200",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      high: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-200",
        icon: <AlertTriangle className="h-3 w-3" />,
      },
      medium: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-200",
        icon: <Info className="h-3 w-3" />,
      },
      low: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-200",
        icon: <Bell className="h-3 w-3" />,
      },
    }

    const statusKey = status.toLowerCase() as keyof typeof variants
    const variant = variants[statusKey] || variants.pending

    return (
      <Badge className={`${variant.bg} ${variant.text} flex items-center gap-1 text-xs`}>
        {variant.icon}
        {status.replace("_", " ")}
      </Badge>
    )
  }

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const variants = {
      academic: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-200",
      },
      events: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-200",
      },
      maintenance: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-200",
      },
      general: {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-800 dark:text-gray-200",
      },
    }

    const categoryKey = category.toLowerCase() as keyof typeof variants
    const variant = variants[categoryKey] || variants.general

    return <Badge className={`${variant.bg} ${variant.text} capitalize`}>{category.toLowerCase()}</Badge>
  }

  // Mess menu specific functions
  const openFeedbackDialog = (menuItem: MenuItem) => {
    setCurrentMenuItem(menuItem)
    const existingReview = menuItem.reviews.find(
      (review) => review.userId.toString() === (studentData?._id || "").toString(),
    )
    if (existingReview) {
      setStudentRating(existingReview.rating)
      setStudentComment(existingReview.comment)
    } else {
      setStudentRating(0)
      setStudentComment("")
    }
    setIsFeedbackOpen(true)
  }

  const handleRatingChange = (rating: number) => {
    setStudentRating(rating)
  }

  const submitFeedback = async () => {
    if (!currentMenuItem) return

    try {
      const token = localStorage.getItem("token") || ""

      const response = await axios.post(
        `${API_BASE_URL}/menu/${currentMenuItem._id}/reviews`,
        {
          comment: studentComment,
          rating: studentRating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const updatedData = response.data

      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item._id === currentMenuItem._id
            ? {
                ...item,
                reviews: updatedData.data.reviews,
                averageRating: updatedData.data.averageRating,
              }
            : item,
        ),
      )

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted",
        className: "bg-green-500 text-white border-0",
      })

      setIsFeedbackOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to submit feedback"
          : "Failed to submit feedback",
        variant: "destructive",
      })
      console.error("Error submitting feedback:", error)
    }
  }

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={`star-${star}`}
            className={`h-5 w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} ${
              interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
            }`}
            onClick={() => interactive && handleRatingChange(star)}
          />
        ))}
      </div>
    )
  }

  // Get today's menu item
  const todayMenuItem = menuItems.find((item) => item.day === currentDayName)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-transparent p-6 -mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-2 border-b">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back,{" "}
          <span className="text-indigo-600 dark:text-indigo-400">
            {isLoading.student ? <Skeleton className="h-8 w-32 inline-block" /> : studentData?.name}
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Here's an overview of your hostel information and recent activities.
        </p>
      </div>

      {/* Urgent Notices Alert */}
      {urgentNotices.length > 0 && (
        <div className="space-y-2">
          {urgentNotices.map((notice) => (
            <Alert
              key={notice._id}
              className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20 border-red-200 dark:border-red-800 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <AlertTitle className="text-red-800 dark:text-red-200 font-medium">{notice.title}</AlertTitle>
                  <AlertDescription className="text-red-700 dark:text-red-300 line-clamp-2">
                    {notice.content}
                  </AlertDescription>
                  <div className="mt-2 flex gap-2">
                    {getCategoryBadge(notice.category)}
                    {getStatusBadge(notice.importance)}
                    {notice.expiryDate && (
                      <Badge variant="outline" className="text-red-700 dark:text-red-300">
                        Expires: {format(new Date(notice.expiryDate), "MMM d, yyyy")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Room Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-bl-full -z-0"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Room Details</CardTitle>
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Home className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading.student ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            ) : !studentData?.room ? (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">No room assigned</p>
                <Button variant="outline" size="sm" className="mt-2 h-8" asChild>
                  <Link href="/dashboard/student/room">
                    <Info className="h-3.5 w-3.5 mr-1.5" />
                    Details
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{studentData.room.roomNumber}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Block {studentData.room.block}, {studentData.room.floor}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="secondary" className="px-2 py-1 text-xs">
                    <User className="h-3 w-3 mr-1.5" />
                    {studentData.room.occupiedCount}/{studentData.room.capacity} Occupants
                  </Badge>
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link href="/dashboard/student/room">
                      <Info className="h-3.5 w-3.5 mr-1.5" />
                      Details
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fees Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-100/50 dark:bg-red-900/20 rounded-bl-full -z-0"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Fee Status</CardTitle>
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading.student ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{studentData?.feeDue?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {studentData?.feeDueDate
                    ? `Due by ${new Date(studentData.feeDueDate).toLocaleDateString()}`
                    : "No pending fees"}
                </p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    className={`h-8 w-full ${!studentData?.feeDue ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                    asChild
                  >
                    <Link href="/dashboard/student/fees">{!studentData?.feeDue ? "Fee Status" : "Pay Now"}</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Complaints Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/50 dark:bg-amber-900/20 rounded-bl-full -z-0"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Complaints</CardTitle>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading.complaints ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{complaints.length}</div>
                  {pendingComplaintsCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 py-0 text-xs">
                      {pendingComplaintsCount} Pending
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {complaints.length === 0 ? "No complaints submitted" : "Your recent complaints"}
                </p>
                {complaints.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {complaints.slice(0, 2).map((complaint) => (
                      <div key={complaint._id} className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-[120px]">{complaint.title}</span>
                        {getStatusBadge(complaint.status)}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    variant={complaints.length === 0 ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-full ${complaints.length === 0 ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                    asChild
                  >
                    <Link href="/dashboard/student/complaints">
                      {complaints.length === 0 ? "Submit Complaint" : "View All"}
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Leave Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100/50 dark:bg-purple-900/20 rounded-bl-full -z-0"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Leave Status</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading.leaves ? (
              <div className="space-y-3">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{leaveApplications.length}</div>
                  {pendingLeavesCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 py-0 text-xs">
                      {pendingLeavesCount} Pending
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {leaveApplications.length === 0 ? "No leave applications" : "Your recent leave applications"}
                </p>
                {leaveApplications.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {leaveApplications.slice(0, 2).map((leave) => (
                      <div key={leave._id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="capitalize">{leave.leaveType}</span>
                        </div>
                        {getStatusBadge(leave.status)}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    variant={leaveApplications.length === 0 ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-full ${leaveApplications.length === 0 ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                    asChild
                  >
                    <Link href="/dashboard/student/leave">
                      {leaveApplications.length === 0 ? "Apply Leave" : "View All"}
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="notices" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/10 dark:to-indigo-900/20 p-1">
          <TabsTrigger
            value="notices"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notices
          </TabsTrigger>
          <TabsTrigger
            value="mess"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
          >
            <Utensils className="h-4 w-4 mr-2" />
            Mess Menu
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Activities
          </TabsTrigger>
        </TabsList>

        {/* Notices Tab */}
        <TabsContent value="notices" className="border rounded-lg mt-3 p-0 overflow-hidden">
          <div className="divide-y">
            {isLoading.notices ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-4 rounded-full mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notices.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notices available</h3>
                <p className="mt-1 text-sm text-muted-foreground">Check back later for important announcements.</p>
              </div>
            ) : (
              notices.slice(0, 5).map((notice) => (
                <div
                  key={notice._id}
                  className="p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        notice.importance === "high"
                          ? "bg-red-100 dark:bg-red-900/20"
                          : notice.importance === "medium"
                            ? "bg-amber-100 dark:bg-amber-900/20"
                            : "bg-indigo-100 dark:bg-indigo-900/20"
                      }`}
                    >
                      <Bell
                        className={`h-4 w-4 ${
                          notice.importance === "high"
                            ? "text-red-600 dark:text-red-400"
                            : notice.importance === "medium"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-indigo-600 dark:text-indigo-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white">{notice.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notice.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getCategoryBadge(notice.category)}
                        {getStatusBadge(notice.importance)}
                        {notice.expiryDate && (
                          <Badge variant="outline" className="text-xs">
                            Expires: {format(new Date(notice.expiryDate), "MMM d, yyyy")}
                          </Badge>
                        )}
                        {!notice.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/notices">View All Notices ({notices.length})</Link>
            </Button>
          </div>
        </TabsContent>

        {/* Enhanced Mess Menu Tab */}
        <TabsContent value="mess" className="border rounded-lg mt-3 p-0 overflow-hidden">
          {isLoading.mess ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : menuItems.length === 0 ? (
            <div className="p-8 text-center">
              <Utensils className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No menu available</h3>
              <p className="mt-1 text-sm text-muted-foreground">The mess menu hasn't been published yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Today's Menu Highlight */}
              {todayMenuItem && (
                <div className="p-6 pb-4 bg-blue-50 dark:bg-blue-900/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <Utensils className="h-5 w-5" />
                      Today's Menu ({todayMenuItem.day})
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{todayMenuItem.averageRating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {mealTypes.map((meal) => (
                      <Card key={`today-${meal.key}`} className="border-blue-100 dark:border-blue-900/30">
                        <CardHeader className="p-3 pb-0">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span className="text-lg">{meal.icon}</span>
                            {meal.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <p className="text-sm whitespace-pre-line">{todayMenuItem[meal.key as keyof MenuItem]}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFeedbackDialog(todayMenuItem)}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Provide Feedback
                    </Button>
                  </div>
                </div>
              )}

              {/* Weekly Menu */}
              <div className="p-6">
                <h3 className="font-medium text-lg mb-4">Weekly Menu</h3>
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <Card key={`menu-${item._id}`} className="border-gray-200 dark:border-gray-700">
                      <CardHeader
                        className="p-4 pb-2 cursor-pointer"
                        onClick={() => setExpandedDay(expandedDay === item._id ? null : item._id)}
                      >
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {item.day}
                            {item.day === currentDayName && (
                              <Badge className="ml-2" variant="secondary">
                                Today
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{item.averageRating?.toFixed(1) || "0.0"}</span>
                            </div>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${expandedDay === item._id ? "rotate-180" : ""}`}
                            />
                          </div>
                        </div>
                      </CardHeader>

                      {expandedDay === item._id && (
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-2 gap-3">
                            {mealTypes.map((meal) => (
                              <div key={`${item._id}-${meal.key}`} className="space-y-1">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <span>{meal.icon}</span> {meal.title}
                                </h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                  {item[meal.key as keyof MenuItem]}
                                </p>
                              </div>
                            ))}
                          </div>

                          {item.day === currentDayName && (
                            <div className="mt-4 flex justify-end">
                              <Button size="sm" onClick={() => openFeedbackDialog(item)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Rate Today's Meals
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="border rounded-lg mt-3 p-0 overflow-hidden">
          {isLoading.complaints || isLoading.leaves || isLoading.notices ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Combine complaints, leaves, and notices into a single activity feed */}
              {(() => {
                // Create combined activities array
                const activities = [
                  ...complaints.map((item) => ({
                    id: item._id,
                    type: "complaint",
                    title: item.title,
                    status: item.status,
                    category: item.category,
                    date: new Date(item.createdAt),
                    description: item.description || "No description provided",
                  })),
                  ...leaveApplications.map((item) => ({
                    id: item._id,
                    type: "leave",
                    title: `${item.leaveType} Leave`,
                    status: item.status,
                    startDate: new Date(item.startDate),
                    endDate: new Date(item.endDate),
                    date: new Date(item.createdAt),
                    description: item.reason,
                  })),
                  ...notices.map((item) => ({
                    id: item._id,
                    type: "notice",
                    title: item.title,
                    status: item.importance,
                    category: item.category,
                    date: new Date(item.createdAt),
                    description: item.content,
                    isActive: item.isActive,
                  })),
                ]

                // Sort by date (newest first)
                activities.sort((a, b) => b.date.getTime() - a.date.getTime())

                return activities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No recent activities</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Your recent activities will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activities.slice(0, 5).map((activity) => (
                      <div
                        key={`${activity.type}-${activity.id}`}
                        className="p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
                      >
                        <div className="flex gap-3 items-start">
                          <div
                            className={`p-2 rounded-full ${
                              activity.type === "complaint"
                                ? "bg-amber-100 dark:bg-amber-900/20"
                                : activity.type === "leave"
                                  ? "bg-purple-100 dark:bg-purple-900/20"
                                  : "bg-indigo-100 dark:bg-indigo-900/20"
                            }`}
                          >
                            {activity.type === "complaint" && (
                              <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            )}
                            {activity.type === "leave" && (
                              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            )}
                            {activity.type === "notice" && (
                              <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                {activity.title}
                                <Badge variant="outline" className="capitalize ml-2">
                                  {activity.type}
                                </Badge>
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {format(activity.date, "MMM d, yyyy")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {getStatusBadge(activity.status)}
                              {activity.type === "leave" && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.type === "leave" &&
                                    "startDate" in activity &&
                                    "endDate" in activity &&
                                    `${format(activity.startDate, "MMM d")} - ${format(activity.endDate, "MMM d, yyyy")}`}
                                </Badge>
                              )}
                              {activity.type === "complaint" &&
                                "category" in activity &&
                                getCategoryBadge(activity.category)}
                              {activity.type === "notice" &&
                                "category" in activity &&
                                activity.category &&
                                getCategoryBadge(activity.category)}
                              {activity.type === "notice" && "isActive" in activity && activity.isActive === false && (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="p-4 border-t text-center">
                      <div className="flex justify-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/student/complaints">Complaints</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/student/leave">Leave</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/student/notices">Notices</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">{currentMenuItem?.day} Meal Feedback</DialogTitle>
            <DialogDescription>Share your experience about today's meals</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                How would you rate today's meals?
              </label>
              <div className="flex items-center gap-4">
                {renderStars(studentRating, true)}
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {studentRating > 0 ? `${studentRating} star${studentRating !== 1 ? "s" : ""}` : "Not rated yet"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your comments
              </label>
              <Textarea
                id="comment"
                value={studentComment}
                onChange={(e) => setStudentComment(e.target.value)}
                placeholder="What did you like or dislike about the meals? Any suggestions?"
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitFeedback}
              disabled={studentRating === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
