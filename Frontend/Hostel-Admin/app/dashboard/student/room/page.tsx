"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BedDouble, Mail, Phone, MapPin, Home, Users, Calendar, Wifi, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function RoomDetailsPage() {
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const roomDetails = {
    roomNumber: "A-204",
    block: "Boys Hostel A",
    floor: "2nd Floor",
    roomType: "AC Double Sharing",
    amenities: ["Wi-Fi", "Attached Bathroom", "Laundry", "Cleaning Service", "24/7 Electricity", "Study Table"],
    rules: [
      "No visitors after 10 PM",
      "Lights out by 11 PM on weekdays",
      "Maintain cleanliness",
      "No smoking or alcohol",
      "Respect roommate's privacy"
    ],
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9zdGVsJTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80"
  };

  const roommates = [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 9876543210",
      course: "B.Tech Computer Science",
      year: "3rd Year",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
      joinedDate: "15 Aug 2022"
    },
    {
      id: 2,
      name: "Amit Patel",
      email: "amit.patel@example.com",
      phone: "+91 8765432109",
      course: "B.Tech Electrical",
      year: "2nd Year",
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
      joinedDate: "20 Jul 2023"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRoomChangeRequest = () => {
    if (showRequestForm && requestReason.trim() === "") {
      toast({
        title: "Error",
        description: "Please provide a reason for room change",
        variant: "destructive"
      });
      return;
    }

    if (showRequestForm) {
      toast({
        title: "Request Submitted",
        description: "Your room change request has been sent to the warden",
        className: "bg-green-500 text-white"
      });
      setShowRequestForm(false);
      setRequestReason("");
    } else {
      setShowRequestForm(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          <span className="text-indigo-600">{roomDetails.roomNumber}</span> - Room Details
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          Complete information about your hostel accommodation at {roomDetails.block}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Room Image and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Image */}
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={roomDetails.image}
                alt="Room Image"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Card>

          {/* Room Specifications */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <BedDouble className="h-5 w-5 text-indigo-600" />
                Room Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    <Home className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 dark:text-gray-400">Hostel Block</h3>
                    <p className="text-lg font-semibold">{roomDetails.block}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 dark:text-gray-400">Location</h3>
                    <p className="text-lg font-semibold">{roomDetails.floor}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 dark:text-gray-400">Room Type</h3>
                    <p className="text-lg font-semibold">{roomDetails.roomType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500 dark:text-gray-400">Allocated Since</h3>
                    <p className="text-lg font-semibold">15 Aug 2022</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Wifi className="h-5 w-5 text-indigo-600" />
                Room Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roomDetails.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                      <div className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Roommates and Rules */}
        <div className="space-y-6">
          {/* Roommates */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-600" />
                Your Roommates
              </CardTitle>
              <CardDescription>
                {roommates.length} students sharing this room
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {roommates.map((roommate) => (
                <div key={roommate.id} className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-indigo-100 dark:border-indigo-900">
                      <AvatarImage src={roommate.profileImage} />
                      <AvatarFallback>{roommate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{roommate.name}</h3>
                      <p className="text-sm text-muted-foreground">{roommate.course} - {roommate.year}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pl-16">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <span>{roommate.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-indigo-600" />
                      <span>{roommate.phone}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Joined: {roommate.joinedDate}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Room Rules */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                Room Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {roomDetails.rules.map((rule, index) => (
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

          {/* Room Change Request */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Room Change Request</CardTitle>
              <CardDescription>
                Submit a formal request to change your room
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showRequestForm && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reason for change
                  </label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Explain why you need to change rooms..."
                  />
                </div>
              )}
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={handleRoomChangeRequest}
              >
                {showRequestForm ? "Submit Request" : "Request Room Change"}
              </Button>
              {showRequestForm && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => {
                    setShowRequestForm(false);
                    setRequestReason("");
                  }}
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}