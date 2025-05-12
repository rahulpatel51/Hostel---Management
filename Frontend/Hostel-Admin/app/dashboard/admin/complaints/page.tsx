"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Loader2,
  RefreshCw,
} from "lucide-react"
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

  useEffect(() => {
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
      console.error("Error fetching details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load complaint details",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsFetchingDetails(false)
    }
  }

  const handleRowClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    fetchComplaintDetails(complaint._id)
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

      toast({
        title: "Success",
        description: "Comment added successfully",
        duration: 3000,
      })

      await fetchComplaints()
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
          <Badge className="flex items-center gap-1 bg-sky-100 text-sky-800 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/40">
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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Complaints Management</h1>
          <Button
            onClick={fetchComplaints}
            variant="outline"
            className="gap-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
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
            <SelectTrigger className="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
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

      <Card className="border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 rounded-t-lg border-b border-gray-200 dark:border-gray-800 py-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-gray-900 dark:text-white text-xl">Student Complaints</CardTitle>
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
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow className="border-b border-gray-200 dark:border-gray-800">
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
                    className="cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
                    onClick={() => handleRowClick(complaint)}
                  >
                    <TableCell className="border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                          <AvatarImage
                            src={
                              complaint.submittedBy?.profilePicture ||
                              `https://ui-avatars.com/api/?name=${getUsernameFromEmail(complaint.submittedBy?.email)}&background=random`
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
                    <TableCell className="border-b border-gray-100 dark:border-gray-800">
                      <div className="space-y-1">
                        <p className="font-medium truncate max-w-[250px]" title={complaint.title}>
                          {complaint.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{complaint.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="border-b border-gray-100 dark:border-gray-800">
                      <Badge
                        variant="outline"
                        className="capitalize bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        {complaint.category.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-b border-gray-100 dark:border-gray-800 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{formatDate(complaint.createdAt)}</div>
                    </TableCell>
                    <TableCell className="border-b border-gray-100 dark:border-gray-800">
                      {getStatusBadge(complaint.status)}
                    </TableCell>
                    <TableCell className="text-right border-b border-gray-100 dark:border-gray-800">
                      <Select
                        value={complaint.status}
                        onValueChange={(value) => {
                          // Prevent row click when interacting with select
                          event?.stopPropagation()
                          updateStatus(complaint._id, value as Complaint["status"])
                        }}
                      >
                        <SelectTrigger
                          className="w-[150px] border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-lg">
          {selectedComplaint && (
            <>
              <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800">
                    <AvatarImage
                      src={
                        selectedComplaint.submittedBy?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${getUsernameFromEmail(selectedComplaint.submittedBy?.email)}&background=random`
                      }
                      alt={getUsernameFromEmail(selectedComplaint.submittedBy?.email)}
                    />
                    <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {getUsernameFromEmail(selectedComplaint.submittedBy?.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <DialogTitle
                      className="text-xl font-bold text-gray-900 dark:text-white truncate"
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
                    className="capitalize bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
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
                  <h3 className="font-medium text-lg text-gray-900 dark:text-white">Description</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                      {selectedComplaint.description}
                    </p>
                  </div>
                </div>

                {(selectedComplaint.response || selectedComplaint.status === "rejected") && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                      {selectedComplaint.status === "rejected" ? "Reason for Rejection" : "Resolution"}
                    </h3>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                        {selectedComplaint.response}
                      </p>
                    </div>
                  </div>
                )}

                {selectedComplaint.comments && selectedComplaint.comments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg text-gray-900 dark:text-white">Conversation</h3>
                    <div className="space-y-3">
                      {selectedComplaint.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className={`p-4 rounded-lg border ${
                            comment.author?.role === "admin"
                              ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                              <AvatarImage
                                src={
                                  comment.author?.profilePicture ||
                                  `https://ui-avatars.com/api/?name=${comment.author?.name}&background=random`
                                }
                                alt={comment.author?.name}
                              />
                              <AvatarFallback
                                className={
                                  comment.author?.role === "admin"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                }
                              >
                                {comment.author?.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {comment.author?.name || (comment.author?.role === "admin" ? "Admin" : "Student")}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-1.5 py-0.5 ${
                                      comment.author?.role === "admin"
                                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                                    }`}
                                  >
                                    {comment.author?.role === "admin" ? "Admin" : "Student"}
                                  </Badge>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 shrink-0 whitespace-nowrap">
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
                  <h3 className="font-medium text-lg text-gray-900 dark:text-white">Add Comment</h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your comment here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px] border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedComplaint(null)}
                        className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
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
  )
}
