"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, CalendarDays, Clock, Loader2, Download, RefreshCw } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
import { cn } from "@/lib/utils"

type Notice = {
  _id: string
  title: string
  content: string
  category: string
  importance: string
  targetAudience: string
  attachments: {
    url: string
    public_id: string
  }[]
  publishedBy?: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    profilePicture?: string
    fullName?: string
  }
  createdAt: string
  updatedAt: string
  expiryDate: string
  isActive: boolean
}

export default function StudentNoticesPage() {
  const { toast } = useToast()
  const [notices, setNotices] = useState<Notice[]>([])
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("active")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication required")
        }

        const response = await axios.get("http://localhost:5000/api/notices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data?.success) {
          setNotices(response.data.data || [])
        } else {
          throw new Error(response.data?.message || "Failed to fetch notices")
        }
      } catch (err) {
        console.error("Error fetching notices:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load notices"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotices()
  }, [toast])

  useEffect(() => {
    const filterNotices = () => {
      let result = [...notices]

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        result = result.filter(
          (notice) => notice.title.toLowerCase().includes(term) || notice.content.toLowerCase().includes(term),
        )
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        result = result.filter((notice) => notice.category.toLowerCase() === categoryFilter.toLowerCase())
      }

      // Apply status filter
      const now = new Date()
      result = result.filter((notice) => {
        const isExpired = notice.expiryDate && new Date(notice.expiryDate) < now
        return activeTab === "active" ? notice.isActive && !isExpired : !notice.isActive || isExpired
      })

      setFilteredNotices(result)
    }

    filterNotices()
  }, [searchTerm, categoryFilter, activeTab, notices])

  const formatDate = (dateString: string) => {
    if (!dateString) return "No expiry date"
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
      return new Date(dateString).toLocaleDateString(undefined, options)
    } catch {
      return "Invalid date"
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { className: string; label: string }> = {
      events: {
        className:
          "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
        label: "Event",
      },
      maintenance: {
        className:
          "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
        label: "Maintenance",
      },
      academic: {
        className:
          "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
        label: "Academic",
      },
      general: {
        className:
          "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
        label: "General",
      },
      default: {
        className:
          "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700",
        label: "Notice",
      },
    }

    const normalizedCategory = (category || "").toLowerCase()
    const badgeInfo = categoryMap[normalizedCategory] || categoryMap.default

    return (
      <Badge className={`${badgeInfo.className} border hover:bg-opacity-80`}>
        {badgeInfo.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400">Loading notices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Bell className="h-12 w-12 text-red-600 dark:text-red-400" />
        <p className="text-lg font-medium text-red-600 dark:text-red-400">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
          Hostel Notices
        </h1>
        <p className="text-lg text-muted-foreground">Stay updated with important announcements</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <Input
            type="search"
            placeholder="Search notices by title or content..."
            className="w-full pl-10 h-11 text-base border-2 border-indigo-200 dark:border-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-11 border-2 border-indigo-200 dark:border-indigo-800">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="border-2 border-indigo-200 dark:border-indigo-800">
              <SelectItem value="all" className="text-base hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                All Categories
              </SelectItem>
              <SelectItem value="general" className="text-base hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                General
              </SelectItem>
              <SelectItem value="academic" className="text-base hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                Academic
              </SelectItem>
              <SelectItem value="events" className="text-base hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                Events
              </SelectItem>
              <SelectItem value="maintenance" className="text-base hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                Maintenance
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setCategoryFilter("all")
            }}
            className="h-11 gap-1 border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 h-12 bg-indigo-50 dark:bg-indigo-950/30 p-1">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-indigo-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-indigo-800 py-2 text-base font-medium transition-all data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            Active Notices
          </TabsTrigger>
          <TabsTrigger
            value="expired"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-indigo-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-indigo-800 py-2 text-base font-medium transition-all data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            Past Notices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  formatDate={formatDate}
                  getCategoryBadge={getCategoryBadge}
                  isActive={true}
                />
              ))
            ) : (
              <EmptyNoticeState
                onClearFilters={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                }}
                message="No active notices found"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          <div className="grid gap-6">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  formatDate={formatDate}
                  getCategoryBadge={getCategoryBadge}
                  isActive={false}
                />
              ))
            ) : (
              <EmptyNoticeState
                onClearFilters={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                }}
                message="No past notices found"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NoticeCard({
  notice,
  formatDate,
  getCategoryBadge,
  isActive,
}: {
  notice: Notice
  formatDate: (date: string) => string
  getCategoryBadge: (category: string) => React.ReactNode
  isActive: boolean
}) {
  const author: Notice["publishedBy"] = notice.publishedBy ?? { _id: "unknown" }
  const authorName =
    author.fullName ||
    (author.firstName && author.lastName ? `${author.firstName} ${author.lastName}` : author.username || "Unknown Author")
  const authorAvatar = author.profilePicture
  const authorInitial = authorName.charAt(0).toUpperCase()

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all border-2",
        isActive
          ? "border-indigo-200 dark:border-indigo-800"
          : "border-gray-100 dark:border-gray-800 bg-muted/30",
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{notice.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border-2 border-indigo-100 dark:border-indigo-900/50">
                <AvatarImage src={authorAvatar || "/placeholder.svg"} alt={authorName} className="object-cover" />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium">
                  {authorInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{authorName}</span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {getCategoryBadge(notice.category)}
            <Badge
              variant={isActive ? "default" : "outline"}
              className={cn(
                "border-2",
                isActive
                  ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                  : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700",
              )}
            >
              {isActive ? "Active" : "Expired"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          {notice.content.split("\n").map((paragraph, i) => (
            <p key={i} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        {notice.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {notice.attachments.map((attachment) => (
              <a
                key={attachment.public_id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Attachment
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-md">
            <CalendarDays className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Published: {formatDate(notice.createdAt)}</span>
          </div>
          {notice.expiryDate && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-md">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{isActive ? "Expires: " : "Expired: "} {formatDate(notice.expiryDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyNoticeState({
  message,
  onClearFilters,
}: {
  message: string
  onClearFilters: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
      <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
        <Bell className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-white">{message}</h3>
      <p className="text-muted-foreground max-w-md">
        Try adjusting your search or filter to find what you're looking for.
      </p>
      <Button
        variant="outline"
        onClick={onClearFilters}
        className="gap-2 border-2 border-indigo-200 dark:border-indigo-800 h-11 px-6 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
      >
        <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        Clear all filters
      </Button>
    </div>
  )
}
