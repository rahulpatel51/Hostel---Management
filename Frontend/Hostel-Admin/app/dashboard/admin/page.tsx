import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BedDouble,
  Bell,
  CreditCard,
  Info,
  MessageSquare,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Manage and monitor all hostel operations from a central location. Quickly access key metrics and take actions.
        </p>
      </div>

      {/* Alert Banner */}
      <Alert className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-800 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
          <div>
            <AlertTitle className="text-teal-800 dark:text-teal-200 font-medium">
              System Update Available
            </AlertTitle>
            <AlertDescription className="text-teal-700 dark:text-teal-300">
              New features have been added to the room allocation module. Check the documentation for details.
              <Button variant="link" size="sm" className="h-auto p-0 ml-2 text-teal-800 dark:text-teal-300">
                View changelog
              </Button>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Students",
            value: "458",
            change: "12%",
            isPositive: true,
            icon: Users,
            link: "/dashboard/admin/students",
            buttonText: "View Details",
          },
          {
            title: "Room Occupancy",
            value: "92%",
            change: "5%",
            isPositive: true,
            icon: BedDouble,
            link: "/dashboard/admin/rooms",
            buttonText: "Manage Rooms",
          },
          {
            title: "Fee Collection",
            value: "₹42.5L",
            change: "3% pending",
            isPositive: false,
            icon: CreditCard,
            link: "/dashboard/admin/fees",
            buttonText: "View Payments",
          },
          {
            title: "Active Complaints",
            value: "24",
            change: "8 unresolved",
            isPositive: false,
            icon: MessageSquare,
            link: "/dashboard/admin/complaints",
            buttonText: "Resolve Issues",
          },
        ].map((metric, index) => (
          <Card 
            key={index} 
            className="border-teal-200 dark:border-teal-800 hover:shadow-md transition-shadow group"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {metric.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-teal-100/50 dark:bg-teal-900/20 group-hover:bg-teal-200/50 dark:group-hover:bg-teal-800/30 transition-colors">
                <metric.icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className={`flex items-center gap-1 text-xs ${metric.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {metric.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{metric.change}</span>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-teal-200 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-300 dark:hover:border-teal-600 text-teal-700 dark:text-teal-300"
                  asChild
                >
                  <Link href={metric.link}>{metric.buttonText}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Occupancy Chart */}
        <Card className="border-teal-200 dark:border-teal-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Occupancy by Block</CardTitle>
                <CardDescription>Distribution of students across hostel blocks</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gradient-to-br from-teal-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg border border-teal-100 dark:border-gray-700 mb-4">
              <div className="text-center text-muted-foreground p-4">
                <PieChart className="mx-auto h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
                <p>Occupancy chart visualization</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { block: "Block A", count: 120, percentage: "26%", color: "bg-teal-500" },
                { block: "Block B", count: 145, percentage: "32%", color: "bg-emerald-500" },
                { block: "Block C", count: 98, percentage: "21%", color: "bg-cyan-500" },
                { block: "Block D", count: 95, percentage: "21%", color: "bg-sky-500" },
              ].map((block, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-3 w-3 rounded-full ${block.color}`}></div>
                    <div>
                      <p className="text-sm font-medium">{block.block}</p>
                      <p className="text-xs text-muted-foreground">{block.count} students</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold">{block.percentage}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Collection Chart */}
        <Card className="border-teal-200 dark:border-teal-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fee Collection Trend</CardTitle>
                <CardDescription>Monthly fee collection for the current year</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gradient-to-br from-teal-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 rounded-lg border border-teal-100 dark:border-gray-700 mb-4">
              <div className="text-center text-muted-foreground p-4">
                <BarChart3 className="mx-auto h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
                <p>Fee collection trend visualization</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Total Collection (YTD)</p>
                <p className="text-sm font-bold">₹1.85 Cr</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Pending Collection</p>
                <Badge variant="destructive">₹12.4 L</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Collection Rate</p>
                <Badge variant="default">93.7%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-teal-50 dark:bg-gray-900/50">
          <TabsTrigger 
            value="recent" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-teal-200 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-teal-800"
          >
            Recent Activities
          </TabsTrigger>
          <TabsTrigger 
            value="notices" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-teal-200 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-teal-800"
          >
            Notices
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-teal-200 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-teal-800"
          >
            Pending Approvals
          </TabsTrigger>
        </TabsList>
        
        {/* Recent Activities Tab */}
        <TabsContent value="recent" className="border border-teal-200 dark:border-teal-800 rounded-md mt-2 p-0 overflow-hidden">
          <div className="divide-y divide-teal-100 dark:divide-teal-900">
            {[
              {
                action: "New Student Registration",
                date: "May 2, 2023",
                description: "Student ID: ST2023045 registered",
                icon: <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
              },
              { 
                action: "Room Allocation", 
                date: "May 1, 2023", 
                description: "15 new students allocated to Block B",
                icon: <BedDouble className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
              },
              { 
                action: "Fee Payment", 
                date: "April 30, 2023", 
                description: "Collected ₹3.2L in fee payments",
                icon: <CreditCard className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
              },
              {
                action: "Complaint Resolved",
                date: "April 29, 2023",
                description: "Resolved 5 maintenance complaints",
                icon: <MessageSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
              },
              {
                action: "Staff Attendance",
                date: "April 28, 2023",
                description: "Updated attendance for 12 staff members",
                icon: <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />,
              },
            ].map((activity, index) => (
              <div key={index} className="p-4 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className="p-2 rounded-lg bg-teal-100/50 dark:bg-teal-900/20">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{activity.action}</h3>
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Notices Tab */}
        <TabsContent value="notices" className="border border-teal-200 dark:border-teal-800 rounded-md mt-2 p-0 overflow-hidden">
          <div className="divide-y divide-teal-100 dark:divide-teal-900">
            {[
              {
                title: "Hostel Inspection",
                date: "May 15, 2023",
                description: "Annual hostel inspection by the university committee.",
                priority: "high",
              },
              {
                title: "Staff Meeting",
                date: "May 10, 2023",
                description: "Monthly staff meeting to discuss hostel operations.",
                priority: "medium",
              },
              {
                title: "Fee Payment Deadline",
                date: "May 5, 2023",
                description: "Reminder for students to clear pending fee payments.",
                priority: "high",
              },
            ].map((notice, index) => (
              <div key={index} className="p-4 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors">
                <div className="flex gap-3 items-start">
                  <Bell className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{notice.title}</h3>
                      <Badge 
                        variant={notice.priority === "high" ? "destructive" : "secondary"} 
                        className="text-xs"
                      >
                        {notice.priority === "high" ? "High Priority" : "Medium Priority"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notice.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Posted: {notice.date}</span>
                      <Button variant="ghost" size="sm" className="h-8 text-teal-600 dark:text-teal-400">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-teal-100 dark:border-teal-900">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 ml-auto" asChild>
              <Link href="/dashboard/admin/notices">Create New Notice</Link>
            </Button>
          </div>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="border border-teal-200 dark:border-teal-800 rounded-md mt-2 p-0 overflow-hidden">
          <div className="divide-y divide-teal-100 dark:divide-teal-900">
            {[
              { 
                type: "Leave Application", 
                student: "Rahul Sharma (ST2023012)", 
                date: "May 3, 2023",
                days: "3 days",
              },
              { 
                type: "Room Change Request", 
                student: "Priya Patel (ST2023034)", 
                date: "May 2, 2023",
                fromTo: "Block A → Block B",
              },
              { 
                type: "Fee Extension Request", 
                student: "Amit Kumar (ST2023056)", 
                date: "May 1, 2023",
                amount: "₹12,500",
              },
              { 
                type: "Complaint Escalation", 
                student: "Neha Singh (ST2023078)", 
                date: "April 30, 2023",
                category: "Maintenance",
              },
            ].map((approval, index) => (
              <div key={index} className="p-4 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{approval.type}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{approval.student}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Submitted: {approval.date}
                      </Badge>
                      {approval.days && (
                        <Badge variant="secondary" className="text-xs">
                          {approval.days}
                        </Badge>
                      )}
                      {approval.fromTo && (
                        <Badge variant="secondary" className="text-xs">
                          {approval.fromTo}
                        </Badge>
                      )}
                      {approval.amount && (
                        <Badge variant="secondary" className="text-xs">
                          {approval.amount}
                        </Badge>
                      )}
                      {approval.category && (
                        <Badge variant="secondary" className="text-xs">
                          {approval.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}