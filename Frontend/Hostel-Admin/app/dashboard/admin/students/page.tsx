"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Download, Filter, MoreHorizontal, Search, UserPlus, X, ChevronDown, ChevronUp, Edit, DollarSign, Camera, CheckCircle, Loader2, ScanFace, Eye, EyeOff, RotateCw, Trash2 } from 'lucide-react'

interface Student {
  _id: string
  studentId: string
  name: string
  email: string
  phone: string
  course: string
  year: string
  status: "Active" | "Pending" | "Inactive"
  createdAt: string
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

const API_BASE_URL = "http://localhost:5000/api/admin/students"

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
  const { toast } = useToast()
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
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20 p-6 rounded-lg border">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-muted-foreground">Manage student records, admissions, and details</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
              <Input
                placeholder="Search students..."
                className="pl-10 border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 hover:bg-purple-100 dark:hover:bg-purple-900/20"
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
                className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
              <Button 
                onClick={() => setShowAddStudent(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-purple-200 dark:border-purple-800/30 rounded-lg bg-purple-50/50 dark:bg-purple-950/10">
              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500">
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
                <Label className="text-purple-700 dark:text-purple-300">Year</Label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500">
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
        <Card className="border-purple-200 dark:border-purple-800/30 shadow-md">
          <CardHeader className="bg-purple-50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-800/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-purple-900 dark:text-purple-100">Students</CardTitle>
                <CardDescription>
                  {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} found
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-purple-50 dark:bg-purple-950/20">
                <TableRow className="border-b border-purple-100 dark:border-purple-800/20">
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
                    <TableRow key={student._id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/10 border-b border-purple-100 dark:border-purple-800/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="border-2 border-purple-100 dark:border-purple-900/50">
                            <AvatarImage src={student.image || "/placeholder.svg"} alt={student.name} />
                            <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
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
                          className={
                            student.status === "Active" 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                              : student.status === "Pending"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                : ""
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-purple-200 dark:border-purple-800/30">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleEditStudent(student)}
                              className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenFeeHistory(student)}
                              className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Fee History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-purple-100 dark:bg-purple-800/30" />
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                        <Search className="h-8 w-8 text-purple-400 dark:text-purple-500" />
                        <p className="text-muted-foreground">No students found matching your criteria</p>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSearchQuery("")
                            setStatusFilter("all")
                            setYearFilter("all")
                          }}
                          className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
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
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-emerald-200 dark:border-emerald-800/30">
            <DialogHeader className="border-b border-emerald-100 dark:border-emerald-800/20 pb-4">
              <DialogTitle className="text-2xl text-emerald-900 dark:text-emerald-100">Add New Student</DialogTitle>
              <DialogDescription>
                Fill in the student details. Face recognition is optional.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddStudent}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-emerald-700 dark:text-emerald-300">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Student's full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-emerald-700 dark:text-emerald-300">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Student's email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-emerald-700 dark:text-emerald-300">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-emerald-700 dark:text-emerald-300">Password *</Label>
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
                        className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-emerald-500" /> : <Eye className="h-4 w-4 text-emerald-500" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-emerald-700 dark:text-emerald-300">Course *</Label>
                    <Input
                      id="course"
                      name="course"
                      placeholder="Course name"
                      value={formData.course}
                      onChange={handleInputChange}
                      required
                      className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-emerald-700 dark:text-emerald-300">Year *</Label>
                    <Select 
                      value={formData.year} 
                      onValueChange={(value) => handleSelectChange("year", value)} 
                      required
                    >
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500">
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
                    <Label htmlFor="status" className="text-emerald-700 dark:text-emerald-300">Status *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500">
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
                  <Label htmlFor="address" className="text-emerald-700 dark:text-emerald-300">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Student's address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                  />
                </div>

