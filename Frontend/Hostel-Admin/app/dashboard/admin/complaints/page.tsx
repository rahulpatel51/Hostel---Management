"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, AlertCircle, CheckCircle2, Clock, XCircle, MessageSquare, Loader2, RefreshCw, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type Complaint = {
  _id: string
  title: string
  description: string
  category: string
  status: "pending" | "in_progress" | "resolved" | "rejected"
  roomNumber: string
  submittedBy: {
    _id: string
    email: string
    studentId: string
    profilePicture?: string
  }
  comments?: {
    _id: string
    text: string
    createdAt: string
    author: {
      role: string
      _id: string
      name: string
      profilePicture?: string
    }
  }[]
  response?: string
  createdAt: string
  updatedAt?: string
  resolvedAt?: string
}

export default function ComplaintsManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "resolved" | "rejected">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  // Check for complaint ID in URL on component mount
  useEffect(() => {
    const complaintId = searchParams.get('id')
    if (complaintId) {
      fetchComplaintDetails(complaintId)
    }
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/admin/complaints", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch complaints")
      }

      const data = await response.json()
      const complaintsArray = Array.isArray(data) ? data : data.data || data.complaints || []

      if (!Array.isArray(complaintsArray)) {
        throw new Error("Invalid data format received from server")
      }

      setComplaints(complaintsArray)
      setFilteredComplaints(complaintsArray)

      // If there's a complaint ID in URL but no selected complaint yet
      const complaintId = searchParams.get('id')
      if (complaintId && !selectedComplaint) {
        const complaint = complaintsArray.find(c => c._id === complaintId)
        if (complaint) {
          setSelectedComplaint(complaint)
        } else {
          // If not found in initial fetch, fetch details separately
          fetchComplaintDetails(complaintId)
        }
      }
    } catch (error: any) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load complaints",
        variant: "destructive",
        duration: 3000,
      })
      setComplaints([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComplaintDetails = async (id: string) => {
    setIsFetchingDetails(true)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch complaint details")
      }

      const data = await response.json()
      setSelectedComplaint(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load complaint details",
        variant: "destructive",
        duration: 3000,
      })
      // Remove invalid ID from URL
      if (searchParams.get('id') === id) {
        router.replace('/dashboard/admin/complaints')
      }
    } finally {
      setIsFetchingDetails(false)
    }
  }

  const handleRowClick = (complaint: Complaint) => {
    // Update URL with complaint ID
    router.push(`/dashboard/admin/complaints?id=${complaint._id}`, { scroll: false })
    setSelectedComplaint(complaint)
  }

  const handleDialogClose = () => {
    // Remove the ID from URL when dialog is closed
    router.push('/dashboard/admin/complaints', { scroll: false })
    setSelectedComplaint(null)
  }

  const getUsernameFromEmail = (email: string) => {
    return email ? email.split("@")[0] : "user"
  }

  useEffect(() => {
    let filtered = [...complaints]

    if (statusFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.category === categoryFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (complaint) =>
          complaint.title.toLowerCase().includes(term) ||
          complaint.description.toLowerCase().includes(term) ||
          (complaint.submittedBy?.email?.toLowerCase()?.includes(term) ?? false) ||
          complaint.roomNumber.toLowerCase().includes(term) ||
          (complaint.submittedBy?.studentId?.toLowerCase()?.includes(term) ?? false),
      )
    }

    setFilteredComplaints(filtered)
  }, [searchTerm, statusFilter, categoryFilter, complaints])

  const updateStatus = async (id: string, newStatus: Complaint["status"]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update status")
      }

      const updatedComplaint = await response.json()

      setComplaints((prev) =>
        prev.map((complaint) => (complaint._id === updatedComplaint._id ? updatedComplaint : complaint)),
      )

      // Update selected complaint if it's the one being updated
      if (selectedComplaint?._id === updatedComplaint._id) {
        setSelectedComplaint(updatedComplaint)
      }

      toast({
        title: "Success",
        description: `Status updated to ${newStatus.replace("_", " ")}`,
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !selectedComplaint) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${selectedComplaint._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        credentials: "include",
        body: JSON.stringify({ text: newComment }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const updatedComplaint = await response.json()
      setSelectedComplaint(updatedComplaint)
      setNewComment("")

      // Update the complaints list with the new comment
      setComplaints(prev => 
        prev.map(c => c._id === updatedComplaint._id ? updatedComplaint : c)
      )

      toast({
        title: "Success",
        description: "Comment added successfully",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="flex items-center gap-1 bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/40">
            <AlertCircle className="h-3 w-3" />
            In Progress
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="flex items-center gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40">
            <CheckCircle2 className="h-3 w-3" />
            Resolved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="flex items-center gap-1 bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/40">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const categories = [...new Set(complaints.map((c) => c.category))]

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch {
      return dateString
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20 p-6 rounded-lg border">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Complaints Management
          </h1>
          <p className="text-muted-foreground">Manage and respond to student complaints</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={fetchComplaints}
                variant="outline"
                className="gap-2 border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-500" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-500" />
                  <SelectValue placeholder="Filter by category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-purple-200 dark:border-purple-800/30 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 rounded-t-lg border-b border-purple-200 dark:border-purple-800/30 py-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-purple-900 dark:text-purple-100 text-xl">Student Complaints</CardTitle>
              <Badge
                variant="secondary"
                className="ml-auto bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
              >
                {filteredComplaints.length} {filteredComplaints.length === 1 ? "complaint" : "complaints"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <Search className="h-8 w-8" />
                <p>No complaints found matching your criteria</p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setCategoryFilter("all")
                  }}
                  className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-purple-50 dark:bg-purple-950/20">
                  <TableRow className="border-b border-purple-200 dark:border-purple-800/30">
                    <TableHead className="w-[200px] font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Complaint</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow
                      key={complaint._id}
                      className="cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors border-b border-purple-200 dark:border-purple-800/30"
                      onClick={() => handleRowClick(complaint)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-purple-200 dark:border-purple-800/30">
                            <AvatarImage
                              src={
                                complaint.submittedBy?.profilePicture ||
                                `https://ui-avatars.com/api/?name=${getUsernameFromEmail(complaint.submittedBy?.email) || "user"}&background=random`
                              }
                              alt={getUsernameFromEmail(complaint.submittedBy?.email)}
                            />
                            <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {getUsernameFromEmail(complaint.submittedBy?.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">@{getUsernameFromEmail(complaint.submittedBy?.email)}</p>
                            <p className="text-xs text-muted-foreground">
                              {complaint.roomNumber} • {complaint.submittedBy?.studentId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium truncate max-w-[250px]" title={complaint.title}>
                            {complaint.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{complaint.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30"
                        >
                          {complaint.category.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{formatDate(complaint.createdAt)}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={complaint.status}
                          onValueChange={(value) => {
                            // Prevent row click when interacting with select
                            event?.stopPropagation()
                            updateStatus(complaint._id, value as Complaint["status"])
                          }}
                        >
                          <SelectTrigger
                            className="w-[150px] border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Complaint Details Dialog */}
        <Dialog 
          open={!!selectedComplaint} 
          onOpenChange={(open) => {
            if (!open) {
              handleDialogClose()
            }
          }}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto border border-purple-200 dark:border-purple-800/30 shadow-lg">
            {selectedComplaint && (
              <>
                <DialogHeader className="border-b border-purple-200 dark:border-purple-800/30 pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800/30">
                      <AvatarImage
                        src={
                          selectedComplaint.submittedBy?.profilePicture ||
                          `https://ui-avatars.com/api/?name=${getUsernameFromEmail(selectedComplaint.submittedBy?.email) || "user"}&background=random`
                        }
                        alt={getUsernameFromEmail(selectedComplaint.submittedBy?.email)}
                      />
                      <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {getUsernameFromEmail(selectedComplaint.submittedBy?.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <DialogTitle
                        className="text-xl font-bold text-purple-900 dark:text-purple-100 truncate"
                        title={selectedComplaint.title}
                      >
                        {selectedComplaint.title}
                      </DialogTitle>
                      <DialogDescription className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>@{getUsernameFromEmail(selectedComplaint.submittedBy?.email)}</span>
                        <span>•</span>
                        <span>{selectedComplaint.roomNumber}</span>
                        <span>•</span>
                        <span>{selectedComplaint.submittedBy?.studentId}</span>
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge
                      variant="outline"
                      className="capitalize bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30"
                    >
                      {selectedComplaint.category.toLowerCase()}
                    </Badge>
                    {getStatusBadge(selectedComplaint.status)}
                    <div className="text-sm text-muted-foreground ml-auto whitespace-nowrap">
                      Submitted: {formatDate(selectedComplaint.createdAt)}
                    </div>
                  </div>
                  {selectedComplaint.resolvedAt && (
                    <div className="text-sm text-muted-foreground mt-1 text-right">
                      Resolved: {formatDate(selectedComplaint.resolvedAt)}
                    </div>
                  )}
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg text-purple-900 dark:text-purple-100">Description</h3>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800/30">
                      <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {selectedComplaint.description}
                      </p>
                    </div>
                  </div>

                  {(selectedComplaint.response || selectedComplaint.status === "rejected") && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg text-purple-900 dark:text-purple-100">
                        {selectedComplaint.status === "rejected" ? "Reason for Rejection" : "Resolution"}
                      </h3>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                        <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                          {selectedComplaint.response}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedComplaint.comments && selectedComplaint.comments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-purple-900 dark:text-purple-100">Conversation</h3>
                      <div className="space-y-3">
                        {selectedComplaint.comments.map((comment) => (
                          <div
                            key={comment._id}
                            className={`p-4 rounded-lg border ${
                              comment.author?.role === "admin"
                                ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30"
                                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 border border-purple-200 dark:border-purple-800/30">
                                {comment.author?.profilePicture ? (
                                  <AvatarImage
                                    src={comment.author.profilePicture || "/placeholder.svg"}
                                    alt={comment.author?.name || "User"}
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <User className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                  </div>
                                )}
                                <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                  {comment.author?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                      {comment.author?.name || (comment.author?.role === "admin" ? "Admin" : "Student")}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs px-1.5 py-0.5 ${
                                        comment.author?.role === "admin"
                                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800/30"
                                          : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/30"
                                      }`}
                                    >
                                      {comment.author?.role === "admin" ? "Admin" : "Student"}
                                    </Badge>
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg text-purple-900 dark:text-purple-100">Add Comment</h3>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your comment here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={handleDialogClose}
                          className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          Close
                        </Button>
                        <Button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || isSubmittingComment || isFetchingDetails}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {isSubmittingComment ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            "Post Comment"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}