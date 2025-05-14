"use client";

import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  BedDouble, Mail, Phone, MapPin, Home, Users, 
  Wifi, ClipboardList, Ruler, User, Layers, 
  BatteryFull, Droplets, Sofa, Loader2, AlertCircle,
  RefreshCw, LogIn
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Student {
  _id: string;
  studentId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  course: string;
  year: string;
  status: string;
  address?: string;
  faceId?: string;
  image?: string;
}

interface Room {
  _id: string;
  block: string;
  roomNumber: string;
  floor: string;
  capacity: number;
  occupiedCount: number;
  roomType: string;
  facilities: string[];
  description?: string;
  price?: number;
  pricePeriod?: string;
  imageUrl?: string;
  roomId: string;
  status: string;
  occupants: Student[];
}

interface ApiResponse {
  message: string;
  success: boolean;
  data: {
    student: Student & {
      room?: Room;
    };
  };
}

// Static room rules that will be displayed
const DEFAULT_ROOM_RULES = [
  "No smoking or alcohol consumption in rooms",
  "Lights out by 11:00 PM on weekdays",
  "Visitors must leave by 9:00 PM",
  "Keep noise levels reasonable after 10:00 PM",
  "No cooking in rooms - use common kitchen area",
  "Clean your own dishes after use",
  "Report any damages immediately",
  "No pets allowed",
  "Conserve electricity and water",
  "Respect other occupants' privacy and space"
];

export default function RoomDetailsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [error, setError] = useState<{message: string; code?: string} | null>(null);

  const fetchRoomDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<ApiResponse>('http://localhost:5000/api/student/room-info', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.success) {
        setStudentData(response.data.data.student);
        setRoomData(response.data.data.student.room || null);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch room details');
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      
      let errorMessage = "Failed to load room details";
      let errorCode = "UNKNOWN_ERROR";
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
        errorCode = err.response?.data?.code || errorCode;
        
        if (err.response?.status === 401) {
          router.push('/login');
          return;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError({ message: errorMessage, code: errorCode });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        action: errorCode === 'STUDENT_NOT_FOUND' ? (
          <Button variant="ghost" onClick={() => router.push('/login')}>
            Login Again
          </Button>
        ) : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const renderInfoItem = (icon: React.ReactNode, label: string, value: string | React.ReactNode) => (
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-500 dark:text-gray-400">{label}</h3>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="text-gray-600">Loading room details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error Loading Room Details</h2>
        <p className="text-muted-foreground max-w-md text-center">
          {error.message} {error.code && `(Code: ${error.code})`}
        </p>
        <div className="flex gap-2 mt-4">
          <Button onClick={fetchRoomDetails} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          {error.code === 'STUDENT_NOT_FOUND' && (
            <Button onClick={() => router.push('/login')}>
              <LogIn className="mr-2 h-4 w-4" />
              Login Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-semibold">Student Data Not Found</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Unable to retrieve your student information. Please try again later.
        </p>
        <Button onClick={fetchRoomDetails} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Home className="h-12 w-12 text-indigo-500" />
        <h2 className="text-xl font-semibold">No Room Assigned</h2>
        <p className="text-muted-foreground max-w-md text-center">
          You currently don't have a room assigned. Please contact the hostel administration.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/support')}>
            Contact Support
          </Button>
          <Button variant="outline" onClick={fetchRoomDetails}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-indigo-600">{roomData.roomNumber}</span> - Room Details
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Home className="h-4 w-4" /> Block {roomData.block}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Layers className="h-4 w-4" /> {roomData.floor}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-4 w-4" /> {roomData.roomType}
          </Badge>
          <Badge variant={roomData.status === 'Available' ? 'default' : 'destructive'}>
            {roomData.status}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Image */}
          <Card className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={roomData.imageUrl || '/placeholder-room.jpg'}
                alt={`Room ${roomData.roomNumber}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-room.jpg';
                }}
              />
            </div>
            {roomData.description && (
              <CardContent className="p-6">
                <p className="text-muted-foreground">{roomData.description}</p>
              </CardContent>
            )}
          </Card>

          {/* Room Specifications */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <BedDouble className="h-5 w-5 text-indigo-600" />
                Room Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {renderInfoItem(
                  <Home className="h-5 w-5 text-indigo-600" />,
                  "Hostel Block",
                  roomData.block
                )}
                {renderInfoItem(
                  <MapPin className="h-5 w-5 text-indigo-600" />,
                  "Location",
                  roomData.floor
                )}
              </div>
              <div className="space-y-4">
                {renderInfoItem(
                  <Users className="h-5 w-5 text-indigo-600" />,
                  "Room Type",
                  `${roomData.roomType} (${roomData.occupiedCount}/${roomData.capacity})`
                )}
                {roomData.price && renderInfoItem(
                  <span className="h-5 w-5 text-indigo-600">₹</span>,
                  "Price",
                  `${roomData.price}/${roomData.pricePeriod || 'month'}`
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Wifi className="h-5 w-5 text-indigo-600" />
                Room Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {roomData.facilities.length > 0 ? (
                  roomData.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                        <div className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-sm">{facility}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2">No amenities listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Roommates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-600" />
                Roommates ({roomData.occupants.length})
              </CardTitle>
              <CardDescription>
                {roomData.occupants.length === 0 
                  ? "You currently have no roommates" 
                  : `Sharing with ${roomData.occupants.length} student${roomData.occupants.length > 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {roomData.occupants.length > 0 ? (
                roomData.occupants.map((roommate) => (
                  <div key={roommate._id} className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-indigo-100 dark:border-indigo-900">
                        <AvatarImage 
                          src={roommate.image} 
                          alt={roommate.name} 
                        />
                        <AvatarFallback>
                          {roommate.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{roommate.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {roommate.studentId} • {roommate.course} - {roommate.year}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pl-16">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-indigo-600" />
                        <span>{roommate.email}</span>
                      </div>
                      {roommate.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-indigo-600" />
                          <span>{roommate.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No other occupants in this room
                </p>
              )}
            </CardContent>
          </Card>

          {/* Room Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Hostel Rules
              </CardTitle>
              <CardDescription>
                All residents must follow these rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {DEFAULT_ROOM_RULES.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 rounded-full bg-indigo-600" />
                    </div>
                    <span className="text-sm">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}