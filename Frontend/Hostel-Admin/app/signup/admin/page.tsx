"use client"; // Required for client-side interactivity

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Contact, Home, Info, Shield, UserCog } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

export default function AdminSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminCode: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register/admin",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          adminCode: formData.adminCode
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true // Include if you need to send cookies
        }
      );

      toast.success("Admin account created successfully!");
      router.push("/login/admin");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific error
        const errorMessage = error.response?.data?.message || "Registration failed";
        toast.error(errorMessage);
      } else {
        // Handle generic error
        toast.error(error.message || "An error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b border-teal-100/50 dark:border-gray-700 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-10 w-10 transition-transform group-hover:scale-105">
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
              <Shield className="h-3.5 w-3.5" />
              <span>Secure Admin Portal</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/about" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">
                  <Info className="h-4 w-4" />
                  <span>About</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/contact" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">
                  <Contact className="h-4 w-4" />
                  <span>Contact</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
     
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline"
          >
            <UserCog className="h-6 w-6" />
            <span className="font-bold text-lg">HostelHub Admin</span>
          </Link>

          <Card className="w-full max-w-md border-teal-200 dark:border-teal-800 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="w-20 h-20 bg-teal-100/50 dark:bg-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-200 dark:border-teal-700">
                <UserCog className="h-9 w-9 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Admin Registration</CardTitle>
              <CardDescription className="text-sm">
                Fill in your details to create an admin account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      required 
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      required 
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@hostelhub.com" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    required 
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={formData.password}
                      onChange={handleChange}
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength={8}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Registration Code</Label>
                  <Input 
                    id="adminCode" 
                    placeholder="Enter registration code" 
                    required 
                    value={formData.adminCode}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This code is provided by the system administrator
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : "Create Admin Account"}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login/admin" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                    Sign in instead
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 border-t border-teal-100/50 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>© {new Date().getFullYear()} Goel Group of Institutions</span>
            <span className="hidden sm:inline">•</span>
            <span>All rights reserved</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}