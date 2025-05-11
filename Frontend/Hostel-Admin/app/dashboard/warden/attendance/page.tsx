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

type Student = {
  _id: string;
  name: string;
  rollNumber: string;
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
  student: {
    _id: string;
    name: string;
    rollNumber: string;
    userId: {
      profilePicture?: string;
      username: string;
    };
    roomId: {
      roomNumber: string;
      block: string;
    };
  };
  date: string;
  morningStatus: 'present' | 'absent';
  eveningStatus: 'present' | 'absent';
  remarks?: string;
};

export default function AttendancePage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<'morning' | 'evening'>('morning');
  const [tempAttendance, setTempAttendance] = useState<Record<string, 'present' | 'absent'>>({});

  // Fetch students and attendance data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch students under warden's supervision
        const studentsRes = await fetch('http://localhost:5000/api/admin/students');
        if (!studentsRes.ok) throw new Error('Failed to fetch students');
        const studentsData = await studentsRes.json();
        setStudents(studentsData.data);

        // Fetch today's attendance records
        const attendanceRes = await fetch(`http://localhost:5000/api/warden/attendance/${currentDate}`);
        if (!attendanceRes.ok) throw new Error('Failed to fetch attendance');
        const attendanceData = await attendanceRes.json();
        setAttendanceRecords(attendanceData.data);

        // Initialize temp attendance state
        const initialAttendance: Record<string, 'present' | 'absent'> = {};
        studentsData.data.forEach((student: Student) => {
          const record = attendanceData.data.find((r: AttendanceRecord) => r.student._id === student._id);
          initialAttendance[student._id] = record 
            ? session === 'morning' ? record.morningStatus : record.eveningStatus
            : 'present'; // default to present
        });
        setTempAttendance(initialAttendance);

      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDate, toast, session]);

  // Fetch attendance history when date changes
  useEffect(() => {
    if (showHistory && selectedDate !== currentDate) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/warden/attendance/${selectedDate}`);
          if (!res.ok) throw new Error('Failed to fetch attendance history');
          const data = await res.json();
          setAttendanceRecords(data.data);
        } catch (error) {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to load history",
            variant: "destructive"
          });
        }
      };
      fetchHistory();
    }
  }, [selectedDate, showHistory, currentDate, toast]);

  const toggleAttendance = (studentId: string) => {
    setTempAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/warden/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: currentDate,
          session,
          attendance: Object.entries(tempAttendance).map(([studentId, status]) => ({
            studentId,
            status
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to submit attendance');

      const data = await response.json();
      setAttendanceRecords(data.data);
      toast({
        title: "Success",
        description: "Attendance recorded successfully",
        className: "bg-green-500 text-white border-0"
      });
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

  const filteredRecords = attendanceRecords.filter(record => 
    record.date.split('T')[0] === selectedDate
  );

  const uniqueDates = Array.from(
    new Set(attendanceRecords.map(record => record.date.split('T')[0]))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Attendance Management</h1>
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
            onClick={() => setShowHistory(!showHistory)}
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
                  {uniqueDates.map((date, index) => (
                    <SelectItem 
                      key={index} 
                      value={date}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      {format(parseISO(date), 'PPPP')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-blue-200 dark:border-blue-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-blue-50 dark:bg-blue-900/20">
                  <TableRow>
                    <TableHead className="text-blue-800 dark:text-blue-200">Student</TableHead>
                    <TableHead className="text-blue-800 dark:text-blue-200">Roll No.</TableHead>
                    <TableHead className="text-blue-800 dark:text-blue-200">Room</TableHead>
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
                              <AvatarFallback>{record.student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{record.student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {record.student.rollNumber}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.student.roomId.block}-{record.student.roomId.roomNumber}</TableCell>
                        <TableCell>
                          <Badge className={record.morningStatus === 'present' 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"}>
                            {record.morningStatus === 'present' ? 'Present' : 'Absent'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={record.eveningStatus === 'present' 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"}>
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
            ) : (
              <>
                <div className="rounded-md border border-blue-200 dark:border-blue-800 overflow-hidden mb-6">
                  <Table>
                    <TableHeader className="bg-blue-50 dark:bg-blue-900/20">
                      <TableRow>
                        <TableHead className="text-blue-800 dark:text-blue-200">Student</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200">Roll No.</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200">Room</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200">Status</TableHead>
                        <TableHead className="text-right text-blue-800 dark:text-blue-200">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const currentStatus = tempAttendance[student._id] || 'present';
                        return (
                          <TableRow key={student._id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={student.userId.profilePicture} alt={student.name} />
                                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {student.rollNumber}
                              </Badge>
                            </TableCell>
                            <TableCell>{student.roomId.block}-{student.roomId.roomNumber}</TableCell>
                            <TableCell>
                              <Badge className={currentStatus === 'present' 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"}>
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