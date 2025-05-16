"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, CheckCircle2, ClipboardList, Download, Edit, Eye, FileText, Filter, Info, Loader2, MoreHorizontal, PanelLeft, Plus, Search, Send, Tag, Trash2, Upload, Users } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Notice = {
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

const API_BASE_URL = "http://localhost:5000/api/notices"

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add request interceptor to include JWT token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error("Session expired. Please login again.")
        // Redirect to login page
        window.location.href = "/login"
      } else if (error.response.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("An error occurred. Please try again.")
      }
    } else {
      toast.error("Network error. Please check your connection.")
    }
    return Promise.reject(error)
  },
)

export default function NoticesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    category: "general" as "general" | "academic" | "hostel" | "event" | "emergency" | "other",
    importance: "normal" as "normal" | "important" | "urgent",
    targetAudience: ["all"] as ("all" | "students" | "wardens" | "admin")[],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
    attachments: [] as string[],
  })

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)

  // Fetch notices from backend
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data } = await api.get("/")
        if (data.success) {
          setNotices(data.data)
        }
      } catch (error) {
        console.error("Error fetching notices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotices()
  }, [])

  useEffect(() => {
    // Check if there's an ID in the URL query parameters
    const params = new URLSearchParams(window.location.search)
    const noticeId = params.get("id")

    if (noticeId && notices.length > 0) {
      const notice = notices.find((n) => n._id === noticeId)
      if (notice) {
        setSelectedNotice(notice)
        setIsViewDialogOpen(true)
      }
    }
  }, [notices])

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice._id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || notice.category.toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory && notice.isActive
  })

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      toast.error("Title and content are required")
      return
    }

    try {
      setIsSubmitting(true)
      const { data } = await api.post("/", newNotice)
      if (data.success) {
        setNotices([data.data, ...notices])
        resetNewNoticeForm()
        setActiveTab("all")
        toast.success("Notice published successfully", {
          description: "Your notice has been published and is now visible to the target audience.",
          action: {
            label: "View",
            onClick: () => {
              setSelectedNotice(data.data)
              setIsViewDialogOpen(true)
            },
          },
        })
      }
    } catch (error) {
      console.error("Error creating notice:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetNewNoticeForm = () => {
    setNewNotice({
      title: "",
      content: "",
      category: "general",
      importance: "normal",
      targetAudience: ["all"],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
      attachments: [],
    })
    setIsPreviewMode(false)
  }

  const handleUpdateNotice = async () => {
    if (!selectedNotice) return

    try {
      setIsSubmitting(true)
      const { data } = await api.put(`/${selectedNotice._id}`, selectedNotice)
      if (data.success) {
        setNotices(notices.map((notice) => (notice._id === selectedNotice._id ? data.data : notice)))
        setIsEditDialogOpen(false)
        toast.success("Notice updated successfully", {
          description: "Your changes have been saved and are now visible.",
        })
      }
    } catch (error) {
      console.error("Error updating notice:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNotice = async () => {
    if (!selectedNotice) return

    try {
      setIsSubmitting(true)
      const { data } = await api.delete(`/${selectedNotice._id}`)
      if (data.success) {
        setNotices(notices.filter((notice) => notice._id !== selectedNotice._id))
        setIsDeleteDialogOpen(false)
        toast.success("Notice deleted successfully", {
          description: "The notice has been permanently removed from the system.",
        })
      }
    } catch (error) {
      console.error("Error deleting notice:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleNoticeStatus = async (noticeId: string, isActive: boolean) => {
    try {
      const { data } = await api.patch(`/${noticeId}/status`, { isActive })
      if (data.success) {
        setNotices(notices.map((notice) => (notice._id === noticeId ? { ...notice, isActive } : notice)))
        toast.success(`Notice ${isActive ? "activated" : "deactivated"}`, {
          description: isActive ? "The notice is now visible to users." : "The notice has been deactivated.",
        })
      }
    } catch (error) {
      console.error("Error toggling notice status:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("attachment", file)

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const { data } = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        },
      })

      if (data.success) {
        setNewNotice({
          ...newNotice,
          attachments: [...newNotice.attachments, data.fileUrl],
        })
        toast.success("File uploaded successfully", {
          description: `${file.name} has been attached to the notice.`,
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file", {
        description: "Please check your connection and try again.",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...newNotice.attachments]
    updatedAttachments.splice(index, 1)
    setNewNotice({
      ...newNotice,
      attachments: updatedAttachments,
    })
    toast.success("Attachment removed", {
      description: "The file has been removed from this notice.",
    })
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleAudienceChange = (value: string) => {
    if (value === "all") {
      setNewNotice({ ...newNotice, targetAudience: ["all"] })
    } else {
      setNewNotice({
        ...newNotice,
        targetAudience: newNotice.targetAudience.includes("all")
          ? [value as "students" | "wardens" | "admin"]
          : newNotice.targetAudience.includes(value as any)
            ? newNotice.targetAudience.filter((a) => a !== value)
            : [...newNotice.targetAudience, value as "students" | "wardens" | "admin"],
      })
    }
  }

  const isAudienceSelected = (audience: string) => {
    return newNotice.targetAudience.includes("all")
      ? audience === "all"
      : newNotice.targetAudience.includes(audience as any)
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
        return "text-rose-400"
      case "important":
        return "text-amber-400"
      default:
        return "text-emerald-400"
    }
  }

  if (isLoading && notices.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6 bg-[#121212]">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[300px] bg-gray-800" />
          <Skeleton className="h-5 w-[400px] bg-gray-800" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-gray-800" />
          <Skeleton className="h-[400px] w-full bg-gray-800" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 text-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20 p-6 rounded-lg border">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Notices Management
        </h1>
        <p className="text-muted-foreground">Create and manage notices and announcements for your institution</p>
      </div>

      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-gray-900 border border-gray-800">
          <TabsTrigger
            value="all"
            className="flex items-center gap-2 data-[state=active]:bg-purple-900/60 data-[state=active]:text-purple-300"
          >
            <FileText className="h-4 w-4" />
            <span>All Notices</span>
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="flex items-center gap-2 data-[state=active]:bg-purple-900/60 data-[state=active]:text-purple-300"
          >
            <Plus className="h-4 w-4" />
            <span>Create Notice</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search notices by title, content or ID..."
                className="w-full pl-8 bg-gray-900 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 focus:ring-purple-500/30 focus:border-purple-500/50">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
                className="border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>

          <Card className="border-gray-800 bg-gray-900 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-900/80 rounded-t-lg pb-4 border-b border-gray-800">
              <div>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <FileText className="h-5 w-5 text-purple-400" />
                  All Notices
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Showing {filteredNotices.length} of {notices.length} notices
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-800 text-gray-300">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                    <p>Loading notices...</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-b-lg">
                  <Table>
                    <TableHeader className="bg-gray-900/50">
                      <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400">Title</TableHead>
                        <TableHead className="text-gray-400">Category</TableHead>
                        <TableHead className="text-gray-400">Published</TableHead>
                        <TableHead className="text-gray-400">Expires</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotices.length > 0 ? (
                        filteredNotices.map((notice) => (
                          <TableRow key={notice._id} className="border-gray-800 hover:bg-gray-800/50 transition-colors">
                            <TableCell className="font-medium max-w-[200px] truncate">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn("h-2 w-2 rounded-full", getImportanceColor(notice.importance))}
                                ></span>
                                {notice.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getCategoryBadgeVariant(notice.category)}
                                className="flex items-center gap-1.5 capitalize bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700"
                              >
                                {getCategoryIcon(notice.category)}
                                {notice.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-400">{formatDate(notice.createdAt)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-400">{formatDate(notice.expiryDate)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="default"
                                  className="flex items-center gap-1.5 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/50"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Active
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:bg-gray-800">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
                                    <DropdownMenuLabel className="text-gray-400">Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedNotice(notice)
                                        setIsViewDialogOpen(true)
                                        window.history.pushState(
                                          {},
                                          "",
                                          `http://localhost:3000/dashboard/admin/notices?id=${notice._id}`,
                                        )
                                      }}
                                      className="flex items-center cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedNotice({ ...notice })
                                        setIsEditDialogOpen(true)
                                        window.history.pushState(
                                          {},
                                          "",
                                          `http://localhost:3000/dashboard/admin/notices?id=${notice._id}`
                                        )
                                      }}
                                      className="flex items-center cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        toggleNoticeStatus(notice._id, !notice.isActive)
                                      }}
                                      className="flex items-center cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-800" />
                                    <DropdownMenuItem
                                      className="text-rose-400 focus:text-rose-400 hover:bg-gray-800 focus:bg-gray-800 flex items-center cursor-pointer"
                                      onClick={() => {
                                        setSelectedNotice(notice)
                                        setIsDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="border-gray-800">
                          <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-8 w-8 text-gray-600" />
                              <p className="text-lg font-medium">No notices found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                              <Button
                                variant="outline"
                                className="mt-2 border-gray-700 text-purple-400 hover:bg-gray-800 hover:text-purple-300"
                                onClick={() => setActiveTab("create")}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Notice
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-4 space-y-6">
          <Card className="border-gray-800 bg-gray-900 shadow-xl overflow-hidden">
            <CardHeader className="bg-gray-900/80 rounded-t-lg pb-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-purple-300">
                    <Plus className="h-5 w-5 text-purple-400" />
                    Create New Notice
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Fill out the form below to create a new notice
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="gap-2 border-gray-700 hover:bg-gray-800 text-gray-300"
                  >
                    {isPreviewMode ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit Mode
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={cn("space-y-6 p-6", isPreviewMode ? "hidden" : "block")}>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                  Notice Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter notice title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-300">
                    Category *
                  </Label>
                  <Select
                    value={newNotice.category}
                    onValueChange={(value) =>
                      setNewNotice({
                        ...newNotice,
                        category: value as "general" | "academic" | "hostel" | "event" | "emergency" | "other",
                      })
                    }
                  >
                    <SelectTrigger
                      id="category"
                      className="bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="general" className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-purple-400" />
                        <span>General</span>
                      </SelectItem>
                      <SelectItem value="academic" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-purple-400" />
                        <span>Academic</span>
                      </SelectItem>
                      <SelectItem value="hostel" className="flex items-center gap-2">
                        <PanelLeft className="h-4 w-4 text-purple-400" />
                        <span>Hostel</span>
                      </SelectItem>
                      <SelectItem value="event" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <span>Event</span>
                      </SelectItem>
                      <SelectItem value="emergency" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                        <span>Emergency</span>
                      </SelectItem>
                      <SelectItem value="other" className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-400" />
                        <span>Other</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importance" className="text-sm font-medium text-gray-300">
                    Importance *
                  </Label>
                  <Select
                    value={newNotice.importance}
                    onValueChange={(value) =>
                      setNewNotice({
                        ...newNotice,
                        importance: value as "normal" | "important" | "urgent",
                      })
                    }
                  >
                    <SelectTrigger
                      id="importance"
                      className="bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                    >
                      <SelectValue placeholder="Select importance level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="normal" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        <span>Normal</span>
                      </SelectItem>
                      <SelectItem value="important" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                        <span>Important</span>
                      </SelectItem>
                      <SelectItem value="urgent" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                        <span>Urgent</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Target Audience *</Label>
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isAudienceSelected("all") ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAudienceChange("all")}
                          className={cn(
                            "gap-1.5",
                            isAudienceSelected("all")
                              ? "bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 border-purple-700"
                              : "border-gray-700 hover:bg-gray-800 text-gray-300",
                          )}
                        >
                          <Users className="h-3.5 w-3.5" />
                          All
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-gray-800">
                        <p>Send to everyone</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isAudienceSelected("students") ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAudienceChange("students")}
                          className={cn(
                            "gap-1.5",
                            isAudienceSelected("students")
                              ? "bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 border-purple-700"
                              : "border-gray-700 hover:bg-gray-800 text-gray-300",
                          )}
                        >
                          <Users className="h-3.5 w-3.5" />
                          Students
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-gray-800">
                        <p>Send to students only</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isAudienceSelected("wardens") ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAudienceChange("wardens")}
                          className={cn(
                            "gap-1.5",
                            isAudienceSelected("wardens")
                              ? "bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 border-purple-700"
                              : "border-gray-700 hover:bg-gray-800 text-gray-300",
                          )}
                        >
                          <Users className="h-3.5 w-3.5" />
                          Wardens
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-gray-800">
                        <p>Send to wardens only</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isAudienceSelected("admin") ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAudienceChange("admin")}
                          className={cn(
                            "gap-1.5",
                            isAudienceSelected("admin")
                              ? "bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 border-purple-700"
                              : "border-gray-700 hover:bg-gray-800 text-gray-300",
                          )}
                        >
                          <Users className="h-3.5 w-3.5" />
                          Admin
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 border-gray-800">
                        <p>Send to administrators only</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-300">
                  Expiry Date *
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <Input
                    type="date"
                    id="expiryDate"
                    min={new Date().toISOString().split("T")[0]}
                    value={newNotice.expiryDate}
                    onChange={(e) => setNewNotice({ ...newNotice, expiryDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-gray-300">
                  Notice Content *
                </Label>
                <Textarea
                  id="content"
                  placeholder="Enter notice content here..."
                  className="min-h-[200px] bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Attachments</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="attachment"
                      className={cn(
                        "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2",
                        isUploading && "opacity-70 pointer-events-none",
                      )}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload File
                        </>
                      )}
                      <input
                        id="attachment"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {isUploading && (
                      <div className="flex-1">
                        <Progress value={uploadProgress} className="h-2 bg-gray-800" />
                        <p className="text-xs text-gray-400 mt-1">{uploadProgress}% uploaded</p>
                      </div>
                    )}
                  </div>

                  {newNotice.attachments.length > 0 && (
                    <div className="border border-gray-800 rounded-lg divide-y divide-gray-800">
                      {newNotice.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="p-3 flex justify-between items-center hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-purple-400" />
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {attachment.split("/").pop()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                            className="text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            {/* Preview Mode */}
            {isPreviewMode && (
              <CardContent className="space-y-6 p-6 bg-gray-900 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getCategoryBadgeVariant(newNotice.category)}
                      className="flex items-center gap-1.5 capitalize bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700"
                    >
                      {getCategoryIcon(newNotice.category)}
                      {newNotice.category}
                    </Badge>
                    <Badge
                      variant={
                        newNotice.importance === "urgent"
                          ? "destructive"
                          : newNotice.importance === "important"
                            ? "secondary"
                            : "outline"
                      }
                      className={cn(
                        "capitalize",
                        newNotice.importance === "urgent"
                          ? "bg-rose-900/30 text-rose-400 hover:bg-rose-900/50 border border-rose-800/50"
                          : newNotice.importance === "important"
                            ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 border border-amber-800/50"
                            : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/50",
                      )}
                    >
                      {newNotice.importance}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">Expires: {formatDate(newNotice.expiryDate)}</div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-purple-300">{newNotice.title || "Notice Title"}</h2>
                  <p className="text-sm text-gray-400 mt-1">For: {newNotice.targetAudience.join(", ")}</p>
                </div>

                <Separator className="bg-gray-800" />

                <div className="prose prose-sm max-w-none prose-headings:text-purple-300 prose-a:text-purple-400 prose-invert">
                  {newNotice.content ? (
                    newNotice.content.split("\n").map((paragraph, i) => <p key={i}>{paragraph}</p>)
                  ) : (
                    <p className="text-gray-500 italic">Notice content will appear here...</p>
                  )}
                </div>

                {newNotice.attachments.length > 0 && (
                  <>
                    <Separator className="bg-gray-800" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-300">Attachments</h3>
                      <div className="grid gap-2">
                        {newNotice.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-purple-400 hover:underline p-2 border border-gray-800 rounded-md hover:bg-gray-800 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Attachment {index + 1} - {attachment.split("/").pop()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            )}

            <CardFooter className="flex justify-end gap-2 pt-4 pb-6 px-6 bg-gray-900/80 rounded-b-lg border-t border-gray-800">
              <Button
                variant="outline"
                onClick={() => {
                  resetNewNoticeForm()
                  setActiveTab("all")
                }}
                className="border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNotice}
                disabled={!newNotice.title || !newNotice.content || isSubmitting}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publish Notice
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Notice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open)
        if (!open) {
          window.history.pushState({}, "", "/dashboard/admin/notices")
        }
      }}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[80vh] overflow-hidden p-0 border-gray-800 bg-gray-900"
        >
          <DialogHeader className="p-6 pb-2 bg-gray-900/80 border-b border-gray-800">
            <DialogTitle className="text-xl text-purple-300">{selectedNotice?.title}</DialogTitle>
            {/* Fix: Replace DialogDescription with div to avoid nesting Badge (div) inside p element */}
            <div className="flex items-center gap-2 mt-2 text-gray-400">
              <Badge
                variant={getCategoryBadgeVariant(selectedNotice?.category || "general")}
                className="flex items-center gap-1.5 capitalize bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700"
              >
                {getCategoryIcon(selectedNotice?.category || "general")}
                {selectedNotice?.category}
              </Badge>
              <span>•</span>
              <span>Published: {selectedNotice && formatDate(selectedNotice.createdAt)}</span>
            </div>
          </DialogHeader>
          {selectedNotice && (
            <ScrollArea className="max-h-[calc(80vh-120px)]">
              <div className="space-y-4 p-6 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize flex items-center gap-1.5 border-gray-700">
                    <Users className="h-3 w-3" />
                    {selectedNotice.targetAudience.join(", ")}
                  </Badge>
                  <Badge
                    variant={
                      selectedNotice.importance === "urgent"
                        ? "destructive"
                        : selectedNotice.importance === "important"
                          ? "secondary"
                          : "outline"
                    }
                    className={cn(
                      "capitalize",
                      selectedNotice.importance === "urgent"
                        ? "bg-rose-900/30 text-rose-400 hover:bg-rose-900/50 border border-rose-800/50"
                        : selectedNotice.importance === "important"
                          ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 border border-amber-800/50"
                          : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/50",
                    )}
                  >
                    {selectedNotice.importance}
                  </Badge>
                  <Badge
                    variant="default"
                    className="flex items-center gap-1.5 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/50"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                  <span className="text-sm text-gray-400">Expires: {formatDate(selectedNotice.expiryDate)}</span>
                </div>

                <Separator className="bg-gray-800" />

                <div className="prose prose-sm prose-invert max-w-none">
                  {selectedNotice.content.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                  <>
                    <Separator className="bg-gray-800" />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-300">Attachments</Label>
                      <div className="grid gap-2">
                        {selectedNotice.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-purple-400 hover:underline p-2 border border-gray-800 rounded-md hover:bg-gray-800 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Attachment {index + 1} - {attachment.split("/").pop()}
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="bg-gray-800" />

                <div className="space-y-2 text-sm bg-gray-800/50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Published By:</span>
                    <span className="font-medium text-gray-300">
                      {selectedNotice.publishedBy?.fullName || "System"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="font-medium text-gray-300">{formatDate(selectedNotice.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-800 bg-gray-900/80">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setIsViewDialogOpen(false)
                setSelectedNotice({ ...selectedNotice! })
                setIsEditDialogOpen(true)
              }}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          window.history.pushState({}, "", "/dashboard/admin/notices")
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden p-0 border-gray-800 bg-gray-900">
          <DialogHeader className="p-6 pb-2 bg-gray-900/80 border-b border-gray-800">
            <DialogTitle className="flex items-center gap-2 text-purple-300">
              <Edit className="h-5 w-5 text-purple-400" />
              Edit Notice
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Make changes to the notice below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <ScrollArea className="max-h-[calc(80vh-180px)]">
              <div className="space-y-4 p-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-sm font-medium text-gray-300">
                    Title *
                  </Label>
                  <Input
                    id="edit-title"
                    value={selectedNotice.title}
                    onChange={(e) =>
                      setSelectedNotice({
                        ...selectedNotice,
                        title: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category" className="text-sm font-medium text-gray-300">
                      Category *
                    </Label>
                    <Select
                      value={selectedNotice.category}
                      onValueChange={(value) =>
                        setSelectedNotice({
                          ...selectedNotice,
                          category: value as "general" | "academic" | "hostel" | "event" | "emergency" | "other",
                        })
                      }
                    >
                      <SelectTrigger
                        id="edit-category"
                        className="bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800">
                        <SelectItem value="general" className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-purple-400" />
                          <span>General</span>
                        </SelectItem>
                        <SelectItem value="academic" className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-purple-400" />
                          <span>Academic</span>
                        </SelectItem>
                        <SelectItem value="hostel" className="flex items-center gap-2">
                          <PanelLeft className="h-4 w-4 text-purple-400" />
                          <span>Hostel</span>
                        </SelectItem>
                        <SelectItem value="event" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span>Event</span>
                        </SelectItem>
                        <SelectItem value="emergency" className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-rose-400" />
                          <span>Emergency</span>
                        </SelectItem>
                        <SelectItem value="other" className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-purple-400" />
                          <span>Other</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-importance" className="text-sm font-medium text-gray-300">
                      Importance *
                    </Label>
                    <Select
                      value={selectedNotice.importance}
                      onValueChange={(value) =>
                        setSelectedNotice({
                          ...selectedNotice,
                          importance: value as "normal" | "important" | "urgent",
                        })
                      }
                    >
                      <SelectTrigger
                        id="edit-importance"
                        className="bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                      >
                        <SelectValue placeholder="Select importance" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800">
                        <SelectItem value="normal" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          <span>Normal</span>
                        </SelectItem>
                        <SelectItem value="important" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                          <span>Important</span>
                        </SelectItem>
                        <SelectItem value="urgent" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                          <span>Urgent</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Target Audience *</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedNotice.targetAudience.includes("all") ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedNotice({
                          ...selectedNotice,
                          targetAudience: ["all"],
                        })
                      }
                      className={cn(
                        "gap-1.5",
                        selectedNotice.targetAudience.includes("all")
                          ? "bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 border-purple-700"
                          : "border-gray-700 hover:bg-gray-800 text-gray-300",
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      All
                    </Button>
                    <Button
                      variant={selectedNotice.targetAudience.includes("students") ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedNotice({
                          ...selectedNotice,
                          targetAudience: selectedNotice.targetAudience.includes("all")
                            ? ["students"]
                            : selectedNotice.targetAudience.includes("students")
                              ? selectedNotice.targetAudience.filter((a) => a !== "students")
                              : [...selectedNotice.targetAudience, "students"],
                        })
                      }
                      className={cn(
                        "gap-1.5",
                        selectedNotice.targetAudience.includes("students")
                          ? "bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 border-purple-700"
                          : "border-gray-700 hover:bg-gray-800 text-gray-300",
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Students
                    </Button>
                    <Button
                      variant={selectedNotice.targetAudience.includes("wardens") ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedNotice({
                          ...selectedNotice,
                          targetAudience: selectedNotice.targetAudience.includes("all")
                            ? ["wardens"]
                            : selectedNotice.targetAudience.includes("wardens")
                              ? selectedNotice.targetAudience.filter((a) => a !== "wardens")
                              : [...selectedNotice.targetAudience, "wardens"],
                        })
                      }
                      className={cn(
                        "gap-1.5",
                        selectedNotice.targetAudience.includes("wardens")
                          ? "bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 border-purple-700"
                          : "border-gray-700 hover:bg-gray-800 text-gray-300",
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Wardens
                    </Button>
                    <Button
                      variant={selectedNotice.targetAudience.includes("admin") ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedNotice({
                          ...selectedNotice,
                          targetAudience: selectedNotice.targetAudience.includes("all")
                            ? ["admin"]
                            : selectedNotice.targetAudience.includes("admin")
                              ? selectedNotice.targetAudience.filter((a) => a !== "admin")
                              : [...selectedNotice.targetAudience, "admin"],
                        })
                      }
                      className={cn(
                        "gap-1.5",
                        selectedNotice.targetAudience.includes("admin")
                          ? "bg-purple-900/60 hover:bg-purple-900/80 text-purple-300 border-purple-700"
                          : "border-gray-700 hover:bg-gray-800 text-gray-300",
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Admin
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-expiry-date" className="text-sm font-medium text-gray-300">
                    Expiry Date *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <Input
                      id="edit-expiry-date"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedNotice.expiryDate.split("T")[0]}
                      onChange={(e) =>
                        setSelectedNotice({
                          ...selectedNotice,
                          expiryDate: e.target.value,
                        })
                      }
                      className="bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-content" className="text-sm font-medium text-gray-300">
                    Content *
                  </Label>
                  <Textarea
                    id="edit-content"
                    className="min-h-[150px] bg-gray-800 border-gray-700 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                    value={selectedNotice.content}
                    onChange={(e) =>
                      setSelectedNotice({
                        ...selectedNotice,
                        content: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-active"
                      checked={selectedNotice.isActive}
                      onCheckedChange={(checked) =>
                        setSelectedNotice({
                          ...selectedNotice,
                          isActive: Boolean(checked),
                        })
                      }
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <Label htmlFor="edit-active" className="text-sm font-medium leading-none text-gray-300">
                      Active Notice
                    </Label>
                  </div>
                  <p className="text-sm text-gray-400">
                    {selectedNotice.isActive
                      ? "This notice is currently visible to users"
                      : "This notice is not visible to users"}
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-800 bg-gray-900/80">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNotice}
              disabled={isSubmitting}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Notice Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <Trash2 className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. Are you sure you want to permanently delete this notice?
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-4 p-4 border border-rose-900/30 rounded-md bg-rose-900/10">
                <div className="bg-rose-900/20 p-2 rounded-md">
                  <Trash2 className="h-6 w-6 text-rose-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-200">{selectedNotice.title}</h4>
                  <p className="text-sm text-gray-400">Published: {formatDate(selectedNotice.createdAt)}</p>
                  <p className="text-sm text-gray-400">Expires: {formatDate(selectedNotice.expiryDate)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNotice}
              disabled={isSubmitting}
              className="gap-2 bg-rose-600 hover:bg-rose-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Notice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
