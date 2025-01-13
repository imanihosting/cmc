'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, X, Edit2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Booking {
  id: number
  childminder: {
    name: string
    profilePicture: string | null
  }
  startTime: string
  endTime: string
  child: { name: string }
  status: string
  location?: string
}

const AnimatedCard = motion(Card)

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export default function BookingsPage() {
  const { isLoaded, user } = useUser()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const res = await fetch('/api/bookings')
        const data = await res.json()
        if (Array.isArray(data)) {
          setBookings(data)
        } else {
          console.error('Bookings data is not an array:', data)
          setBookings([])
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError('Failed to load bookings')
        setBookings([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      fetchBookings()
    }
  }, [isLoaded, user])

  // Authentication and role checks
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    window.location.href = '/sign-in'
    return null
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading bookings...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  const upcomingBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'pending')
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      setCancellingBookingId(bookingId);
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });

      if (res.ok) {
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' } 
              : booking
          )
        );
        toast.success('Booking cancelled successfully');
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleEditBooking = (bookingId: number) => {
    window.location.href = `/portal/parent/bookings/${bookingId}/edit`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Bookings</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Manage your childcare appointments and schedules.</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Bookings</h2>
            <div className="grid gap-6">
              {upcomingBookings.map((booking, index) => (
                <AnimatedCard
                  key={booking.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={booking.childminder.profilePicture || ''} />
                          <AvatarFallback>{booking.childminder.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{booking.childminder.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Caring for {booking.child.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        {booking.status !== 'cancelled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-purple-50 dark:hover:bg-purple-900"
                              onClick={() => handleEditBooking(booking.id)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancellingBookingId === booking.id}
                            >
                              {cancellingBookingId === booking.id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 dark:border-red-400 mr-1" />
                                  Cancelling...
                                </div>
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <CalendarDays className="h-4 w-4" />
                        <span>{format(new Date(booking.startTime), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}</span>
                      </div>
                      {booking.location && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </AnimatedCard>
              ))}
              {upcomingBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No upcoming bookings found.
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Past Bookings</h2>
            <div className="grid gap-6">
              {pastBookings.map((booking, index) => (
                <AnimatedCard
                  key={booking.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={booking.childminder.profilePicture || ''} />
                          <AvatarFallback>{booking.childminder.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{booking.childminder.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Cared for {booking.child.name}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <CalendarDays className="h-4 w-4" />
                        <span>{format(new Date(booking.startTime), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}</span>
                      </div>
                      {booking.location && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </AnimatedCard>
              ))}
              {pastBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No past bookings found.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 