                {/* Optional Face Recognition */}
                <div className="space-y-2">
                  <Label className="text-emerald-700 dark:text-emerald-300">Face Recognition (Optional)</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-emerald-200 dark:border-emerald-800/30 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/10">
                    {!faceImage ? (
                      <>
                        <div className="text-center">
                          <ScanFace className="mx-auto h-12 w-12 text-emerald-400 dark:text-emerald-500" />
                          <h3 className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">Add Face Recognition</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            For enhanced identification (optional)
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          <Button 
                            variant="outline" 
                            onClick={startCamera} 
                            disabled={isScanning}
                            className="border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
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
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-900/70 dark:text-emerald-300"
                          >
                            Upload Photo
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <img
                            src={faceImage || "/placeholder.svg"}
                            alt="Scanned face"
                            className="h-40 w-40 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-800/30"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 rounded-full bg-white dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
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
                  className="border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
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
                        <Button 
                          onClick={retryCamera}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
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
                        <div className="border-4 border-emerald-400 rounded-full h-64 w-64 opacity-80"></div>
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
                          className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700"
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
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-emerald-200 dark:border-emerald-800/30">
            <DialogHeader className="border-b border-emerald-100 dark:border-emerald-800/20 pb-4">
              <DialogTitle className="text-2xl text-emerald-900 dark:text-emerald-100">Edit Student</DialogTitle>
              <DialogDescription>
                Update student details for {editedStudent?.name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateStudent}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-emerald-700 dark:text-emerald-300">Full Name *</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      placeholder="Student's full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="text-emerald-700 dark:text-emerald-300">Email *</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      placeholder="Student's email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-emerald-700 dark:text-emerald-300">Phone Number *</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-password" className="text-emerald-700 dark:text-emerald-300">New Password</Label>
                    <div className="relative">
                      <Input
                        id="edit-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Leave blank to keep current"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-emerald-500" /> : <Eye className="h-4 w-4 text-emerald-500" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-course" className="text-emerald-700 dark:text-emerald-300">Course *</Label>
                    <Input
                      id="edit-course"
                      name="course"
                      placeholder="Course name"
                      value={formData.course}
                      onChange={handleInputChange}
                      required
                      className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-year" className="text-emerald-700 dark:text-emerald-300">Year *</Label>
                    <Select 
                      value={formData.year} 
                      onValueChange={(value) => handleSelectChange("year", value)} 
                      required
                    >
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500">
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
                    <Label htmlFor="edit-status" className="text-emerald-700 dark:text-emerald-300">Status *</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500">
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
                  <Label htmlFor="edit-address" className="text-emerald-700 dark:text-emerald-300">Address *</Label>
                  <Textarea
                    id="edit-address"
                    name="address"
                    placeholder="Student's address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="border-emerald-200 dark:border-emerald-800/30 focus-visible:ring-emerald-500"
                  />
                </div>

                {/* Face Recognition */}
                <div className="space-y-2">
                  <Label className="text-emerald-700 dark:text-emerald-300">Face Recognition</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-emerald-200 dark:border-emerald-800/30 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/10">
                    {!faceImage ? (
                      <>
                        <div className="text-center">
                          <ScanFace className="mx-auto h-12 w-12 text-emerald-400 dark:text-emerald-500" />
                          <h3 className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">Update Face Recognition</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            No face image currently set
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          <Button 
                            variant="outline" 
                            onClick={startCamera} 
                            disabled={isScanning}
                            className="border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
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
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-900/70 dark:text-emerald-300"
                          >
                            Upload Photo
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <img
                            src={faceImage || "/placeholder.svg"}
                            alt="Scanned face"
                            className="h-40 w-40 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-800/30"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 rounded-full bg-white dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>Face image updated</span>
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
                  className="border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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
                        <Button 
                          onClick={retryCamera}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
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
                        <div className="border-4 border-emerald-400 rounded-full h-64 w-64 opacity-80"></div>
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
                          className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700"
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
          <DialogContent className="sm:max-w-md border-red-200 dark:border-red-800/30">
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400">Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this student? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="py-4">
                <div className="flex items-center gap-4 p-4 border border-red-100 dark:border-red-900/30 rounded-lg bg-red-50/50 dark:bg-red-950/10">
                  <Avatar className="h-12 w-12 border-2 border-red-100 dark:border-red-900/50">
                    <AvatarImage src={selectedStudent.image || "/placeholder.svg"} alt={selectedStudent.name} />
                    <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {selectedStudent.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedStudent.name}</div>
                    <div className="text-sm text-muted-foreground">ID: {selectedStudent.studentId}</div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="border-gray-200 dark:border-gray-800"
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
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border-purple-200 dark:border-purple-800/30">
            <DialogHeader className="border-b border-purple-100 dark:border-purple-800/20 pb-4">
              <DialogTitle className="text-2xl text-purple-900 dark:text-purple-100">Fee History</DialogTitle>
              <DialogDescription>
                {selectedStudent?.name}'s fee payment history
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {selectedStudent && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-purple-100 dark:border-purple-900/50">
                      <AvatarImage src={selectedStudent.image || "/placeholder.svg"} alt={selectedStudent.name} />
                      <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {selectedStudent.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-lg font-medium">{selectedStudent.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {selectedStudent.studentId}</div>
                      <div className="text-sm text-muted-foreground">{selectedStudent.course}, {selectedStudent.year}</div>
                    </div>
                  </div>

                  {feeRecords[selectedStudent._id] ? (
                    feeRecords[selectedStudent._id].length > 0 ? (
                      <div className="border border-purple-100 dark:border-purple-800/20 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader className="bg-purple-50 dark:bg-purple-950/20">
                            <TableRow className="border-b border-purple-100 dark:border-purple-800/20">
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Payment Method</TableHead>
                              <TableHead>Receipt</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feeRecords[selectedStudent._id].map(record => (
                              <TableRow key={record._id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/10 border-b border-purple-100 dark:border-purple-800/20">
                                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">₹{record.amount.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      record.status === "Paid" ? "default" :
                                      record.status === "Pending" ? "secondary" : "destructive"
                                    }
                                    className={
                                      record.status === "Paid" 
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                        : record.status === "Pending"
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                          : ""
                                    }
                                  >
                                    {record.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{record.paymentMethod || "N/A"}</TableCell>
                                <TableCell>
                                  {record.receiptNumber ? (
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                      {record.receiptNumber}
                                      <Download className="h-3.5 w-3.5" />
                                    </Button>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <DollarSign className="h-12 w-12 text-purple-300 dark:text-purple-700 mb-2" />
                        <h3 className="text-lg font-medium">No Fee Records</h3>
                        <p className="text-muted-foreground">This student has no fee payment records yet.</p>
                      </div>
                    )
                  ) : (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowFeeHistory(false)}
                className="border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Close
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
