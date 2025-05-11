"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { BedDouble, CheckCircle, Download, Filter, Plus, Search, Users, X, ChevronDown, ChevronUp, Image as ImageIcon, Edit, Loader2, Trash } from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Types
interface Room {
  _id: string
  block: string
  roomNumber: string
  roomId: string
  floor: string
  capacity: number
  occupiedCount: number
  roomType: string
  description: string
  facilities: string[]
  price: number
  pricePeriod: string
  imageUrl: string
  status: "Available" | "Full" | "Maintenance"
  createdAt?: string
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

const API_BASE_URL = 'http://localhost:5000/api'

export default function RoomAllocationPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // UI State
  const [searchQuery, setSearchQuery] = useState("")
  const [blockFilter, setBlockFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<"blocks" | "rooms">("rooms")
  
  // Modal States
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [showRoomDetails, setShowRoomDetails] = useState(false)
  const [showBlockDetails, setShowBlockDetails] = useState(false)
  const [showEditRoom, setShowEditRoom] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Data States
  const [rooms, setRooms] = useState<Room[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  
  // Form States
  const [editedRoom, setEditedRoom] = useState<Partial<Room>>({
    block: "A",
    roomNumber: "",
    floor: "1st Floor",
    capacity: 2,
    occupiedCount: 0,
    roomType: "AC Room - Boys",
    description: "",
    facilities: [],
    price: 0,
    pricePeriod: "month",
    status: "Available",
    imageUrl: ""
  })
  const [imagePreview, setImagePreview] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageInputMethod, setImageInputMethod] = useState<"upload" | "url">("upload")
  
  // Loading States
  const [loading, setLoading] = useState({
    page: true,
    form: false,
    delete: false
  })

  // Initialize axios with interceptors
  const api = axios.create({
    baseURL: API_BASE_URL,
  })

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        toast.error("Session expired. Please login again.")
      }
      return Promise.reject(error)
    }
  )

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, page: true }))
        await fetchRooms()
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load data. Please try again.")
      } finally {
        setLoading(prev => ({ ...prev, page: false }))
      }
    }

    fetchData()
  }, [])

  // Data fetching functions
  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms')
      
      // Handle different response structures
      let roomsData: Room[] = []
      
      if (Array.isArray(response.data)) {
        roomsData = response.data
      } else if (Array.isArray(response.data?.data)) {
        roomsData = response.data.data
      } else if (Array.isArray(response.data?.rooms)) {
        roomsData = response.data.rooms
      } else {
        console.error('Unexpected API response structure:', response.data)
        toast.error('Received unexpected data format from server')
        return
      }
      
      // Sort rooms by creation date (newest first)
      roomsData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
      
      setRooms(roomsData)
      calculateBlockStats(roomsData)
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
      toast.error("Failed to load rooms data. Please try again.")
      throw error
    }
  }

  // Calculate block statistics
  const calculateBlockStats = useCallback((roomsData: Room[]) => {
    const blockStats: Block[] = [
      { 
        name: "Block A", 
        total: 0, 
        occupied: 0, 
        vacant: 0, 
        maintenance: 0, 
        description: "Modern block with AC rooms and premium amenities.",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      },
      { 
        name: "Block B", 
        total: 0, 
        occupied: 0, 
        vacant: 0, 
        maintenance: 0,
        description: "Standard block with both AC and non-AC options.",
        image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      },
      { 
        name: "Block C", 
        total: 0, 
        occupied: 0, 
        vacant: 0, 
        maintenance: 0,
        description: "Deluxe block with attached bathrooms.",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      },
      { 
        name: "Block D", 
        total: 0, 
        occupied: 0, 
        vacant: 0, 
        maintenance: 0,
        description: "Economy block with basic amenities.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      }
    ]

    roomsData.forEach((room) => {
      const blockChar = room.block?.[0]?.toUpperCase() || 'A'
      const blockIndex = blockChar.charCodeAt(0) - 65 // A=0, B=1, etc.
      
      if (blockIndex >= 0 && blockIndex < blockStats.length) {
        blockStats[blockIndex].total++
        
        switch (room.status) {
          case "Full":
            blockStats[blockIndex].occupied++
            break
          case "Available":
            blockStats[blockIndex].vacant++
            break
          case "Maintenance":
            blockStats[blockIndex].maintenance++
            break
        }
      }
    })

    setBlocks(blockStats)
  }, [])

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const searchLower = searchQuery.toLowerCase()
    const roomNumber = String(room.roomNumber || '').toLowerCase()
    const roomType = String(room.roomType || '').toLowerCase()
    
    const matchesSearch = roomNumber.includes(searchLower) || 
                         roomType.includes(searchLower)
    const matchesBlock = blockFilter === "all" || room.block === blockFilter
    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    
    return matchesSearch && matchesBlock && matchesStatus
  })

  // Room actions
  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room)
    setShowRoomDetails(true)
  }

  const handleViewBlock = (block: Block) => {
    setSelectedBlock(block)
    setShowBlockDetails(true)
  }

  const handleEditRoom = (room: Room) => {
    setEditedRoom({ ...room })
    setImagePreview(room.imageUrl || "")
    setImageInputMethod(room.imageUrl ? "url" : "upload")
    setShowEditRoom(true)
  }

  const handleSaveRoom = async () => {
    if (!editedRoom || !editedRoom._id) return
    
    try {
      setLoading(prev => ({ ...prev, form: true }))
      
      const formData = new FormData()
      let imageUrl = editedRoom.imageUrl
      
      // Handle image upload if file is selected
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      const roomData = {
        block: editedRoom.block?.toUpperCase(),
        roomNumber: editedRoom.roomNumber?.toUpperCase(),
        floor: editedRoom.floor,
        capacity: Number(editedRoom.capacity),
        occupiedCount: Number(editedRoom.occupiedCount),
        roomType: editedRoom.roomType,
        description: editedRoom.description,
        facilities: editedRoom.facilities || [],
        price: Number(editedRoom.price),
        pricePeriod: editedRoom.pricePeriod,
        status: editedRoom.status,
        // Only include imageUrl if no file is being uploaded
        ...(!imageFile && { imageUrl })
      }
      
      if (imageFile) {
        formData.append('data', JSON.stringify(roomData))
        const { data } = await api.put(`/rooms/${editedRoom._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        await fetchRooms() // Refresh data
      } else {
        const { data } = await api.put(`/rooms/${editedRoom._id}`, roomData)
        await fetchRooms() // Refresh data
      }

      toast.success("Room updated successfully")
      setShowEditRoom(false)
      resetForm()
    } catch (error: any) {
      console.error("Update error:", error)
      toast.error(error.response?.data?.message || "Failed to update room. Please try again.")
    } finally {
      setLoading(prev => ({ ...prev, form: false }))
    }
  }

  const handleCreateRoom = async () => {
    try {
      setLoading(prev => ({ ...prev, form: true }))
      
      const formData = new FormData()
      let imageUrl = editedRoom.imageUrl
      
      // Handle image upload if file is selected
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      const roomData = {
        block: editedRoom.block?.toUpperCase(),
        roomNumber: editedRoom.roomNumber?.toUpperCase(),
        floor: editedRoom.floor,
        capacity: Number(editedRoom.capacity),
        occupiedCount: Number(editedRoom.occupiedCount),
        roomType: editedRoom.roomType,
        description: editedRoom.description,
        facilities: editedRoom.facilities || [],
        price: Number(editedRoom.price),
        pricePeriod: editedRoom.pricePeriod,
        status: editedRoom.status,
        // Only include imageUrl if no file is being uploaded
        ...(!imageFile && { imageUrl })
      }
      
      if (imageFile) {
        formData.append('data', JSON.stringify(roomData))
        await api.post('/rooms', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        await api.post('/rooms', roomData)
      }

      await fetchRooms() // Refresh data
      toast.success("Room created successfully")
      setShowAddRoom(false)
      resetForm()
    } catch (error: any) {
      console.error("Create error:", error)
      toast.error(error.response?.data?.message || "Failed to create room. Please try again.")
    } finally {
      setLoading(prev => ({ ...prev, form: false }))
    }
  }

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return
    
    try {
      setLoading(prev => ({ ...prev, delete: true }))
      
      await api.delete(`/rooms/${selectedRoom._id}`)
      await fetchRooms() // Refresh data

      toast.success("Room deleted successfully")
      setShowDeleteConfirm(false)
      setShowRoomDetails(false)
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete room. Please try again.")
    } finally {
      setLoading(prev => ({ ...prev, delete: false }))
    }
  }

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      // Clear URL input when uploading a file
      setEditedRoom(prev => ({...prev, imageUrl: ""}))
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Form reset
  const resetForm = () => {
    setEditedRoom({
      block: "A",
      roomNumber: "",
      floor: "1st Floor",
      capacity: 2,
      occupiedCount: 0,
      roomType: "AC Room - Boys",
      description: "",
      facilities: [],
      price: 0,
      pricePeriod: "month",
      status: "Available",
      imageUrl: ""
    })
    setImagePreview("")
    setImageFile(null)
    setImageInputMethod("upload")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  )

  // Get block letter from block name safely
  const getBlockLetter = (blockName: string) => {
    const parts = blockName.split(' ')
    return parts.length > 1 ? parts[1] : 'A'
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Room Management
        </h1>
        <p className="text-muted-foreground">Manage hostel rooms and allocations</p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
            <Button 
              onClick={() => {
                resetForm()
                setShowAddRoom(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label>Block</Label>
              <Select value={blockFilter} onValueChange={setBlockFilter}>
                <SelectTrigger>
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
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
              <Label>Room Type</Label>
              <Select>
                <SelectTrigger>
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "blocks" | "rooms")} className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex h-auto p-0 bg-transparent gap-2">
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
        </TabsList>

        {/* Blocks Overview Tab */}
        <TabsContent value="blocks" className="mt-4">
          {loading.page ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {blocks.map((block, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
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

              <Card className="mt-6">
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
            </>
          )}
        </TabsContent>

        {/* Room List Tab */}
        <TabsContent value="rooms" className="mt-4">
          {loading.page ? (
            <LoadingSpinner />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Room List</CardTitle>
                  <CardDescription>
                    Showing {filteredRooms.length} of {rooms.length} rooms
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {filteredRooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <BedDouble className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No rooms found matching your criteria</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("")
                        setBlockFilter("all")
                        setStatusFilter("all")
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRooms.map((room) => (
                      <Card key={room._id} className="hover:shadow-md transition-shadow">
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={room.imageUrl || "/placeholder-room.jpg"}
                            alt={`Room ${room.roomNumber}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder-room.jpg"
                            }}
                          />
                          <Badge
                            className={`absolute top-2 right-2 ${
                              room.status === "Available"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : room.status === "Full"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {room.status}
                          </Badge>
                        </div>
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <span>Block {room.block}, {room.floor}</span>
                              <Badge variant="outline" className="text-xs">
                                {room.roomType.split(' - ')[0]}
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
                              <span className="font-medium">{room.occupiedCount} students</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Available:</span>
                              <span className="font-medium">{room.capacity - room.occupiedCount} beds</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-medium">₹{room.price}/{room.pricePeriod}</span>
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleEditRoom(room)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoom} onOpenChange={(open) => {
        setShowAddRoom(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Room</DialogTitle>
            <DialogDescription>Fill in the details to add a new room to the hostel</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Block</Label>
                <Select 
                  value={editedRoom.block || "A"}
                  onValueChange={(value) => setEditedRoom(prev => ({...prev, block: value}))}
                >
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
                <Input 
                  placeholder="Enter room number (e.g., A-101)" 
                  value={editedRoom.roomNumber || ""}
                  onChange={(e) => setEditedRoom(prev => ({...prev, roomNumber: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Floor</Label>
                <Select 
                  value={editedRoom.floor || "1st Floor"}
                  onValueChange={(value) => setEditedRoom(prev => ({...prev, floor: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Floor">1st Floor</SelectItem>
                    <SelectItem value="2nd Floor">2nd Floor</SelectItem>
                    <SelectItem value="3rd Floor">3rd Floor</SelectItem>
                    <SelectItem value="4th Floor">4th Floor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Select 
                  value={editedRoom.capacity?.toString() || "2"}
                  onValueChange={(value) => setEditedRoom(prev => ({...prev, capacity: parseInt(value)}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select 
                  value={editedRoom.roomType || "AC Room - Boys"}
                  onValueChange={(value) => setEditedRoom(prev => ({...prev, roomType: value}))}
                >
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
                <Label>Price (₹)</Label>
                <Input 
                  type="number" 
                  placeholder="Enter price" 
                  value={editedRoom.price || ""}
                  onChange={(e) => setEditedRoom(prev => ({...prev, price: parseFloat(e.target.value)}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Price Period</Label>
                <Select 
                  value={editedRoom.pricePeriod || "month"}
                  onValueChange={(value) => setEditedRoom(prev => ({...prev, pricePeriod: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Per Month</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                    <SelectItem value="year">Per Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={editedRoom.status || "Available"}
                  onValueChange={(value) => setEditedRoom(prev => ({...prev, status: value as "Available" | "Full" | "Maintenance"}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Full">Full</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Enhanced Image Input Section */}
            <div className="space-y-2">
              <Label>Room Image</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  variant={imageInputMethod === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageInputMethod("upload")}
                >
                  Upload Image
                </Button>
                <Button
                  variant={imageInputMethod === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageInputMethod("url")}
                >
                  Enter URL
                </Button>
              </div>

              {imageInputMethod === "upload" ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            setImagePreview("")
                            setImageFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                    <Button
                      variant="outline"
                      type="button"
                      onClick={triggerFileInput}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Select Image
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter image URL"
                    value={editedRoom.imageUrl || ""}
                    onChange={(e) => {
                      setEditedRoom(prev => ({...prev, imageUrl: e.target.value}))
                      setImagePreview(e.target.value)
                    }}
                  />
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                    {editedRoom.imageUrl ? (
                      <>
                        <img 
                          src={editedRoom.imageUrl} 
                          alt="URL Preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-room.jpg"
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 hover:bg-white"
                          onClick={() => {
                            setEditedRoom(prev => ({...prev, imageUrl: ""}))
                            setImagePreview("")
                          }}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Facilities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi", "Attached Bathroom", "Fan", "Geyser", "Laundry Service"].map((facility) => (
                  <div key={facility} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`facility-${facility}`} 
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      checked={editedRoom.facilities?.includes(facility) || false}
                      onChange={(e) => {
                        const facilities = editedRoom.facilities || []
                        if (e.target.checked) {
                          setEditedRoom(prev => ({
                            ...prev,
                            facilities: [...facilities, facility]
                          }))
                        } else {
                          setEditedRoom(prev => ({
                            ...prev,
                            facilities: facilities.filter(f => f !== facility)
                          }))
                        }
                      }}
                    />
                    <label htmlFor={`facility-${facility}`} className="text-sm font-medium leading-none">
                      {facility}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Enter room description" 
                rows={3} 
                value={editedRoom.description || ""}
                onChange={(e) => setEditedRoom(prev => ({...prev, description: e.target.value}))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddRoom(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRoom}
              disabled={loading.form || !editedRoom.roomNumber || !editedRoom.block || (!imageFile && !editedRoom.imageUrl)}
            >
              {loading.form ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Room"
              )}
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
                  Room {editedRoom.roomNumber} | Block {editedRoom.block}, {editedRoom.floor}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Block</Label>
                    <Select 
                      value={editedRoom.block || ""}
                      onValueChange={(value) => setEditedRoom(prev => ({...prev, block: value}))}
                    >
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
                    <Input 
                      value={editedRoom.roomNumber || ""} 
                      onChange={(e) => setEditedRoom(prev => ({...prev, roomNumber: e.target.value}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Select 
                      value={editedRoom.floor || ""}
                      onValueChange={(value) => setEditedRoom(prev => ({...prev, floor: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Floor">1st Floor</SelectItem>
                        <SelectItem value="2nd Floor">2nd Floor</SelectItem>
                        <SelectItem value="3rd Floor">3rd Floor</SelectItem>
                        <SelectItem value="4th Floor">4th Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Select 
                      value={editedRoom.capacity?.toString() || ""}
                      onValueChange={(value) => setEditedRoom(prev => ({...prev, capacity: parseInt(value)}))}
                    >
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
                    <Select 
                      value={editedRoom.roomType || ""}
                      onValueChange={(value) => setEditedRoom(prev => ({...prev, roomType: value}))}
                    >
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
                    <Label>Price (₹)</Label>
                    <Input 
                      type="number"
                      value={editedRoom.price || ""} 
                      onChange={(e) => setEditedRoom(prev => ({...prev, price: parseFloat(e.target.value)}))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price Period</Label>
                    <Select 
                      value={editedRoom.pricePeriod || "month"}
                      onValueChange={(value) => setEditedRoom(prev => ({...prev, pricePeriod: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Per Month</SelectItem>
                        <SelectItem value="semester">Per Semester</SelectItem>
                        <SelectItem value="year">Per Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={editedRoom.status || "Available"}
                      onValueChange={(value) => setEditedRoom(prev => ({...prev, status: value as "Available" | "Full" | "Maintenance"}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Full">Full</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Enhanced Image Input Section */}
                <div className="space-y-2">
                  <Label>Room Image</Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant={imageInputMethod === "upload" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setImageInputMethod("upload")}
                    >
                      Upload Image
                    </Button>
                    <Button
                      variant={imageInputMethod === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setImageInputMethod("url")}
                    >
                      Enter URL
                    </Button>
                  </div>

                  {imageInputMethod === "upload" ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                setImagePreview("")
                                setImageFile(null)
                                if (fileInputRef.current) fileInputRef.current.value = ""
                              }}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                        />
                        <Button
                          variant="outline"
                          type="button"
                          onClick={triggerFileInput}
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Change Image
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF (max 5MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter image URL"
                        value={editedRoom.imageUrl || ""}
                        onChange={(e) => {
                          setEditedRoom(prev => ({...prev, imageUrl: e.target.value}))
                          setImagePreview(e.target.value)
                        }}
                      />
                      <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                        {editedRoom.imageUrl ? (
                          <>
                            <img 
                              src={editedRoom.imageUrl} 
                              alt="URL Preview" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-room.jpg"
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 hover:bg-white"
                              onClick={() => {
                                setEditedRoom(prev => ({...prev, imageUrl: ""}))
                                setImagePreview("")
                              }}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Facilities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Air Conditioning", "Study Table", "Premium Furniture", "High-Speed WiFi", "Attached Bathroom", "Fan", "Geyser", "Laundry Service"].map((facility) => (
                      <div key={facility} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`edit-facility-${facility}`} 
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          checked={editedRoom.facilities?.includes(facility) || false}
                          onChange={(e) => {
                            const facilities = editedRoom.facilities || []
                            if (e.target.checked) {
                              setEditedRoom(prev => ({
                                ...prev,
                                facilities: [...facilities, facility]
                              }))
                            } else {
                              setEditedRoom(prev => ({
                                ...prev,
                                facilities: facilities.filter(f => f !== facility)
                              }))
                            }
                          }}
                        />
                        <label htmlFor={`edit-facility-${facility}`} className="text-sm font-medium leading-none">
                          {facility}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={editedRoom.description || ""} 
                    onChange={(e) => setEditedRoom(prev => ({...prev, description: e.target.value}))}
                    rows={3} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditRoom(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveRoom}
                  disabled={loading.form}
                >
                  {loading.form ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
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
                <DialogTitle className="text-2xl">{selectedRoom.roomType}</DialogTitle>
                <DialogDescription>
                  Room {selectedRoom.roomNumber} | Block {selectedRoom.block}, {selectedRoom.floor}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <img
                    src={selectedRoom.imageUrl || "/placeholder-room.jpg"}
                    alt={`Room ${selectedRoom.roomNumber}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-room.jpg"
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-muted-foreground">{selectedRoom.description}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Facilities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRoom.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>{facility}</span>
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
                    <p>{selectedRoom.occupiedCount} students</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Available</Label>
                    <p>{selectedRoom.capacity - selectedRoom.occupiedCount} beds</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <p>₹{selectedRoom.price}/{selectedRoom.pricePeriod}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Badge
                      variant={selectedRoom.status === "Available" ? "default" : "outline"}
                      className={
                        selectedRoom.status === "Available"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : selectedRoom.status === "Full"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }
                    >
                      {selectedRoom.status}
                    </Badge>
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
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setShowDeleteConfirm(true)
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Room
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRoom}
              disabled={loading.delete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading.delete ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Room"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  <p className="text-muted-foreground">{selectedBlock.description}</p>
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
                      .filter(room => room.block === getBlockLetter(selectedBlock.name))
                      .slice(0, 4)
                      .map(room => (
                        <Card key={room._id}>
                          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                              <CardDescription>{room.floor}</CardDescription>
                            </div>
                            <Badge
                              variant={room.status === "Available" ? "default" : "outline"}
                              className={
                                room.status === "Available"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : room.status === "Full"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
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
                              <span className="font-medium">{room.occupiedCount}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      setActiveTab("rooms")
                      setBlockFilter(getBlockLetter(selectedBlock.name))
                      setShowBlockDetails(false)
                    }}
                  >
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