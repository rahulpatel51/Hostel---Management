"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ShieldCheck, Lock, Key, Eye, EyeOff, Home, Info, Contact } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send OTP to email here
    setStep(2)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would verify OTP here
    setStep(3)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would reset password here
    alert("Password reset successfully!")
    // Redirect to login page
    window.location.href = "/login/student"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Enhanced Header */}
      <header className="w-full py-3 px-4 sm:px-6 lg:px-8 border-b border-teal-100/50 dark:border-gray-700 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-9 w-9 transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Goel Group Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Goel Group
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">of Institutions</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Password Recovery</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">
                    <Home className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Home</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/about" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">
                    <Info className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">About</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/contact" className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                    <Contact className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Contact</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-teal-200 dark:border-gray-700 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="space-y-1 text-center">
            <div className="w-20 h-20 bg-teal-100/50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-teal-300/50 dark:border-teal-700/50">
              {step === 1 ? (
                <Mail className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              ) : step === 2 ? (
                <Key className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              ) : (
                <Lock className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {step === 1
                ? "Reset Your Password"
                : step === 2
                ? "Verify OTP"
                : "Create New Password"}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {step === 1
                ? "Enter your email to receive a verification code"
                : step === 2
                ? "Enter the 6-digit code sent to your email"
                : "Create a new password for your account"}
            </CardDescription>
          </CardHeader>

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span>Email Address</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400">(required)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md transition-all hover:shadow-teal-200 dark:hover:shadow-teal-900/50"
                >
                  Send Verification Code
                </Button>
                <Link href="/login/student" className="text-sm text-teal-600 dark:text-teal-400 hover:underline text-center">
                  Back to Login
                </Link>
              </CardFooter>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleVerifyOtp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span>Verification Code</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400">(required)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Code sent to {email} (<Link href="#" onClick={() => setStep(1)} className="text-teal-600 dark:text-teal-400 hover:underline">Change email</Link>)
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md transition-all hover:shadow-teal-200 dark:hover:shadow-teal-900/50"
                >
                  Verify Code
                </Button>
                <div className="flex justify-between text-sm">
                  <Link href="#" className="text-teal-600 dark:text-teal-400 hover:underline">
                    Resend Code
                  </Link>
                  <Link href="/login/student" className="text-teal-600 dark:text-teal-400 hover:underline">
                    Back to Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span>New Password</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400">(required)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-500 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span>Confirm Password</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400">(required)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-500 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md transition-all hover:shadow-teal-200 dark:hover:shadow-teal-900/50"
                >
                  Reset Password
                </Button>
                <Link href="/login/student" className="text-sm text-teal-600 dark:text-teal-400 hover:underline text-center">
                  Back to Login
                </Link>
              </CardFooter>
            </form>
          )}

          <div className="px-6 pb-4">
            <div className="flex items-center justify-center space-x-4">
              <div className={`h-2 w-10 rounded-full transition-colors ${step === 1 ? "bg-teal-600" : "bg-gray-300 dark:bg-gray-600"}`}></div>
              <div className={`h-2 w-10 rounded-full transition-colors ${step === 2 ? "bg-teal-600" : "bg-gray-300 dark:bg-gray-600"}`}></div>
              <div className={`h-2 w-10 rounded-full transition-colors ${step === 3 ? "bg-teal-600" : "bg-gray-300 dark:bg-gray-600"}`}></div>
            </div>
          </div>
        </Card>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 px-6 border-t border-teal-100/50 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>© {new Date().getFullYear()} Goel Group of Institutions</span>
            <span className="hidden sm:inline">•</span>
            <span>All rights reserved</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}