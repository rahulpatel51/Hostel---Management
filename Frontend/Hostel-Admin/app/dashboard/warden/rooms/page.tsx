"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BedDouble, CheckCircle, Download, Filter, Plus, Search, Users, X, ChevronDown, ChevronUp, Image as ImageIcon, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Room {
  id: string
  block: string
  floor: string
  capacity: number
  occupied: number
  status: "Available" | "Full" | "Maintenance"
  type: string
  description: string
  amenities: string[]
  price: string
  availability: string
  image: string
}

interface Block {
  name: string
  total: number
  occupied: number
  vacant: number
  maintenance: number
  description: string
  image: string
}

export default function RoomAllocationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [blockFilter, setBlockFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showRoomDetails, setShowRoomDetails] = useState(false)
  const [showBlockDetails, setShowBlockDetails] = useState(false)
  const [showEditRoom, setShowEditRoom] = useState(false)
  const [activeTab, setActiveTab] = useState("rooms")
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [editedRoom, setEditedRoom] = useState<Room | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const blocks: Block[] = [
    {
      name: "Block A",
      total: 120,
      occupied: 110,
      vacant: 10,
      maintenance: 0,
      description: "Modern block with AC rooms and premium amenities. Primarily for male students.",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      name: "Block B",
      total: 150,
      occupied: 142,
      vacant: 5,
      maintenance: 3,
      description: "Standard block with both AC and non-AC options. Mixed gender floors available.",
      image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      name: "Block C",
      total: 100,
      occupied: 95,
      vacant: 2,
      maintenance: 3,
      description: "Deluxe block with attached bathrooms and premium facilities. For female students only.",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      name: "Block D",
      total: 80,
      occupied: 75,
      vacant: 3,
      maintenance: 2,
      description: "Economy block with basic amenities. Affordable option for budget-conscious students.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
  ]

  const rooms: Room[] = [
    { 
      id: "A-101", 
      block: "A", 
      floor: "1st", 
      capacity: 4, 
      occupied: 4, 
      status: "Full",
      type: "AC Room - Boys",
      description: "Premium air-conditioned rooms with modern amenities.",
      amenities: ["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi"],
      price: "8,500/month",
      availability: "Booked",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: "A-102", 
      block: "A", 
      floor: "1st", 
      capacity: 4, 
      occupied: 3, 
      status: "Available",
      type: "Non-AC Room - Boys",
      description: "Standard rooms with basic amenities.",
      amenities: ["Study Table", "WiFi", "Fan"],
      price: "6,500/month",
      availability: "Available",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: "B-201", 
      block: "B", 
      floor: "2nd", 
      capacity: 2, 
      occupied: 2, 
      status: "Full",
      type: "AC Room - Girls",
      description: "Premium air-conditioned rooms for female students.",
      amenities: ["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi"],
      price: "9,000/month",
      availability: "Booked",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80"
    },
    { 
      id: "B-202", 
      block: "B", 
      floor: "2nd", 
      capacity: 2, 
      occupied: 1, 
      status: "Available",
      type: "AC Room - Girls",
      description: "Premium air-conditioned rooms for female students.",
      amenities: ["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi"],
      price: "9,000/month",
      availability: "Available",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80"
    },
    { 
      id: "C-301", 
      block: "C", 
      floor: "3rd", 
      capacity: 3, 
      occupied: 3, 
      status: "Full",
      type: "Deluxe Room - Boys",
      description: "Spacious rooms with extra amenities.",
      amenities: ["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi", "Attached Bathroom"],
      price: "10,500/month",
      availability: "Booked",
      image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
    },
    { 
      id: "C-302", 
      block: "C", 
      floor: "3rd", 
      capacity: 3, 
      occupied: 0, 
      status: "Maintenance",
      type: "Deluxe Room - Boys",
      description: "Spacious rooms with extra amenities.",
      amenities: ["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi", "Attached Bathroom"],
      price: "10,500/month",
      availability: "Under Maintenance",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: "D-101", 
      block: "D", 
      floor: "1st", 
      capacity: 2, 
      occupied: 2, 
      status: "Full",
      type: "Non-AC Room - Girls",
      description: "Standard rooms with basic amenities.",
      amenities: ["Study Table", "WiFi", "Fan"],
      price: "6,500/month",
      availability: "Booked",
      image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: "D-102", 
      block: "D", 
      floor: "1st", 
      capacity: 2, 
      occupied: 2, 
      status: "Full",
      type: "Non-AC Room - Girls",
      description: "Standard rooms with basic amenities.",
      amenities: ["Study Table", "WiFi", "Fan"],
      price: "6,500/month",
      availability: "Booked",
      image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
    },
    { 
      id: "A-201", 
      block: "A", 
      floor: "2nd", 
      capacity: 4, 
      occupied: 2, 
      status: "Available",
      type: "AC Room - Boys",
      description: "Premium air-conditioned rooms with modern amenities.",
      amenities: ["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi"],
      price: "8,500/month",
      availability: "Available",
      image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
    },
  ]

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         room.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBlock = blockFilter === "all" || room.block === blockFilter
    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    
    return matchesSearch && matchesBlock && matchesStatus
  })

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room)
    setShowRoomDetails(true)
  }

  const handleViewBlock = (block: Block) => {
    setSelectedBlock(block)
    setShowBlockDetails(true)
  }

  const handleEditRoom = (room: Room) => {
    setEditedRoom({...room})
    setShowEditRoom(true)
  }

  const handleSaveRoom = () => {
    // In a real app, you would save the edited room to your database/state here
    setShowEditRoom(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAllocateNow = (room: Room) => {
    setSelectedRoom(room)
    setActiveTab("allocation")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Room Allocation</h1>
        <p className="text-muted-foreground">Manage hostel rooms and student allocations.</p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rooms or students..."
              className="w-full bg-white dark:bg-gray-950 pl-8 border-gray-200 dark:border-gray-800"
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
              className="h-9 bg-teal-600 hover:bg-teal-700 text-white ml-auto md:ml-0"
              onClick={() => setShowAddRoom(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-teal-100 dark:border-teal-900 rounded-lg bg-teal-50/50 dark:bg-teal-900/10">
            <div className="space-y-2">
              <Label htmlFor="block-filter">Block</Label>
              <Select value={blockFilter} onValueChange={setBlockFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  <SelectItem value="A">Block A</SelectItem>
                  <SelectItem value="B">Block B</SelectItem>
                  <SelectItem value="C">Block C</SelectItem>
                  <SelectItem value="D">Block D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-filter">Room Type</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ac">AC Rooms</SelectItem>
                  <SelectItem value="non-ac">Non-AC Rooms</SelectItem>
                  <SelectItem value="deluxe">Deluxe Rooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="rooms" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex h-auto p-0 bg-transparent gap-2">
          <TabsTrigger
            value="blocks"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Blocks Overview
          </TabsTrigger>
          <TabsTrigger
            value="rooms"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Room List
          </TabsTrigger>
          <TabsTrigger
            value="allocation"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Allocate Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {blocks.map((block, index) => (
              <Card key={index} className="border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{block.name}</CardTitle>
                  <CardDescription>
                    {block.occupied} / {block.total} rooms occupied
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 dark:bg-teal-500 rounded-full"
                        style={{ width: `${(block.occupied / block.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">{block.occupied}</p>
                        <p className="text-xs text-muted-foreground">Occupied</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-600 dark:text-blue-400">{block.vacant}</p>
                        <p className="text-xs text-muted-foreground">Vacant</p>
                      </div>
                      <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">{block.maintenance}</p>
                        <p className="text-xs text-muted-foreground">Maintenance</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewBlock(block)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Occupancy Overview</CardTitle>
              <CardDescription>Current room allocation status across all blocks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">[Occupancy Chart Visualization]</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div>
                <CardTitle className="text-xl">Room List</CardTitle>
                <CardDescription>
                  Showing {filteredRooms.length} of {rooms.length} rooms
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => (
                  <Card key={room.id} className="border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={room.image}
                        alt={`Room ${room.id}`}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          room.status === "Full"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                            : room.status === "Available"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {room.status}
                      </Badge>
                    </div>
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          Room {room.id}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <span>Block {room.block}, {room.floor} Floor</span>
                          <Badge variant="outline" className="text-xs">
                            {room.type.split(' - ')[0]}
                          </Badge>
                        </CardDescription>
                      </div>
                      <BedDouble className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Capacity:</span>
                          <span className="font-medium">{room.capacity} students</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Occupied:</span>
                          <span className="font-medium">{room.occupied} students</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-medium">{room.capacity - room.occupied} beds</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">₹{room.price}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewRoom(room)}
                        >
                          Details
                        </Button>
                        {room.status === "Available" ? (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => handleAllocateNow(room)}
                          >
                            Allocate Now
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            disabled
                          >
                            {room.status}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Allocate Students to Rooms</CardTitle>
              <CardDescription>
                {selectedRoom ? `Allocating to Room ${selectedRoom.id}` : "Assign students to available hostel rooms"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student">Select Student</Label>
                    <Select>
                      <SelectTrigger id="student">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="st001">John Doe (ST2023001)</SelectItem>
                        <SelectItem value="st002">Jane Smith (ST2023002)</SelectItem>
                        <SelectItem value="st003">Michael Johnson (ST2023003)</SelectItem>
                        <SelectItem value="st004">Sarah Williams (ST2023004)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="block">Select Block</Label>
                    <Select value={selectedRoom?.block || ""}>
                      <SelectTrigger id="block">
                        <SelectValue placeholder="Select a block" />
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
                    <Label htmlFor="room">Select Room</Label>
                    <Select value={selectedRoom?.id || ""}>
                      <SelectTrigger id="room">
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms
                          .filter(room => room.status === "Available")
                          .map(room => (
                            <SelectItem 
                              key={room.id} 
                              value={room.id}
                            >
                              {room.id} ({room.capacity - room.occupied} beds available) - ₹{room.price}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bed">Select Bed</Label>
                    <Select>
                      <SelectTrigger id="bed">
                        <SelectValue placeholder="Select a bed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Bed 1</SelectItem>
                        <SelectItem value="2">Bed 2</SelectItem>
                        <SelectItem value="3">Bed 3</SelectItem>
                        <SelectItem value="4">Bed 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Allocation Date</Label>
                    <Input type="date" id="date" className="border-gray-200 dark:border-gray-800" />
                  </div>

                  <div className="pt-2">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Allocation
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedRoom && (
                    <div className="border rounded-lg p-4 border-gray-200 dark:border-gray-800">
                      <h3 className="font-medium mb-2">Selected Room Details</h3>
                      <div className="flex gap-4">
                        <div className="w-1/3">
                          <img
                            src={selectedRoom.image}
                            alt={`Room ${selectedRoom.id}`}
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                        <div className="w-2/3 space-y-2">
                          <p className="font-medium">Room {selectedRoom.id}</p>
                          <p className="text-sm text-muted-foreground">{selectedRoom.type}</p>
                          <p className="text-sm">Block {selectedRoom.block}, {selectedRoom.floor} Floor</p>
                          <p className="text-sm">₹{selectedRoom.price}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={selectedRoom.status === "Available" ? "default" : "outline"}
                              className={
                                selectedRoom.status === "Available"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              }
                            >
                              {selectedRoom.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border rounded-lg p-4 border-gray-200 dark:border-gray-800">
                    <h3 className="font-medium mb-2">Bulk Allocation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a CSV file to allocate multiple students at once
                    </p>
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center border-gray-200 dark:border-gray-800">
                      <Users className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-center text-muted-foreground mb-2">
                        Drag and drop your CSV file here, or click to browse
                      </p>
                      <Button variant="outline" size="sm">
                        Browse Files
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 border-gray-200 dark:border-gray-800">
                    <h3 className="font-medium mb-2">Recent Allocations</h3>
                    <div className="space-y-3">
                      {[
                        { student: "John Doe", room: "A-101", date: "May 1, 2023" },
                        { student: "Jane Smith", room: "B-205", date: "May 1, 2023" },
                        { student: "Michael Johnson", room: "C-310", date: "April 30, 2023" },
                      ].map((allocation, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{allocation.student}</span>
                          <span className="font-medium">Room {allocation.room}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoom} onOpenChange={(open) => {
        setShowAddRoom(open)
        if (!open) {
          setImagePreview("")
          setImageFile(null)
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Room</DialogTitle>
            <DialogDescription>Fill in the details to add a new room to the hostel</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block">Block</Label>
                <Select>
                  <SelectTrigger id="block">
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
                <Label htmlFor="room-number">Room Number</Label>
                <Input id="room-number" placeholder="Enter room number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Select>
                  <SelectTrigger id="floor">
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Floor</SelectItem>
                    <SelectItem value="2nd">2nd Floor</SelectItem>
                    <SelectItem value="3rd">3rd Floor</SelectItem>
                    <SelectItem value="4th">4th Floor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Select>
                  <SelectTrigger id="capacity">
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Students</SelectItem>
                    <SelectItem value="3">3 Students</SelectItem>
                    <SelectItem value="4">4 Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Room Type</Label>
                <Select>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ac-boys">AC Room - Boys</SelectItem>
                    <SelectItem value="ac-girls">AC Room - Girls</SelectItem>
                    <SelectItem value="non-ac-boys">Non-AC Room - Boys</SelectItem>
                    <SelectItem value="non-ac-girls">Non-AC Room - Girls</SelectItem>
                    <SelectItem value="deluxe-boys">Deluxe Room - Boys</SelectItem>
                    <SelectItem value="deluxe-girls">Deluxe Room - Girls</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price (₹)</Label>
                <Input id="price" type="number" placeholder="Enter monthly price" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Room Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi", "Attached Bathroom", "Fan", "Geyser", "Laundry Service"].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input type="checkbox" id={`amenity-${amenity}`} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <label htmlFor={`amenity-${amenity}`} className="text-sm font-medium leading-none">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter room description" rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowAddRoom(false)
              setImagePreview("")
              setImageFile(null)
            }}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700">
              Add Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={showEditRoom} onOpenChange={setShowEditRoom}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {editedRoom && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Edit Room Details</DialogTitle>
                <DialogDescription>
                  Room {editedRoom.id} | Block {editedRoom.block}, {editedRoom.floor} Floor
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Block</Label>
                    <Select value={editedRoom.block}>
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
                    <Label>Room Number</Label>
                    <Input value={editedRoom.id} onChange={(e) => setEditedRoom({...editedRoom, id: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Select value={editedRoom.floor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Floor</SelectItem>
                        <SelectItem value="2nd">2nd Floor</SelectItem>
                        <SelectItem value="3rd">3rd Floor</SelectItem>
                        <SelectItem value="4th">4th Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Select value={editedRoom.capacity.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Students</SelectItem>
                        <SelectItem value="3">3 Students</SelectItem>
                        <SelectItem value="4">4 Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select value={editedRoom.type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC Room - Boys">AC Room - Boys</SelectItem>
                        <SelectItem value="AC Room - Girls">AC Room - Girls</SelectItem>
                        <SelectItem value="Non-AC Room - Boys">Non-AC Room - Boys</SelectItem>
                        <SelectItem value="Non-AC Room - Girls">Non-AC Room - Girls</SelectItem>
                        <SelectItem value="Deluxe Room - Boys">Deluxe Room - Boys</SelectItem>
                        <SelectItem value="Deluxe Room - Girls">Deluxe Room - Girls</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Price (₹)</Label>
                    <Input value={editedRoom.price} onChange={(e) => setEditedRoom({...editedRoom, price: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Room Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800">
                      <img src={editedRoom.image} alt={`Room ${editedRoom.id}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Change Image
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi", "Attached Bathroom", "Fan", "Geyser", "Laundry Service"].map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`edit-amenity-${amenity}`} 
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          checked={editedRoom.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditedRoom({
                                ...editedRoom,
                                amenities: [...editedRoom.amenities, amenity]
                              })
                            } else {
                              setEditedRoom({
                                ...editedRoom,
                                amenities: editedRoom.amenities.filter(a => a !== amenity)
                              })
                            }
                          }}
                        />
                        <label htmlFor={`edit-amenity-${amenity}`} className="text-sm font-medium leading-none">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={editedRoom.description} 
                    onChange={(e) => setEditedRoom({...editedRoom, description: e.target.value})}
                    rows={3} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditRoom(false)}>
                  Cancel
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveRoom}>
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Room Details Dialog */}
      <Dialog open={showRoomDetails} onOpenChange={setShowRoomDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRoom && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRoom.type}</DialogTitle>
                <DialogDescription>
                  Room {selectedRoom.id} | Block {selectedRoom.block}, {selectedRoom.floor} Floor
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <img
                    src={selectedRoom.image}
                    alt={`Room ${selectedRoom.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">{selectedRoom.description}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRoom.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <p>{selectedRoom.capacity} students</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Occupied</Label>
                    <p>{selectedRoom.occupied} students</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Available</Label>
                    <p>{selectedRoom.capacity - selectedRoom.occupied} beds</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Price</Label>
                    <p>₹{selectedRoom.price}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleEditRoom(selectedRoom)
                        setShowRoomDetails(false)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </Button>
                    {selectedRoom.status === "Available" ? (
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => {
                          handleAllocateNow(selectedRoom)
                          setShowRoomDetails(false)
                        }}
                      >
                        Allocate Now
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Currently {selectedRoom.status}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Details Dialog */}
      <Dialog open={showBlockDetails} onOpenChange={setShowBlockDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBlock && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedBlock.name}</DialogTitle>
                <DialogDescription>
                  {selectedBlock.occupied} / {selectedBlock.total} rooms occupied
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <img
                    src={selectedBlock.image}
                    alt={`${selectedBlock.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300">{selectedBlock.description}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedBlock.occupied}</p>
                    <p className="text-sm text-muted-foreground">Occupied Rooms</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedBlock.vacant}</p>
                    <p className="text-sm text-muted-foreground">Vacant Rooms</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{selectedBlock.maintenance}</p>
                    <p className="text-sm text-muted-foreground">Under Maintenance</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Rooms in this Block</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rooms
                      .filter(room => room.block === selectedBlock.name.split(' ')[1])
                      .slice(0, 4)
                      .map(room => (
                        <Card key={room.id} className="border-gray-200 dark:border-gray-800">
                          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">Room {room.id}</CardTitle>
                              <CardDescription>{room.floor} Floor</CardDescription>
                            </div>
                            <Badge
                              variant={room.status === "Available" ? "default" : "outline"}
                              className={
                                room.status === "Available"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : room.status === "Full"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              }
                            >
                              {room.status}
                            </Badge>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Capacity:</span>
                              <span className="font-medium">{room.capacity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Occupied:</span>
                              <span className="font-medium">{room.occupied}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Rooms in {selectedBlock.name}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}