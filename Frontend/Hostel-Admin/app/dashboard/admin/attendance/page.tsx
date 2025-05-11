"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Calendar, Clock, User, History, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Student = {
  _id: string;
  name: string;
  studentId: string;
  roomId: {
    roomNumber: string;
    block: string;
  };
  userId: {
    profilePicture?: string;
    username: string;
  };
};

type AttendanceRecord = {
  _id: string;
  student: Student;
  date: string;
  morningStatus: 'present' | 'absent';
  eveningStatus: 'present' | 'absent';
  remarks?: string;
};

export default function AttendancePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<'morning' | 'evening'>('morning');
  const [tempAttendance, setTempAttendance] = useState<Record<string, { morning: 'present' | 'absent', evening: 'present' | 'absent' }>>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const fetchAttendanceData = async (date: string) => {
    const token = getAuthToken();
    if (!token) return [];

    try {
      const res = await fetch(`http://localhost:5000/api/admin/attendance/${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('adminToken');
          router.push('/login');
          return [];
        }
        throw new Error('Failed to fetch attendance data');
      }
      
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive"
      });
      return [];
    }
  };

  const fetchAllDates = async () => {
    const token = getAuthToken();
    if (!token) return [];

    try {
      const res = await fetch('http://localhost:5000/api/admin/attendance/dates/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch available dates');
      }

      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load available dates",
        variant: "destructive"
      });
      return [];
    }
  };

  const fetchStudents = async () => {
    const token = getAuthToken();
    if (!token) return [];

    try {
      const res = await fetch('http://localhost:5000/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('adminToken');
          router.push('/login');
          return [];
        }
        throw new Error(`Failed to fetch students: ${res.status}`);
      }

      const data = await res.json();
      return Array.isArray(data.data) ? data.data.map((student: any) => ({
        _id: student._id,
        name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown',
        studentId: student.studentId || 'N/A',
        roomId: {
          roomNumber: student.roomId?.roomNumber || student.roomNumber || 'N/A',
          block: student.roomId?.block || student.block || 'N/A'
        },
        userId: {
          profilePicture: student.profilePicture || student.userId?.profilePicture,
          username: student.username || student.userId?.username || 'N/A'
        }
      })) : [];
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load students",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch students
        const fetchedStudents = await fetchStudents();
        setStudents(fetchedStudents);

        // Initialize all students as absent by default for both sessions
        const initialAttendance: Record<string, { morning: 'present' | 'absent', evening: 'present' | 'absent' }> = {};
        fetchedStudents.forEach((student: Student) => {
          initialAttendance[student._id] = { morning: 'absent', evening: 'absent' };
        });
        setTempAttendance(initialAttendance);

        // Fetch today's attendance records
        const records = await fetchAttendanceData(currentDate);
        setAttendanceRecords(records);
        
        // Update tempAttendance based on fetched records
        if (records.length > 0) {
          setTempAttendance(prev => {
            const updated = {...prev};
            records.forEach((record: AttendanceRecord) => {
              if (record.student._id in updated) {
                updated[record.student._id] = {
                  morning: record.morningStatus,
                  evening: record.eveningStatus
                };
              }
            });
            return updated;
          });
        }

        // Fetch all unique dates
        const dates = await fetchAllDates();
        setAvailableDates(dates);

      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDate, router, toast]);

  useEffect(() => {
    if (showHistory) {
      const loadHistory = async () => {
        setIsLoading(true);
        try {
          const records = await fetchAttendanceData(selectedDate);
          setAttendanceRecords(records);
        } catch (error) {
          console.error('Error loading history:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadHistory();
    }
  }, [selectedDate, showHistory]);

  const toggleAttendance = (studentId: string) => {
    setTempAttendance(prev => {
      const currentStatus = prev[studentId] ? prev[studentId][session] : 'absent';
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [session]: currentStatus === 'present' ? 'absent' : 'present'
        }
      };
    });
  };

  const handleSubmit = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: currentDate,
          session,
          attendance: Object.entries(tempAttendance).map(([studentId, status]) => ({
            studentId,
            status: status[session]
          }))
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          router.push('/login');
          return;
        }
        throw new Error('Failed to submit attendance');
      }

      const data = await response.json();
      setAttendanceRecords(Array.isArray(data.data) ? data.data : []);
      
      // Refresh available dates after submission
      const dates = await fetchAllDates();
      setAvailableDates(dates);

      // Show success dialog
      setShowSuccessDialog(true);
      
      // Refresh the attendance data
      const updatedRecords = await fetchAttendanceData(currentDate);
      setAttendanceRecords(updatedRecords);

      // Update tempAttendance with the new records
      if (updatedRecords.length > 0) {
        setTempAttendance(prev => {
          const updated = {...prev};
          updatedRecords.forEach((record: AttendanceRecord) => {
            if (record.student._id in updated) {
              updated[record.student._id] = {
                morning: record.morningStatus,
                evening: record.eveningStatus
              };
            }
          });
          return updated;
        });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit attendance",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = showHistory 
    ? attendanceRecords.filter(record => 
        record.date && new Date(record.date).toISOString().split('T')[0] === selectedDate
      )
    : [];

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">Attendance Recorded!</AlertDialogTitle>
            <AlertDialogDescription>
              Attendance has been successfully marked for {session} session on {format(new Date(currentDate), 'PPPP')}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowSuccessDialog(false)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        <CardDescription className="text-muted-foreground">
          Mark and manage student attendance records
        </CardDescription>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-md">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-800 dark:text-blue-200">
            {format(new Date(currentDate), 'PPPP')}
          </span>
        </div>
        <div className="flex gap-2">
          <Select value={session} onValueChange={(value: 'morning' | 'evening') => setSession(value)}>
            <SelectTrigger className="w-[120px]">
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
              setShowHistory(!showHistory);
              if (!showHistory) {
                setSelectedDate(currentDate);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <History className="mr-2 h-4 w-4" />
            {showHistory ? "Hide History" : "View History"}
          </Button>
        </div>
      </div>

      {showHistory ? (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-blue-800 dark:text-blue-200">Attendance History</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Select 
                value={selectedDate}
                onValueChange={setSelectedDate}
              >
                <SelectTrigger className="w-[220px] border-blue-300 dark:border-blue-700">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent className="border-blue-200 dark:border-blue-800">
                  {availableDates.map((date) => (
                    <SelectItem 
                      key={date} 
                      value={date}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      {format(parseISO(date), 'PPPP')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="rounded-md border border-blue-200 dark:border-blue-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-50 dark:bg-blue-900/20">
                    <TableRow>
                      <TableHead className="text-blue-800 dark:text-blue-200">Student</TableHead>
                      <TableHead className="text-blue-800 dark:text-blue-200">Student ID</TableHead>
                      <TableHead className="text-blue-800 dark:text-blue-200">Room No</TableHead>
                      <TableHead className="text-blue-800 dark:text-blue-200">Morning</TableHead>
                      <TableHead className="text-blue-800 dark:text-blue-200">Evening</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <TableRow key={record._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={record.student.userId.profilePicture} alt={record.student.name} />
                                <AvatarFallback>
                                  {record.student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{record.student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {record.student.studentId}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.morningStatus === 'present' ? 'default' : 'destructive'}
                              className={record.morningStatus === 'present' 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"}
                            >
                              {record.morningStatus === 'present' ? 'Present' : 'Absent'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.eveningStatus === 'present' ? 'default' : 'destructive'}
                              className={record.eveningStatus === 'present' 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"}
                            >
                              {record.eveningStatus === 'present' ? 'Present' : 'Absent'}
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
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-blue-800 dark:text-blue-200">
                {session === 'morning' ? 'Morning' : 'Evening'} Attendance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            ) : (
              <>
                <div className="rounded-md border border-blue-200 dark:border-blue-800 overflow-hidden mb-6">
                  <Table>
                    <TableHeader className="bg-blue-50 dark:bg-blue-900/20">
                      <TableRow>
                        <TableHead className="text-blue-800 dark:text-blue-200">Student</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200">Student ID</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200">Room No</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200">Status</TableHead>
                        <TableHead className="text-right text-blue-800 dark:text-blue-200">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const currentStatus = tempAttendance[student._id] ? tempAttendance[student._id][session] : 'absent';
                        const existingRecord = attendanceRecords.find(r => r.student._id === student._id);
                        const displayStatus = existingRecord 
                          ? session === 'morning' 
                            ? existingRecord.morningStatus 
                            : existingRecord.eveningStatus
                          : currentStatus;

                        return (
                          <TableRow key={student._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={student.userId.profilePicture} alt={student.name} />
                                  <AvatarFallback>
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {student.studentId}
                              </Badge>
                            </TableCell>
                            <TableCell>{student.roomId.block}-{student.roomId.roomNumber}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={currentStatus === 'present' ? 'default' : 'destructive'}
                                className={currentStatus === 'present' 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"}
                              >
                                {currentStatus === 'present' ? 'Present' : 'Absent'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant={currentStatus === 'present' ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleAttendance(student._id)}
                                className={currentStatus === 'present' ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                              >
                                {currentStatus === 'present' ? (
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
  );
}