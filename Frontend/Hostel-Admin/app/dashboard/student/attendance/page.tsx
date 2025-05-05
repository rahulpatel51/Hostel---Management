"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Clock, Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HostelAttendancePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  // Generate month data
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Sample attendance data
  const generateAttendanceData = () => {
    const data: Record<string, { status: 'present' | 'absent' | 'late', reason?: string, lateBy?: string }> = {
      '2023-11-01': { status: 'present' },
      '2023-11-02': { status: 'present' },
      '2023-11-03': { status: 'absent', reason: 'Out of station' },
      '2023-11-04': { status: 'present' },
      '2023-11-05': { status: 'late', lateBy: '1 hour' },
      '2023-11-15': { status: 'absent', reason: 'Medical leave' },
      '2023-11-20': { status: 'late', lateBy: '30 minutes' },
    };
    return data;
  };

  const attendanceData = generateAttendanceData();

  // Calculate stats for current month
  const getMonthStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let present = 0, absent = 0, late = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const status = attendanceData[dateStr]?.status;
      
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
    }
    
    const total = present + absent + late;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, late, total, percentage };
  };

  const monthStats = getMonthStats();

  // Generate days for current month
  const generateMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const status = attendanceData[dateStr]?.status;
      const reason = attendanceData[dateStr]?.reason;
      const lateBy = attendanceData[dateStr]?.lateBy;
      
      days.push({
        date,
        dayOfMonth: day,
        status,
        reason,
        lateBy
      });
    }
    
    return days;
  };

  const monthDays = generateMonthDays();

  // Handle month navigation
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Handle day selection
  const handleDayClick = (day: { date: Date, status?: 'present' | 'absent' | 'late', reason?: string, lateBy?: string }) => {
    setSelectedDay(day.date);
    setViewMode('day');
  };

  // Handle back to month view
  const handleBackToMonth = () => {
    setViewMode('month');
    setSelectedDay(null);
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentDate, viewMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Hostel <span className="text-indigo-600">Attendance</span>
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'month' ? 'Monthly overview' : 'Daily attendance details'}
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {viewMode === 'day' && (
              <Button variant="outline" size="sm" onClick={handleBackToMonth}>
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to Month
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold">
                {viewMode === 'month' 
                  ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : selectedDay?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
            </div>
          </div>
          
          {viewMode === 'month' && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => changeMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                value={currentDate.getMonth().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(parseInt(value));
                  setCurrentDate(newDate);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => changeMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-indigo-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                <div className="text-indigo-600">{monthStats.percentage}%</div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600" 
                    style={{ width: `${monthStats.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{monthStats.present} Present</span>
                  <span>{monthStats.total} Days</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <Check className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthStats.present}</div>
                <p className="text-xs text-muted-foreground">Days</p>
              </CardContent>
            </Card>

            <Card className="border-red-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Absent/Late</CardTitle>
                <X className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthStats.absent + monthStats.late}</div>
                <p className="text-xs text-muted-foreground">Days</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle>Monthly Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-sm text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`aspect-square p-2 rounded-md border ${
                      day ? 
                        day.status === 'present' ? 'border-green-200 bg-green-50 hover:bg-green-100' :
                        day.status === 'absent' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
                        day.status === 'late' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
                        'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        : 'border-transparent'
                    } ${day ? 'cursor-pointer' : ''}`}
                    onClick={() => day && handleDayClick(day)}
                  >
                    {day && (
                      <div className="flex flex-col h-full">
                        <div className="text-sm font-medium self-end">
                          {day.dayOfMonth}
                        </div>
                        <div className="mt-auto">
                          {day.status === 'present' && (
                            <Check className="h-4 w-4 mx-auto text-green-600" />
                          )}
                          {day.status === 'absent' && (
                            <X className="h-4 w-4 mx-auto text-red-600" />
                          )}
                          {day.status === 'late' && (
                            <Clock className="h-4 w-4 mx-auto text-yellow-600" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day View */}
        {viewMode === 'day' && selectedDay && (
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle>
                {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-100">
                      <Calendar className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Hostel Attendance</h3>
                      <p className="text-sm text-muted-foreground">
                        {dayNames[selectedDay.getDay()]}, {selectedDay.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    {attendanceData[selectedDay.toISOString().split('T')[0]]?.status === 'present' && (
                      <Badge className="bg-green-100 text-green-800 px-4 py-2">
                        <Check className="h-4 w-4 mr-2" /> Present
                      </Badge>
                    )}
                    {attendanceData[selectedDay.toISOString().split('T')[0]]?.status === 'absent' && (
                      <Badge className="bg-red-100 text-red-800 px-4 py-2">
                        <X className="h-4 w-4 mr-2" /> Absent
                      </Badge>
                    )}
                    {attendanceData[selectedDay.toISOString().split('T')[0]]?.status === 'late' && (
                      <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2">
                        <Clock className="h-4 w-4 mr-2" /> Late
                      </Badge>
                    )}
                    {!attendanceData[selectedDay.toISOString().split('T')[0]] && (
                      <Badge variant="outline" className="px-4 py-2">
                        No record
                      </Badge>
                    )}
                  </div>
                </div>
                
                {(attendanceData[selectedDay.toISOString().split('T')[0]]?.reason || 
                  attendanceData[selectedDay.toISOString().split('T')[0]]?.lateBy) && (
                  <Card className="border-gray-200">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Info className="h-4 w-4 text-indigo-600" /> Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      {attendanceData[selectedDay.toISOString().split('T')[0]]?.reason && (
                        <p className="text-sm">
                          <span className="font-medium">Reason: </span>
                          {attendanceData[selectedDay.toISOString().split('T')[0]]?.reason}
                        </p>
                      )}
                      {attendanceData[selectedDay.toISOString().split('T')[0]]?.lateBy && (
                        <p className="text-sm">
                          <span className="font-medium">Late by: </span>
                          {attendanceData[selectedDay.toISOString().split('T')[0]]?.lateBy}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}