"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Save, Plus, BookOpen, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function AcademicPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [studentData, setStudentData] = useState({
    name: "Rahul Sharma",
    rollNumber: "CS2023001",
    department: "Computer Science",
    semester: "5th Semester"
  });

  const [courses, setCourses] = useState([
    { code: "CS501", name: "Advanced Algorithms", credits: 4, grade: "A" },
    { code: "CS502", name: "Database Systems", credits: 3, grade: "B+" },
    { code: "CS503", name: "Machine Learning", credits: 4, grade: "A-" }
  ]);

  const [newCourse, setNewCourse] = useState({ code: "", name: "", credits: "", grade: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (index: number, field: string, value: string) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    setCourses(updatedCourses);
  };

  const handleAddCourse = () => {
    if (!newCourse.code || !newCourse.name || !newCourse.credits) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setCourses([...courses, { ...newCourse, credits: Number(newCourse.credits), grade: newCourse.grade || "Not Graded" }]);
    setNewCourse({ code: "", name: "", credits: "", grade: "" });
    toast({
      title: "Success",
      description: "Course added successfully",
      className: "bg-green-500 text-white"
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Updated",
      description: "Academic information saved successfully",
      className: "bg-blue-500 text-white"
    });
  };

  const removeCourse = (index: number) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
    toast({
      title: "Removed",
      description: "Course removed successfully",
      className: "bg-red-500 text-white"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading academic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Academic <span className="text-indigo-600">Profile</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your academic information and courses
          </p>
        </div>

        {/* Student Information Card */}
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-indigo-600" />
              <CardTitle>Student Information</CardTitle>
            </div>
            {isEditing ? (
              <Button onClick={handleSave} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Save className="h-4 w-4" />
                Save
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm" variant="outline" className="gap-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={studentData.name}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="text-lg font-medium">{studentData.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              {isEditing ? (
                <Input
                  id="rollNumber"
                  name="rollNumber"
                  value={studentData.rollNumber}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="text-lg font-medium">{studentData.rollNumber}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              {isEditing ? (
                <Input
                  id="department"
                  name="department"
                  value={studentData.department}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="text-lg font-medium">{studentData.department}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              {isEditing ? (
                <Input
                  id="semester"
                  name="semester"
                  value={studentData.semester}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="text-lg font-medium">{studentData.semester}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses Section */}
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <CardTitle>Course Details</CardTitle>
            </div>
            <Button 
              size="sm" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setIsEditing(true)}
            >
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Grade</TableHead>
                  {isEditing && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={course.code}
                          onChange={(e) => handleCourseChange(index, "code", e.target.value)}
                        />
                      ) : (
                        course.code
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={course.name}
                          onChange={(e) => handleCourseChange(index, "name", e.target.value)}
                        />
                      ) : (
                        course.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={course.credits}
                          onChange={(e) => handleCourseChange(index, "credits", e.target.value)}
                          type="number"
                        />
                      ) : (
                        course.credits
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={course.grade}
                          onChange={(e) => handleCourseChange(index, "grade", e.target.value)}
                        />
                      ) : (
                        <Badge variant="secondary">{course.grade}</Badge>
                      )}
                    </TableCell>
                    {isEditing && (
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeCourse(index)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {isEditing && (
                  <TableRow>
                    <TableCell>
                      <Input
                        placeholder="CS501"
                        value={newCourse.code}
                        onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Advanced Algorithms"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="4"
                        value={newCourse.credits}
                        onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                        type="number"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="A"
                        value={newCourse.grade}
                        onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={handleAddCourse}>
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}