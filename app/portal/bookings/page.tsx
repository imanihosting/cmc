'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock, Euro } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from 'react-hot-toast'

interface Child {
  id: number
  name: string
}

interface Childminder {
  id: number
  name: string
  profilePicture: string | null
  hourlyRate: number
}

const AnimatedCard = motion(Card)

export default function BookingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedChild, setSelectedChild] = useState('')
  const [selectedChildminder, setSelectedChildminder] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [children, setChildren] = useState<Child[]>([])
  const [childminders, setChildminders] = useState<Childminder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch children for the parent
        const childrenRes = await fetch('/api/children')
        const childrenData = await childrenRes.json()
        if (Array.isArray(childrenData)) {
          setChildren(childrenData)
        }

        // Fetch available childminders
        const childmindersRes = await fetch('/api/childminders')
        const childmindersData = await childmindersRes.json()
        if (Array.isArray(childmindersData)) {
          setChildminders(childmindersData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load necessary data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
  }

  const selectedChildminderData = childminders.find(cm => cm.id.toString() === selectedChildminder)
  const duration = calculateDuration()
  const totalCost = selectedChildminderData ? (duration / 60) * selectedChildminderData.hourlyRate : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !startTime || !endTime || !selectedChild || !selectedChildminder) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const startDateTime = new Date(date)
      const [startHour, startMinute] = startTime.split(':')
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute))

      const endDateTime = new Date(date)
      const [endHour, endMinute] = endTime.split(':')
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute))

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childminderId: parseInt(selectedChildminder),
          childId: parseInt(selectedChild),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          additionalInfo,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      toast.success('Booking request sent successfully')
      router.push('/portal/bookings')
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Failed to create booking')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book a Childminder</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedCard 
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardHeader>
              <CardTitle>Booking Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="childminder" className="block mb-2">Select Childminder</Label>
                  <Select onValueChange={setSelectedChildminder} required>
                    <SelectTrigger id="childminder" className="w-full">
                      <SelectValue placeholder="Select a childminder" />
                    </SelectTrigger>
                    <SelectContent>
                      {childminders.map((childminder) => (
                        <SelectItem key={childminder.id} value={childminder.id.toString()}>
                          {childminder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="child" className="block mb-2">Select Child</Label>
                  <Select onValueChange={setSelectedChild} required>
                    <SelectTrigger id="child" className="w-full">
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id.toString()}>{child.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block mb-2">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime" className="block mb-2">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="block mb-2">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="additionalInfo" className="block mb-2">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any special requirements or information..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full">Confirm Booking</Button>
              </form>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard 
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedChildminderData && (
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={selectedChildminderData.profilePicture || ''} alt={selectedChildminderData.name} />
                      <AvatarFallback>{selectedChildminderData.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedChildminderData.name}</h3>
                      <p className="text-sm text-gray-500">Childminder</p>
                    </div>
                  </div>
                )}
                {selectedChildminderData && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span className="font-semibold">€{selectedChildminderData.hourlyRate.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{Math.floor(duration / 60)}h {duration % 60}m</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Cost:</span>
                  <span>€{totalCost.toFixed(2)}</span>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Important Notes:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Please be punctual for drop-off and pick-up times.</li>
                    <li>Inform the childminder of any allergies or special needs.</li>
                    <li>Cancellations must be made at least 24 hours in advance.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
} 