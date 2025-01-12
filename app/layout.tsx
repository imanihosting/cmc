import { Poppins } from 'next/font/google'
import Link from 'next/link'
import { Baby } from 'lucide-react'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { SignedOut, SignedIn, UserButton } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata = {
  title: 'ChildMinderConnect',
  description: 'Find trusted childcare providers in your area',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${poppins.variable} font-sans`}>
        <body className="min-h-screen flex flex-col bg-gray-50">
          <Toaster position="top-center" />
          <header className="fixed w-full z-50 transition-all duration-300 px-4 py-6">
            <nav className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20">
              <div className="px-6 py-3 flex items-center justify-between">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-2xl font-bold hover:opacity-90 transition-opacity"
                  aria-label="ChildMinderConnect Home"
                >
                  <Baby className="h-8 w-8 text-violet-600" />
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    ChildMinderConnect
                  </span>
                </Link>
                <div className="flex items-center space-x-8">
                  <Link href="/" className="text-gray-800 hover:text-violet-600 transition-colors font-poppins font-medium relative group">
                    <span className="relative z-10">Home</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                  </Link>
                  <Link href="/about" className="text-gray-800 hover:text-violet-600 transition-colors font-poppins font-medium relative group">
                    <span className="relative z-10">About</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                  </Link>
                  <Link href="/contact" className="text-gray-800 hover:text-violet-600 transition-colors font-poppins font-medium relative group">
                    <span className="relative z-10">Contact</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                  </Link>
                  <SignedOut>
                    <Link href="/sign-in" className="text-gray-800 hover:text-violet-600 transition-colors font-poppins font-medium relative group">
                      <span className="relative z-10">Sign In</span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                    </Link>
                    <Link href="/sign-up" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-poppins font-medium transform hover:scale-105 shadow-md hover:shadow-lg">
                      Sign Up
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </nav>
          </header>

          <main className="flex-grow pt-28">
            {children}
          </main>

          <footer className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#0f172a] rounded-3xl shadow-xl overflow-hidden">
                <div className="px-8 py-16 sm:p-16 text-gray-400">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                      <Link 
                        href="/" 
                        className="flex items-center space-x-2 text-xl font-bold"
                      >
                        <Baby className="h-6 w-6 text-violet-400" />
                        <span className="text-white">ChildMinderConnect</span>
                      </Link>
                      <p className="text-sm">
                        Connecting families with trusted childcare professionals in your area.
                      </p>
                      <div className="flex space-x-4">
                        {/* Social media icons */}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-4 font-poppins">Quick Links</h3>
                      <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-violet-400 transition-colors font-poppins">How it Works</Link></li>
                        <li><Link href="#" className="hover:text-violet-400 transition-colors font-poppins">Features</Link></li>
                        <li><Link href="#" className="hover:text-violet-400 transition-colors font-poppins">Testimonials</Link></li>
                        <li><Link href="#" className="hover:text-violet-400 transition-colors font-poppins">Pricing</Link></li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-4 font-poppins">Support</h3>
                      <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-violet-400 transition-colors font-poppins">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-violet-400 transition-colors font-poppins">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-violet-400 transition-colors font-poppins">FAQ</Link></li>
                        <li><Link href="#" className="hover:text-violet-400 transition-colors font-poppins">Contact</Link></li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-4 font-poppins">Stay Updated</h3>
                      <p className="text-sm mb-4">
                        Subscribe to our newsletter for the latest updates and childcare tips.
                      </p>
                      <form className="space-y-2">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:border-violet-400 transition-colors font-poppins"
                        />
                        <button
                          type="submit"
                          className="w-full bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-500 transform hover:scale-105 transition-all duration-300 font-poppins font-medium"
                        >
                          Subscribe
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
                    <p>&copy; {new Date().getFullYear()} ChildMinderConnect. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}