"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Calendar, Clock, User, History, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, parseISO } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Student = {
  _id: string
  name: string
  studentId: string
  roomId: {
    roomNumber: string
    block: string
  }
  userId: {
    profilePicture?: string
    username: string
  }
}

type AttendanceRecord = {
  _id: string
  student: Student
  date: string
  morningStatus: "present" | "absent"
  eveningStatus: "present" | "absent"
  remarks?: string
}

export default function AttendancePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate] = useState(new Date().toISOString().split("T")[0])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedDate, setSelectedDate] = useState(currentDate)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [session, setSession] = useState<"morning" | "evening">("morning")
  const [tempAttendance, setTempAttendance] = useState<
    Record<string, { morning: "present" | "absent"; evening: "present" | "absent" }>
  >({})
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken")
    }
    return null
  }

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const fetchAttendanceData = async (date: string) => {
    const token = getAuthToken()
    if (!token) return []

    try {
      const res = await fetch(`http://localhost:5000/api/admin/attendance/${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("adminToken")
          router.push("/login")
          return []
        }
        throw new Error("Failed to fetch attendance data")
      }

      const data = await res.json()
      return Array.isArray(data.data) ? data.data : []
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive",
      })
      return []
    }
  }

  const fetchAllDates = async () => {
    const token = getAuthToken()
    if (!token) return []

    try {
      const res = await fetch("http://localhost:5000/api/admin/attendance/dates/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch available dates")
      }

      const data = await res.json()
      return Array.isArray(data.data) ? data.data : []
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load available dates",
        variant: "destructive",
      })
      return []
    }
  }

  const fetchStudents = async () => {
    const token = getAuthToken()
    if (!token) return []

    try {
      const res = await fetch("http://localhost:5000/api/admin/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("adminToken")
          router.push("/login")
          return []
        }
        throw new Error(`Failed to fetch students: ${res.status}`)
      }

      const data = await res.json()
      return Array.isArray(data.data)
        ? data.data.map((student: any) => ({
            _id: student._id,
            name: student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown",
            studentId: student.studentId || "N/A",
            roomId: {
              roomNumber: student.roomId?.roomNumber || student.roomNumber || "N/A",
              block: student.roomId?.block || student.block || "N/A",
            },
            userId: {
              profilePicture: student.profilePicture || student.userId?.profilePicture,
              username: student.username || student.userId?.username || "N/A",
            },
          }))
        : []
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load students",
        variant: "destructive",
      })
      return []
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch students
        const fetchedStudents = await fetchStudents()
        setStudents(fetchedStudents)

        // Initialize all students as absent by default for both sessions
        const initialAttendance: Record<string, { morning: "present" | "absent"; evening: "present" | "absent" }> = {}
        fetchedStudents.forEach((student: Student) => {
          initialAttendance[student._id] = { morning: "absent", evening: "absent" }
        })
        setTempAttendance(initialAttendance)

        // Fetch today's attendance records
        const records = await fetchAttendanceData(currentDate)
        setAttendanceRecords(records)

        // Update tempAttendance based on fetched records
        if (records.length > 0) {
          setTempAttendance((prev) => {
            const updated = { ...prev }
            records.forEach((record: AttendanceRecord) => {
              if (record.student._id in updated) {
                updated[record.student._id] = {
                  morning: record.morningStatus,
                  evening: record.eveningStatus,
                }
              }
            })
            return updated
          })
        }

        // Fetch all unique dates
        const dates = await fetchAllDates()
        setAvailableDates(dates)
      } catch (error) {
        console.error("Fetch error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentDate, router, toast])

  useEffect(() => {
    if (showHistory) {
      const loadHistory = async () => {
        setIsLoading(true)
        try {
          const records = await fetchAttendanceData(selectedDate)
          setAttendanceRecords(records)
        } catch (error) {
          console.error("Error loading history:", error)
        } finally {
          setIsLoading(false)
        }
      }
      loadHistory()
    }
  }, [selectedDate, showHistory])

  const toggleAttendance = (studentId: string) => {
    setTempAttendance((prev) => {
      const currentStatus = prev[studentId] ? prev[studentId][session] : "absent"
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [session]: currentStatus === "present" ? "absent" : "present",
        },
      }
    })
  }

  const handleSubmit = async () => {
    const token = getAuthToken()
    if (!token) {
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("http://localhost:5000/api/admin/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: currentDate,
          session,
          attendance: Object.entries(tempAttendance).map(([studentId, status]) => ({
            studentId,
            status: status[session],
          })),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken")
          router.push("/login")
          return
        }
        throw new Error("Failed to submit attendance")
      }

      const data = await response.json()
      setAttendanceRecords(Array.isArray(data.data) ? data.data : [])

      // Refresh available dates after submission
      const dates = await fetchAllDates()
      setAvailableDates(dates)

      // Show success dialog
      setShowSuccessDialog(true)

      // Refresh the attendance data
      const updatedRecords = await fetchAttendanceData(currentDate)
      setAttendanceRecords(updatedRecords)

      // Update tempAttendance with the new records
      if (updatedRecords.length > 0) {
        setTempAttendance((prev) => {
          const updated = { ...prev }
          updatedRecords.forEach((record: AttendanceRecord) => {
            if (record.student._id in updated) {
              updated[record.student._id] = {
                morning: record.morningStatus,
                evening: record.eveningStatus,
              }
            }
          })
          return updated
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit attendance",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredRecords = showHistory
    ? attendanceRecords.filter(
        (record) => record.date && new Date(record.date).toISOString().split("T")[0] === selectedDate,
      )
    : []

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="border-emerald-200 dark:border-emerald-800/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-emerald-600 dark:text-emerald-400">
                Attendance Recorded!
              </AlertDialogTitle>
              <AlertDialogDescription>
                Attendance has been successfully marked for {session} session on {format(new Date(currentDate), "PPPP")}
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowSuccessDialog(false)}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Header */}
        <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20 p-6 rounded-lg border">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="text-muted-foreground">Mark and manage student attendance records</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground bg-purple-50 dark:bg-purple-900/30 px-3 py-2 rounded-md">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-800 dark:text-purple-200">{format(new Date(currentDate), "PPPP")}</span>
          </div>
          <div className="flex gap-2">
            <Select value={session} onValueChange={(value: "morning" | "evening") => setSession(value)}>
              <SelectTrigger className="w-[120px] border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showHistory ? "outline" : "default"}
              onClick={() => {
                setShowHistory(!showHistory)
                if (!showHistory) {
                  setSelectedDate(currentDate)
                }
              }}
              className={
                showHistory
                  ? "border-purple-200 dark:border-purple-800/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }
            >
              <History className="mr-2 h-4 w-4" />
              {showHistory ? "Hide History" : "View History"}
            </Button>
          </div>
        </div>

        {showHistory ? (
          <Card className="border-purple-200 dark:border-purple-800/30">
            <CardHeader className="bg-purple-50 dark:bg-purple-900/20 rounded-t-lg border-b border-purple-100 dark:border-purple-800/20">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-purple-900 dark:text-purple-100">Attendance History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[220px] border-purple-200 dark:border-purple-800/30 focus-visible:ring-purple-500">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date} value={date} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        {format(parseISO(date), "PPPP")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="rounded-md border border-purple-200 dark:border-purple-800/30 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-purple-50 dark:bg-purple-900/20">
                      <TableRow className="border-b border-purple-100 dark:border-purple-800/20">
                        <TableHead className="text-purple-900 dark:text-purple-100">Student</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-100">Student ID</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-100">Room No</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-100">Morning</TableHead>
                        <TableHead className="text-purple-900 dark:text-purple-100">Evening</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                          <TableRow
                            key={record._id}
                            className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 border-b border-purple-100 dark:border-purple-800/20"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-purple-200 dark:border-purple-800/30">
                                  <AvatarImage
                                    src={record.student.userId.profilePicture || "/placeholder.svg"}
                                    alt={record.student.name}
                                  />
                                  <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    {record.student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{record.student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs border-purple-200 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-900/20"
                              >
                                {record.student.studentId}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="border-purple-200 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-900/20"
                              >
                                {record.student.roomId.block}-{record.student.roomId.roomNumber}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={record.morningStatus === "present" ? "default" : "destructive"}
                                className={
                                  record.morningStatus === "present"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                }
                              >
                                {record.morningStatus === "present" ? "Present" : "Absent"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={record.eveningStatus === "present" ? "default" : "destructive"}
                                className={
                                  record.eveningStatus === "present"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                }
                              >
                                {record.eveningStatus === "present" ? "Present" : "Absent"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No attendance records found for selected date
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-emerald-200 dark:border-emerald-800/30">
            <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20 rounded-t-lg border-b border-emerald-100 dark:border-emerald-800/20">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-emerald-900 dark:text-emerald-100">
                  {session === "morning" ? "Morning" : "Evening"} Attendance
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No students found</div>
              ) : (
                <>
                  <div className="rounded-md border border-emerald-200 dark:border-emerald-800/30 overflow-hidden mb-6">
                    <Table>
                      <TableHeader className="bg-emerald-50 dark:bg-emerald-900/20">
                        <TableRow className="border-b border-emerald-100 dark:border-emerald-800/20">
                          <TableHead className="text-emerald-900 dark:text-emerald-100">Student</TableHead>
                          <TableHead className="text-emerald-900 dark:text-emerald-100">Student ID</TableHead>
                          <TableHead className="text-emerald-900 dark:text-emerald-100">Room No</TableHead>
                          <TableHead className="text-emerald-900 dark:text-emerald-100">Status</TableHead>
                          <TableHead className="text-right text-emerald-900 dark:text-emerald-100">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => {
                          const currentStatus = tempAttendance[student._id]
                            ? tempAttendance[student._id][session]
                            : "absent"
                          const existingRecord = attendanceRecords.find((r) => r.student._id === student._id)
                          const displayStatus = existingRecord
                            ? session === "morning"
                              ? existingRecord.morningStatus
                              : existingRecord.eveningStatus
                            : currentStatus

                          return (
                            <TableRow
                              key={student._id}
                              className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-800/20"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-emerald-200 dark:border-emerald-800/30">
                                    <AvatarImage
                                      src={student.userId.profilePicture || "/placeholder.svg"}
                                      alt={student.name}
                                    />
                                    <AvatarFallback className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                      {student.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{student.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="text-xs border-emerald-200 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/20"
                                >
                                  {student.studentId}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {student.roomId.block}-{student.roomId.roomNumber}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={currentStatus === "present" ? "default" : "destructive"}
                                  className={
                                    currentStatus === "present"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                  }
                                >
                                  {currentStatus === "present" ? "Present" : "Absent"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant={currentStatus === "present" ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => toggleAttendance(student._id)}
                                  className={
                                    currentStatus === "present"
                                      ? "bg-red-600 hover:bg-red-700"
                                      : "bg-emerald-600 hover:bg-emerald-700"
                                  }
                                >
                                  {currentStatus === "present" ? (
                                    <>
                                      <XCircle className="mr-1 h-3 w-3" />
                                      Mark Absent
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-1 h-3 w-3" />
                                      Mark Present
                                    </>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Attendance"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
