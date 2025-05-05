import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BedDouble,
  Bell,
  Calendar,
  ClipboardList,
  Info,
  MessageSquare,
  Users,
  CheckCircle2,
  XCircle,
  ChevronRight,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function WardenDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Warden Dashboard</h1>
        <p className="text-muted-foreground text-sm">Monitor hostel activities and manage student affairs</p>
      </div>

      <Alert className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-teal-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
          <div>
            <AlertTitle className="text-teal-800 dark:text-teal-200 font-semibold">Attention Required</AlertTitle>
            <AlertDescription className="text-teal-700 dark:text-teal-300">
              8 leave applications are pending your approval. Please review them at your earliest convenience.
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Students Present",
            value: "432 / 458",
            description: "26 students on leave",
            icon: Users,
            link: "/dashboard/warden/students",
            color: "text-blue-600 dark:text-blue-400"
          },
          {
            title: "Leave Requests",
            value: "8",
            description: "Pending approval",
            icon: Calendar,
            link: "/dashboard/warden/leave",
            color: "text-amber-600 dark:text-amber-400"
          },
          {
            title: "Complaints",
            value: "12",
            description: "5 high priority",
            icon: MessageSquare,
            link: "/dashboard/warden/complaints",
            color: "text-rose-600 dark:text-rose-400"
          },
          {
            title: "Room Occupancy",
            value: "92%",
            description: "18 vacant beds",
            icon: BedDouble,
            link: "/dashboard/warden/rooms",
            color: "text-emerald-600 dark:text-emerald-400"
          }
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className="mt-4">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" asChild>
                  <Link href={stat.link}>
                    View details <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="leave" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Leave Requests
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Recent Complaints
          </TabsTrigger>
          <TabsTrigger value="discipline" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Disciplinary Actions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="leave" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Pending Leave Requests
              </CardTitle>
              <CardDescription>Approve or reject student leave applications</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                {
                  student: "Rahul Sharma",
                  id: "ST2023012",
                  from: "May 10, 2023",
                  to: "May 15, 2023",
                  reason: "Family function",
                  status: "pending"
                },
                {
                  student: "Priya Patel",
                  id: "ST2023034",
                  from: "May 12, 2023",
                  to: "May 14, 2023",
                  reason: "Medical appointment",
                  status: "pending"
                },
                {
                  student: "Amit Kumar",
                  id: "ST2023056",
                  from: "May 15, 2023",
                  to: "May 20, 2023",
                  reason: "Personal emergency",
                  status: "pending"
                }
              ].map((leave, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{leave.student}</h3>
                      <Badge variant="outline" className="text-xs">{leave.id}</Badge>
                      {leave.status === "pending" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {leave.from} to {leave.to}
                    </p>
                    <p className="text-sm">{leave.reason}</p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/warden/leave" className="flex items-center">
                    View all requests <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                Recent Complaints
              </CardTitle>
              <CardDescription>Address student complaints and issues</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                {
                  issue: "Water leakage in bathroom",
                  student: "Neha Singh",
                  id: "ST2023078",
                  room: "A-204",
                  date: "May 2, 2023",
                  priority: "High",
                },
                {
                  issue: "Broken chair",
                  student: "Vikram Reddy",
                  id: "ST2023045",
                  room: "B-112",
                  date: "May 1, 2023",
                  priority: "Medium",
                },
                {
                  issue: "Faulty electrical socket",
                  student: "Ananya Gupta",
                  id: "ST2023023",
                  room: "C-305",
                  date: "April 30, 2023",
                  priority: "High",
                },
              ].map((complaint, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{complaint.issue}</h3>
                      <Badge variant={complaint.priority === "High" ? "destructive" : "secondary"}>
                        {complaint.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {complaint.student} ({complaint.id}) • Room {complaint.room} • {complaint.date}
                    </p>
                  </div>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 self-end sm:self-center">
                    Take Action
                  </Button>
                </div>
              ))}
              <div className="flex justify-end mt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/warden/complaints" className="flex items-center">
                    View all complaints <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discipline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-500" />
                Disciplinary Actions
              </CardTitle>
              <CardDescription>Recent disciplinary cases and actions taken</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                {
                  action: "Warning Issued",
                  student: "Rajesh Kumar",
                  id: "ST2023067",
                  reason: "Noise complaint after quiet hours",
                  date: "April 29, 2023",
                  severity: "Medium"
                },
                {
                  action: "Fine Imposed",
                  student: "Suresh Verma",
                  id: "ST2023089",
                  reason: "Damage to hostel property",
                  date: "April 25, 2023",
                  severity: "High"
                },
                {
                  action: "Counseling Session",
                  student: "Mohan Singh",
                  id: "ST2023112",
                  reason: "Repeated absence from hostel",
                  date: "April 20, 2023",
                  severity: "Low"
                },
              ].map((action, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className={`p-2 rounded-full ${
                    action.severity === "High" ? "bg-rose-100 text-rose-600" : 
                    action.severity === "Medium" ? "bg-amber-100 text-amber-600" : 
                    "bg-blue-100 text-blue-600"
                  }`}>
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{action.action}</h3>
                      <Badge variant="outline" className="text-xs">{action.id}</Badge>
                    </div>
                    <p className="text-sm">{action.student}</p>
                    <p className="text-sm text-muted-foreground">{action.reason}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{action.date}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-2">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700" asChild>
                  <Link href="/dashboard/warden/discipline" className="flex items-center">
                    Record New Action <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-500" />
            Recent Notices
          </CardTitle>
          <CardDescription>Announcements posted for students</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {[
            {
              title: "Hostel Day Celebration",
              date: "May 10, 2023",
              description: "Annual hostel day celebration will be held in the main auditorium. All students are required to attend.",
              priority: "Important"
            },
            {
              title: "Internet Maintenance",
              date: "May 5, 2023",
              description: "Internet services will be down from 2 PM to 5 PM due to maintenance work.",
              priority: "Notice"
            }
          ].map((notice, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{notice.title}</h3>
                  <Badge variant={notice.priority === "Important" ? "default" : "outline"}>
                    {notice.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notice.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Posted on {notice.date}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-2">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" asChild>
              <Link href="/dashboard/warden/notices" className="flex items-center">
                Post New Notice <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}