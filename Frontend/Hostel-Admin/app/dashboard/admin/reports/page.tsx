import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Download, FileText, PieChart, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and view reports on hostel operations and statistics.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <Select>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="h-9">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex h-auto p-0 bg-transparent gap-2">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="occupancy"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Occupancy
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Financial
          </TabsTrigger>
          <TabsTrigger
            value="complaints"
            className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-900 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-teal-400 dark:data-[state=active]:border-teal-500 border rounded-md py-2"
          >
            Complaints
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Occupancy Rate</CardTitle>
                <CardDescription>Current hostel occupancy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-8 w-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
                    <div className="text-3xl font-bold">92%</div>
                    <p className="text-sm text-muted-foreground">422/458 beds occupied</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Fee Collection</CardTitle>
                <CardDescription>Monthly fee collection trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
                    <div className="text-3xl font-bold">₹42.5L</div>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400">↑ 12%</span> from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Complaint Resolution</CardTitle>
                <CardDescription>Complaint resolution rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-teal-600 dark:text-teal-400" />
                    <div className="text-3xl font-bold">87%</div>
                    <p className="text-sm text-muted-foreground">44/52 complaints resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>Key metrics for the current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">[Monthly Summary Chart Visualization]</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Occupancy Analytics</CardTitle>
              <CardDescription>Detailed occupancy statistics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">[Occupancy Analytics Visualization]</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Revenue, expenses, and financial trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">[Financial Reports Visualization]</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Complaint Analytics</CardTitle>
              <CardDescription>Complaint types, resolution times, and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">[Complaint Analytics Visualization]</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
