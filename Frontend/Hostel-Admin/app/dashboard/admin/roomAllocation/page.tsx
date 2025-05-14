"use client"

import { useState, useEffect } from "react"
import {
  BedDouble,
  Loader2,
  Search,
  User,
  UserCheck,
  UserPlus,
  UserX,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"

// Types
interface Student {
  _id: string
  name: string
  email: string
  registrationNumber: string
  course: string
  semester: number
  gender: "Male" | "Female"
  roomId?: string
  status: "Active" | "Inactive"
}

interface Room {
  roomType: any
  _id: string
  block: string
  roomNumber: string
  floor: string
  capacity: number
  occupiedCount: number
  type: string
  gender: "Male" | "Female"
  status: "Available" | "Full" | "Maintenance"
  occupants: Student[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export default function RoomAllocationPage() {
  // State
  const [students, setStudents] = useState<Student[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"All" | "Allocated" | "Unallocated">("All")
  const [loading, setLoading] = useState({
    students: false,
    rooms: false,
    action: false,
  })
  const [showAllocationDialog, setShowAllocationDialog] = useState(false)
  const [showDeallocationDialog, setShowDeallocationDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"allocate" | "rooms">("allocate")
  const [showRoomDetails, setShowRoomDetails] = useState(false)
  const [currentRoomDetails, setCurrentRoomDetails] = useState<Room | null>(null)
  const [selectedStudentsForDeallocation, setSelectedStudentsForDeallocation] = useState<string[]>([])
  const [showBulkDeallocationDialog, setShowBulkDeallocationDialog] = useState(false)

  // Fetch data from API
  const fetchStudents = async () => {
    try {
      setLoading((prev) => ({ ...prev, students: true }))
      const res = await fetch(`${API_BASE}/api/room-allocation/students`)
      if (!res.ok) throw new Error("Failed to fetch students")
      const data = await res.json()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch students",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, students: false }))
    }
  }

  const fetchRooms = async () => {
    try {
      setLoading((prev) => ({ ...prev, rooms: true }))
      const res = await fetch(`${API_BASE}/api/room-allocation/rooms`)
      if (!res.ok) throw new Error("Failed to fetch rooms")
      const data = await res.json()
      setRooms(data)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch rooms",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, rooms: false }))
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchRooms()
  }, [])

  // Filter students with null checks
  const filteredStudents = students.filter((student) => {
    const name = student.name || ""
    const regNum = student.registrationNumber || ""
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) || regNum.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = 
      filterStatus === "All" || 
      (filterStatus === "Allocated" && student.roomId) || 
      (filterStatus === "Unallocated" && !student.roomId)
    return matchesSearch && matchesStatus
  })

  // Filter available rooms for selected student
  const availableRooms = selectedStudent
    ? rooms.filter(
        (room) =>
          room.status === "Available" && room.gender === selectedStudent.gender && room.occupiedCount < room.capacity,
      )
    : []

  // Handle allocation
  const handleAllocate = async () => {
    if (!selectedStudent || !selectedRoom) return

    setLoading((prev) => ({ ...prev, action: true }))

    try {
      const response = await fetch(`${API_BASE}/api/room-allocation/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          roomId: selectedRoom._id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to allocate room")
      }

      // Refresh data
      await Promise.all([fetchStudents(), fetchRooms()])

      // Update selected student
      const updatedStudent = students.find((s) => s._id === selectedStudent._id)
      setSelectedStudent(updatedStudent || null)

      toast({
        title: "Success",
        description: `${selectedStudent.name} allocated to Room ${selectedRoom.block}-${selectedRoom.roomNumber}`,
      })
    } catch (error) {
      console.error("Allocation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to allocate room",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
      setShowAllocationDialog(false)
    }
  }

  // Handle deallocation
  const handleDeallocate = async () => {
    if (!selectedStudent || !selectedStudent.roomId) return

    setLoading((prev) => ({ ...prev, action: true }))

    try {
      const response = await fetch(`${API_BASE}/api/room-allocation/deallocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent._id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to deallocate room")
      }

      // Refresh data
      await Promise.all([fetchStudents(), fetchRooms()])

      // Update selected student
      const updatedStudent = students.find((s) => s._id === selectedStudent._id)
      setSelectedStudent(updatedStudent || null)

      toast({
        title: "Success",
        description: `${selectedStudent.name} deallocated from room`,
      })
    } catch (error) {
      console.error("Deallocation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deallocate room",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
      setShowDeallocationDialog(false)
    }
  }

  // Handle bulk deallocation
  const handleBulkDeallocate = async () => {
    if (selectedStudentsForDeallocation.length === 0) return

    setLoading((prev) => ({ ...prev, action: true }))

    try {
      // In a real implementation, you would likely have a bulk endpoint
      // For this example, we'll use Promise.all to make multiple requests
      await Promise.all(
        selectedStudentsForDeallocation.map((studentId) =>
          fetch(`${API_BASE}/api/room-allocation/deallocate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ studentId }),
          }),
        ),
      )

      // Refresh data
      await Promise.all([fetchStudents(), fetchRooms()])

      toast({
        title: "Success",
        description: `${selectedStudentsForDeallocation.length} students deallocated from rooms`,
      })

      // Clear selections
      setSelectedStudentsForDeallocation([])
    } catch (error) {
      console.error("Bulk deallocation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deallocate rooms",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, action: false }))
      setShowBulkDeallocationDialog(false)
    }
  }

  // Toggle student selection for deallocation
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentsForDeallocation((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  // View room occupants
  const viewRoomDetails = (roomId: string) => {
    const room = rooms.find((r) => r._id === roomId)
    if (room) {
      setCurrentRoomDetails(room)
      setShowRoomDetails(true)
    }
  }

  // Get status badge styling
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "Full":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "Maintenance":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20 p-6 rounded-lg border">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Hostel Room Allocation
          </h1>
          <p className="text-muted-foreground">Manage student room assignments and allocations</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "allocate" | "rooms")}>
          <TabsList className="grid grid-cols-2 w-full md:w-[400px] bg-muted/80">
            <TabsTrigger
              value="allocate"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-100"
            >
              Student Allocation
            </TabsTrigger>
            <TabsTrigger
              value="rooms"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-100"
            >
              Room Management
            </TabsTrigger>
          </TabsList>

          {/* Student Allocation Tab */}
          <TabsContent value="allocate" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Students Panel */}
              <Card className="border-purple-200 dark:border-purple-800/30 shadow-sm">
                <CardHeader className="bg-purple-50 dark:bg-purple-950/20 rounded-t-lg border-b border-purple-100 dark:border-purple-800/20">
                  <CardTitle className="text-purple-900 dark:text-purple-100">Students</CardTitle>
                  <CardDescription>
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-6">
                  <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                        <Input
                          placeholder="Search students..."
                          className="pl-10 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-7 w-7 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                            onClick={() => setSearchTerm("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Select
                        value={filterStatus}
                        onValueChange={(value) => setFilterStatus(value as "All" | "Allocated" | "Unallocated")}
                      >
                        <SelectTrigger className="w-[150px] border-purple-200 dark:border-purple-800/30">
                          <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Allocated">Allocated</SelectItem>
                          <SelectItem value="Unallocated">Unallocated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Students List */}
                    {loading.students ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      </div>
                    ) : (
                      <div className="border border-purple-200 dark:border-purple-800/30 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-12 bg-purple-50 dark:bg-purple-950/20 p-3 font-medium text-sm">
                          <div className="col-span-5">Name</div>
                          <div className="col-span-3">Course</div>
                          <div className="col-span-4">Status</div>
                        </div>
                        <div className="divide-y divide-purple-100 dark:divide-purple-800/20 max-h-[500px] overflow-y-auto">
                          {filteredStudents.map((student) => (
                            <div
                              key={student._id}
                              className={`grid grid-cols-12 p-3 hover:bg-purple-50/50 dark:hover:bg-purple-950/10 cursor-pointer transition-colors ${
                                selectedStudent?._id === student._id ? "bg-purple-100 dark:bg-purple-900/20" : ""
                              }`}
                              onClick={() => setSelectedStudent(student)}
                            >
                              <div className="col-span-5 flex items-center gap-2">
                                {student.roomId ? (
                                  <UserCheck className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <UserX className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="truncate">{student.name}</span>
                              </div>
                              <div className="col-span-3 text-sm text-muted-foreground truncate">{student.course}</div>
                              <div className="col-span-4">
                                {student.roomId ? (
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="default"
                                      className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    >
                                      Allocated
                                    </Badge>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-5 p-0 text-xs text-purple-600 dark:text-purple-400"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        viewRoomDetails(student.roomId!)
                                      }}
                                    >
                                      View Room
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  >
                                    Unallocated
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Allocation Panel */}
              <Card className="border-emerald-200 dark:border-emerald-800/30 shadow-sm">
                <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 rounded-t-lg border-b border-emerald-100 dark:border-emerald-800/20">
                  <CardTitle className="text-emerald-900 dark:text-emerald-100">Allocation Details</CardTitle>
                  <CardDescription>
                    {selectedStudent
                      ? `Manage room for ${selectedStudent.name}`
                      : "Select a student to allocate or deallocate"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-6">
                  {selectedStudent ? (
                    <div className="space-y-6">
                      {/* Student Info */}
                      <div className="space-y-2">
                        <Label className="text-emerald-700 dark:text-emerald-300">Selected Student</Label>
                        <div className="p-4 border border-emerald-200 dark:border-emerald-800/30 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-emerald-900 dark:text-emerald-100">
                                {selectedStudent.name}
                              </p>
                              <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">
                                {selectedStudent.registrationNumber} | {selectedStudent.course} - Sem{" "}
                                {selectedStudent.semester}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-emerald-200 bg-emerald-100/50 text-emerald-800 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-300"
                            >
                              {selectedStudent.gender}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            {selectedStudent.roomId ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  Room Allocated
                                </Badge>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-6 p-0 text-purple-600 dark:text-purple-400"
                                  onClick={() => viewRoomDetails(selectedStudent.roomId!)}
                                >
                                  View Room Details
                                </Button>
                              </div>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                Not allocated to any room
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Allocation/Deallocation Options */}
                      {selectedStudent.roomId ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-red-600 dark:text-red-400">Deallocate Room</Label>
                            <p className="text-sm text-muted-foreground">
                              This will remove the student from their current room assignment.
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => setShowDeallocationDialog(true)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Deallocate Room
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-emerald-700 dark:text-emerald-300">Available Rooms</Label>
                            <Select
                              onValueChange={(value) => {
                                const room = rooms.find((r) => r._id === value)
                                if (room) setSelectedRoom(room)
                              }}
                            >
                              <SelectTrigger className="border-emerald-200 dark:border-emerald-800/30">
                                <SelectValue placeholder="Select a room to allocate" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRooms.length > 0 ? (
                                  availableRooms.map((room) => (
                                    <SelectItem key={room._id} value={room._id}>
                                      {`RoomNumber-${room.roomNumber} (${room.roomType}) - ${room.capacity - room.occupiedCount} bed${
                                        room.capacity - room.occupiedCount !== 1 ? "s" : ""
                                      } available`}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="py-2 text-center text-sm text-muted-foreground">
                                    No available rooms matching criteria
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedRoom && (
                            <div className="space-y-2">
                              <Label className="text-emerald-700 dark:text-emerald-300">Room Details</Label>
                              <div className="p-4 border border-emerald-200 dark:border-emerald-800/30 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-emerald-900 dark:text-emerald-100">
                                      {selectedRoom.block}-{selectedRoom.roomNumber}
                                    </p>
                                    <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">
                                      {selectedRoom.floor} | {selectedRoom.roomType}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="border-emerald-200 bg-emerald-100/50 text-emerald-800 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-300"
                                  >
                                    {selectedRoom.gender}
                                  </Badge>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-emerald-700/70 dark:text-emerald-300/70">Capacity:</span>{" "}
                                    {selectedRoom.capacity}
                                  </div>
                                  <div>
                                    <span className="text-emerald-700/70 dark:text-emerald-300/70">Occupied:</span>{" "}
                                    {selectedRoom.occupiedCount}
                                  </div>
                                  <div>
                                    <span className="text-emerald-700/70 dark:text-emerald-300/70">Available:</span>{" "}
                                    {selectedRoom.capacity - selectedRoom.occupiedCount}
                                  </div>
                                  <div>
                                    <span className="text-emerald-700/70 dark:text-emerald-300/70">Status:</span>
                                    <Badge
                                      variant="outline"
                                      className={`ml-2 ${getStatusBadgeStyles(selectedRoom.status)}`}
                                    >
                                      {selectedRoom.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => setShowAllocationDialog(true)}
                            disabled={!selectedRoom}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Allocate Room
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-1 text-emerald-900 dark:text-emerald-100">
                        No student selected
                      </h3>
                      <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">
                        Select a student from the list to view allocation options
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Room Management Tab */}
          <TabsContent value="rooms" className="mt-6">
            <Card className="border-emerald-200 dark:border-emerald-800/30 shadow-sm">
              <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 rounded-t-lg border-b border-emerald-100 dark:border-emerald-800/20">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-emerald-900 dark:text-emerald-100">Room Management</CardTitle>
                    <CardDescription>View and manage all hostel rooms and their occupants</CardDescription>
                  </div>

                  {selectedStudentsForDeallocation.length > 0 && (
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setShowBulkDeallocationDialog(true)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Deallocate {selectedStudentsForDeallocation.length} Student
                      {selectedStudentsForDeallocation.length > 1 ? "s" : ""}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                {loading.rooms ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="border border-emerald-200 dark:border-emerald-800/30 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-emerald-50 dark:bg-emerald-950/20">
                        <TableRow className="hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30">
                          <TableHead>Room</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Occupied</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rooms.map((room) => (
                          <TableRow
                            key={room._id}
                            className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/30"
                          >
                            <TableCell className="font-medium text-emerald-900 dark:text-emerald-100">
                              {room.roomNumber}
                              <div className="text-xs text-emerald-700/70 dark:text-emerald-300/70">{room.floor}</div>
                            </TableCell>
                            <TableCell>{room.roomType}</TableCell>
                            <TableCell>{room.capacity}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {room.occupiedCount}
                                <div className="w-16 h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 dark:bg-emerald-400"
                                    style={{ width: `${(room.occupiedCount / room.capacity) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusBadgeStyles(room.status)}>
                                {room.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800/30 dark:hover:bg-emerald-900/20"
                                onClick={() => viewRoomDetails(room._id)}
                              >
                                View Occupants
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Allocation Confirmation Dialog */}
      <AlertDialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <AlertDialogContent className="border-emerald-200 dark:border-emerald-800/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-emerald-900 dark:text-emerald-100">
              Confirm Room Allocation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to allocate {selectedStudent?.name} to Room {selectedRoom?.block}-
              {selectedRoom?.roomNumber}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-emerald-200 dark:border-emerald-800/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAllocate}
              disabled={loading.action}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading.action ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Allocating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Allocation
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deallocation Confirmation Dialog */}
      <AlertDialog open={showDeallocationDialog} onOpenChange={setShowDeallocationDialog}>
        <AlertDialogContent className="border-red-200 dark:border-red-800/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">Confirm Room Deallocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedStudent?.name} from their current room?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-red-200 dark:border-red-800/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeallocate}
              disabled={loading.action}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading.action ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deallocating...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Confirm Deallocation
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Deallocation Confirmation Dialog */}
      <AlertDialog open={showBulkDeallocationDialog} onOpenChange={setShowBulkDeallocationDialog}>
        <AlertDialogContent className="border-red-200 dark:border-red-800/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">Confirm Bulk Deallocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deallocate {selectedStudentsForDeallocation.length} student
              {selectedStudentsForDeallocation.length > 1 ? "s" : ""} from their rooms? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-red-200 dark:border-red-800/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeallocate}
              disabled={loading.action}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading.action ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deallocating...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Confirm Deallocation
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Room Details Sheet */}
      <Sheet open={showRoomDetails} onOpenChange={setShowRoomDetails}>
        <SheetContent className="w-full sm:max-w-md border-l border-emerald-200 dark:border-emerald-800/30">
          <SheetHeader className="border-b border-emerald-100 dark:border-emerald-800/20 pb-4">
            <SheetTitle className="text-emerald-900 dark:text-emerald-100">
              Room {currentRoomDetails?.roomNumber} Occupants
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {currentRoomDetails?.occupants?.length ? (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium pb-2 border-b border-emerald-100 dark:border-emerald-800/20">
                  {activeTab === "rooms" && (
                    <div className="col-span-1">
                      <span className="sr-only">Select</span>
                    </div>
                  )}
                  <div className={activeTab === "rooms" ? "col-span-5" : "col-span-6"}>Name</div>
                  <div className="col-span-3">Course</div>
                  <div className="col-span-3">Semester</div>
                </div>
                {currentRoomDetails.occupants.map((student) => (
                  <div key={student._id} className="grid grid-cols-12 gap-4 text-sm items-center">
                    {activeTab === "rooms" && (
                      <div className="col-span-1">
                        <Checkbox
                          id={`select-${student._id}`}
                          checked={selectedStudentsForDeallocation.includes(student._id)}
                          onCheckedChange={() => toggleStudentSelection(student._id)}
                          className="border-emerald-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </div>
                    )}
                    <div className={`truncate ${activeTab === "rooms" ? "col-span-5" : "col-span-6"}`}>
                      <label htmlFor={`select-${student._id}`} className="cursor-pointer">
                        {student.name}
                      </label>
                    </div>
                    <div className="truncate col-span-3">{student.course}</div>
                    <div className="col-span-3">Sem {student.semester}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <BedDouble className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-medium mb-1 text-emerald-900 dark:text-emerald-100">No occupants</h3>
                <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70">This room is currently empty</p>
              </div>
            )}
          </div>
          {activeTab === "rooms" && currentRoomDetails?.occupants?.length ? (
            <SheetFooter className="mt-6 border-t border-emerald-100 dark:border-emerald-800/20 pt-4">
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                  {
                    selectedStudentsForDeallocation.filter((id) =>
                      currentRoomDetails.occupants.some((student) => student._id === id),
                    ).length
                  }{" "}
                  selected
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800/30 dark:hover:bg-emerald-900/20"
                  onClick={() => {
                    // Select all students in this room
                    const roomStudentIds = currentRoomDetails.occupants.map((student) => student._id)
                    const allSelected = roomStudentIds.every((id) => selectedStudentsForDeallocation.includes(id))

                    if (allSelected) {
                      // Deselect all from this room
                      setSelectedStudentsForDeallocation((prev) => prev.filter((id) => !roomStudentIds.includes(id)))
                    } else {
                      // Select all from this room
                      setSelectedStudentsForDeallocation((prev) => {
                        const newSelection = [...prev]
                        roomStudentIds.forEach((id) => {
                          if (!newSelection.includes(id)) {
                            newSelection.push(id)
                          }
                        })
                        return newSelection
                      })
                    }
                  }}
                >
                  {currentRoomDetails.occupants.every((student) =>
                    selectedStudentsForDeallocation.includes(student._id),
                  )
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}