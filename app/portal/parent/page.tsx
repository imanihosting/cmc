'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MessageCircle, Star, Bell, Users, BookOpen, ChevronRight, Mail } from 'lucide-react'

// Mock data
const quickStats = [
  { title: 'Active Bookings', value: 3, icon: BookOpen },
  { title: 'Registered Children', value: 2, icon: Users },
  { title: 'Unread Messages', value: 5, icon: Mail },
  { title: 'Reviews Given', value: 8, icon: Star },
]

const upcomingBookings = [
  { id: 1, childminder: 'Sarah Johnson', date: '2023-07-20', time: '09:00 AM - 05:00 PM', child: 'Emma', status: 'Confirmed' },
  { id: 2, childminder: 'Michael Brown', date: '2023-07-22', time: '08:00 AM - 04:00 PM', child: 'Liam', status: 'Pending' },
  { id: 3, childminder: 'Emily Davis', date: '2023-07-25', time: '10:00 AM - 06:00 PM', child: 'Emma', status: 'Confirmed' },
]

const children = [
  { id: 1, name: 'Emma', age: 4, image: '/placeholder.svg' },
  { id: 2, name: 'Liam', age: 2, image: '/placeholder.svg' },
]

const recentMessages = [
  { id: 1, sender: 'Sarah Johnson', message: 'Hi! Just confirming our appointment for tomorrow.', time: '2 hours ago' },
  { id: 2, sender: 'Michael Brown', message: 'Thank you for booking with me. I look forward to meeting Liam.', time: '1 day ago' },
]

const notifications = [
  { id: 1, type: 'system', message: 'New feature: Video chat is now available!', time: '1 hour ago' },
  { id: 2, type: 'booking', message: 'Your booking with Sarah Johnson has been confirmed.', time: '3 hours ago' },
  { id: 3, type: 'subscription', message: 'Your subscription will renew in 3 days.', time: '1 day ago' },
]

const AnimatedCard = motion(Card)

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Parent Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <AnimatedCard 
              key={index}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <stat.icon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedCard 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming Bookings</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CalendarDays className="h-10 w-10 text-purple-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{booking.childminder}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{booking.date} • {booking.time}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Child: {booking.child}</p>
                      </div>
                    </div>
                    <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Children Profiles</span>
                <Button variant="ghost" size="sm">Manage</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.map((child, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={child.image} alt={child.name} />
                        <AvatarFallback>{child.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{child.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Age: {child.age}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Messages</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.map((message, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Avatar>
                      <AvatarFallback>{message.sender[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{message.sender}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{message.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{message.time}</p>
                    </div>
                    <Button variant="outline" size="sm">Reply</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Notifications</span>
                <Button variant="ghost" size="sm">Clear All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                      {notification.type === 'system' && <Bell className="h-4 w-4 text-purple-600 dark:text-purple-300" />}
                      {notification.type === 'booking' && <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-300" />}
                      {notification.type === 'subscription' && <Star className="h-4 w-4 text-purple-600 dark:text-purple-300" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{notification.time}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
