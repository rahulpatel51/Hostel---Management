"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IndianRupee,
  Calendar,
  Check,
  Clock,
  AlertTriangle,
  CreditCard,
  History,
  X,
  Wallet,
  BanknoteIcon as Bank,
  Smartphone,
  Receipt,
  ArrowRight,
  Shield,
  Download,
  RefreshCw,
  Info,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function FeePaymentPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Sample fee data
  const feeDetails = {
    roomNumber: "A-204",
    hostelName: "Boys Hostel A",
    currentDue: 12500,
    totalAnnualFee: 60000,
    paidAmount: 47500,
    dueDate: "2023-12-15",
    lateFee: 500,
    studentName: "Rahul Sharma",
    studentId: "STU2023001",
    academicYear: "2023-2024",
    admissionDate: "2023-01-05",
  }

  // Calculate payment progress
  const paymentProgress = Math.round((feeDetails.paidAmount / feeDetails.totalAnnualFee) * 100)

  // Sample payment history
  const paymentHistory = [
    {
      id: 1,
      date: "2023-06-15",
      amount: 15000,
      method: "UPI",
      status: "completed",
      receipt: "RCPT2023061501",
      transactionId: "TXN123456789",
    },
    {
      id: 2,
      date: "2023-04-10",
      amount: 15000,
      method: "Net Banking",
      status: "completed",
      receipt: "RCPT2023041001",
      transactionId: "TXN987654321",
    },
    {
      id: 3,
      date: "2023-01-05",
      amount: 17500,
      method: "Debit Card",
      status: "completed",
      receipt: "RCPT2023010501",
      transactionId: "TXN456789123",
    },
    {
      id: 4,
      date: "2022-11-20",
      amount: 10000,
      method: "UPI",
      status: "failed",
      receipt: "",
      transactionId: "TXN789123456",
    },
  ]

  // Payment methods
  const paymentMethods = [
    { id: "upi", name: "UPI", icon: Smartphone, description: "Pay instantly using any UPI app" },
    { id: "netbanking", name: "Net Banking", icon: Bank, description: "Pay using your bank account" },
    { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Pay using credit or debit card" },
    { id: "wallet", name: "Wallet", icon: Wallet, description: "Pay using digital wallets" },
  ]

  // Fee breakdown
  const feeBreakdown = [
    { component: "Admission Fee", amount: 15000, dueDate: "2023-01-05", status: "paid", paidDate: "2023-01-05" },
    { component: "1st Installment", amount: 15000, dueDate: "2023-04-10", status: "paid", paidDate: "2023-04-10" },
    { component: "2nd Installment", amount: 17500, dueDate: "2023-06-15", status: "paid", paidDate: "2023-06-15" },
    { component: "Final Installment", amount: 12500, dueDate: "2023-12-15", status: "pending", paidDate: null },
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handlePayment = () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return
    }

    // Open payment confirmation modal
    setIsPaymentModalOpen(true)
  }

  const confirmPayment = () => {
    // Simulate payment processing
    setIsLoading(true)
    setIsPaymentModalOpen(false)

    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: `₹${paymentAmount} paid successfully`,
        variant: "default",
        className: "bg-green-500 text-white border-0",
      })
      setPaymentAmount("")
      setSelectedPaymentMethod("")
      setIsLoading(false)
    }, 2000)
  }

  const viewReceipt = (payment: any) => {
    setSelectedReceipt(payment)
    setIsReceiptModalOpen(true)
  }

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
            <IndianRupee className="absolute inset-0 m-auto h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading fee details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-12">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
              <IndianRupee className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Fee <span className="text-indigo-600 dark:text-indigo-400">Management</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl ml-12">
            View your fee details, make payments, and download receipts
          </p>
        </div>

        {/* Student Info Card */}
        <Card className="mb-8 border-indigo-100 dark:border-indigo-900/30 shadow-md overflow-hidden bg-white dark:bg-gray-800">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -z-0"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-indigo-100 dark:border-indigo-900/30">
                <AvatarImage src="/placeholder.svg?height=80&width=80" alt={feeDetails.studentName} />
                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xl">
                  {feeDetails.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{feeDetails.studentName}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">ID:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{feeDetails.studentId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Room:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{feeDetails.roomNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Hostel:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{feeDetails.hostelName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500 dark:text-gray-400">Academic Year:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{feeDetails.academicYear}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={feeDetails.currentDue > 0 ? "destructive" : "default"} className="px-3 py-1">
                    {feeDetails.currentDue > 0 ? "Payment Due" : "Fully Paid"}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fee status for current academic year</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {/* Payment Progress */}
          <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Payment Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{paymentProgress}%</span>
              </div>
              <Progress
                value={paymentProgress}
                className="h-2.5 bg-blue-100 dark:bg-blue-900/30"
              />
              <div className="flex justify-between mt-3 text-sm">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    ₹{feeDetails.paidAmount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-muted-foreground">Paid Amount</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    ₹{feeDetails.totalAnnualFee.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Fee</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Due */}
          <Card
            className={`border-${feeDetails.currentDue > 0 ? "red" : "green"}-100 dark:border-${feeDetails.currentDue > 0 ? "red" : "green"}-900/30 shadow-md overflow-hidden bg-white dark:bg-gray-800`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div
                  className={`p-1.5 rounded-md bg-${feeDetails.currentDue > 0 ? "red" : "green"}-100 dark:bg-${feeDetails.currentDue > 0 ? "red" : "green"}-900/30`}
                >
                  {feeDetails.currentDue > 0 ? (
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                Current Due
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${feeDetails.currentDue > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
              >
                {feeDetails.currentDue > 0 ? `₹${feeDetails.currentDue.toLocaleString("en-IN")}` : "No Due"}
              </div>
              {feeDetails.currentDue > 0 && (
                <>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Due by{" "}
                      {new Date(feeDetails.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {feeDetails.lateFee > 0 && (
                    <Badge variant="destructive" className="mt-2">
                      Late Fee: ₹{feeDetails.lateFee}
                    </Badge>
                  )}
                </>
              )}
              {!feeDetails.currentDue && (
                <div className="flex items-center gap-2 mt-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-muted-foreground">All payments completed for this term</span>
                </div>
              )}
            </CardContent>
            {feeDetails.currentDue > 0 && (
              <CardFooter className="pt-0 pb-4">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    setPaymentAmount(feeDetails.currentDue.toString())
                    toggleSection("payment")
                  }}
                >
                  Pay Due Amount
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Next Installment */}
          <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feeDetails.currentDue > 0 ? (
                <>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">Final Installment</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Amount: ₹{feeDetails.currentDue.toLocaleString("en-IN")}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      {Math.ceil(
                        (new Date(feeDetails.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      )}{" "}
                      days remaining
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">All Installments Paid</div>
                  <div className="text-sm text-muted-foreground mt-1">No upcoming payments</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Completed for {feeDetails.academicYear}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-4">
              <Button variant="outline" className="w-full" onClick={() => toggleSection("breakdown")}>
                View Full Schedule
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-1">
            <TabsTrigger
              value="payment"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
              onClick={() => setExpandedSection("payment")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
              onClick={() => setExpandedSection("history")}
            >
              <History className="h-4 w-4 mr-2" />
              Payment History
            </TabsTrigger>
            <TabsTrigger
              value="breakdown"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
              onClick={() => setExpandedSection("breakdown")}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Fee Breakdown
            </TabsTrigger>
          </TabsList>

          {/* Payment Section */}
          <TabsContent value="payment" className="space-y-6">
            <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Make Payment
                </CardTitle>
                <CardDescription>Pay your hostel fees securely through our payment gateway</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={`Enter amount (min ₹${Math.min(1000, feeDetails.currentDue)})`}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">
                      Current due: ₹{feeDetails.currentDue.toLocaleString("en-IN")}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-indigo-600 dark:text-indigo-400"
                      onClick={() => setPaymentAmount(feeDetails.currentDue.toString())}
                    >
                      Pay full amount
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center gap-3 p-4 border ${
                          selectedPaymentMethod === method.id
                            ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        } rounded-lg cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-400 transition-colors`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div
                          className={`p-2 rounded-full ${
                            selectedPaymentMethod === method.id
                              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{method.name}</div>
                          <div className="text-xs text-muted-foreground">{method.description}</div>
                        </div>
                        <div
                          className={`h-4 w-4 rounded-full border-2 ${
                            selectedPaymentMethod === method.id
                              ? "border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedPaymentMethod === method.id && (
                            <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 scale-[0.4]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">Secure Payment</h4>
                      <p className="text-sm text-muted-foreground">
                        All transactions are secure and encrypted. Your payment information is never stored on our
                        servers.
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <img src="/placeholder.svg?height=20&width=40" alt="Visa" className="h-5" />
                        <img src="/placeholder.svg?height=20&width=40" alt="Mastercard" className="h-5" />
                        <img src="/placeholder.svg?height=20&width=40" alt="RuPay" className="h-5" />
                        <img src="/placeholder.svg?height=20&width=40" alt="UPI" className="h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
                <Button
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                  onClick={handlePayment}
                  disabled={isLoading || !paymentAmount || !selectedPaymentMethod}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{paymentAmount ? Number.parseInt(paymentAmount).toLocaleString("en-IN") : "0"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setPaymentAmount("")
                    setSelectedPaymentMethod("")
                  }}
                >
                  Reset
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Payment History
                </CardTitle>
                <CardDescription>Your past payment transactions and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <TableRow>
                        <TableHead className="font-medium">Date</TableHead>
                        <TableHead className="font-medium">Amount</TableHead>
                        <TableHead className="font-medium">Method</TableHead>
                        <TableHead className="font-medium">Status</TableHead>
                        <TableHead className="font-medium text-right">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No payment history available
                          </TableCell>
                        </TableRow>
                      ) : (
                        paymentHistory.map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell className="font-medium">
                              {new Date(payment.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="font-semibold">₹{payment.amount.toLocaleString("en-IN")}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800">
                                  {payment.method === "UPI" && (
                                    <Smartphone className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                  )}
                                  {payment.method === "Net Banking" && (
                                    <Bank className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                  )}
                                  {payment.method === "Debit Card" && (
                                    <CreditCard className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                  )}
                                  {payment.method === "Wallet" && (
                                    <Wallet className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                  )}
                                </div>
                                {payment.method}
                              </div>
                            </TableCell>
                            <TableCell>
                              {payment.status === "completed" ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  <Check className="h-3 w-3 mr-1" /> Paid
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <X className="h-3 w-3 mr-1" /> Failed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {payment.status === "completed" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-indigo-600 dark:text-indigo-400"
                                  onClick={() => viewReceipt(payment)}
                                >
                                  <Receipt className="h-3.5 w-3.5 mr-1" />
                                  View
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fee Breakdown */}
          <TabsContent value="breakdown" className="space-y-6">
            <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Fee Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed hostel fee structure for the academic year {feeDetails.academicYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                      <TableRow>
                        <TableHead className="font-medium">Component</TableHead>
                        <TableHead className="font-medium">Amount</TableHead>
                        <TableHead className="font-medium">Due Date</TableHead>
                        <TableHead className="font-medium text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeBreakdown.map((fee, index) => (
                        <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="font-medium">{fee.component}</TableCell>
                          <TableCell>₹{fee.amount.toLocaleString("en-IN")}</TableCell>
                          <TableCell>
                            {new Date(fee.dueDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {fee.status === "paid" ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                <Check className="h-3 w-3 mr-1" />
                                Paid on{" "}
                                {new Date(fee.paidDate!).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Pending
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50 font-medium">
                        <TableCell>Total</TableCell>
                        <TableCell>₹{feeDetails.totalAnnualFee.toLocaleString("en-IN")}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={paymentProgress === 100 ? "default" : "outline"}
                            className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                          >
                            {paymentProgress}% Complete
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Note:</span> Late payments may incur additional charges
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download Statement
                </Button>
              </CardFooter>
            </Card>

            {/* Fee Structure Accordion */}
            <Card className="border-indigo-100 dark:border-indigo-900/30 shadow-md overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-base">Fee Structure Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Hostel Accommodation Fee</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          The hostel accommodation fee covers your room rent, basic utilities, and maintenance for the
                          academic year.
                        </p>
                        <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                          <span>Room Rent</span>
                          <span className="font-medium">₹40,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                          <span>Electricity & Water</span>
                          <span className="font-medium">₹8,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                          <span>Maintenance</span>
                          <span className="font-medium">₹7,000</span>
                        </div>
                        <div className="flex justify-between py-1 font-medium">
                          <span>Total</span>
                          <span>₹55,000</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Additional Services</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          Additional services include internet, security, and other amenities provided in the hostel.
                        </p>
                        <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                          <span>Internet</span>
                          <span className="font-medium">₹2,000</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                          <span>Security</span>
                          <span className="font-medium">₹1,500</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                          <span>Amenities</span>
                          <span className="font-medium">₹1,500</span>
                        </div>
                        <div className="flex justify-between py-1 font-medium">
                          <span>Total</span>
                          <span>₹5,000</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Payment Policy</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm">
                        <p>
                          Please review our payment policy for important information about deadlines, refunds, and late
                          fees.
                        </p>
                        <div className="space-y-1">
                          <h4 className="font-medium">Payment Deadlines</h4>
                          <p className="text-muted-foreground">
                            All payments must be made by the due dates specified. Failure to pay on time may result in
                            late fees.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Late Fee</h4>
                          <p className="text-muted-foreground">
                            A late fee of ₹500 will be charged for payments made after the due date.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Refund Policy</h4>
                          <p className="text-muted-foreground">
                            Refunds are processed as per the institution's refund policy. Please contact the hostel
                            administration for details.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Confirmation Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>Please review your payment details before proceeding</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  ₹{paymentAmount ? Number.parseInt(paymentAmount).toLocaleString("en-IN") : "0"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium">
                  {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name || "Not selected"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Student ID</span>
                <span className="font-medium">{feeDetails.studentId}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transaction Date</span>
                <span className="font-medium">{new Date().toLocaleDateString("en-IN")}</span>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  By clicking "Confirm Payment", you will be redirected to the payment gateway to complete your
                  transaction.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={confirmPayment}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Payment Receipt
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Receipt #{selectedReceipt.receipt}
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <Check className="h-3 w-3 mr-1" /> Paid
                </Badge>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {new Date(selectedReceipt.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{selectedReceipt.method}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="font-medium">{selectedReceipt.transactionId}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Student ID</span>
                  <span className="font-medium">{feeDetails.studentId}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Student Name</span>
                  <span className="font-medium">{feeDetails.studentName}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  <img src="/placeholder.svg?height=100&width=100" alt="QR Code" className="h-24 w-24" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsReceiptModalOpen(false)}>
              Close
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
