"use client"

import { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, Filter, MoreHorizontal, Search, UserPlus, X, ChevronDown, ChevronUp, Edit, DollarSign, Camera, CheckCircle, Loader2, ScanFace, Eye, EyeOff, RotateCw, Trash2 } from "lucide-react"

interface Student {
  _id: string
  studentId: string
  name: string
  email: string
  phone: string
  course: string
  year: string
  status: "Active" | "Pending" | "Inactive"
  createdAt: string;
  address: string
  image?: string
  faceId?: string
}

interface FeeRecord {
  _id: string
  date: string
  amount: number
  status: "Paid" | "Pending" | "Overdue"
  paymentMethod?: string
  receiptNumber?: string
}

const API_BASE_URL = 'http://localhost:5000/api/admin/students'

export default function StudentManagementPage() {
  const router = useRouter()
  const webcamRef = useRef<Webcam>(null)
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showFeeHistory, setShowFeeHistory] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Camera State
  const [faceImage, setFaceImage] = useState<string | undefined>(undefined)
  const [showCamera, setShowCamera] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [mirrored, setMirrored] = useState(true)
  const [isCapturing, setIsCapturing] = useState(false)

  // Data State
  const [students, setStudents] = useState<Student[]>([])
  const [feeRecords, setFeeRecords] = useState<Record<string, FeeRecord[]>>({})
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editedStudent, setEditedStudent] = useState<Student | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    year: "",
    address: "",
    password: "",
    status: "Active" as "Active" | "Pending" | "Inactive",
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
        showToast("Session expired", "Please login again", "destructive")
      }
      return Promise.reject(error)
    }
  )

  // Helper function for showing toast messages
  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    toast({
      title,
      description,
      variant,
    })
  }

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/')
        setStudents(response.data.data)
      } catch (error: any) {
        showToast(
          "Error fetching students", 
          error.response?.data?.message || "Failed to load student data", 
          "destructive"
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    const matchesYear = yearFilter === "all" || student.year === yearFilter

    return matchesSearch && matchesStatus && matchesYear
  })

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Camera functions
  const startCamera = () => {
    setCameraError(null)
    setIsScanning(true)
    setShowCamera(true)
  }

  const stopCamera = () => {
    setShowCamera(false)
    setIsScanning(false)
  }

  const captureFace = () => {
    if (webcamRef.current) {
      setIsCapturing(true)
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        setTimeout(() => {
          setFaceImage(imageSrc)
          setIsCapturing(false)
          stopCamera()
          showToast("Face captured", "Face image successfully captured")
        }, 500)
      } else {
        setIsCapturing(false)
        showToast("Capture failed", "Could not capture image", "destructive")
      }
    }
  }

  const retryCamera = () => {
    setCameraError(null)
    setIsScanning(true)
  }

  const uploadPhotoFallback = (e: React.MouseEvent) => {
    e.preventDefault()
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showToast("File too large", "Please select an image smaller than 5MB", "destructive")
          return
        }
        
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFaceImage(event.target.result as string)
            showToast("Image uploaded", "Face image successfully uploaded")
          }
        }
        reader.onerror = () => {
          showToast("Upload failed", "Could not read the image file", "destructive")
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const removeImage = () => {
    setFaceImage(undefined)
    showToast("Image removed", "Face image has been removed")
  }

  // API operations
  const fetchFeeRecords = async (studentId: string) => {
    try {
      const response = await api.get(`/${studentId}/fees`)
      setFeeRecords(prev => ({ ...prev, [studentId]: response.data.data }))
    } catch (error: any) {
      showToast(
        "Error fetching fee records", 
        error.response?.data?.message || "Failed to load fee history", 
        "destructive"
      )
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const studentData = {
        ...formData,
        ...(faceImage && { image: faceImage })
      }

      const response = await api.post('/', studentData)
      setStudents([...students, response.data.data.student])

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        year: "",
        address: "",
        password: "",
        status: "Active",
      })
      setFaceImage(undefined)
      setShowAddStudent(false)

      showToast(
        "Student added successfully", 
        `${response.data.data.student.name} has been added with ID: ${response.data.data.student.studentId}`
      )
    } catch (error: any) {
      showToast(
        "Error adding student", 
        error.response?.data?.message || "There was an error adding the student.", 
        "destructive"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditedStudent(student)
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      year: student.year,
      address: student.address,
      password: "",
      status: student.status,
    })
    setFaceImage(student.image)
    setShowEditStudent(true)
  }

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editedStudent) return

    setIsSubmitting(true)

    try {
      const studentData = {
        ...formData,
        ...(faceImage && { image: faceImage })
      }

      const response = await api.put(`/${editedStudent._id}`, studentData)
      setStudents(students.map(s => s._id === editedStudent._id ? response.data.data : s))

      setShowEditStudent(false)
      setEditedStudent(null)
      setFaceImage(undefined)

      showToast(
        "Student updated", 
        `${response.data.data.name}'s details have been updated.`
      )
    } catch (error: any) {
      showToast(
        "Error updating student", 
        error.response?.data?.message || "There was an error updating the student.", 
        "destructive"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return

    setIsSubmitting(true)

    try {
      await api.delete(`/${selectedStudent._id}`)
      setStudents(students.filter(s => s._id !== selectedStudent._id))
      setShowDeleteConfirm(false)
      setSelectedStudent(null)

      showToast(
        "Student deleted", 
        `${selectedStudent.name} (ID: ${selectedStudent.studentId}) has been removed.`
      )
    } catch (error: any) {
      showToast(
        "Error deleting student", 
        error.response?.data?.message || "There was an error deleting the student.", 
        "destructive"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenFeeHistory = (student: Student) => {
    setSelectedStudent(student)
    setShowFeeHistory(true)
    fetchFeeRecords(student._id)
  }

  const handleCameraError = (error: string | MediaStream) => {
    if (typeof error === 'string') {
      setCameraError("Could not access camera. Please check permissions.")
      setIsScanning(false)
      showToast("Camera Error", "Could not access camera. Please check permissions.", "destructive")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Student Management
        </h1>
        <p className="text-muted-foreground">Manage student records, admissions, and details</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
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
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
            <Button onClick={() => setShowAddStudent(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by year" />
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
          </div>
        )}
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} found
              </CardDescription>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.image} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === "Active" ? "default" :
                          student.status === "Pending" ? "secondary" : "destructive"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(student.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenFeeHistory(student)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Fee History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedStudent(student)
                              setShowDeleteConfirm(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No students found matching your criteria</p>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSearchQuery("")
                          setStatusFilter("all")
                          setYearFilter("all")
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Student</DialogTitle>
            <DialogDescription>
              Fill in the student details. Face recognition is optional.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStudent}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Student's full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Student's email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Input
                    id="course"
                    name="course"
                    placeholder="Course name"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Select 
                    value={formData.year} 
                    onValueChange={(value) => handleSelectChange("year", value)} 
                    required
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
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Student's address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Optional Face Recognition */}
              <div className="space-y-2">
                <Label>Face Recognition (Optional)</Label>
                <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg bg-muted/30">
                  {!faceImage ? (
                    <>
                      <div className="text-center">
                        <ScanFace className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium">Add Face Recognition</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          For enhanced identification (optional)
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button 
                          variant="outline" 
                          onClick={startCamera} 
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Initializing Camera
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Open Camera
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={uploadPhotoFallback}
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <img
                          src={faceImage}
                          alt="Scanned face"
                          className="h-40 w-40 rounded-full object-cover border-4 border-teal-200"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 rounded-full bg-background"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Face image added</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddStudent(false)
                  setFaceImage(undefined)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Student"
                )}
              </Button>
            </DialogFooter>
          </form>

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden relative">
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="bg-red-100 rounded-full p-4 mb-4">
                      <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Camera Error</h3>
                    <p className="text-red-300 mb-6">{cameraError}</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={stopCamera}
                        className="text-white border-white/30 hover:bg-white/10"
                      >
                        Close
                      </Button>
                      <Button onClick={retryCamera}>
                        <RotateCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ 
                        width: 720, 
                        height: 720, 
                        facingMode: "user",
                        aspectRatio: 1
                      }}
                      mirrored={mirrored}
                      onUserMediaError={(error) => handleCameraError(error.toString())}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-teal-400 rounded-full h-64 w-64 opacity-80"></div>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={() => setMirrored(!mirrored)}
                      >
                        <RotateCw className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={captureFace}
                        size="lg"
                        className="h-12 w-12 rounded-full"
                        disabled={isCapturing}
                      >
                        {isCapturing ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-white/10" 
                        onClick={stopCamera}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <Button 
                variant="ghost" 
                className="mt-4 text-white hover:bg-white/10" 
                onClick={stopCamera}
              >
                <X className="mr-2 h-5 w-5" />
                Close Camera
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditStudent} onOpenChange={(open) => {
        if (!open) {
          setFaceImage(undefined)
        }
        setShowEditStudent(open)
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Student</DialogTitle>
            <DialogDescription>
              Update student details for {editedStudent?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateStudent}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    placeholder="Student's full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    placeholder="Student's email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to keep current"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-course">Course *</Label>
                  <Input
                    id="edit-course"
                    name="course"
                    placeholder="Course name"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year *</Label>
                  <Select 
                    value={formData.year} 
                    onValueChange={(value) => handleSelectChange("year", value)} 
                    required
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
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Address *</Label>
                <Textarea
                  id="edit-address"
                  name="address"
                  placeholder="Student's address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Optional Face Recognition */}
              <div className="space-y-2">
                <Label>Face Recognition (Optional)</Label>
                <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg bg-muted/30">
                  {!faceImage ? (
                    <>
                      <div className="text-center">
                        <ScanFace className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium">Update Face Recognition</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          For enhanced identification (optional)
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button 
                          variant="outline" 
                          onClick={startCamera} 
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Initializing Camera
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Open Camera
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={uploadPhotoFallback}
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <img
                          src={faceImage}
                          alt="Scanned face"
                          className="h-40 w-40 rounded-full object-cover border-4 border-teal-200"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 rounded-full bg-background"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Face image added</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditStudent(false)
                  setFaceImage(undefined)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Student"
                )}
              </Button>
            </DialogFooter>
          </form>

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden relative">
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="bg-red-100 rounded-full p-4 mb-4">
                      <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Camera Error</h3>
                    <p className="text-red-300 mb-6">{cameraError}</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={stopCamera}
                        className="text-white border-white/30 hover:bg-white/10"
                      >
                        Close
                      </Button>
                      <Button onClick={retryCamera}>
                        <RotateCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ 
                        width: 720, 
                        height: 720, 
                        facingMode: "user",
                        aspectRatio: 1
                      }}
                      mirrored={mirrored}
                      onUserMediaError={(error) => handleCameraError(error.toString())}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-teal-400 rounded-full h-64 w-64 opacity-80"></div>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={() => setMirrored(!mirrored)}
                      >
                        <RotateCw className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={captureFace}
                        size="lg"
                        className="h-12 w-12 rounded-full"
                        disabled={isCapturing}
                      >
                        {isCapturing ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-white/10" 
                        onClick={stopCamera}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <Button 
                variant="ghost" 
                className="mt-4 text-white hover:bg-white/10" 
                onClick={stopCamera}
              >
                <X className="mr-2 h-5 w-5" />
                Close Camera
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this student?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-4 py-4">
            <div className="bg-red-100 p-2 rounded-full">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium">{selectedStudent?.name}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedStudent?.studentId}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStudent}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee History Dialog */}
      <Dialog open={showFeeHistory} onOpenChange={setShowFeeHistory}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Fee History</DialogTitle>
            <DialogDescription>
              Payment records for {selectedStudent?.name} (ID: {selectedStudent?.studentId})
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedStudent?.image} />
                <AvatarFallback>
                  {selectedStudent?.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{selectedStudent?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStudent?.course} • {selectedStudent?.year}
                </p>
              </div>
            </div>

            <Tabs defaultValue="history">
              <TabsList className="mb-4">
                <TabsTrigger value="history">Fee History</TabsTrigger>
                <TabsTrigger value="add">Add Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Receipt</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedStudent && feeRecords[selectedStudent._id] ? (
                          feeRecords[selectedStudent._id].map(record => (
                            <TableRow key={record._id}>
                              <TableCell>{record.receiptNumber || "N/A"}</TableCell>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                              <TableCell>₹{record.amount.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    record.status === "Paid" ? "default" :
                                    record.status === "Pending" ? "secondary" : "destructive"
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.paymentMethod || "N/A"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                              <div className="flex flex-col items-center gap-2">
                                <DollarSign className="h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">No fee records found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="add">
                <Card>
                  <CardContent className="p-4">
                    <form className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (₹) *</Label>
                          <Input 
                            id="amount" 
                            type="number" 
                            placeholder="Enter amount" 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-method">Payment Method *</Label>
                          <Select defaultValue="online">
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">Online Transfer</SelectItem>
                              <SelectItem value="card">Credit/Debit Card</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select defaultValue="Paid">
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="receipt">Receipt Number</Label>
                          <Input id="receipt" placeholder="Optional receipt number" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" placeholder="Additional notes" rows={3} />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                        <Button type="submit">
                          Add Payment
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}