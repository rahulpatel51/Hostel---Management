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
import {
  Calendar,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Tag,
  Trash2,
  Upload,
  Users,
  School,
  Building,
  CalendarDays,
  AlertTriangle,
  Megaphone,
  Moon,
  Sun,
} from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

type Notice = {
  _id: string
  title: string
  content: string
  category: "general" | "academic" | "hostel" | "event" | "emergency" | "other"
  importance: "normal" | "important" | "urgent"
  publishedBy: string
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
    console.error("API Error:", error.response?.data || error.message)
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
  const { theme, setTheme } = useTheme()
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

  // Set dark theme as default
  useEffect(() => {
    setTheme("dark")
  }, [setTheme])

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice._id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || notice.category.toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      toast.error("Title and content are required")
      return
    }

    try {
      setIsSubmitting(true)

      // Create a copy of the newNotice object with the publishedBy field
      const noticeToCreate = {
        ...newNotice,
        // Use a string ID instead of an object
        publishedBy: localStorage.getItem("userId") || "1", // Fallback to '1' if userId is not in localStorage
      }

      console.log("Sending notice data:", noticeToCreate)

      const { data } = await api.post("/", noticeToCreate)
      if (data.success) {
        setNotices([data.data, ...notices])
        resetNewNoticeForm()
        setActiveTab("all")
        toast.success("Notice published successfully", {
          description: "Your notice has been published and is now visible to the target audience.",
        })
      }
    } catch (error) {
      console.error("Error creating notice:", error)
      toast.error("Failed to create notice. Please check your input and try again.")
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
        return <CalendarDays className="h-4 w-4" />
      case "emergency":
        return <AlertTriangle className="h-4 w-4" />
      case "academic":
        return <School className="h-4 w-4" />
      case "hostel":
        return <Building className="h-4 w-4" />
      case "general":
        return <Megaphone className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "urgent":
        return "text-rose-500 dark:text-rose-400"
      case "important":
        return "text-amber-500 dark:text-amber-400"
      default:
        return "text-emerald-500 dark:text-emerald-400"
    }
  }

  if (isLoading && notices.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6 bg-background">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-5 w-[400px]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-500 dark:from-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
            Notices Management
          </h1>
          <p className="text-muted-foreground">Create and manage notices and announcements for your institution</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>All Notices</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Notice</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notices by title or content..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] bg-card border-border/50">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
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
                className="border-border/50 bg-card"
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <Card className="border-border/40 shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/30 rounded-t-lg border-b border-border/30 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  All Notices
                </CardTitle>
                <CardDescription>
                  Showing {filteredNotices.length} of {notices.length} notices
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2 border-border/50 bg-card">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                    <p>Loading notices...</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-b-lg">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-muted/50">
                        <TableHead className="font-medium">Title</TableHead>
                        <TableHead className="font-medium">Category</TableHead>
                        <TableHead className="font-medium">Created</TableHead>
                        <TableHead className="font-medium">Expires</TableHead>
                        <TableHead className="text-right font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotices.length > 0 ? (
                        filteredNotices.map((notice) => (
                          <TableRow key={notice._id} className="hover:bg-muted/30 border-b border-border/20">
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
                                className="flex items-center gap-1.5 capitalize font-medium"
                              >
                                {getCategoryIcon(notice.category)}
                                {notice.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">{formatDate(notice.createdAt)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">{formatDate(notice.expiryDate)}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedNotice(notice)
                                      setIsViewDialogOpen(true)
                                    }}
                                    className="flex items-center cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4 text-indigo-500" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedNotice({ ...notice })
                                      setIsEditDialogOpen(true)
                                    }}
                                    className="flex items-center cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4 text-amber-500" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive flex items-center cursor-pointer"
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
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-8 w-8 text-muted-foreground/50" />
                              <p className="text-lg font-medium">No notices found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                              <Button
                                variant="outline"
                                className="mt-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
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
          <Card className="border-border/40 shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30 rounded-t-lg border-b border-border/30 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    Create New Notice
                  </CardTitle>
                  <CardDescription>Fill out the form below to create a new notice</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="gap-2 border-border/50 bg-card"
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
                <Label htmlFor="title" className="text-sm font-medium">
                  Notice Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter notice title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="focus-visible:ring-indigo-500/20 border-border/50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
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
                    <SelectTrigger id="category" className="focus-visible:ring-indigo-500/20 border-border/50 bg-card">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general" className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-indigo-500" />
                        <span>General</span>
                      </SelectItem>
                      <SelectItem value="academic" className="flex items-center gap-2">
                        <School className="h-4 w-4 text-blue-500" />
                        <span>Academic</span>
                      </SelectItem>
                      <SelectItem value="hostel" className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-amber-500" />
                        <span>Hostel</span>
                      </SelectItem>
                      <SelectItem value="event" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-purple-500" />
                        <span>Event</span>
                      </SelectItem>
                      <SelectItem value="emergency" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        <span>Emergency</span>
                      </SelectItem>
                      <SelectItem value="other" className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>Other</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importance" className="text-sm font-medium">
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
                      className="focus-visible:ring-indigo-500/20 border-border/50 bg-card"
                    >
                      <SelectValue placeholder="Select importance level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span>Normal</span>
                      </SelectItem>
                      <SelectItem value="important" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                        <span>Important</span>
                      </SelectItem>
                      <SelectItem value="urgent" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        <span>Urgent</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Target Audience *</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={isAudienceSelected("all") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAudienceChange("all")}
                    className={cn(
                      "gap-1.5",
                      isAudienceSelected("all")
                        ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        : "border-border/50 bg-card",
                    )}
                  >
                    <Users className="h-3.5 w-3.5" />
                    All
                  </Button>
                  <Button
                    variant={isAudienceSelected("students") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAudienceChange("students")}
                    className={cn(
                      "gap-1.5",
                      isAudienceSelected("students")
                        ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        : "border-border/50 bg-card",
                    )}
                  >
                    <School className="h-3.5 w-3.5" />
                    Students
                  </Button>
                  <Button
                    variant={isAudienceSelected("wardens") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAudienceChange("wardens")}
                    className={cn(
                      "gap-1.5",
                      isAudienceSelected("wardens")
                        ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        : "border-border/50 bg-card",
                    )}
                  >
                    <Building className="h-3.5 w-3.5" />
                    Wardens
                  </Button>
                  <Button
                    variant={isAudienceSelected("admin") ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAudienceChange("admin")}
                    className={cn(
                      "gap-1.5",
                      isAudienceSelected("admin")
                        ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        : "border-border/50 bg-card",
                    )}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Admin
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-sm font-medium">
                  Expiry Date *
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    id="expiryDate"
                    min={new Date().toISOString().split("T")[0]}
                    value={newNotice.expiryDate}
                    onChange={(e) => setNewNotice({ ...newNotice, expiryDate: e.target.value })}
                    className="focus-visible:ring-indigo-500/20 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  Notice Content *
                </Label>
                <Textarea
                  id="content"
                  placeholder="Enter notice content here..."
                  className="min-h-[200px] focus-visible:ring-indigo-500/20 border-border/50"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Attachments</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="attachment"
                      className={cn(
                        "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 h-10 px-4 py-2",
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
                        <Progress value={uploadProgress} className="h-2 bg-indigo-100 dark:bg-indigo-950" />
                        <p className="text-xs text-muted-foreground mt-1">{uploadProgress}% uploaded</p>
                      </div>
                    )}
                  </div>

                  {newNotice.attachments.length > 0 && (
                    <div className="border rounded-lg divide-y divide-border/30 border-border/50">
                      {newNotice.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="p-3 flex justify-between items-center hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {attachment.split("/").pop()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
              <CardContent className="space-y-6 p-6 bg-card rounded-md border border-border/30 m-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getCategoryBadgeVariant(newNotice.category)}
                      className="flex items-center gap-1.5 capitalize font-medium"
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
                      className="capitalize font-medium"
                    >
                      {newNotice.importance}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Expires: {formatDate(newNotice.expiryDate)}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold">{newNotice.title || "Notice Title"}</h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    For: {newNotice.targetAudience.join(", ")}
                  </p>
                </div>

                <Separator className="bg-border/30" />

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {newNotice.content ? (
                    newNotice.content.split("\n").map((paragraph, i) => <p key={i}>{paragraph}</p>)
                  ) : (
                    <p className="text-muted-foreground italic">Notice content will appear here...</p>
                  )}
                </div>

                {newNotice.attachments.length > 0 && (
                  <>
                    <Separator className="bg-border/30" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Attachments</h3>
                      <div className="grid gap-2">
                        {newNotice.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline p-2 border border-border/30 rounded-md hover:bg-muted/50 transition-colors"
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

            <CardFooter className="flex justify-end gap-2 pt-4 pb-6 px-6 bg-muted/30 rounded-b-lg border-t border-border/30">
              <Button
                variant="outline"
                onClick={() => {
                  resetNewNoticeForm()
                  setActiveTab("all")
                }}
                className="border-border/50 bg-card"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNotice}
                disabled={!newNotice.title || !newNotice.content || isSubmitting}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2 bg-muted/30 border-b border-border/30">
            <DialogTitle className="text-xl">{selectedNotice?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-2">
              <Badge
                variant={getCategoryBadgeVariant(selectedNotice?.category || "general")}
                className="flex items-center gap-1.5 capitalize font-medium"
              >
                {getCategoryIcon(selectedNotice?.category || "general")}
                {selectedNotice?.category}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span>Published: {selectedNotice && formatDate(selectedNotice.createdAt)}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <ScrollArea className="max-h-[calc(80vh-120px)]">
              <div className="space-y-4 p-6 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize flex items-center gap-1.5 border-border/50">
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
                    className="capitalize font-medium"
                  >
                    {selectedNotice.importance}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Expires: {formatDate(selectedNotice.expiryDate)}
                  </span>
                </div>

                <Separator className="bg-border/30" />

                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {selectedNotice.content.split("\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                  <>
                    <Separator className="bg-border/30" />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Attachments</Label>
                      <div className="grid gap-2">
                        {selectedNotice.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline p-2 border border-border/30 rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Attachment {index + 1} - {attachment.split("/").pop()}
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 p-4 border-t border-border/30 bg-muted/30">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-border/50 bg-card">
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setIsViewDialogOpen(false)
                setSelectedNotice({ ...selectedNotice! })
                setIsEditDialogOpen(true)
              }}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2 bg-muted/30 border-b border-border/30">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Edit Notice
            </DialogTitle>
            <DialogDescription>Make changes to the notice below. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <ScrollArea className="max-h-[calc(80vh-180px)]">
              <div className="space-y-4 p-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-sm font-medium">
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
                    className="focus-visible:ring-indigo-500/20 border-border/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category" className="text-sm font-medium">
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
                        className="focus-visible:ring-indigo-500/20 border-border/50 bg-card"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general" className="flex items-center gap-2">
                          <Megaphone className="h-4 w-4 text-indigo-500" />
                          <span>General</span>
                        </SelectItem>
                        <SelectItem value="academic" className="flex items-center gap-2">
                          <School className="h-4 w-4 text-blue-500" />
                          <span>Academic</span>
                        </SelectItem>
                        <SelectItem value="hostel" className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-amber-500" />
                          <span>Hostel</span>
                        </SelectItem>
                        <SelectItem value="event" className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-purple-500" />
                          <span>Event</span>
                        </SelectItem>
                        <SelectItem value="emergency" className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                          <span>Emergency</span>
                        </SelectItem>
                        <SelectItem value="other" className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span>Other</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-importance" className="text-sm font-medium">
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
                        className="focus-visible:ring-indigo-500/20 border-border/50 bg-card"
                      >
                        <SelectValue placeholder="Select importance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          <span>Normal</span>
                        </SelectItem>
                        <SelectItem value="important" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                          <span>Important</span>
                        </SelectItem>
                        <SelectItem value="urgent" className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                          <span>Urgent</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Audience *</Label>
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
                          ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                          : "border-border/50 bg-card",
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
                          ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                          : "border-border/50 bg-card",
                      )}
                    >
                      <School className="h-3.5 w-3.5" />
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
                          ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                          : "border-border/50 bg-card",
                      )}
                    >
                      <Building className="h-3.5 w-3.5" />
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
                          ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                          : "border-border/50 bg-card",
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Admin
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-expiry-date" className="text-sm font-medium">
                    Expiry Date *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
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
                      className="focus-visible:ring-indigo-500/20 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-content" className="text-sm font-medium">
                    Content *
                  </Label>
                  <Textarea
                    id="edit-content"
                    className="min-h-[150px] focus-visible:ring-indigo-500/20 border-border/50"
                    value={selectedNotice.content}
                    onChange={(e) =>
                      setSelectedNotice({
                        ...selectedNotice,
                        content: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 p-4 border-t border-border/30 bg-muted/30">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-border/50 bg-card">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNotice}
              disabled={isSubmitting}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently delete this notice?
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-4 p-4 border border-destructive/20 rounded-md bg-destructive/10">
                <div className="bg-destructive/20 p-2 rounded-md">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h4 className="font-medium">{selectedNotice.title}</h4>
                  <p className="text-sm text-muted-foreground">Published: {formatDate(selectedNotice.createdAt)}</p>
                  <p className="text-sm text-muted-foreground">Expires: {formatDate(selectedNotice.expiryDate)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-border/50 bg-card">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotice} disabled={isSubmitting} className="gap-2">
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
