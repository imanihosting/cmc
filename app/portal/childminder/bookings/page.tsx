'use client'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar as CalendarIcon, User, CheckCircle, XCircle, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addDays, isSameDay, parseISO } from "date-fns";

interface Booking {
  id: string;
  child: string;
  parent: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  additionalInfo?: string;
  history?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

export default function BookingsPage() {
  const { isLoaded, user } = useUser();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, selectedDate, activeTab]);

  const fetchBookings = async () => {
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

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchBookings();
        
        const statusMessages = {
          accepted: "Booking accepted successfully",
          rejected: "Booking rejected successfully",
          completed: "Booking marked as completed",
          pending: "Booking status updated to pending"
        };

        toast({
          title: "Success",
          description: statusMessages[newStatus as keyof typeof statusMessages],
          variant: "default",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update booking status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div
      key={booking.id}
      className="flex items-center justify-between p-6 mb-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer border border-gray-100 dark:border-gray-700"
      onClick={() => setSelectedBooking(booking)}
    >
      <div className="flex items-center gap-6">
        <div className={cn(
          "p-3 rounded-xl",
          booking.status === 'pending' ? "bg-yellow-50 dark:bg-yellow-900/20" :
          booking.status === 'accepted' ? "bg-green-50 dark:bg-green-900/20" :
          booking.status === 'completed' ? "bg-blue-50 dark:bg-blue-900/20" :
          "bg-red-50 dark:bg-red-900/20"
        )}>
          <Clock className={cn(
            "h-6 w-6",
            booking.status === 'pending' ? "text-yellow-600 dark:text-yellow-400" :
            booking.status === 'accepted' ? "text-green-600 dark:text-green-400" :
            booking.status === 'completed' ? "text-blue-600 dark:text-blue-400" :
            "text-red-600 dark:text-red-400"
          )} />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{booking.child}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {booking.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {booking.time}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {booking.parent}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={cn(
          "px-4 py-1.5 rounded-full text-sm font-medium",
          getStatusColor(booking.status)
        )}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  const getDayBookingStatus = (date: Date) => {
    const dayBookings = bookings.filter(booking => 
      isSameDay(parseISO(booking.date), date)
    );
    
    if (dayBookings.length === 0) return null;
    
    if (dayBookings.some(b => b.status === 'pending')) return 'pending';
    if (dayBookings.some(b => b.status === 'accepted')) return 'accepted';
    return null;
  };

  if (!isLoaded || !user) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Bookings Management</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your upcoming and past bookings</p>
            </div>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 py-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300">
              <CalendarIcon className="w-5 h-5" />
              Export Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-0 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-5">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Bookings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                    <TabsTrigger value="upcoming" className="rounded-lg px-6 py-2.5">Upcoming</TabsTrigger>
                    <TabsTrigger value="past" className="rounded-lg px-6 py-2.5">Past</TabsTrigger>
                    <TabsTrigger value="pending" className="rounded-lg px-6 py-2.5">Pending</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    <ScrollArea className="h-[600px]">
                      {bookings
                        .filter(booking => booking.status === 'accepted')
                        .map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="pending">
                    <ScrollArea className="h-[600px]">
                      {bookings
                        .filter(booking => booking.status === 'pending')
                        .map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="past">
                    <ScrollArea className="h-[600px]">
                      {bookings
                        .filter(booking => booking.status === 'completed' || booking.status === 'rejected')
                        .map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-5">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Calendar View</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-end gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-gray-600 dark:text-gray-400">Pending</span>
                    </div>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
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
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-white dark:bg-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Bookings for {format(selectedDate, "MMMM d, yyyy")}
                    </h3>
                    <ScrollArea className="h-[240px]">
                      {bookings
                        .filter(booking => booking.date === format(selectedDate, "yyyy-MM-dd"))
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-4 mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{booking.time}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{booking.child}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">Parent: {booking.parent}</p>
                            </div>
                            <Badge className={cn(
                              "px-3 py-1 rounded-full text-sm font-medium",
                              getStatusColor(booking.status)
                            )}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden bg-white dark:bg-gray-800">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Booking Details</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Complete information about this booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Child</h4>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedBooking.child}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Parent</h4>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedBooking.parent}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h4>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedBooking.date}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</h4>
                  <p className="text-base font-medium text-gray-900 dark:text-white">{selectedBooking.time}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                  <Badge className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    getStatusColor(selectedBooking.status)
                  )}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {selectedBooking.additionalInfo && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedBooking.additionalInfo}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking History</h4>
                <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  {selectedBooking.history?.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 text-sm">
                      <div className="w-32 flex-shrink-0 text-gray-500 dark:text-gray-400">
                        {format(new Date(event.timestamp), "MMM d, HH:mm")}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-900 dark:text-white">Status changed to </span>
                        <Badge variant="outline" className="ml-1">
                          {event.status}
                        </Badge>
                        {event.note && (
                          <p className="text-gray-600 dark:text-gray-300 mt-1 bg-white dark:bg-gray-800 rounded-lg p-2">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedBooking.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="outline"
                    className="rounded-xl px-6 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, 'rejected');
                      setSelectedBooking(null);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    className="rounded-xl px-6 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, 'accepted');
                      setSelectedBooking(null);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 