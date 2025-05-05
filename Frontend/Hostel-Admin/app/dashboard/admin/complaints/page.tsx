import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { CheckCircle, Filter, MessageSquare, MoreHorizontal, Search, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ComplaintsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Complaints Management</h1>
        <p className="text-muted-foreground">Manage and resolve student complaints and maintenance requests.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge
              variant="outline"
              className="text-amber-800 border-amber-600 dark:text-amber-400 dark:border-amber-500"
            >
              8
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Awaiting resolution</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
              16
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Being addressed</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
              24
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">44</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search complaints..."
            className="w-full bg-white dark:bg-gray-950 pl-8 border-gray-200 dark:border-gray-800"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex h-auto p-0 bg-transparent gap-2">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            All Complaints
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">All Complaints</CardTitle>
                <CardDescription>Showing all student complaints and maintenance requests</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      id: "CMP001",
                      issue: "Water leakage in bathroom",
                      student: "John Doe (ST2023001)",
                      room: "A-101",
                      date: "May 5, 2023",
                      status: "Pending",
                    },
                    {
                      id: "CMP002",
                      issue: "Broken chair",
                      student: "Jane Smith (ST2023002)",
                      room: "B-205",
                      date: "May 4, 2023",
                      status: "In Progress",
                    },
                    {
                      id: "CMP003",
                      issue: "Faulty electrical socket",
                      student: "Michael Johnson (ST2023003)",
                      room: "C-310",
                      date: "May 3, 2023",
                      status: "In Progress",
                    },
                    {
                      id: "CMP004",
                      issue: "Noisy ceiling fan",
                      student: "Sarah Williams (ST2023004)",
                      room: "A-202",
                      date: "May 2, 2023",
                      status: "Resolved",
                    },
                    {
                      id: "CMP005",
                      issue: "Clogged sink",
                      student: "David Brown (ST2023005)",
                      room: "D-105",
                      date: "May 1, 2023",
                      status: "Resolved",
                    },
                    {
                      id: "CMP006",
                      issue: "Broken window latch",
                      student: "Emily Davis (ST2023006)",
                      room: "B-301",
                      date: "April 30, 2023",
                      status: "Rejected",
                    },
                  ].map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.id}</TableCell>
                      <TableCell>{complaint.issue}</TableCell>
                      <TableCell>{complaint.student}</TableCell>
                      <TableCell>{complaint.room}</TableCell>
                      <TableCell>{complaint.date}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            complaint.status === "Pending"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                              : complaint.status === "In Progress"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                                : complaint.status === "Resolved"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {complaint.status === "Pending" && (
                              <>
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Reject Complaint
                                </DropdownMenuItem>
                              </>
                            )}
                            {complaint.status === "In Progress" && (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Mark as Resolved
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Assign to Staff</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Pending Complaints</CardTitle>
              <CardDescription>Complaints awaiting initial action</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Pending complaints content will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">In Progress</CardTitle>
              <CardDescription>Complaints currently being addressed</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">In progress complaints content will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Resolved Complaints</CardTitle>
              <CardDescription>Successfully resolved complaints</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">Resolved complaints content will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
