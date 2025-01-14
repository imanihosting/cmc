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
  CheckCircle, XCircle, Star, Clock, Users, Calendar as CalendarIcon, 
  DollarSign, TrendingUp, Bell, MessageSquare, Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

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
  href: string;
}

interface Booking {
  id: string;
  child: string;
  parent: string;
  time: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
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
    icon: CalendarIcon,
    gradient: "from-blue-600 to-blue-400",
    href: "/portal/childminder/bookings"
  },
  { 
    title: "Active Children", 
    key: "activeChildren", 
    icon: Users,
    gradient: "from-green-600 to-green-400",
    href: "/portal/childminder/children"
  },
  { 
    title: "Rating", 
    key: "rating", 
    icon: Star,
    gradient: "from-yellow-600 to-yellow-400",
    href: "/portal/childminder/reviews"
  },
  { 
    title: "Hourly Rate", 
    key: "hourlyRate", 
    icon: DollarSign, 
    prefix: "€",
    gradient: "from-purple-600 to-purple-400",
    href: "/portal/childminder/settings"
  }
];

export default function ChildminderDashboard() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  
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
  const [bookings, setBookings] = useState<Booking[]>([]);

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
      // Fetch all bookings for calendar
      fetchAllBookings();
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

  const fetchAllBookings = async () => {
    try {
      const response = await fetch('/api/childminder/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const getDayBookingStatus = (date: Date): 'pending' | 'accepted' | null => {
    const dayBookings = bookings.filter((booking: Booking) => 
      isSameDay(parseISO(booking.date), date)
    );
    
    if (dayBookings.length === 0) return null;
    
    if (dayBookings.some((b: Booking) => b.status === 'pending')) return 'pending';
    if (dayBookings.some((b: Booking) => b.status === 'accepted')) return 'accepted';
    return null;
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
              className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => router.push(stat.href)}
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
              <div className="flex justify-between items-center">
                <CardTitle>Today's Schedule</CardTitle>
                <div className="flex gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800"
                  modifiers={{
                    booked: (date) => getDayBookingStatus(date) === 'accepted',
                    pending: (date) => getDayBookingStatus(date) === 'pending',
                  }}
                  modifiersClassNames={{
                    booked: "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400",
                    pending: "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400",
                  }}
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center text-gray-900 dark:text-white",
                    caption_label: "text-base font-semibold",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-9 w-9 bg-transparent p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",
                      "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-10 font-medium text-[0.875rem] mb-2",
                    row: "flex w-full mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    day: cn(
                      "h-10 w-10 p-0 font-normal rounded-lg",
                      "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                      "focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-white"
                    ),
                    day_selected: cn(
                      "bg-violet-600 text-white hover:bg-violet-600 hover:text-white",
                      "focus:bg-violet-600 focus:text-white"
                    ),
                    day_today: "border-2 border-violet-600",
                    day_outside: "text-gray-400 dark:text-gray-500 opacity-50",
                    day_disabled: "text-gray-400 dark:text-gray-500 opacity-50",
                    day_hidden: "invisible",
                  }}
                />
                <ScrollArea className="h-[300px] pr-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Bookings</h3>
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
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {pendingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                    <Bell className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      No Pending Requests
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      You're all caught up! New booking requests will appear here.
                    </p>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
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
                  ))
                )}
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
