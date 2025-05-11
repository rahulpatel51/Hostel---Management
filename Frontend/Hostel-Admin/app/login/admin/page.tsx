"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, Home, Info, Contact, LogIn, Mail, ShieldCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
          role: "admin"
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      )

      if (response.data.success) {
        toast.success("Admin login successful!")
        if (response.data.token) {
          localStorage.setItem("adminToken", response.data.token)
        }
        router.push("/dashboard/admin")
      } else {
        throw new Error(response.data.message || "Login failed")
      }
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again."
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message
      } else if (error.message) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
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
                  priority
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
                <span>Admin Portal</span>
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
                  <Link href="/contact" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">
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
              <Lock className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enter your credentials to access administrative controls
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <span>Administrator Email</span>
                  <span className="text-xs text-teal-600 dark:text-teal-400">(required)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@goelgroup.edu"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span>Password</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400">(required)</span>
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md transition-all hover:shadow-teal-200 dark:hover:shadow-teal-900/50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  "Login to Dashboard"
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Need admin access?{" "}
                <Link href="/signup/admin" className="font-medium text-teal-600 dark:text-teal-400 hover:underline">
                  Signup
                </Link>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <Link href="/login/student" className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Student Login</span>
                </Link>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <Link href="/login/warden" className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Warden Login</span>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>

      {/* Enhanced Footer */}
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
            <Link href="/help" className="text-xs text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}