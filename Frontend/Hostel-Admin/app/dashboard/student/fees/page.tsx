"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee, Calendar, Check, Clock, AlertTriangle, CreditCard, History, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

export default function FeePaymentPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Sample fee data
  const feeDetails = {
    roomNumber: 'A-204',
    hostelName: 'Boys Hostel A',
    currentDue: 12500,
    totalAnnualFee: 60000,
    paidAmount: 47500,
    dueDate: '2023-12-15',
    lateFee: 500,
  };

  // Calculate payment progress
  const paymentProgress = Math.round((feeDetails.paidAmount / feeDetails.totalAnnualFee) * 100);

  // Sample payment history
  const paymentHistory = [
    { id: 1, date: '2023-06-15', amount: 15000, method: 'UPI', status: 'completed', receipt: 'RCPT2023061501' },
    { id: 2, date: '2023-04-10', amount: 15000, method: 'Net Banking', status: 'completed', receipt: 'RCPT2023041001' },
    { id: 3, date: '2023-01-05', amount: 17500, method: 'Debit Card', status: 'completed', receipt: 'RCPT2023010501' },
    { id: 4, date: '2022-11-20', amount: 10000, method: 'UPI', status: 'failed', receipt: '' },
  ];

  // Payment methods
  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: CreditCard },
    { id: 'netbanking', name: 'Net Banking', icon: CreditCard },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'wallet', name: 'Wallet', icon: CreditCard },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePayment = () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }

    // Simulate payment processing
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: `₹${paymentAmount} paid successfully`,
        className: "bg-green-500 text-white"
      });
      setPaymentAmount('');
      setSelectedPaymentMethod('');
      setIsLoading(false);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading fee details...</p>
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
            Fee <span className="text-indigo-600">Payment</span>
          </h1>
          <p className="text-muted-foreground">
            View your fee details and make payments
          </p>
        </div>

        {/* Fee Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Room Details */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Room Details</CardTitle>
              <Badge variant="secondary">{feeDetails.roomNumber}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{feeDetails.hostelName}</div>
              <p className="text-sm text-muted-foreground mt-1">Current Accommodation</p>
            </CardContent>
          </Card>

          {/* Payment Progress */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payment Progress</CardTitle>
              <div className="text-indigo-600">{paymentProgress}%</div>
            </CardHeader>
            <CardContent>
              <Progress value={paymentProgress} className="h-2" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Paid: ₹{feeDetails.paidAmount.toLocaleString('en-IN')}</span>
                <span>Total: ₹{feeDetails.totalAnnualFee.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Current Due */}
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Due</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{feeDetails.currentDue.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Due by {new Date(feeDetails.dueDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              {feeDetails.lateFee > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Late Fee: ₹{feeDetails.lateFee}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Make Payment */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-indigo-600" />
                Make Payment
              </CardTitle>
              <CardDescription>
                Pay your hostel fees securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Enter amount (min ₹${Math.min(1000, feeDetails.currentDue)})`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-muted-foreground">
                  Current due: ₹{feeDetails.currentDue.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                      className={`flex flex-col items-center h-16 ${
                        selectedPaymentMethod === method.id ? "bg-indigo-600" : ""
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <method.icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{method.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Pay Now"}
              </Button>

              <div className="text-xs text-muted-foreground mt-2">
                <p>By proceeding, you agree to our Terms of Service</p>
                <p>Secure payment powered by Razorpay</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-600" />
                Payment History
              </CardTitle>
              <CardDescription>
                Your past payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {new Date(payment.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" /> Paid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" /> Failed
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Fee Breakdown */}
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader>
            <CardTitle>Fee Breakdown</CardTitle>
            <CardDescription>
              Detailed hostel fee structure for the academic year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Admission Fee</TableCell>
                  <TableCell>₹15,000</TableCell>
                  <TableCell>05 Jan 2023</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" /> Paid
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">1st Installment</TableCell>
                  <TableCell>₹15,000</TableCell>
                  <TableCell>10 Apr 2023</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" /> Paid
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">2nd Installment</TableCell>
                  <TableCell>₹15,000</TableCell>
                  <TableCell>15 Jun 2023</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" /> Paid
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Final Installment</TableCell>
                  <TableCell>₹15,000</TableCell>
                  <TableCell>15 Dec 2023</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Pending
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}