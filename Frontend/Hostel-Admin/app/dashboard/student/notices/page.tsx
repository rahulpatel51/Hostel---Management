"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

type Notice = {
  id: string;
  title: string;
  category: "General" | "Academic" | "Events" | "Maintenance";
  content: string;
  publishDate: string;
  expiryDate: string;
  status: "Active" | "Expired";
  author: {
    name: string;
    avatar: string;
    role: string;
  };
};

export default function StudentNoticesPage() {
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");

  // Mock data fetch - replace with actual API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData: Notice[] = [
          {
            id: "NOT001",
            title: "Hostel Day Celebration",
            category: "Events",
            content: "Annual hostel day celebration will be held on May 15th. All students are invited to participate in various cultural programs and competitions. Lunch will be provided for all attendees.",
            publishDate: "2023-05-05",
            expiryDate: "2023-05-20",
            status: "Active",
            author: {
              name: "Dr. Sharma",
              avatar: "/warden-avatar.jpg",
              role: "Chief Warden"
            }
          },
          {
            id: "NOT002",
            title: "Internet Maintenance Schedule",
            category: "Maintenance",
            content: "Internet services will be unavailable from 10PM to 2AM on May 10th for scheduled maintenance. We apologize for the inconvenience and appreciate your understanding.",
            publishDate: "2023-05-04",
            expiryDate: "2023-05-10",
            status: "Expired",
            author: {
              name: "IT Department",
              avatar: "/it-avatar.jpg",
              role: "Maintenance Team"
            }
          },
          {
            id: "NOT003",
            title: "Fee Payment Deadline",
            category: "Academic",
            content: "Last date for fee payment is May 15th. Late payments will incur a penalty of ₹50 per day. Please make payments at the accounts office between 10AM-4PM.",
            publishDate: "2023-05-03",
            expiryDate: "2023-05-15",
            status: "Active",
            author: {
              name: "Accounts Office",
              avatar: "/accounts-avatar.jpg",
              role: "Administration"
            }
          },
          {
            id: "NOT004",
            title: "Summer Vacation Schedule",
            category: "Academic",
            content: "Hostel will remain closed during summer vacation from June 1st to July 15th. All students must vacate their rooms by May 31st. Limited accommodation available for special cases - apply by May 20th.",
            publishDate: "2023-04-30",
            expiryDate: "2023-05-30",
            status: "Active",
            author: {
              name: "Dr. Gupta",
              avatar: "/admin-avatar.jpg",
              role: "Hostel Administrator"
            }
          },
          {
            id: "NOT005",
            title: "New Sports Facilities",
            category: "General",
            content: "New badminton courts and table tennis tables have been installed in the recreation area. Available for use from 4PM-8PM daily. Equipment can be borrowed from the sports room with ID card.",
            publishDate: "2023-04-28",
            expiryDate: "2023-05-28",
            status: "Expired",
            author: {
              name: "Sports Committee",
              avatar: "/sports-avatar.jpg",
              role: "Student Council"
            }
          }
        ];
        
        setNotices(mockData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load notices",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [toast]);

  // Filter notices based on search term, category and status
  useEffect(() => {
    let filtered = notices;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(notice => 
        notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        notice.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(notice => notice.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    
    // Apply status filter
    filtered = filtered.filter(notice => activeTab === "active" ? notice.status === "Active" : notice.status === "Expired");
    
    setFilteredNotices(filtered);
  }, [searchTerm, categoryFilter, activeTab, notices]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Events":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400">Event</Badge>;
      case "Maintenance":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">Maintenance</Badge>;
      case "Academic":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Academic</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400">General</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Hostel Notices</h1>
        <p className="text-muted-foreground">Stay updated with important announcements from the hostel administration</p>
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
                <Card key={notice.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={notice.author.avatar} alt={notice.author.name} />
                            <AvatarFallback>{notice.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{notice.author.name} • {notice.author.role}</span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getCategoryBadge(notice.category)}
                        <Badge 
                          variant={notice.status === "Active" ? "default" : "outline"}
                          className={notice.status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                        >
                          {notice.status}
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
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>Published: {formatDate(notice.publishDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Expires: {formatDate(notice.expiryDate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
                <Bell className="h-10 w-10" />
                <p>No active notices found</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          <div className="grid gap-4">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice) => (
                <Card key={notice.id} className="bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={notice.author.avatar} alt={notice.author.name} />
                            <AvatarFallback>{notice.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{notice.author.name} • {notice.author.role}</span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getCategoryBadge(notice.category)}
                        <Badge variant="outline">Expired</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose dark:prose-invert max-w-none">
                      {notice.content.split('\n').map((paragraph, i) => (
                        <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>Published: {formatDate(notice.publishDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Expired: {formatDate(notice.expiryDate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
                <Bell className="h-10 w-10" />
                <p>No past notices found</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}