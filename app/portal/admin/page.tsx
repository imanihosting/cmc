'use client'

import { useState } from 'react'
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
import { motion, AnimatePresence } from 'framer-motion'

// Mock data for demonstration purposes
const userStats = [
  { name: 'Jan', Admin: 5, Parent: 150, Childminder: 80 },
  { name: 'Feb', Admin: 5, Parent: 180, Childminder: 95 },
  { name: 'Mar', Admin: 6, Parent: 210, Childminder: 110 },
  { name: 'Apr', Admin: 6, Parent: 240, Childminder: 125 },
  { name: 'May', Admin: 7, Parent: 270, Childminder: 140 },
  { name: 'Jun', Admin: 7, Parent: 300, Childminder: 155 },
]

const quickStats = [
  { title: 'Total Users', value: 235, icon: Users, color: 'text-blue-600', trend: '+5.2%' },
  { title: 'Active Childminders', value: 65, icon: UserCheck, color: 'text-green-600', trend: '+3.1%' },
  { title: 'New Registrations', value: 46, icon: UserPlus, color: 'text-yellow-600', trend: '+7.6%' },
  { title: 'Total Bookings', value: 1280, icon: BookOpen, color: 'text-purple-600', trend: '+2.5%' },
  { title: 'Monthly Revenue', value: '€9,850', icon: Euro, color: 'text-pink-600', trend: '+4.7%' },
]

const AnimatedButton = motion(Button);

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')

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
            <AnimatedButton 
              variant="outline"
              className="rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Notifications
            </AnimatedButton>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-lg">
            <TabsTrigger value="dashboard" className="rounded-md px-4 py-2">Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="rounded-md px-4 py-2">Users</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-md px-4 py-2">Bookings</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-md px-4 py-2">Reviews</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-md px-4 py-2">Analytics</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="dashboard" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {quickStats.map((stat, index) => (
                    <Card key={index} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`rounded-full p-3 ${stat.color} bg-opacity-15`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                          <span className={`text-sm font-semibold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {stat.trend}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={userStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Parent" stroke="#8884d8" />
                            <Line type="monotone" dataKey="Childminder" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { user: 'John Doe', action: 'made a booking', time: '2 hours ago' },
                          { user: 'Jane Smith', action: 'left a review', time: '4 hours ago' },
                          { user: 'Mike Johnson', action: 'registered as a childminder', time: '1 day ago' },
                          { user: 'Sarah Williams', action: 'updated their profile', time: '2 days ago' },
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.user} <span className="text-gray-500 dark:text-gray-400">{activity.action}</span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-8">
                <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-6">
                      <Input placeholder="Search users..." className="max-w-sm" />
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="childminder">Childminder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { name: 'John Doe', email: 'john@example.com', role: 'Parent', registered: '2023-05-15' },
                          { name: 'Jane Smith', email: 'jane@example.com', role: 'Childminder', registered: '2023-06-02' },
                          { name: 'Admin User', email: 'admin@example.com', role: 'Admin', registered: '2023-01-01' },
                        ].map((user, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.registered}</TableCell>
                            <TableCell>
                              <AnimatedButton 
                                variant="outline" 
                                size="sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View
                              </AnimatedButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-8">
                <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle>Booking Management</CardTitle>
                    <CardDescription>View and manage all bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-6">
                      <Input placeholder="Search bookings..." className="max-w-sm" />
                      <Select>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Parent</TableHead>
                          <TableHead>Childminder</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { id: 'B001', parent: 'John Doe', childminder: 'Mary Johnson', date: '2023-07-15', status: 'Confirmed' },
                          { id: 'B002', parent: 'Jane Smith', childminder: 'Robert Brown', date: '2023-07-18', status: 'Pending' },
                        ].map((booking, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <TableCell>{booking.id}</TableCell>
                            <TableCell>{booking.parent}</TableCell>
                            <TableCell>{booking.childminder}</TableCell>
                            <TableCell>{booking.date}</TableCell>
                            <TableCell>{booking.status}</TableCell>
                            <TableCell>
                              <AnimatedButton 
                                variant="outline" 
                                size="sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View
                              </AnimatedButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-8">
                <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle>Review System</CardTitle>
                    <CardDescription>Monitor and manage reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-6">
                      <Input placeholder="Search reviews..." className="max-w-sm" />
                      <Select>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reviewer</TableHead>
                          <TableHead>Childminder</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { reviewer: 'John Doe', childminder: 'Mary Johnson', rating: '5 Stars', date: '2023-07-10' },
                          { reviewer: 'Jane Smith', childminder: 'Robert Brown', rating: '4 Stars', date: '2023-07-12' },
                        ].map((review, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <TableCell>{review.reviewer}</TableCell>
                            <TableCell>{review.childminder}</TableCell>
                            <TableCell>{review.rating}</TableCell>
                            <TableCell>{review.date}</TableCell>
                            <TableCell>
                              <AnimatedButton 
                                variant="outline" 
                                size="sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View
                              </AnimatedButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle>Analytics & Statistics</CardTitle>
                    <CardDescription>View insights and statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Admin" fill="#8884d8" />
                          <Bar dataKey="Parent" fill="#82ca9d" />
                          <Bar dataKey="Childminder" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}
