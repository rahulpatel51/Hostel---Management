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
  id: string;
  name: string;
  room: string;
  profileImg: string;
  present: boolean;
};

type AttendanceRecord = {
  date: string;
  attendance: {
    studentId: string;
    status: 'present' | 'absent';
  }[];
};

export default function AttendancePage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);

  // Load mock data with profile images
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock student data with profile images from online sources
        const mockStudents: Student[] = [
          { 
            id: 'ST2023001', 
            name: 'Rahul Sharma', 
            room: 'A-101', 
            profileImg: 'https://randomuser.me/api/portraits/men/1.jpg',
            present: true 
          },
          { 
            id: 'ST2023002', 
            name: 'Priya Patel', 
            room: 'A-102', 
            profileImg: 'https://randomuser.me/api/portraits/women/1.jpg',
            present: true 
          },
          { 
            id: 'ST2023003', 
            name: 'Amit Kumar', 
            room: 'B-201', 
            profileImg: 'https://randomuser.me/api/portraits/men/2.jpg',
            present: false 
          },
          { 
            id: 'ST2023004', 
            name: 'Neha Singh', 
            room: 'B-202', 
            profileImg: 'https://randomuser.me/api/portraits/women/2.jpg',
            present: true 
          },
          { 
            id: 'ST2023005', 
            name: 'Vikram Reddy', 
            room: 'C-301', 
            profileImg: 'https://randomuser.me/api/portraits/men/3.jpg',
            present: false 
          },
        ];

        // Mock attendance history
        const mockHistory: AttendanceRecord[] = [
          {
            date: '2023-05-01',
            attendance: [
              { studentId: 'ST2023001', status: 'present' },
              { studentId: 'ST2023002', status: 'present' },
              { studentId: 'ST2023003', status: 'absent' },
              { studentId: 'ST2023004', status: 'present' },
              { studentId: 'ST2023005', status: 'absent' },
            ]
          },
          {
            date: '2023-05-02',
            attendance: [
              { studentId: 'ST2023001', status: 'present' },
              { studentId: 'ST2023002', status: 'absent' },
              { studentId: 'ST2023003', status: 'present' },
              { studentId: 'ST2023004', status: 'present' },
              { studentId: 'ST2023005', status: 'present' },
            ]
          }
        ];

        setStudents(mockStudents);
        setHistory(mockHistory);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load attendance data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const toggleAttendance = (studentId: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, present: !student.present } : student
    ));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const newRecord: AttendanceRecord = {
          date: currentDate,
          attendance: students.map(student => ({
            studentId: student.id,
            status: student.present ? 'present' : 'absent'
          }))
        };

        setHistory(prev => [newRecord, ...prev]);
        toast({
          title: "Success",
          description: "Attendance recorded successfully",
          className: "bg-green-500 text-white border-0"
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter(record => record.date === selectedDate);

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
                  {history.map((record, index) => (
                    <SelectItem 
                      key={index} 
                      value={record.date}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      {format(parseISO(record.date), 'PPPP')}
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
                    <TableHead className="text-blue-800 dark:text-blue-200">ID</TableHead>
                    <TableHead className="text-blue-800 dark:text-blue-200">Room</TableHead>
                    <TableHead className="text-blue-800 dark:text-blue-200">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory[0].attendance.map((record, index) => {
                      const student = students.find(s => s.id === record.studentId);
                      return (
                        <TableRow key={index} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={student?.profileImg} alt={student?.name} />
                                <AvatarFallback>{student?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {record.studentId}
                            </Badge>
                          </TableCell>
                          <TableCell>{student?.room}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {record.status === 'present' ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Present
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Absent
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
              <CardTitle className="text-blue-800 dark:text-blue-200">Today's Attendance</CardTitle>
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
                        <TableHead className="text-blue-800 dark:text-blue-200">ID</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200">Room</TableHead>
                        <TableHead className="text-blue-800 dark:text-blue-200">Status</TableHead>
                        <TableHead className="text-right text-blue-800 dark:text-blue-200">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={student.profileImg} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {student.id}
                            </Badge>
                          </TableCell>
                          <TableCell>{student.room}</TableCell>
                          <TableCell>
                            {student.present ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                Present
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                Absent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={student.present ? "destructive" : "default"}
                              size="sm"
                              onClick={() => toggleAttendance(student.id)}
                              className={student.present ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
                            >
                              {student.present ? (
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
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