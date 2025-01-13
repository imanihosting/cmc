'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Clock, ArrowLeft } from 'lucide-react'
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
  additionalInfo?: string
}

const AnimatedCard = motion(Card)

export default function EditBookingPage({ params }: { params: { bookingId: string } }) {
  const router = useRouter()
  const { isLoaded, user } = useUser()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    additionalInfo: ''
  })

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user) return
      
      try {
        setIsLoading(true)
        const res = await fetch(`/api/bookings/${params.bookingId}`)
        if (!res.ok) throw new Error('Failed to fetch booking')
        const data = await res.json()
        setBooking(data)
        setFormData({
          startTime: format(new Date(data.startTime), "yyyy-MM-dd'T'HH:mm"),
          endTime: format(new Date(data.endTime), "yyyy-MM-dd'T'HH:mm"),
          additionalInfo: data.additionalInfo || ''
        })
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('Failed to load booking')
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      fetchBooking()
    }
  }, [isLoaded, user, params.bookingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      const res = await fetch(`/api/bookings/${params.bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to update booking')
      
      toast.success('Booking updated successfully')
      router.push('/portal/parent/bookings')
    } catch (err) {
      console.error('Error updating booking:', err)
      toast.error('Failed to update booking')
    } finally {
      setIsSaving(false)
    }
  }

  // Authentication and role checks
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    window.location.href = '/sign-in'
    return null
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading booking details...</div>
  }

  if (error || !booking) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Booking not found'}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>

        <AnimatedCard
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle>Edit Booking with {booking.childminder.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Information</label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Any special instructions or notes for the childminder..."
                  className="h-32"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  )
} 