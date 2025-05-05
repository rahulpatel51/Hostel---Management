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
import {
  ArrowDownUp,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FeeManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fee Management</h1>
        <p className="text-muted-foreground">Manage student fees, payments, and financial records.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <CreditCard className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹42,50,000</div>
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹3,75,000</div>
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <span>32 students</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹8,25,000</div>
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91.8%</div>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <span>Target: 95%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by student ID or name..."
            className="w-full bg-white dark:bg-gray-950 pl-8 border-gray-200 dark:border-gray-800"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="h-9 bg-teal-600 hover:bg-teal-700 text-white ml-auto md:ml-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Fee
          </Button>
        </div>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex h-auto p-0 bg-transparent gap-2">
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Payment Records
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Pending Payments
          </TabsTrigger>
          <TabsTrigger
            value="structure"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Fee Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Payment Records</CardTitle>
                <CardDescription>Recent fee payments by students</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    <TableHead className="w-[100px]">Receipt ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      id: "RCP2023001",
                      student: "John Doe (ST2023001)",
                      date: "May 5, 2023",
                      amount: "₹12,500",
                      mode: "Online",
                      status: "Paid",
                    },
                    {
                      id: "RCP2023002",
                      student: "Jane Smith (ST2023002)",
                      date: "May 3, 2023",
                      amount: "₹12,500",
                      mode: "Bank Transfer",
                      status: "Paid",
                    },
                    {
                      id: "RCP2023003",
                      student: "Michael Johnson (ST2023003)",
                      date: "May 2, 2023",
                      amount: "₹12,500",
                      mode: "Cash",
                      status: "Paid",
                    },
                    {
                      id: "RCP2023004",
                      student: "Sarah Williams (ST2023004)",
                      date: "May 1, 2023",
                      amount: "₹12,500",
                      mode: "Online",
                      status: "Paid",
                    },
                    {
                      id: "RCP2023005",
                      student: "David Brown (ST2023005)",
                      date: "April 30, 2023",
                      amount: "₹12,500",
                      mode: "Cheque",
                      status: "Processing",
                    },
                    {
                      id: "RCP2023006",
                      student: "Emily Davis (ST2023006)",
                      date: "April 28, 2023",
                      amount: "₹12,500",
                      mode: "Online",
                      status: "Paid",
                    },
                  ].map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.student}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{payment.mode}</TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.status === "Paid" ? "default" : "outline"}
                          className={
                            payment.status === "Paid"
                              ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                              : "text-amber-800 border-amber-600 dark:text-amber-400 dark:border-amber-500"
                          }
                        >
                          {payment.status}
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
                            <DropdownMenuItem>View Receipt</DropdownMenuItem>
                            <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Send to Student</DropdownMenuItem>
                            {payment.status === "Processing" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                              </>
                            )}
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
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Pending Payments</CardTitle>
                <CardDescription>Students with pending fee payments</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-white">
                  Send Reminders
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    <TableHead className="w-[100px]">Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      id: "ST2023007",
                      name: "Robert Wilson",
                      room: "A-103",
                      amount: "₹12,500",
                      dueDate: "May 15, 2023",
                      status: "Upcoming",
                    },
                    {
                      id: "ST2023008",
                      name: "Lisa Anderson",
                      room: "B-207",
                      amount: "₹12,500",
                      dueDate: "May 15, 2023",
                      status: "Upcoming",
                    },
                    {
                      id: "ST2023009",
                      name: "Thomas Martin",
                      room: "C-312",
                      amount: "₹12,500",
                      dueDate: "May 10, 2023",
                      status: "Due Soon",
                    },
                    {
                      id: "ST2023010",
                      name: "Jennifer Lewis",
                      room: "A-204",
                      amount: "₹12,500",
                      dueDate: "May 5, 2023",
                      status: "Overdue",
                    },
                    {
                      id: "ST2023011",
                      name: "Richard Clark",
                      room: "D-106",
                      amount: "₹12,500",
                      dueDate: "May 1, 2023",
                      status: "Overdue",
                    },
                  ].map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.name}</TableCell>
                      <TableCell>{payment.room}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            payment.status === "Upcoming"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                              : payment.status === "Due Soon"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-white">
                          Record Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Fee Structure</CardTitle>
              <CardDescription>Current hostel fee structure for different room types</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Monthly Fee</TableHead>
                    <TableHead>Quarterly Fee</TableHead>
                    <TableHead>Annual Fee</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      type: "Standard (4-Sharing)",
                      description: "Basic amenities with shared bathroom",
                      monthly: "₹4,500",
                      quarterly: "₹12,500",
                      annual: "₹45,000",
                      updated: "Jan 15, 2023",
                    },
                    {
                      type: "Standard (3-Sharing)",
                      description: "Basic amenities with shared bathroom",
                      monthly: "₹5,000",
                      quarterly: "₹14,000",
                      annual: "₹50,000",
                      updated: "Jan 15, 2023",
                    },
                    {
                      type: "Standard (2-Sharing)",
                      description: "Basic amenities with shared bathroom",
                      monthly: "₹6,000",
                      quarterly: "₹17,000",
                      annual: "₹60,000",
                      updated: "Jan 15, 2023",
                    },
                    {
                      type: "Deluxe (2-Sharing)",
                      description: "Enhanced amenities with attached bathroom",
                      monthly: "₹7,500",
                      quarterly: "₹21,000",
                      annual: "₹75,000",
                      updated: "Jan 15, 2023",
                    },
                    {
                      type: "Single Occupancy",
                      description: "Private room with attached bathroom",
                      monthly: "₹10,000",
                      quarterly: "₹28,000",
                      annual: "₹1,00,000",
                      updated: "Jan 15, 2023",
                    },
                  ].map((fee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{fee.type}</TableCell>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell>{fee.monthly}</TableCell>
                      <TableCell>{fee.quarterly}</TableCell>
                      <TableCell>{fee.annual}</TableCell>
                      <TableCell>{fee.updated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 flex justify-end">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Update Fee Structure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
