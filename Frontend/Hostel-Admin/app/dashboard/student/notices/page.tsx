"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, CalendarDays, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

type Notice = {
  _id: string;
  title: string;
  content: string;
  category: string;
  importance: string;
  targetAudience: string;
  attachments: {
    url: string;
    public_id: string;
  }[];
  publishedBy?: {
    _id: string;
    username?: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
  expiryDate: string;
  isActive: boolean;
};

export default function StudentNoticesPage() {
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await axios.get("http://localhost:5000/api/notices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.success) {
          setNotices(response.data.data || []);
        } else {
          throw new Error(response.data?.message || "Failed to fetch notices");
        }
      } catch (err) {
        console.error("Error fetching notices:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load notices";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, [toast]);

  useEffect(() => {
    const filterNotices = () => {
      let result = [...notices];

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          notice =>
            notice.title.toLowerCase().includes(term) ||
            notice.content.toLowerCase().includes(term)
        );
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        result = result.filter(
          notice => notice.category.toLowerCase() === categoryFilter.toLowerCase()
        );
      }

      // Apply status filter
      const now = new Date();
      result = result.filter(notice => {
        const isExpired = notice.expiryDate && new Date(notice.expiryDate) < now;
        return activeTab === "active" 
          ? notice.isActive && !isExpired 
          : !notice.isActive || isExpired;
      });

      setFilteredNotices(result);
    };

    filterNotices();
  }, [searchTerm, categoryFilter, activeTab, notices]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "No expiry date";
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return "Invalid date";
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { className: string; label: string }> = {
      events: {
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        label: "Event"
      },
      maintenance: {
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        label: "Maintenance"
      },
      academic: {
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        label: "Academic"
      },
      default: {
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        label: "General"
      }
    };

    const normalizedCategory = (category || "").toLowerCase();
    const badgeInfo = categoryMap[normalizedCategory] || categoryMap.default;

    return (
      <Badge className={`${badgeInfo.className} hover:bg-opacity-80`}>
        {badgeInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading notices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Bell className="h-10 w-10 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Hostel Notices</h1>
        <p className="text-muted-foreground">Stay updated with important announcements</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notices..."
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="events">Events</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="active">Active Notices</TabsTrigger>
          <TabsTrigger value="expired">Past Notices</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4">
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
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
                message="No active notices found"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          <div className="grid gap-4">
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
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
                message="No past notices found"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NoticeCard({ 
  notice, 
  formatDate, 
  getCategoryBadge,
  isActive 
}: {
  notice: Notice;
  formatDate: (date: string) => string;
  getCategoryBadge: (category: string) => React.ReactNode;
  isActive: boolean;
}) {
  // Safely get author information with fallbacks
  const authorName = notice.publishedBy?.username || 'Unknown Author';
  const authorAvatar = notice.publishedBy?.profilePicture;
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <Card className={`hover:shadow-md transition-shadow ${!isActive ? "bg-muted/50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <CardTitle className="text-lg">{notice.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage 
                  src={authorAvatar} 
                  alt={authorName} 
                />
                <AvatarFallback>
                  {authorInitial}
                </AvatarFallback>
              </Avatar>
              <span>{authorName}</span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {getCategoryBadge(notice.category)}
            <Badge 
              variant={isActive ? "default" : "outline"}
              className={isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
            >
              {isActive ? "Active" : "Expired"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert max-w-none">
          {notice.content.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
          ))}
        </div>
        
        {notice.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {notice.attachments.map((attachment) => (
              <a 
                key={attachment.public_id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                View Attachment
              </a>
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Published: {formatDate(notice.createdAt)}</span>
          </div>
          {notice.expiryDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {isActive ? "Expires: " : "Expired: "} 
                {formatDate(notice.expiryDate)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyNoticeState({ 
  message,
  onClearFilters 
}: {
  message: string;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
      <Bell className="h-10 w-10" />
      <p>{message}</p>
      <Button 
        variant="outline" 
        onClick={onClearFilters}
      >
        Clear filters
      </Button>
    </div>
  );
}