'use client'

import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  CheckCircle, XCircle, Star, Clock, Users, Calendar, 
  DollarSign, TrendingUp, Bell, MessageSquare, Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  gradient: string;
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

// Enhanced quick stats configuration
const quickStatsConfig: QuickStat[] = [
  { 
    title: "Total Bookings", 
    key: "totalBookings", 
    icon: Calendar,
    gradient: "from-blue-600 to-blue-400"
  },
  { 
    title: "Active Children", 
    key: "activeChildren", 
    icon: Users,
    gradient: "from-green-600 to-green-400"
  },
  { 
    title: "Rating", 
    key: "rating", 
    icon: Star,
    gradient: "from-yellow-600 to-yellow-400"
  },
  { 
    title: "Hourly Rate", 
    key: "hourlyRate", 
    icon: DollarSign, 
    prefix: "€",
    gradient: "from-purple-600 to-purple-400"
  }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>CM</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.firstName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your childminding services and bookings
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1">
              <Shield className="w-4 h-4 mr-1" /> Garda Vetted
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" /> Tusla Registered
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 px-3 py-1">
              <Star className="w-4 h-4 mr-1" /> Premium Member
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStatsConfig.map((stat, index) => (
            <AnimatedCard 
              key={index}
              className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${stat.gradient}`} />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.key === 'hourlyRate' ? `${stat.prefix}${quickStats[stat.key]}` : quickStats[stat.key]}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {todaySchedule.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-lg mb-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.child}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{booking.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                      Scheduled
                    </Badge>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg mb-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{request.parent[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{request.parent}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{request.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptBooking(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDeclineBooking(request.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-lg mb-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{review.parent[0]}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-gray-900 dark:text-white">{review.parent}</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{review.date}</p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 rounded-lg mb-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{message.sender[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{message.sender}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{message.time}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 pl-11">{message.message}</p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
