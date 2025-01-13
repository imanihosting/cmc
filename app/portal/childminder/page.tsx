'use client'

import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Star, Clock, Users, Calendar, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

// Interfaces
interface QuickStats {
  [key: string]: number;
  totalBookings: number;
  activeChildren: number;
  rating: number;
  hourlyRate: number;
}

interface QuickStat {
  title: string;
  key: string;
  icon: any;
  prefix?: string;
}

interface Booking {
  id: string;
  child: string;
  parent: string;
  time: string;
  date?: string;
}

interface Review {
  id: string;
  parent: string;
  rating: number;
  comment: string;
  date: string;
}

interface Message {
  id: string;
  sender: string;
  message: string;
  time: string;
}

// Animated card component
const AnimatedCard = motion(Card);

// Quick stats configuration
const quickStatsConfig: QuickStat[] = [
  { title: "Total Bookings", key: "totalBookings", icon: Calendar },
  { title: "Active Children", key: "activeChildren", icon: Users },
  { title: "Rating", key: "rating", icon: Star },
  { title: "Hourly Rate", key: "hourlyRate", icon: DollarSign, prefix: "€" }
];

export default function ChildminderDashboard() {
  const { isLoaded, user } = useUser();
  
  // State for dashboard data
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalBookings: 0,
    activeChildren: 0,
    rating: 0,
    hourlyRate: 0
  });
  
  const [todaySchedule, setTodaySchedule] = useState<Booking[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      // Fetch quick stats
      fetchQuickStats();
      // Fetch today's schedule
      fetchTodaySchedule();
      // Fetch pending requests
      fetchPendingRequests();
      // Fetch recent reviews
      fetchRecentReviews();
      // Fetch recent messages
      fetchRecentMessages();
    }
  }, [user]);

  // Handlers for booking actions
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      // API call to accept booking
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: 'POST'
      });
      if (response.ok) {
        // Refresh pending requests
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      // API call to decline booking
      const response = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: 'POST'
      });
      if (response.ok) {
        // Refresh pending requests
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error declining booking:', error);
    }
  };

  // Data fetching functions
  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/childminder/stats');
      if (response.ok) {
        const data = await response.json();
        setQuickStats(data);
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const response = await fetch('/api/childminder/schedule/today');
      if (response.ok) {
        const data = await response.json();
        setTodaySchedule(data);
      }
    } catch (error) {
      console.error('Error fetching today schedule:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/childminder/bookings/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchRecentReviews = async () => {
    try {
      const response = await fetch('/api/childminder/reviews');
      if (response.ok) {
        const data = await response.json();
        setRecentReviews(data);
      }
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const response = await fetch('/api/childminder/messages');
      if (response.ok) {
        const data = await response.json();
        setRecentMessages(data);
      }
    } catch (error) {
      console.error('Error fetching recent messages:', error);
    }
  };

  // Check authentication and role
  if (!isLoaded) {
    return null;
  }

  if (!user) {
    window.location.href = '/sign-in';
    return null;
  }

  const userRole = user.publicMetadata.role as string;
  const onboardingComplete = user.publicMetadata.onboardingComplete as boolean;

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
          {quickStatsConfig.map((stat, index) => (
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.key === 'hourlyRate' ? `${stat.prefix}${quickStats[stat.key]}` : quickStats[stat.key]}
                  </h3>
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
                {todaySchedule.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No bookings scheduled for today</p>
                ) : (
                  todaySchedule.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                  ))
                )}
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
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No pending booking requests</p>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Users className="h-10 w-10 text-indigo-500" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{request.child}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Parent: {request.parent}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{request.date} • {request.time}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleAcceptBooking(request.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeclineBooking(request.id)}>
                          <XCircle className="w-4 h-4 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
                {recentReviews.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No reviews yet</p>
                ) : (
                  recentReviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                  ))
                )}
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
                {recentMessages.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No messages yet</p>
                ) : (
                  recentMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
                  ))
                )}
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
