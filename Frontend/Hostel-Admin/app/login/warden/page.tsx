"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ShieldCheck, Home, Info, Contact, LogIn } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function WardenLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const router = useRouter()
  const { toast } = useToast()

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

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if fields are filled
    if (!formData.email || !formData.password) {
      toast({
        title: "Login Failed",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      setIsLoading(false)
      return
    }

    // Any email/password will work
    localStorage.setItem("token", "simulated-token-for-warden-access")
    
    toast({
      title: "Login Successful",
      description: "Welcome to the Warden Dashboard",
    })
    
    router.push("/dashboard/warden")
    setIsLoading(false)
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
                <span>Warden Portal</span>
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
              <ShieldCheck className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Warden Login
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Access hostel management controls and student records
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <span>Warden Email</span>
                  <span className="text-xs text-teal-600 dark:text-teal-400">(required)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="warden@goelgroup.edu"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
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
                  "Access Warden Dashboard"
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Need assistance?{" "}
                <Link href="/contact" className="font-medium text-teal-600 dark:text-teal-400 hover:underline">
                  Contact administration
                </Link>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <Link href="/login/student" className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Student Login</span>
                </Link>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <Link href="/login/admin" className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Admin Login</span>
                </Link>
              </div>
            </CardFooter>
          </form>
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
            <Link href="/help" className="text-xs text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}