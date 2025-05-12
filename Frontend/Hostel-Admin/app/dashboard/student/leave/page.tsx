"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Loader2,
  PlusCircle,
  CalendarDays,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
  Info,
  Phone,
  Home,
  HeartPulse,
  BookOpen,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, isBefore } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LeaveApplication {
  _id: string
  student: string
  leaveType: string
  startDate: Date
  endDate: Date
  reason: string
  destination: string
  contactDuringLeave: string
  parentApproval: boolean
  documents: string[]
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvalDate?: Date
  remarks?: string
  actualReturnDate?: Date
  createdAt: Date
  updatedAt: Date
}

interface LeaveFormData {
  leaveType: string
  startDate: Date | undefined
  endDate: Date | undefined
  reason: string
  destination: string
  contactDuringLeave: string
  parentApproval: boolean
}

const leaveTypeIcons = {
  home: <Home className="h-4 w-4 mr-2 text-purple-600" />,
  medical: <HeartPulse className="h-4 w-4 mr-2 text-rose-600" />,
  academic: <BookOpen className="h-4 w-4 mr-2 text-blue-600" />,
  emergency: <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />,
  other: <Info className="h-4 w-4 mr-2 text-slate-600" />,
}

export default function StudentLeavePage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null)
  const [newLeave, setNewLeave] = useState<LeaveFormData>({
    leaveType: "home",
    startDate: undefined,
    endDate: undefined,
    reason: "",
    destination: "",
    contactDuringLeave: "",
    parentApproval: false,
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const calculateDuration = (from: Date, to: Date): string => {
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`
  }

  const validateDates = (from: Date | undefined, to: Date | undefined): boolean => {
    if (!from || !to) return false
    if (isBefore(from, today)) return false
    if (isBefore(to, from)) return false
    return true
  }

  const fetchLeaveApplications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/student/leave", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch leave applications")
      }

      const data = await response.json()
      const applications = Array.isArray(data) ? data : data.data || []

      const formattedData = applications.map((app: any) => ({
        ...app,
        // Fix for the object rendering error - ensure student is a string
        student: typeof app.student === "object" ? app.student.fullName : app.student,
        startDate: new Date(app.startDate),
        endDate: new Date(app.endDate),
        createdAt: new Date(app.createdAt),
        updatedAt: new Date(app.updatedAt),
        ...(app.approvalDate && { approvalDate: new Date(app.approvalDate) }),
        ...(app.actualReturnDate && { actualReturnDate: new Date(app.actualReturnDate) }),
      }))

      setLeaveApplications(formattedData)
    } catch (error) {
      console.error("Error fetching leave applications:", error)
      setLeaveApplications([])
      toast({
        title: "Error",
        description: "Failed to load leave applications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaveApplications()
  }, [])

  const filteredApplications = leaveApplications.filter((app) =>
    activeTab === "all" ? true : app.status === activeTab,
  )

  const handleSubmitLeave = async () => {
    if (
      !newLeave.startDate ||
      !newLeave.endDate ||
      !newLeave.reason ||
      !newLeave.destination ||
      !newLeave.contactDuringLeave
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    if (!validateDates(newLeave.startDate, newLeave.endDate)) {
      toast({
        title: "Error",
        description: "Invalid date selection. Please check your dates.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const url = editingId
        ? `http://localhost:5000/api/student/leave/${editingId}/edit`
        : "http://localhost:5000/api/student/leave"

      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          leaveType: newLeave.leaveType,
          startDate: newLeave.startDate,
          endDate: newLeave.endDate,
          reason: newLeave.reason,
          destination: newLeave.destination,
          contactDuringLeave: newLeave.contactDuringLeave,
          parentApproval: newLeave.parentApproval,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message ||
            (editingId ? "Failed to update leave application" : "Failed to submit leave application"),
        )
      }

      await fetchLeaveApplications()

      toast({
        title: "Success",
        description: editingId ? "Leave application updated successfully" : "Leave application submitted successfully",
      })

      setNewLeave({
        leaveType: "home",
        startDate: undefined,
        endDate: undefined,
        reason: "",
        destination: "",
        contactDuringLeave: "",
        parentApproval: false,
      })
      setIsCreating(false)
      setEditingId(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (app: LeaveApplication) => {
    if (app.status !== "pending") {
      toast({
        title: "Cannot Edit",
        description: "Only pending leave applications can be edited",
        variant: "destructive",
      })
      return
    }

    setNewLeave({
      leaveType: app.leaveType,
      startDate: app.startDate,
      endDate: app.endDate,
      reason: app.reason,
      destination: app.destination,
      contactDuringLeave: app.contactDuringLeave,
      parentApproval: app.parentApproval,
    })
    setEditingId(app._id)
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave application?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/student/leave/${id}/delete`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete leave application")
      }

      setLeaveApplications((prev) => prev.filter((app) => app._id !== id))

      toast({
        title: "Success",
        description: "Leave application deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete application",
        variant: "destructive",
      })
      await fetchLeaveApplications()
    } finally {
      setIsLoading(false)
    }
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingId(null)
    setNewLeave({
      leaveType: "home",
      startDate: undefined,
      endDate: undefined,
      reason: "",
      destination: "",
      contactDuringLeave: "",
      parentApproval: false,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
    }
  }

  const leaveTypeOptions = [
    { value: "home", label: "Home Leave", icon: <Home className="h-4 w-4 mr-2 text-purple-600" /> },
    { value: "medical", label: "Medical Leave", icon: <HeartPulse className="h-4 w-4 mr-2 text-rose-600" /> },
    { value: "academic", label: "Academic Leave", icon: <BookOpen className="h-4 w-4 mr-2 text-blue-600" /> },
    { value: "emergency", label: "Emergency Leave", icon: <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" /> },
    { value: "other", label: "Other", icon: <Info className="h-4 w-4 mr-2 text-slate-600" /> },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Leave Management</h1>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Request and track your leave applications
            </CardDescription>
          </div>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Leave Request
            </Button>
          )}
        </div>
      </div>

     {isCreating && (
  <Card className="border-purple-200 dark:border-purple-800 shadow-md">
    <CardHeader className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
      <CardTitle className="text-purple-700 dark:text-purple-300">
        {editingId ? "Edit Leave Request" : "New Leave Request"}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Leave Type dropdown */}
          <div className="space-y-2">
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Leave Type
            </label>
            <select
              id="leaveType"
              value={newLeave.leaveType}
              onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {leaveTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Approval checkbox */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent Approval</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="parentApproval"
                checked={newLeave.parentApproval}
                onChange={(e) => setNewLeave({ ...newLeave, parentApproval: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label
                htmlFor="parentApproval"
                className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
              >
                Parent has approved this leave
              </label>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Start Date Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-purple-600" />
                  {newLeave.startDate ? format(newLeave.startDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="font-medium text-center text-purple-800 dark:text-purple-200">
                    {format(newLeave.startDate || new Date(), "MMMM yyyy")}
                  </h3>
                </div>
                <Calendar
                  mode="single"
                  selected={newLeave.startDate}
                  onSelect={(date) => {
                    if (date) {
                      setNewLeave((prev) => ({
                        ...prev,
                        startDate: date,
                        endDate: prev.endDate && isBefore(prev.endDate, date) ? undefined : prev.endDate,
                      }))
                    }
                  }}
                  disabled={(date) => isBefore(date, today)}
                  initialFocus
                  className="rounded-md border border-purple-200 dark:border-purple-800"
                  classNames={{
                    nav: "flex items-center justify-between px-2 pt-1",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-purple-600 hover:bg-purple-100 rounded",
                    nav_button_previous: "absolute left-2",
                    nav_button_next: "absolute right-2",
                    head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                    cell: "h-9 w-9 p-0 text-center text-sm hover:bg-purple-100 dark:hover:bg-purple-900",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
                    day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-700",
                    day_today: "border border-purple-400",
                    day_disabled: "text-gray-300 dark:text-gray-600 opacity-50",
                    day_outside: "text-gray-300 dark:text-gray-600 opacity-50",
                    day_range_middle: "aria-selected:bg-purple-100 aria-selected:text-purple-900 dark:aria-selected:bg-purple-800/50",
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                    IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                  }}
                />
              </PopoverContent>
            </Popover>
            {newLeave.startDate && isBefore(newLeave.startDate, today) && (
              <p className="text-sm text-red-500">Start date cannot be in the past</p>
            )}
          </div>

          {/* End Date Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                  disabled={!newLeave.startDate}
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-purple-600" />
                  {newLeave.endDate ? format(newLeave.endDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="font-medium text-center text-purple-800 dark:text-purple-200">
                    {format(newLeave.endDate || newLeave.startDate || new Date(), "MMMM yyyy")}
                  </h3>
                </div>
                <Calendar
                  mode="single"
                  selected={newLeave.endDate}
                  onSelect={(date) => date && setNewLeave((prev) => ({ ...prev, endDate: date }))}
                  disabled={(date) =>
                    !newLeave.startDate || isBefore(date, newLeave.startDate) || isBefore(date, today)
                  }
                  initialFocus
                  className="rounded-md border border-purple-200 dark:border-purple-800"
                  classNames={{
                    nav: "flex items-center justify-between px-2 pt-1",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-purple-600 hover:bg-purple-100 rounded",
                    nav_button_previous: "absolute left-2",
                    nav_button_next: "absolute right-2",
                    head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                    cell: "h-9 w-9 p-0 text-center text-sm hover:bg-purple-100 dark:hover:bg-purple-900",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
                    day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-700",
                    day_today: "border border-purple-400",
                    day_disabled: "text-gray-300 dark:text-gray-600 opacity-50",
                    day_outside: "text-gray-300 dark:text-gray-600 opacity-50",
                    day_range_middle: "aria-selected:bg-purple-100 aria-selected:text-purple-900 dark:aria-selected:bg-purple-800/50",
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                    IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                  }}
                />
              </PopoverContent>
            </Popover>
            {newLeave.endDate && newLeave.startDate && isBefore(newLeave.endDate, newLeave.startDate) && (
              <p className="text-sm text-red-500">End date must be after start date</p>
            )}
          </div>
        </div>

        {/* Date Summary */}
        {newLeave.startDate && newLeave.endDate && validateDates(newLeave.startDate, newLeave.endDate) && (
          <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800 dark:text-purple-200">
                {format(newLeave.startDate, "MMM d")} - {format(newLeave.endDate, "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800 dark:text-purple-200">
                {calculateDuration(newLeave.startDate, newLeave.endDate)}
              </span>
            </div>
          </div>
        )}

        {/* Destination and Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
            <input
              type="text"
              value={newLeave.destination}
              onChange={(e) => setNewLeave({ ...newLeave, destination: e.target.value })}
              placeholder="Where will you be during leave?"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact During Leave
            </label>
            <input
              type="text"
              value={newLeave.contactDuringLeave}
              onChange={(e) => setNewLeave({ ...newLeave, contactDuringLeave: e.target.value })}
              placeholder="Phone number where you can be reached"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Reason for Leave */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Leave</label>
          <Textarea
            value={newLeave.reason}
            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
            placeholder="Please provide details about your leave reason..."
            className="min-h-[120px] focus-visible:ring-purple-500"
          />
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 border-t p-4">
      <Button
        variant="outline"
        onClick={cancelForm}
        className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmitLeave}
        disabled={
          isLoading ||
          !newLeave.startDate ||
          !newLeave.endDate ||
          !newLeave.reason ||
          !newLeave.destination ||
          !newLeave.contactDuringLeave ||
          !validateDates(newLeave.startDate, newLeave.endDate)
        }
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {editingId ? "Updating..." : "Submitting..."}
          </>
        ) : editingId ? (
          "Update Request"
        ) : (
          "Submit Request"
        )}
      </Button>
    </CardFooter>
  </Card>
)} {isCreating && (
  <Card className="border-purple-200 dark:border-purple-800 shadow-md">
    <CardHeader className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
      <CardTitle className="text-purple-700 dark:text-purple-300">
        {editingId ? "Edit Leave Request" : "New Leave Request"}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Leave Type dropdown */}
          <div className="space-y-2">
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Leave Type
            </label>
            <select
              id="leaveType"
              value={newLeave.leaveType}
              onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {leaveTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Parent Approval checkbox */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent Approval</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="parentApproval"
                checked={newLeave.parentApproval}
                onChange={(e) => setNewLeave({ ...newLeave, parentApproval: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label
                htmlFor="parentApproval"
                className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300"
              >
                Parent has approved this leave
              </label>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Start Date Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-purple-600" />
                  {newLeave.startDate ? format(newLeave.startDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="font-medium text-center text-purple-800 dark:text-purple-200">
                    {format(newLeave.startDate || new Date(), "MMMM yyyy")}
                  </h3>
                </div>
                <Calendar
                  mode="single"
                  selected={newLeave.startDate}
                  onSelect={(date) => {
                    if (date) {
                      setNewLeave((prev) => ({
                        ...prev,
                        startDate: date,
                        endDate: prev.endDate && isBefore(prev.endDate, date) ? undefined : prev.endDate,
                      }))
                    }
                  }}
                  disabled={(date) => isBefore(date, today)}
                  initialFocus
                  className="rounded-md border border-purple-200 dark:border-purple-800"
                  classNames={{
                    nav: "flex items-center justify-between px-2 pt-1",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-purple-600 hover:bg-purple-100 rounded",
                    nav_button_previous: "absolute left-2",
                    nav_button_next: "absolute right-2",
                    head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                    cell: "h-9 w-9 p-0 text-center text-sm hover:bg-purple-100 dark:hover:bg-purple-900",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
                    day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-700",
                    day_today: "border border-purple-400",
                    day_disabled: "text-gray-300 dark:text-gray-600 opacity-50",
                    day_outside: "text-gray-300 dark:text-gray-600 opacity-50",
                    day_range_middle: "aria-selected:bg-purple-100 aria-selected:text-purple-900 dark:aria-selected:bg-purple-800/50",
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                    IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                  }}
                />
              </PopoverContent>
            </Popover>
            {newLeave.startDate && isBefore(newLeave.startDate, today) && (
              <p className="text-sm text-red-500">Start date cannot be in the past</p>
            )}
          </div>

          {/* End Date Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                  disabled={!newLeave.startDate}
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-purple-600" />
                  {newLeave.endDate ? format(newLeave.endDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="font-medium text-center text-purple-800 dark:text-purple-200">
                    {format(newLeave.endDate || newLeave.startDate || new Date(), "MMMM yyyy")}
                  </h3>
                </div>
                <Calendar
                  mode="single"
                  selected={newLeave.endDate}
                  onSelect={(date) => date && setNewLeave((prev) => ({ ...prev, endDate: date }))}
                  disabled={(date) =>
                    !newLeave.startDate || isBefore(date, newLeave.startDate) || isBefore(date, today)
                  }
                  initialFocus
                  className="rounded-md border border-purple-200 dark:border-purple-800"
                  classNames={{
                    nav: "flex items-center justify-between px-2 pt-1",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-purple-600 hover:bg-purple-100 rounded",
                    nav_button_previous: "absolute left-2",
                    nav_button_next: "absolute right-2",
                    head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                    cell: "h-9 w-9 p-0 text-center text-sm hover:bg-purple-100 dark:hover:bg-purple-900",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
                    day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-700",
                    day_today: "border border-purple-400",
                    day_disabled: "text-gray-300 dark:text-gray-600 opacity-50",
                    day_outside: "text-gray-300 dark:text-gray-600 opacity-50",
                    day_range_middle: "aria-selected:bg-purple-100 aria-selected:text-purple-900 dark:aria-selected:bg-purple-800/50",
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                    IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                  }}
                />
              </PopoverContent>
            </Popover>
            {newLeave.endDate && newLeave.startDate && isBefore(newLeave.endDate, newLeave.startDate) && (
              <p className="text-sm text-red-500">End date must be after start date</p>
            )}
          </div>
        </div>

        {/* Date Summary */}
        {newLeave.startDate && newLeave.endDate && validateDates(newLeave.startDate, newLeave.endDate) && (
          <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800 dark:text-purple-200">
                {format(newLeave.startDate, "MMM d")} - {format(newLeave.endDate, "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800 dark:text-purple-200">
                {calculateDuration(newLeave.startDate, newLeave.endDate)}
              </span>
            </div>
          </div>
        )}

        {/* Destination and Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
            <input
              type="text"
              value={newLeave.destination}
              onChange={(e) => setNewLeave({ ...newLeave, destination: e.target.value })}
              placeholder="Where will you be during leave?"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact During Leave
            </label>
            <input
              type="text"
              value={newLeave.contactDuringLeave}
              onChange={(e) => setNewLeave({ ...newLeave, contactDuringLeave: e.target.value })}
              placeholder="Phone number where you can be reached"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Reason for Leave */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Leave</label>
          <Textarea
            value={newLeave.reason}
            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
            placeholder="Please provide details about your leave reason..."
            className="min-h-[120px] focus-visible:ring-purple-500"
          />
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 border-t p-4">
      <Button
        variant="outline"
        onClick={cancelForm}
        className="border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmitLeave}
        disabled={
          isLoading ||
          !newLeave.startDate ||
          !newLeave.endDate ||
          !newLeave.reason ||
          !newLeave.destination ||
          !newLeave.contactDuringLeave ||
          !validateDates(newLeave.startDate, newLeave.endDate)
        }
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {editingId ? "Updating..." : "Submitting..."}
          </>
        ) : editingId ? (
          "Update Request"
        ) : (
          "Submit Request"
        )}
      </Button>
    </CardFooter>
  </Card>
)}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-4 bg-purple-50 dark:bg-purple-900/20 p-1 rounded-lg">
          <TabsTrigger
            value="all"
            className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm"
          >
            <Info className="h-4 w-4" /> All
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-300 data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4" /> Pending
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 data-[state=active]:shadow-sm"
          >
            <CheckCircle className="h-4 w-4" /> Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="flex items-center gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-300 data-[state=active]:shadow-sm"
          >
            <XCircle className="h-4 w-4" /> Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className="border-gray-200 dark:border-gray-700 shadow-md">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">All Applications</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {filteredApplications.length} leave applications
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  Today: {format(today, "MMM d, yyyy")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <CalendarDays className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No leave applications found</p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm mt-2"
                  >
                    Create New Request
                  </Button>
                </div>
              ) : (
                <div className="rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <TableRow>
                        <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Type</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Date Range</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Duration</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Destination</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Status</TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-medium">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow
                          key={leave._id}
                          className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 cursor-pointer border-b border-gray-100 dark:border-gray-800"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          <TableCell>
                            <div className="flex items-center">
                              {leaveTypeIcons[leave.leaveType as keyof typeof leaveTypeIcons] || leaveTypeIcons.other}
                              <span className="capitalize">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-purple-600" />
                              {format(leave.startDate, "MMM d")} - {format(leave.endDate, "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              {calculateDuration(leave.startDate, leave.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>{leave.destination}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(leave.status)}
                              {leave.remarks && (
                                <p className="text-xs text-muted-foreground max-w-[200px] truncate">{leave.remarks}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {leave.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEdit(leave)
                                    }}
                                    className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(leave._id)
                                    }}
                                    className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLeave(leave)
                                }}
                                className="text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card className="border-amber-200 dark:border-amber-800 shadow-md">
            <CardHeader className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-amber-700 dark:text-amber-300">Pending Applications</CardTitle>
                  <CardDescription className="text-amber-600 dark:text-amber-400">
                    {filteredApplications.length} pending leave applications
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                >
                  Awaiting Approval
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Same table content as "all" tab but with filtered data */}
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Clock className="h-12 w-12 text-amber-300 dark:text-amber-700" />
                  <p className="text-amber-600 dark:text-amber-400">No pending applications</p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm mt-2"
                  >
                    Create New Request
                  </Button>
                </div>
              ) : (
                <div className="rounded-md">
                  <Table>
                    <TableHeader className="bg-amber-50 dark:bg-amber-900/20">
                      <TableRow>
                        <TableHead className="text-amber-700 dark:text-amber-300 font-medium">Type</TableHead>
                        <TableHead className="text-amber-700 dark:text-amber-300 font-medium">Date Range</TableHead>
                        <TableHead className="text-amber-700 dark:text-amber-300 font-medium">Duration</TableHead>
                        <TableHead className="text-amber-700 dark:text-amber-300 font-medium">Destination</TableHead>
                        <TableHead className="text-amber-700 dark:text-amber-300 font-medium">Status</TableHead>
                        <TableHead className="text-right text-amber-700 dark:text-amber-300 font-medium">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow
                          key={leave._id}
                          className="hover:bg-amber-50/50 dark:hover:bg-amber-900/10 cursor-pointer border-b border-amber-100 dark:border-amber-800"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          <TableCell>
                            <div className="flex items-center">
                              {leaveTypeIcons[leave.leaveType as keyof typeof leaveTypeIcons] || leaveTypeIcons.other}
                              <span className="capitalize">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-amber-600" />
                              {format(leave.startDate, "MMM d")} - {format(leave.endDate, "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-600" />
                              {calculateDuration(leave.startDate, leave.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>{leave.destination}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">{getStatusBadge(leave.status)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(leave)
                                }}
                                className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(leave._id)
                                }}
                                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLeave(leave)
                                }}
                                className="text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card className="border-emerald-200 dark:border-emerald-800 shadow-md">
            <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-emerald-700 dark:text-emerald-300">Approved Applications</CardTitle>
                  <CardDescription className="text-emerald-600 dark:text-emerald-400">
                    {filteredApplications.length} approved leave applications
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> Approved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Same table content as "all" tab but with filtered data */}
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <CheckCircle className="h-12 w-12 text-emerald-300 dark:text-emerald-700" />
                  <p className="text-emerald-600 dark:text-emerald-400">No approved applications</p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm mt-2"
                  >
                    Create New Request
                  </Button>
                </div>
              ) : (
                <div className="rounded-md">
                  <Table>
                    <TableHeader className="bg-emerald-50 dark:bg-emerald-900/20">
                      <TableRow>
                        <TableHead className="text-emerald-700 dark:text-emerald-300 font-medium">Type</TableHead>
                        <TableHead className="text-emerald-700 dark:text-emerald-300 font-medium">Date Range</TableHead>
                        <TableHead className="text-emerald-700 dark:text-emerald-300 font-medium">Duration</TableHead>
                        <TableHead className="text-emerald-700 dark:text-emerald-300 font-medium">
                          Destination
                        </TableHead>
                        <TableHead className="text-emerald-700 dark:text-emerald-300 font-medium">Status</TableHead>
                        <TableHead className="text-right text-emerald-700 dark:text-emerald-300 font-medium">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow
                          key={leave._id}
                          className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 cursor-pointer border-b border-emerald-100 dark:border-emerald-800"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          <TableCell>
                            <div className="flex items-center">
                              {leaveTypeIcons[leave.leaveType as keyof typeof leaveTypeIcons] || leaveTypeIcons.other}
                              <span className="capitalize">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-emerald-600" />
                              {format(leave.startDate, "MMM d")} - {format(leave.endDate, "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-emerald-600" />
                              {calculateDuration(leave.startDate, leave.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>{leave.destination}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(leave.status)}
                              {leave.remarks && (
                                <p className="text-xs text-muted-foreground max-w-[200px] truncate">{leave.remarks}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLeave(leave)
                                }}
                                className="text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card className="border-rose-200 dark:border-rose-800 shadow-md">
            <CardHeader className="bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-rose-700 dark:text-rose-300">Rejected Applications</CardTitle>
                  <CardDescription className="text-rose-600 dark:text-rose-400">
                    {filteredApplications.length} rejected leave applications
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                >
                  <XCircle className="h-3 w-3 mr-1" /> Rejected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Same table content as "all" tab but with filtered data */}
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <XCircle className="h-12 w-12 text-rose-300 dark:text-rose-700" />
                  <p className="text-rose-600 dark:text-rose-400">No rejected applications</p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm mt-2"
                  >
                    Create New Request
                  </Button>
                </div>
              ) : (
                <div className="rounded-md">
                  <Table>
                    <TableHeader className="bg-rose-50 dark:bg-rose-900/20">
                      <TableRow>
                        <TableHead className="text-rose-700 dark:text-rose-300 font-medium">Type</TableHead>
                        <TableHead className="text-rose-700 dark:text-rose-300 font-medium">Date Range</TableHead>
                        <TableHead className="text-rose-700 dark:text-rose-300 font-medium">Duration</TableHead>
                        <TableHead className="text-rose-700 dark:text-rose-300 font-medium">Destination</TableHead>
                        <TableHead className="text-rose-700 dark:text-rose-300 font-medium">Status</TableHead>
                        <TableHead className="text-right text-rose-700 dark:text-rose-300 font-medium">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((leave) => (
                        <TableRow
                          key={leave._id}
                          className="hover:bg-rose-50/50 dark:hover:bg-rose-900/10 cursor-pointer border-b border-rose-100 dark:border-rose-800"
                          onClick={() => setSelectedLeave(leave)}
                        >
                          <TableCell>
                            <div className="flex items-center">
                              {leaveTypeIcons[leave.leaveType as keyof typeof leaveTypeIcons] || leaveTypeIcons.other}
                              <span className="capitalize">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-rose-600" />
                              {format(leave.startDate, "MMM d")} - {format(leave.endDate, "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-rose-600" />
                              {calculateDuration(leave.startDate, leave.endDate)}
                            </div>
                          </TableCell>
                          <TableCell>{leave.destination}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(leave.status)}
                              {leave.remarks && (
                                <p className="text-xs text-muted-foreground max-w-[200px] truncate">{leave.remarks}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedLeave(leave)
                                }}
                                className="text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Details Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
        {selectedLeave && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-purple-700 dark:text-purple-300 flex items-center gap-2">
                {leaveTypeIcons[selectedLeave.leaveType as keyof typeof leaveTypeIcons] || leaveTypeIcons.other}
                <span className="capitalize">{selectedLeave.leaveType} Leave Application</span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800 dark:text-purple-200">
                    {format(selectedLeave.startDate, "MMM d, yyyy")} - {format(selectedLeave.endDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800 dark:text-purple-200">
                    {calculateDuration(selectedLeave.startDate, selectedLeave.endDate)}
                  </span>
                </div>
                {getStatusBadge(selectedLeave.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Destination</h3>
                  <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                    {selectedLeave.destination}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact During Leave</h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                    <Phone className="h-4 w-4 text-purple-600" />
                    {selectedLeave.contactDuringLeave}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Parent Approval</h3>
                <Badge
                  variant={selectedLeave.parentApproval ? "default" : "outline"}
                  className={
                    selectedLeave.parentApproval
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : ""
                  }
                >
                  {selectedLeave.parentApproval ? "Approved by Parent" : "Not Approved by Parent"}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason for Leave</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                  <p className="whitespace-pre-line">{selectedLeave.reason}</p>
                </div>
              </div>

              {selectedLeave.remarks && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Remarks</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                    <p className="whitespace-pre-line">{selectedLeave.remarks}</p>
                  </div>
                </div>
              )}


              {selectedLeave.approvalDate && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval Date</h3>
                  <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-purple-600" />
                    {format(selectedLeave.approvalDate, "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted On</h3>
                  <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-purple-600" />
                    {format(selectedLeave.createdAt, "MMM d, yyyy h:mm a")}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                  <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    {format(selectedLeave.updatedAt, "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
