"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BedDouble, Bell, Calendar, CreditCard, Info, MessageSquare, Utensils, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back, <span className="text-indigo-600 dark:text-indigo-400">John</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Here's an overview of your hostel information and recent activities. Stay updated with all hostel operations.
        </p>
      </div>

      {/* Alert Banner */}
      <Alert className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
          <div>
            <AlertTitle className="text-indigo-800 dark:text-indigo-200 font-medium">
              Maintenance Notice
            </AlertTitle>
            <AlertDescription className="text-indigo-700 dark:text-indigo-300">
              Hostel maintenance scheduled for this weekend (June 10-11). Please ensure your rooms are accessible between 9AM-5PM.
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Room Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Room Details
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <BedDouble className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">A-204</div>
            <p className="text-xs text-muted-foreground mt-1">Block A, Second Floor</p>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="secondary" className="px-2 py-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                3 Roommates
              </Badge>
              <Button variant="outline" size="sm" className="h-8" asChild>
                <Link href="/dashboard/student/room">
                  <Info className="h-3.5 w-3.5 mr-1.5" />
                  Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fees Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Fee Status
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">₹12,500</div>
            <p className="text-xs text-muted-foreground mt-1">Due by May 15, 2023</p>
            <div className="mt-4">
              <Button size="sm" className="h-8 w-full bg-indigo-600 hover:bg-indigo-700" asChild>
                <Link href="/dashboard/student/fees">Pay Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Complaints
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">2</div>
              <Badge variant="destructive" className="h-5 px-1.5 py-0 text-xs">
                Pending
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active complaints</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="h-8 w-full" asChild>
                <Link href="/dashboard/student/complaints">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leave Card */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Leave Status
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leave applications</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="h-8 w-full" asChild>
                <Link href="/dashboard/student/leave">Apply Leave</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="notices" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-indigo-50 dark:bg-indigo-900/10">
          <TabsTrigger value="notices" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/30">
            <Bell className="h-4 w-4 mr-2" />
            Notices
          </TabsTrigger>
          <TabsTrigger value="mess" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/30">
            <Utensils className="h-4 w-4 mr-2" />
            Mess Menu
          </TabsTrigger>
          <TabsTrigger value="activities" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/30">
            <Clock className="h-4 w-4 mr-2" />
            Activities
          </TabsTrigger>
        </TabsList>
        
        {/* Notices Tab */}
        <TabsContent value="notices" className="border rounded-lg mt-3 p-0 overflow-hidden">
          <div className="divide-y">
            {[
              {
                title: "Hostel Day Celebration",
                date: "May 10, 2023",
                description: "Annual hostel day celebration will be held in the main auditorium. All students are required to attend.",
                urgent: true
              },
              {
                title: "Internet Maintenance",
                date: "May 5, 2023",
                description: "Internet services will be down from 2 PM to 5 PM due to maintenance work.",
                urgent: false
              },
              {
                title: "Room Inspection",
                date: "May 3, 2023",
                description: "Monthly room inspection will be conducted by the warden. Please keep your rooms clean.",
                urgent: false
              },
            ].map((notice, index) => (
              <div key={index} className="p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-lg mt-0.5 ${notice.urgent ? 'bg-red-100 dark:bg-red-900/20' : 'bg-indigo-100 dark:bg-indigo-900/20'}`}>
                    <Bell className={`h-4 w-4 ${notice.urgent ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">{notice.title}</h3>
                      <span className="text-xs text-muted-foreground">{notice.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notice.description}</p>
                    {notice.urgent && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/notices">View All Notices</Link>
            </Button>
          </div>
        </TabsContent>

        {/* Mess Menu Tab */}
        <TabsContent value="mess" className="border rounded-lg mt-3 p-0 overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  day: "Monday",
                  breakfast: "Idli, Sambar, Chutney, Tea",
                  lunch: "Rice, Dal, Aloo Gobi, Roti, Salad, Curd",
                  dinner: "Chapati, Paneer Butter Masala, Jeera Rice, Raita",
                },
                {
                  day: "Tuesday",
                  breakfast: "Bread, Butter, Jam, Omelette, Tea",
                  lunch: "Rice, Rajma, Mix Veg, Roti, Salad, Pickle",
                  dinner: "Chapati, Chana Masala, Steamed Rice, Papad",
                },
                {
                  day: "Wednesday",
                  breakfast: "Poha, Jalebi, Tea",
                  lunch: "Rice, Dal Tadka, Bhindi Sabzi, Roti, Salad",
                  dinner: "Chapati, Chicken Curry, Rice, Soup",
                },
              ].map((menu, index) => (
                <Card key={index} className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">{menu.day}</CardTitle>
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <Utensils className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Breakfast</p>
                      <p className="text-sm text-muted-foreground">{menu.breakfast}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Lunch</p>
                      <p className="text-sm text-muted-foreground">{menu.lunch}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Dinner</p>
                      <p className="text-sm text-muted-foreground">{menu.dinner}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="p-4 border-t text-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/student/mess">View Full Weekly Menu</Link>
            </Button>
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="border rounded-lg mt-3 p-0 overflow-hidden">
          <div className="divide-y">
            {[
              { 
                action: "Fee Payment", 
                date: "April 28, 2023", 
                description: "Paid ₹12,500 for May 2023 hostel fees",
                status: "completed"
              },
              {
                action: "Leave Application",
                date: "April 25, 2023",
                description: "Applied for leave from May 12 to May 15 for family function",
                status: "pending"
              },
              { 
                action: "Complaint Filed", 
                date: "April 20, 2023", 
                description: "Reported issue with room fan not working properly",
                status: "in-progress"
              },
              { 
                action: "Room Allocation", 
                date: "April 15, 2023", 
                description: "Assigned to Room A-204 with 3 roommates",
                status: "completed"
              },
            ].map((activity, index) => (
              <div key={index} className="p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className="relative mt-0.5">
                    <div className={`h-3 w-3 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' : 
                      activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    {index !== 3 && (
                      <div className="absolute left-1.5 top-3.5 w-px h-[calc(100%+1rem)] bg-gray-200 dark:bg-gray-700"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">{activity.action}</h3>
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <div className="mt-2">
                      <Badge 
                        variant={
                          activity.status === 'completed' ? 'default' : 
                          activity.status === 'pending' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {activity.status === 'completed' ? 'Completed' : 
                         activity.status === 'pending' ? 'Pending' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t text-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/activities">View All Activities</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}