'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MessageCircle, Star, Bell, Users, BookOpen, ChevronRight, Mail, CheckCircle, XCircle, Clock, Euro } from 'lucide-react'

// Mock data
const quickStats = [
  { title: 'Active Bookings', value: 5, icon: BookOpen },
  { title: 'Average Rating', value: '4.8', icon: Star },
  { title: 'Unread Messages', value: 3, icon: Mail },
  { title: 'Hourly Rate', value: '€15', icon: Euro },
]

const todaySchedule = [
  { id: 1, child: 'Emma', parent: 'John Doe', time: '09:00 AM - 02:00 PM' },
  { id: 2, child: 'Liam', parent: 'Jane Smith', time: '03:00 PM - 07:00 PM' },
]

const pendingRequests = [
  { id: 1, child: 'Sophia', parent: 'Michael Johnson', date: '2023-07-25', time: '10:00 AM - 04:00 PM' },
  { id: 2, child: 'Oliver', parent: 'Emily Brown', date: '2023-07-26', time: '09:00 AM - 03:00 PM' },
]

const recentReviews = [
  { id: 1, parent: 'Alice Wilson', rating: 5, comment: 'Excellent care and attention to detail!', date: '2023-07-15' },
  { id: 2, parent: 'David Thompson', rating: 4, comment: 'Very reliable and professional.', date: '2023-07-10' },
]

const recentMessages = [
  { id: 1, sender: 'John Doe', message: 'Can you accommodate an extra hour tomorrow?', time: '2 hours ago' },
  { id: 2, sender: 'Jane Smith', message: 'Thank you for taking such good care of Liam!', time: '1 day ago' },
]

const AnimatedCard = motion(Card)

export default function ChildminderDashboard() {
  const { isLoaded, user } = useUser();

  // Check authentication and role
  if (!isLoaded) {
    return null; // or loading spinner
  }

  if (!user) {
    window.location.href = '/sign-in';
    return null;
  }

  const userRole = user.publicMetadata.role as string;
  const onboardingComplete = user.publicMetadata.onboardingComplete as boolean;

  console.log('Childminder portal, onboardingComplete:', onboardingComplete);

  if (userRole !== 'childminder') {
    window.location.href = '/portal/' + userRole;
    return null;
  }

  if (!onboardingComplete) {
    window.location.href = '/onboarding/childminder';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Childminder Dashboard</h1>
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <CheckCircle className="w-4 h-4 mr-1" /> Garda Vetted
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              <CheckCircle className="w-4 h-4 mr-1" /> Tusla Registered
            </Badge>
          </div>
        </div>

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
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                    <stat.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
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
                <span>Today's Schedule</span>
                <Button variant="ghost" size="sm">View Full Schedule</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Clock className="h-10 w-10 text-indigo-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{booking.child}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Parent: {booking.parent}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{booking.time}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Details</Button>
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
                <span>Pending Requests</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Users className="h-10 w-10 text-indigo-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{request.child}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Parent: {request.parent}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{request.date} • {request.time}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <CheckCircle className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button variant="outline" size="sm">
                        <XCircle className="w-4 h-4 mr-1" /> Decline
                      </Button>
                    </div>
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
                <span>Recent Reviews</span>
                <Button variant="ghost" size="sm">View All Reviews</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.map((review, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{review.parent}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{review.date}</p>
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
                <span>Messages</span>
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
            transition={{ delay: 0.6 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Availability Schedule</span>
                <Button variant="ghost" size="sm">Update Availability</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{day}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">9:00 AM - 5:00 PM</span>
                      <Badge>Available</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Qualifications & Experience</span>
                <Button variant="ghost" size="sm">Update Profile</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Qualifications</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                    <li>Early Childhood Education Diploma</li>
                    <li>First Aid and CPR Certified</li>
                    <li>Child Protection Training</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Experience</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    5+ years of experience in childcare, including 3 years as a registered childminder.
                    Specialized in early childhood development and creating engaging learning environments.
                  </p>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
