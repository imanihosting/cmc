'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MessageCircle, Star, Bell, Users, BookOpen, ChevronRight, Mail, UserCircle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

interface Booking {
  id: number
  childminder: { name: string }
  startTime: string
  endTime: string
  child: { name: string }
  status: string
}

interface Child {
  id: number
  name: string
  dateOfBirth: string
}

interface Message {
  id: number
  sender: { 
    id: number
    name: string 
  }
  content: string
  sentAt: string
  read: boolean
}

interface Notification {
  id: number
  type: string
  message: string
  createdAt: string
}

interface Conversation {
  id: number
  participant: {
    id: number
    name: string
    profilePicture?: string
    clerkId: string
  }
  lastMessage?: Message
  unreadCount: number
}

const AnimatedCard = motion(Card)

export default function ParentDashboard() {
  const { isLoaded, user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true)
        
        // Fetch conversations
        const conversationsRes = await fetch('/api/conversations')
        if (!conversationsRes.ok) {
          throw new Error('Failed to fetch conversations')
        }
        const conversationsData = await conversationsRes.json()
        if (Array.isArray(conversationsData)) {
          setConversations(conversationsData)
        } else {
          console.error('Conversations data is not an array:', conversationsData)
          setConversations([])
        }

        // Fetch bookings
        const bookingsRes = await fetch('/api/bookings')
        const bookingsData = await bookingsRes.json()
        if (Array.isArray(bookingsData)) {
          setBookings(bookingsData)
        } else {
          console.error('Bookings data is not an array:', bookingsData)
          setBookings([])
        }

        // Fetch children
        const childrenRes = await fetch('/api/children')
        const childrenData = await childrenRes.json()
        if (Array.isArray(childrenData)) {
          setChildren(childrenData)
        } else {
          console.error('Children data is not an array:', childrenData)
          setChildren([])
        }

        // Fetch messages for each conversation
        const allMessages: Message[] = []
        for (const conversation of conversationsData) {
          const messagesRes = await fetch(`/api/messages?conversationId=${conversation.id}`)
          const messagesData = await messagesRes.json()
          if (Array.isArray(messagesData)) {
            allMessages.push(...messagesData)
          }
        }
        setMessages(allMessages)

        // Fetch notifications
        const notificationsRes = await fetch('/api/notifications')
        if (!notificationsRes.ok) {
          const errorData = await notificationsRes.json()
          console.error('Failed to fetch notifications:', errorData)
          setNotifications([])
        } else {
          const notificationsData = await notificationsRes.json()
          if (Array.isArray(notificationsData)) {
            setNotifications(notificationsData)
          } else {
            console.error('Notifications data is not an array:', notificationsData)
            setNotifications([])
          }
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
        setBookings([])
        setChildren([])
        setMessages([])
        setConversations([])
        setNotifications([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      fetchDashboardData()
    }
  }, [isLoaded, user])

  // Check authentication and role
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    window.location.href = '/sign-in';
    return null;
  }

  const userRole = user.publicMetadata.role as string;
  const onboardingComplete = user.publicMetadata.onboardingComplete as boolean;

  if (userRole !== 'parent') {
    window.location.href = '/portal/' + userRole;
    return null;
  }

  if (!onboardingComplete) {
    window.location.href = '/onboarding/parent';
    return null;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard data...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  const quickStats = [
    { title: 'Active Bookings', value: bookings.filter(b => b.status === 'accepted').length, icon: BookOpen },
    { title: 'Registered Children', value: children.length, icon: Users },
    { title: 'Unread Messages', value: conversations.reduce((acc: number, conv: Conversation) => acc + conv.unreadCount, 0), icon: Mail },
    { title: 'Reviews Given', value: bookings.filter(b => b.status === 'completed').length, icon: Star },
  ]

  const upcomingBookings = bookings
    .filter(b => b.status === 'accepted' || b.status === 'pending')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3)

  const recentMessages = messages
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    .slice(0, 2)
    .map(msg => ({
      ...msg,
      time: formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true })
    }))

  const handleCardClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back {user?.firstName || user?.username}!</h1>
            <p className="text-gray-600 dark:text-gray-300">Here's what's happening with your childcare.</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => handleCardClick('/portal/parent/profile')}
          >
            <UserCircle className="w-4 h-4" />
            View Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard
            className="bg-white/30 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-white/30 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handleCardClick('/portal/bookings')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl shadow-inner">
                  <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bookings.filter(b => b.status === 'accepted').length}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Bookings</p>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            className="bg-white/30 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-white/30 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handleCardClick('/portal/messages')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl shadow-inner">
                  <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{conversations.reduce((acc: number, conv: Conversation) => acc + conv.unreadCount, 0)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Unread Messages</p>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            className="bg-white/30 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-white/30 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handleCardClick('/portal/notifications')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl shadow-inner">
                  <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{notifications.length}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Recent Notifications</p>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard
            className="bg-white/30 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden border border-white/30 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handleCardClick('/portal/children')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl shadow-inner">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{children.length}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Children Profiles</p>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedCard 
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  <span>Recommended Childminders</span>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900" onClick={() => window.location.href = '/portal/parent/smart-match'}>Find More</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading recommendations...</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                          <Star className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Smart Matching Available</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Find the perfect childminder based on your preferences
                          </p>
                        </div>
                      </div>
                      <Button 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
                        onClick={() => window.location.href = '/portal/parent/smart-match'}
                      >
                        Start Matching
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <span>Recent Messages</span>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900" onClick={() => window.location.href = '/portal/parent/messages'}>View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-sm">
                    <Avatar className="ring-2 ring-purple-100 dark:ring-purple-900">
                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">{message.sender.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{message.sender.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{message.content}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{message.time}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-purple-50 dark:hover:bg-purple-900" 
                      onClick={() => window.location.href = `/portal/parent/messages/${message.sender.id}`}
                    >
                      Reply
                    </Button>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-4 text-gray-500">No messages</div>
                )}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5 text-purple-500" />
                  <span>Upcoming Bookings</span>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900" onClick={() => window.location.href = '/portal/parent/bookings'}>View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-4">
                      <CalendarDays className="h-10 w-10 text-purple-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{booking.childminder.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(booking.startTime), 'PPP')} • {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Child: {booking.child.name}</p>
                      </div>
                    </div>
                    <Badge variant={booking.status === 'accepted' ? 'default' : 'secondary'}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                ))}
                {upcomingBookings.length === 0 && (
                  <div className="text-center py-4 text-gray-500">No upcoming bookings</div>
                )}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span>Children Profiles</span>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900" onClick={() => window.location.href = '/portal/parent/children'}>Manage</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-4">
                      <Avatar className="ring-2 ring-purple-100 dark:ring-purple-900">
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900">{child.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{child.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Age: {Math.floor((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / 31557600000)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-purple-50 dark:hover:bg-purple-900" 
                      onClick={() => window.location.href = '/portal/parent/children'}
                    >
                      Update
                    </Button>
                  </div>
                ))}
                {children.length === 0 && (
                  <div className="text-center py-4 text-gray-500">No children registered</div>
                )}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-purple-500" />
                  <span>Recent Notifications</span>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900" onClick={() => window.location.href = '/portal/parent/notifications'}>View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No new notifications</div>
                ) : (
                  notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-4">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                        <Bell className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
