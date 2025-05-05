"use client"

import { useState } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Filter, 
  MoreHorizontal, 
  Search, 
  UserPlus,
  X,
  ChevronDown,
  ChevronUp,
  Move,
  Edit,
  DollarSign
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  room: string
  block: string
  course: string
  year: string
  status: string
  joinDate: string
  address: string
  image: string
}

interface FeeRecord {
  id: string
  date: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  paymentMethod?: string
  receiptNumber?: string
}

export default function StudentManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [blockFilter, setBlockFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showChangeRoom, setShowChangeRoom] = useState(false)
  const [showFeeHistory, setShowFeeHistory] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editedStudent, setEditedStudent] = useState<Student | null>(null)
  const [newBlock, setNewBlock] = useState("")
  const [newRoom, setNewRoom] = useState("")

  const students: Student[] = [
    {
      id: "ST2023001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      room: "A-101",
      block: "Block A",
      course: "Computer Science",
      year: "2nd Year",
      status: "Active",
      joinDate: "15 Aug 2022",
      address: "123 Main St, Bangalore, Karnataka",
      image: "/avatars/01.png"
    },
    {
      id: "ST2023002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 8765432109",
      room: "B-205",
      block: "Block B",
      course: "Electrical Engineering",
      year: "3rd Year",
      status: "Active",
      joinDate: "20 Jul 2021",
      address: "456 Oak Ave, Mumbai, Maharashtra",
      image: "/avatars/02.png"
    },
    {
      id: "ST2023003",
      name: "Michael Johnson",
      email: "michael.j@example.com",
      phone: "+91 7654321098",
      room: "C-310",
      block: "Block C",
      course: "Mechanical Engineering",
      year: "1st Year",
      status: "Active",
      joinDate: "05 Jun 2023",
      address: "789 Pine Rd, Delhi",
      image: "/avatars/03.png"
    },
    {
      id: "ST2023004",
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      phone: "+91 6543210987",
      room: "A-202",
      block: "Block A",
      course: "Civil Engineering",
      year: "4th Year",
      status: "Active",
      joinDate: "10 May 2020",
      address: "321 Elm St, Chennai, Tamil Nadu",
      image: "/avatars/04.png"
    },
    {
      id: "ST2023005",
      name: "David Brown",
      email: "david.b@example.com",
      phone: "+91 5432109876",
      room: "D-105",
      block: "Block D",
      course: "Business Administration",
      year: "2nd Year",
      status: "Pending",
      joinDate: "Pending",
      address: "654 Maple Dr, Hyderabad, Telangana",
      image: "/avatars/05.png"
    },
    {
      id: "ST2023006",
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+91 4321098765",
      room: "B-301",
      block: "Block B",
      course: "Medicine",
      year: "3rd Year",
      status: "Active",
      joinDate: "12 Apr 2021",
      address: "987 Cedar Ln, Kolkata, West Bengal",
      image: "/avatars/06.png"
    },
  ]

  const feeRecords: FeeRecord[] = [
    {
      id: "FEE2023001",
      date: "15 Jan 2023",
      amount: 25000,
      status: "Paid",
      paymentMethod: "Online Transfer",
      receiptNumber: "RC2023001"
    },
    {
      id: "FEE2023002",
      date: "15 Feb 2023",
      amount: 25000,
      status: "Paid",
      paymentMethod: "Cheque",
      receiptNumber: "RC2023002"
    },
    {
      id: "FEE2023003",
      date: "15 Mar 2023",
      amount: 25000,
      status: "Pending"
    },
    {
      id: "FEE2023004",
      date: "15 Apr 2023",
      amount: 25000,
      status: "Overdue"
    }
  ]

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    const matchesYear = yearFilter === "all" || student.year === yearFilter
    const matchesBlock = blockFilter === "all" || student.block === blockFilter
    
    return matchesSearch && matchesStatus && matchesYear && matchesBlock
  })

  const handleEditStudent = (student: Student) => {
    setEditedStudent({...student})
    setShowEditStudent(true)
  }

  const handleSaveStudent = () => {
    // In a real app, you would update the student in your database/state here
    setShowEditStudent(false)
  }

  const handleChangeRoom = (student: Student) => {
    setSelectedStudent(student)
    setNewBlock(student.block)
    setNewRoom(student.room)
    setShowChangeRoom(true)
  }

  const handleSaveRoomChange = () => {
    // In a real app, you would update the room allocation in your database/state here
    setShowChangeRoom(false)
  }

  const handleViewFeeHistory = (student: Student) => {
    setSelectedStudent(student)
    setShowFeeHistory(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Student Management
        </h1>
        <p className="text-muted-foreground">Manage all student records, admissions, and details.</p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students by name, ID or course..."
              className="w-full bg-white dark:bg-gray-900 pl-8 border-gray-200 dark:border-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2.5 top-2.5 h-5 w-5 text-muted-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </Button>
            <Button 
              size="sm" 
              className="h-9 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setShowAddStudent(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-teal-100 dark:border-teal-900 rounded-lg bg-teal-50/50 dark:bg-teal-900/10">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year-filter">Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-filter">Block</Label>
              <Select value={blockFilter} onValueChange={setBlockFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  <SelectItem value="Block A">Block A</SelectItem>
                  <SelectItem value="Block B">Block B</SelectItem>
                  <SelectItem value="Block C">Block C</SelectItem>
                  <SelectItem value="Block D">Block D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex h-auto p-0 bg-transparent gap-2">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            All Students
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="alumni"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Alumni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card className="border-teal-200 dark:border-teal-800">
            <CardHeader className="p-4 flex flex-row items-center justify-between bg-teal-50/50 dark:bg-teal-900/10">
              <div>
                <CardTitle className="text-xl">All Students</CardTitle>
                <CardDescription>
                  Showing {filteredStudents.length} of {students.length} students
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 border-teal-200 dark:border-teal-700">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-teal-50/30 dark:bg-gray-900">
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Room</TableHead>
                    <TableHead className="hidden md:table-cell">Course</TableHead>
                    <TableHead className="hidden md:table-cell">Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-teal-50/30 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">{student.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={student.image} alt={student.name} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground hidden sm:inline">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-medium">{student.room}</div>
                        <div className="text-xs text-muted-foreground">{student.block}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{student.course}</TableCell>
                      <TableCell className="hidden md:table-cell">{student.year}</TableCell>
                      <TableCell>
                        <Badge
                          variant={student.status === "Active" ? "default" : "outline"}
                          className={
                            student.status === "Active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                              : "text-amber-800 border-amber-600 dark:text-amber-400 dark:border-amber-500"
                          }
                        >
                          {student.status}
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleChangeRoom(student)}>
                              <Move className="mr-2 h-4 w-4" />
                              Change Room
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewFeeHistory(student)}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Fee History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 dark:text-red-400">
                              {student.status === "Active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
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

        <TabsContent value="active" className="mt-4">
          <Card className="border-teal-200 dark:border-teal-800">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Active Students</CardTitle>
              <CardDescription>Currently active students in the hostel</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">
                {filteredStudents.filter(s => s.status === "Active").length} active students
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card className="border-teal-200 dark:border-teal-800">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Pending Admissions</CardTitle>
              <CardDescription>Students with pending hostel admission</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">
                {filteredStudents.filter(s => s.status === "Pending").length} pending admissions
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alumni" className="mt-4">
          <Card className="border-teal-200 dark:border-teal-800">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Alumni</CardTitle>
              <CardDescription>Former students who have left the hostel</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground py-8">
                Alumni records will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Student</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter student's full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter student's email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input id="course" placeholder="Enter course name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Year</SelectItem>
                    <SelectItem value="2nd">2nd Year</SelectItem>
                    <SelectItem value="3rd">3rd Year</SelectItem>
                    <SelectItem value="4th">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="block">Hostel Block</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Block A</SelectItem>
                    <SelectItem value="B">Block B</SelectItem>
                    <SelectItem value="C">Block C</SelectItem>
                    <SelectItem value="D">Block D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input id="room" placeholder="Enter room number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter student's address" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Upload Photo</Label>
              <Input id="photo" type="file" accept="image/*" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700">Add Student</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditStudent} onOpenChange={setShowEditStudent}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Student Details</DialogTitle>
          </DialogHeader>
          {editedStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={editedStudent.name} 
                    onChange={(e) => setEditedStudent({...editedStudent, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={editedStudent.email} 
                    onChange={(e) => setEditedStudent({...editedStudent, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={editedStudent.phone} 
                    onChange={(e) => setEditedStudent({...editedStudent, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Input 
                    value={editedStudent.course} 
                    onChange={(e) => setEditedStudent({...editedStudent, course: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select 
                    value={editedStudent.year} 
                    onValueChange={(value) => setEditedStudent({...editedStudent, year: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editedStudent.status} 
                    onValueChange={(value) => setEditedStudent({...editedStudent, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea 
                  value={editedStudent.address} 
                  onChange={(e) => setEditedStudent({...editedStudent, address: e.target.value})}
                  rows={3} 
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditStudent(false)}>
                  Cancel
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveStudent}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Room Dialog */}
      <Dialog open={showChangeRoom} onOpenChange={setShowChangeRoom}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Change Room Allocation</DialogTitle>
            <DialogDescription>
              Update room for {selectedStudent?.name} ({selectedStudent?.id})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Block</Label>
              <Select value={newBlock} onValueChange={setNewBlock}>
                <SelectTrigger>
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Block A">Block A</SelectItem>
                  <SelectItem value="Block B">Block B</SelectItem>
                  <SelectItem value="Block C">Block C</SelectItem>
                  <SelectItem value="Block D">Block D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Room Number</Label>
              <Input 
                value={newRoom} 
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="Enter new room number"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowChangeRoom(false)}>
                Cancel
              </Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveRoomChange}>
                Update Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fee History Dialog */}
      <Dialog open={showFeeHistory} onOpenChange={setShowFeeHistory}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Fee Payment History</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} ({selectedStudent?.id})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Receipt Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === 'Paid' ? 'default' : 
                          record.status === 'Pending' ? 'secondary' : 'destructive'
                        }
                        className={
                          record.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.paymentMethod || '-'}</TableCell>
                    <TableCell>{record.receiptNumber || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Total Paid: ₹{feeRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Pending: ₹{feeRecords.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="bg-teal-600 hover:bg-teal-700">
                <DollarSign className="mr-2 h-4 w-4" />
                Record New Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedStudent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedStudent.name}</DialogTitle>
                    <DialogDescription>Student ID: {selectedStudent.id}</DialogDescription>
                  </div>
                  <Badge
                    variant={selectedStudent.status === "Active" ? "default" : "outline"}
                    className={
                      selectedStudent.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "text-amber-800 border-amber-600 dark:text-amber-400 dark:border-amber-500"
                    }
                  >
                    {selectedStudent.status}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={selectedStudent.image} alt={selectedStudent.name} />
                      <AvatarFallback>{selectedStudent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="w-full">
                      Change Photo
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Email</Label>
                      <p>{selectedStudent.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Phone</Label>
                      <p>{selectedStudent.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Course</Label>
                      <p>{selectedStudent.course}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Year</Label>
                      <p>{selectedStudent.year}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Room</Label>
                      <p>{selectedStudent.room} ({selectedStudent.block})</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Join Date</Label>
                      <p>{selectedStudent.joinDate}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-muted-foreground">Address</Label>
                      <p>{selectedStudent.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9"
                      onClick={() => {
                        handleEditStudent(selectedStudent)
                        setSelectedStudent(null)
                      }}
                    >
                      Edit Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9"
                      onClick={() => {
                        handleChangeRoom(selectedStudent)
                        setSelectedStudent(null)
                      }}
                    >
                      Change Room
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9"
                      onClick={() => {
                        handleViewFeeHistory(selectedStudent)
                        setSelectedStudent(null)
                      }}
                    >
                      View Fees
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 text-red-600 dark:text-red-400">
                      {selectedStudent.status === "Active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setSelectedStudent(null)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}