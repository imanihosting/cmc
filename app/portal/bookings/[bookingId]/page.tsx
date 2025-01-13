'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Booking {
  id: string
  childminderId: string
  parentId: string
  childId: string
  date: string
  startTime: string
  endTime: string
  status: string
  childminder: {
    id: string
    name: string
  }
  parent: {
    id: string
    name: string
  }
  child: {
    id: string
    name: string
  }
}

const badgeVariants = {
  accepted: "outline",
  rejected: "destructive",
  completed: "secondary",
  pending: "default"
} as const

export default function BookingDetailsPage() {
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${params.bookingId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch booking')
        }
        const data = await response.json()
        setBooking(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [params.bookingId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!booking) return <div>Booking not found</div>

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link 
          href="/portal/admin" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Booking ID: {booking.id}</CardDescription>
            </div>
            <Badge variant={badgeVariants[booking.status as keyof typeof badgeVariants]}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Parent</h3>
                <p>{booking.parent.name}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Childminder</h3>
                <p>{booking.childminder.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Child</h3>
                <p>{booking.child.name}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Date</h3>
                <p>{format(new Date(booking.date), "PPP")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-1">Start Time</h3>
                <p>{booking.startTime}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">End Time</h3>
                <p>{booking.endTime}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-4">
              {booking.status === 'pending' && (
                <>
                  <Button variant="outline" onClick={() => {}}>Reject</Button>
                  <Button onClick={() => {}}>Accept</Button>
                </>
              )}
              {booking.status === 'accepted' && (
                <Button onClick={() => {}}>Mark as Completed</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 