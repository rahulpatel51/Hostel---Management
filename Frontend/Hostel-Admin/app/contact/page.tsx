import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, Home as HomeIcon, Info, LogIn, Contact } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-teal-100/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Enhanced Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b border-teal-100/50 dark:border-gray-700 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <Image
                    src="/logo.png"
                    alt="Goel Group Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Goel Group</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">of Institutions</p>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">
                  <HomeIcon className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/about" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">About</span>
                </Link>
              </Button>
              <Button variant="ghost" asChild className="text-teal-600 dark:text-teal-400">
                <Link href="/contact" className="flex items-center gap-1.5">
                  <Contact className="h-4 w-4" />
                  <span>Contact</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-700 dark:hover:border-teal-300"
              >
                <Link href="/login/student" className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4 sm:px-6">
        {/* Contact Header */}
        <section className="max-w-4xl mx-auto text-center mb-16">
          <div className="mb-6 flex justify-center">
            <div className="bg-teal-100/50 dark:bg-teal-900/20 p-4 rounded-full">
              <Mail className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Contact Us
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Reach out to our team for any questions or inquiries.
          </p>
        </section>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="hover:shadow-lg transition-shadow hover:border-teal-300 dark:hover:border-teal-600">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-teal-100/50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-xl">Email Us</CardTitle>
              <CardDescription className="dark:text-gray-400">
                For general inquiries and information
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                href="mailto:info@goelgroup.edu"
                className="text-teal-600 dark:text-teal-400 hover:underline font-medium text-lg"
              >
                info@goelgroup.edu
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow hover:border-teal-300 dark:hover:border-teal-600">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-teal-100/50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-xl">Call Us</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Speak directly with our team
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                <Link href="tel:+911234567890" className="hover:underline">
                  +91 123 456 7890
                </Link>
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Monday - Saturday, 9:00 AM to 5:00 PM
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow hover:border-teal-300 dark:hover:border-teal-600">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-teal-100/50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-xl">Visit Us</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Our main campus location
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Goel Group Campus, 123 Education Road
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Knowledge City, India - 110001
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form and Location */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Card className="border-teal-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              <CardDescription className="dark:text-gray-400">
                We'll respond to your inquiry within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Your name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    placeholder="What's this about?"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Your message here..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 transition-all"
                    required
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white w-full py-6 text-lg mt-4"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-teal-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Our Location</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Visit our main administrative office
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-6 border border-gray-200 dark:border-gray-700">
                {/* Google Maps Embed */}
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.29771403251!2d81.07821068100316!3d26.894045116473333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39995f2f5b8b9591%3A0xbd9e770717a687c0!2sGoel%20Group%20of%20Institutions%2C%20Lucknow!5e0!3m2!1sen!2sin!4v1744998242145!5m2!1sen!2sin"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy">
                </iframe>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100/50 dark:bg-teal-900/30 p-2 rounded-lg mt-0.5">
                    <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Goel Group of Institutions</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Anora Kalan, Ayodhya Road, near Indira Canal<br />
                      Lucknow, Anora Kala, Uttar Pradesh 226028
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100/50 dark:bg-teal-900/30 p-2 rounded-lg mt-0.5">
                    <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Office Hours</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Monday - Friday: 9:00 AM - 4:00 PM<br />
                      Saturday: 9:00 AM - 1:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <Image
                    src="/logo.png"
                    alt="Goel Group Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Goel Group</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">of Institutions</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Transforming education through innovation and excellence in hostel management.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/campuses" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    Our Campuses
                  </Link>
                </li>
                <li>
                  <Link href="/admissions" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    Admissions
                  </Link>
                </li>
                <li>
                  <Link href="/facilities" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    Facilities
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Contact Us
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Goel Group of Institutions Anora Kalan, Ayodhya Road, near Indira Canal Lucknow, Anora Kala, Uttar Pradesh 226028
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    +91 123 456 7890
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    info@goelgroup.edu
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Mon-Fri: 9AM - 5PM
                  </span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Newsletter
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Subscribe to our newsletter for the latest updates and announcements.
              </p>
              <form className="mt-4 space-y-3">
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Your email address"
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-800 text-sm"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Goel Group of Institutions. All rights reserved.
              </div>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/sitemap" className="text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}