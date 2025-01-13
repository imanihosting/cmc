'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Users, Baby, Calendar, Star, CreditCard, MessageCircle, Bell, BarChart2, UserCheck, UserPlus, BookOpen, Euro, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface Booking {
  id: string
  parent: { id: string; name: string }
  childminder: { id: string; name: string }
  date: string
  status: string
  price: number
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewer: { id: string; name: string }
  childminder: { id: string; name: string }
}

interface Stats {
  totalUsers: number
  activeChildminders: number
  newRegistrations: number
  totalBookings: number
  monthlyRevenue: number
}

interface MonthlyStats {
  month: string
  users: number
  bookings: number
  revenue: number
}

// Mock data for development
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'parent', createdAt: '2024-01-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'childminder', createdAt: '2024-01-15' },
]

const mockBookings = [
  { 
    id: '1', 
    parent: { id: '1', name: 'John Doe' },
    childminder: { id: '2', name: 'Jane Smith' },
    date: '2024-02-01',
    status: 'confirmed',
    price: 50
  },
]

const mockReviews = [
  {
    id: '1',
    rating: 5,
    comment: 'Great service!',
    createdAt: '2024-01-20',
    reviewer: { id: '1', name: 'John Doe' },
    childminder: { id: '2', name: 'Jane Smith' }
  },
]

const mockMonthlyStats = [
  { month: 'Jan', users: 10, bookings: 5, revenue: 250 },
  { month: 'Feb', users: 15, bookings: 8, revenue: 400 },
  { month: 'Mar', users: 20, bookings: 12, revenue: 600 },
  { month: 'Apr', users: 25, bookings: 15, revenue: 750 },
  { month: 'May', users: 30, bookings: 20, revenue: 1000 },
  { month: 'Jun', users: 35, bookings: 25, revenue: 1250 },
]

export default function AdminPortal() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [stats, setStats] = useState<Stats>({
    totalUsers: mockUsers.length,
    activeChildminders: mockUsers.filter(u => u.role === 'childminder').length,
    newRegistrations: mockUsers.length,
    totalBookings: mockBookings.length,
    monthlyRevenue: mockBookings.reduce((total, booking) => total + booking.price, 0)
  })
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>(mockMonthlyStats)

  useEffect(() => {
    if (!user) {
      redirect('/sign-in')
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch real data, fall back to mock data if API fails
        try {
          const [usersRes, bookingsRes, reviewsRes] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/bookings'),
            fetch('/api/reviews')
          ])

          if (usersRes.ok && bookingsRes.ok && reviewsRes.ok) {
            const [usersData, bookingsData, reviewsData] = await Promise.all([
              usersRes.json(),
              bookingsRes.json(),
              reviewsRes.json()
            ])

            setUsers(usersData)
            setBookings(bookingsData)
            setReviews(reviewsData)

            // Calculate real stats
            const activeChildminders = usersData.filter((user: User) => user.role === 'childminder').length
            const newRegistrations = usersData.filter((user: User) => {
              const registrationDate = new Date(user.createdAt)
              const oneMonthAgo = new Date()
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
              return registrationDate >= oneMonthAgo
            }).length

            const monthlyRevenue = bookingsData
              .filter((booking: Booking) => {
                const bookingDate = new Date(booking.date)
                const oneMonthAgo = new Date()
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                return bookingDate >= oneMonthAgo
              })
              .reduce((total: number, booking: Booking) => total + booking.price, 0)

            setStats({
              totalUsers: usersData.length,
              activeChildminders,
              newRegistrations,
              totalBookings: bookingsData.length,
              monthlyRevenue
            })

            // Calculate real monthly stats if API call succeeded
            const last6Months = Array.from({ length: 6 }, (_, i) => {
              const date = new Date()
              date.setMonth(date.getMonth() - i)
              return date.toLocaleString('default', { month: 'short' })
            }).reverse()

            const realMonthlyStats = last6Months.map(month => ({
              month,
              users: usersData.filter((user: User) => {
                const userMonth = new Date(user.createdAt).toLocaleString('default', { month: 'short' })
                return userMonth === month
              }).length,
              bookings: bookingsData.filter((booking: Booking) => {
                const bookingMonth = new Date(booking.date).toLocaleString('default', { month: 'short' })
                return bookingMonth === month
              }).length,
              revenue: bookingsData
                .filter((booking: Booking) => {
                  const bookingMonth = new Date(booking.date).toLocaleString('default', { month: 'short' })
                  return bookingMonth === month
                })
                .reduce((total: number, booking: Booking) => total + booking.price, 0)
            }))

            setMonthlyStats(realMonthlyStats)
          }
        } catch (err) {
          console.log('Using mock data due to API error:', err)
          // Keep using mock data if API fails
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (!user) return null
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.newRegistrations} this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Childminders</CardTitle>
                  <Baby className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeChildminders}</div>
                  <p className="text-xs text-muted-foreground">
                    Verified and active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats.monthlyRevenue}</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" fill="#8884d8" name="New Users" />
                      <Bar dataKey="bookings" fill="#82ca9d" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <Input placeholder="Search users..." className="max-w-sm" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="parent">Parents</SelectItem>
                      <SelectItem value="childminder">Childminders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>View and manage all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <Input placeholder="Search bookings..." className="max-w-sm" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Booking ID</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Childminder</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.id}</TableCell>
                          <TableCell>{booking.parent.name}</TableCell>
                          <TableCell>{booking.childminder.name}</TableCell>
                          <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                          <TableCell>{booking.status}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/portal/bookings/${booking.id}`}>
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Review Management</CardTitle>
                <CardDescription>View and manage all reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <Input placeholder="Search reviews..." className="max-w-sm" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Childminder</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{review.id}</TableCell>
                          <TableCell>{review.reviewer.name}</TableCell>
                          <TableCell>{review.childminder.name}</TableCell>
                          <TableCell>{review.rating} ★</TableCell>
                          <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Detailed metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="users" stroke="#8884d8" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="bookings" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={monthlyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="revenue" stroke="#ffc658" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
