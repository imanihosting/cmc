'use client'

import { useState, useEffect } from "react"
import * as Tabs from "@radix-ui/react-tabs"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useUser } from "@clerk/nextjs"

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

interface Childminder {
  id: string
  name: string
}

interface Child {
  id: string
  name: string
}

interface BadgeVariants {
  [key: string]: "default" | "destructive" | "outline" | "secondary"
}

const badgeVariants: BadgeVariants = {
  accepted: "outline",
  rejected: "destructive",
  completed: "secondary",
  pending: "default"
}

export default function BookingsPage() {
  const { user } = useUser()
  const [role, setRole] = useState<"admin" | "parent" | "childminder">()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [childminders, setChildminders] = useState<Childminder[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [selectedChildminder, setSelectedChildminder] = useState("")
  const [selectedChild, setSelectedChild] = useState("")

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setBookings(data)
      }
    } catch (err) {
      setError("Failed to fetch bookings")
    }
  }

  const fetchChildminders = async () => {
    try {
      const response = await fetch("/api/users?role=childminder")
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setChildminders(data)
      }
    } catch (err) {
      setError("Failed to fetch childminders")
    }
  }

  const fetchChildren = async () => {
    try {
      const response = await fetch("/api/children")
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setChildren(data)
      }
    } catch (err) {
      setError("Failed to fetch children")
    }
  }

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/user/role")
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setRole(data.role)
      }
    } catch (err) {
      setError("Failed to fetch user role")
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        await fetchBookings()
      }
    } catch (err) {
      setError("Failed to update booking status")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childminderId: selectedChildminder,
          date: date ? format(date, "yyyy-MM-dd") : "",
          startTime,
          endTime,
          childId: selectedChild,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSelectedChildminder("")
        setDate(undefined)
        setStartTime("")
        setEndTime("")
        setSelectedChild("")
        await fetchBookings()
      }
    } catch (err) {
      setError("Failed to create booking")
    }

    setLoading(false)
  }

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true)
      await fetchUserRole()
      await Promise.all([
        fetchBookings(),
        fetchChildminders(),
        fetchChildren()
      ])
      setLoading(false)
    }

    initializePage()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Bookings</h1>
      
      <Tabs.Root defaultValue="upcoming">
        <Tabs.List className="grid w-full grid-cols-3 inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <Tabs.Trigger value="upcoming" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Upcoming
          </Tabs.Trigger>
          <Tabs.Trigger value="past" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Past
          </Tabs.Trigger>
          {role === "parent" && (
            <Tabs.Trigger value="new" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              New
            </Tabs.Trigger>
          )}
        </Tabs.List>
        
        <Tabs.Content value="upcoming" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <div className="grid grid-cols-1 gap-4">
            {bookings
              .filter(booking => new Date(booking.date) >= new Date())
              .map(booking => (
                <Card key={booking.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {role === "childminder" ? booking.parent.name : booking.childminder.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.date), "PPP")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.startTime} - {booking.endTime}
                      </p>
                      <p className="text-sm text-gray-500">
                        Child: {booking.child.name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant={badgeVariants[booking.status]}>
                        {booking.status}
                      </Badge>
                      {role === "childminder" && booking.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleStatusChange(booking.id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(booking.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </Tabs.Content>
        
        <Tabs.Content value="past" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <div className="grid grid-cols-1 gap-4">
            {bookings
              .filter(booking => new Date(booking.date) < new Date())
              .map(booking => (
                <Card key={booking.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {role === "childminder" ? booking.parent.name : booking.childminder.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.date), "PPP")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.startTime} - {booking.endTime}
                      </p>
                      <p className="text-sm text-gray-500">
                        Child: {booking.child.name}
                      </p>
                    </div>
                    <Badge variant={badgeVariants[booking.status]}>
                      {booking.status}
                    </Badge>
                  </div>
                </Card>
              ))}
          </div>
        </Tabs.Content>
        
        {role === "parent" && (
          <Tabs.Content value="new" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="childminder">Select Childminder</Label>
                  <select
                    id="childminder"
                    value={selectedChildminder}
                    onChange={(e) => setSelectedChildminder(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a childminder</option>
                    {childminders.map(minder => (
                      <option key={minder.id} value={minder.id}>
                        {minder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="child">Select Child</Label>
                  <select
                    id="child"
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a child</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  Create Booking
                </Button>
              </form>
            </Card>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </div>
  )
} 