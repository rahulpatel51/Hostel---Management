"use client"

import { useState, useEffect } from 'react'
import { BedDouble, Check, ChevronDown, ChevronUp, Loader2, Search, User, UserCheck, UserPlus, UserX, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types
interface Student {
  id: string
  name: string
  email: string
  registrationNumber: string
  course: string
  semester: number
  gender: "Male" | "Female"
  currentRoom?: string
  status: "Active" | "Inactive"
}

interface Room {
  id: string
  block: string
  roomNumber: string
  floor: string
  capacity: number
  occupied: number
  type: string
  gender: "Male" | "Female"
  status: "Available" | "Full" | "Maintenance"
}

export default function RoomAllocationPage() {
  // State
  const [students, setStudents] = useState<Student[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGender, setFilterGender] = useState<"All" | "Male" | "Female">("All")
  const [loading, setLoading] = useState({
    students: false,
    rooms: false,
    action: false
  })
  const [showAllocationDialog, setShowAllocationDialog] = useState(false)
  const [showDeallocationDialog, setShowDeallocationDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"allocate" | "bulk">("allocate")

  // Mock data - replace with actual API calls
  useEffect(() => {
    setLoading({ students: true, rooms: true, action: false })
    
    // Mock students data
    const mockStudents: Student[] = [
      {
        id: "1",
        name: "Rahul Sharma",
        email: "rahul@example.com",
        registrationNumber: "2023001",
        course: "B.Tech CSE",
        semester: 3,
        gender: "Male",
        status: "Active"
      },
      {
        id: "2",
        name: "Priya Patel",
        email: "priya@example.com",
        registrationNumber: "2023002",
        course: "B.Tech ECE",
        semester: 2,
        gender: "Female",
        currentRoom: "A-101",
        status: "Active"
      },
      // Add more mock data...
    ]

    // Mock rooms data
    const mockRooms: Room[] = [
      {
        id: "1",
        block: "A",
        roomNumber: "101",
        floor: "1st Floor",
        capacity: 2,
        occupied: 1,
        type: "AC",
        gender: "Male",
        status: "Available"
      },
      {
        id: "2",
        block: "B",
        roomNumber: "201",
        floor: "2nd Floor",
        capacity: 3,
        occupied: 3,
        type: "Non-AC",
        gender: "Female",
        status: "Full"
      },
      // Add more mock data...
    ]

    setTimeout(() => {
      setStudents(mockStudents)
      setRooms(mockRooms)
      setLoading({ students: false, rooms: false, action: false })
    }, 1000)
  }, [])

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = filterGender === "All" || student.gender === filterGender
    return matchesSearch && matchesGender
  })

  // Filter available rooms for selected student
  const availableRooms = selectedStudent 
    ? rooms.filter(room => 
        room.status === "Available" &&
        room.gender === selectedStudent.gender &&
        room.occupied < room.capacity
      )
    : []

  // Handle allocation
  const handleAllocate = () => {
    if (!selectedStudent || !selectedRoom) return
    
    setLoading({ ...loading, action: true })
    
    // Simulate API call
    setTimeout(() => {
      setStudents(students.map(s => 
        s.id === selectedStudent.id 
          ? { ...s, currentRoom: `${selectedRoom.block}-${selectedRoom.roomNumber}` } 
          : s
      ))
      setRooms(rooms.map(r => 
        r.id === selectedRoom.id 
          ? { ...r, occupied: r.occupied + 1, status: r.occupied + 1 === r.capacity ? "Full" : "Available" } 
          : r
      ))
      setLoading({ ...loading, action: false })
      setShowAllocationDialog(false)
      toast.success(`${selectedStudent.name} allocated to Room ${selectedRoom.block}-${selectedRoom.roomNumber}`)
    }, 1000)
  }

  // Handle deallocation
  const handleDeallocate = () => {
    if (!selectedStudent || !selectedStudent.currentRoom) return
    
    setLoading({ ...loading, action: true })
    
    // Simulate API call
    setTimeout(() => {
      const [block, roomNumber] = selectedStudent.currentRoom!.split('-')
      
      setStudents(students.map(s => 
        s.id === selectedStudent.id 
          ? { ...s, currentRoom: undefined } 
          : s
      ))
      setRooms(rooms.map(r => 
        `${r.block}-${r.roomNumber}` === selectedStudent.currentRoom
          ? { ...r, occupied: r.occupied - 1, status: "Available" } 
          : r
      ))
      setLoading({ ...loading, action: false })
      setShowDeallocationDialog(false)
      toast.success(`${selectedStudent.name} deallocated from Room ${selectedStudent.currentRoom}`)
    }, 1000)
  }

  // Toast notification function (mock)
  const toast = {
    success: (message: string) => console.log(`Success: ${message}`),
    error: (message: string) => console.log(`Error: ${message}`)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Room Allocation</h1>
          <p className="text-muted-foreground">
            Manage student room assignments and allocations
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "allocate" | "bulk")}>
          <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
            <TabsTrigger value="allocate">Single Allocation</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Allocation</TabsTrigger>
          </TabsList>
          
          {/* Single Allocation Tab */}
          <TabsContent value="allocate" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Students Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search students..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-7 w-7"
                            onClick={() => setSearchTerm("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Select 
                        value={filterGender} 
                        onValueChange={(value) => setFilterGender(value as "All" | "Male" | "Female")}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Students List */}
                    {loading.students ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-12 bg-muted/50 p-3 font-medium text-sm">
                          <div className="col-span-6">Name</div>
                          <div className="col-span-3">Course</div>
                          <div className="col-span-3">Status</div>
                        </div>
                        <div className="divide-y max-h-[500px] overflow-y-auto">
                          {filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              className={`grid grid-cols-12 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                                selectedStudent?.id === student.id ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                              }`}
                              onClick={() => setSelectedStudent(student)}
                            >
                              <div className="col-span-6 flex items-center gap-2">
                                {student.currentRoom ? (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                ) : (
                                  <UserX className="h-4 w-4 text-amber-500" />
                                )}
                                <span>{student.name}</span>
                              </div>
                              <div className="col-span-3 text-sm text-muted-foreground">
                                {student.course}
                              </div>
                              <div className="col-span-3">
                                <Badge
                                  variant={student.currentRoom ? "default" : "outline"}
                                  className={
                                    student.currentRoom
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  }
                                >
                                  {student.currentRoom ? `Room ${student.currentRoom}` : "Unallocated"}
                                </Badge>
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
              <Card>
                <CardHeader>
                  <CardTitle>Allocation Details</CardTitle>
                  <CardDescription>
                    {selectedStudent 
                      ? `Manage room for ${selectedStudent.name}`
                      : "Select a student to allocate or deallocate"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStudent ? (
                    <div className="space-y-6">
                      {/* Student Info */}
                      <div className="space-y-2">
                        <Label>Selected Student</Label>
                        <div className="p-4 border rounded-lg bg-muted/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{selectedStudent.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedStudent.registrationNumber} | {selectedStudent.course} - Sem {selectedStudent.semester}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {selectedStudent.gender}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            {selectedStudent.currentRoom ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Currently in Room {selectedStudent.currentRoom}
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                Not allocated to any room
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Allocation/Deallocation Options */}
                      {selectedStudent.currentRoom ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Deallocate Room</Label>
                            <p className="text-sm text-muted-foreground">
                              This will remove the student from their current room assignment.
                            </p>
                          </div>
                          <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => setShowDeallocationDialog(true)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Deallocate Room
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Available Rooms</Label>
                            <Select
                              onValueChange={(value) => {
                                const room = rooms.find(r => r.id === value)
                                if (room) setSelectedRoom(room)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a room to allocate" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableRooms.length > 0 ? (
                                  availableRooms.map(room => (
                                    <SelectItem 
                                      key={room.id} 
                                      value={room.id}
                                    >
                                      {`Room ${room.block}-${room.roomNumber} (${room.type}) - ${room.capacity - room.occupied} bed${
                                        room.capacity - room.occupied !== 1 ? 's' : ''
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
                              <Label>Room Details</Label>
                              <div className="p-4 border rounded-lg bg-muted/10">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">Room {selectedRoom.block}-{selectedRoom.roomNumber}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedRoom.floor} | {selectedRoom.type}
                                    </p>
                                  </div>
                                  <Badge variant="outline">
                                    {selectedRoom.gender}
                                  </Badge>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Capacity:</span> {selectedRoom.capacity}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Occupied:</span> {selectedRoom.occupied}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Available:</span> {selectedRoom.capacity - selectedRoom.occupied}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Status:</span> 
                                    <Badge
                                      variant="outline"
                                      className={`ml-2 ${
                                        selectedRoom.status === "Available"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                          : selectedRoom.status === "Full"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                      }`}
                                    >
                                      {selectedRoom.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button 
                            className="w-full"
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
                      <User className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No student selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Select a student from the list to view allocation options
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bulk Allocation Tab */}
          <TabsContent value="bulk" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Room Allocation</CardTitle>
                <CardDescription>
                  Allocate multiple students to rooms at once (CSV upload)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                  <div className="mb-4 p-3 rounded-full bg-muted">
                    <UserPlus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    File should contain student IDs and room numbers
                  </p>
                  <Button variant="outline">
                    Select File
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Download template CSV for reference
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Allocation Confirmation Dialog */}
      <AlertDialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Room Allocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to allocate {selectedStudent?.name} to Room {selectedRoom?.block}-{selectedRoom?.roomNumber}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAllocate}
              disabled={loading.action}
            >
              {loading.action ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Allocating...
                </>
              ) : (
                "Confirm Allocation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deallocation Confirmation Dialog */}
      <AlertDialog open={showDeallocationDialog} onOpenChange={setShowDeallocationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Room Deallocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedStudent?.name} from Room {selectedStudent?.currentRoom}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeallocate}
              disabled={loading.action}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading.action ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deallocating...
                </>
              ) : (
                "Confirm Deallocation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}