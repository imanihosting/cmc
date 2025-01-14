import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const bookingId = parseInt(params.bookingId)
    if (isNaN(bookingId)) {
      return new NextResponse('Invalid booking ID', { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        childminder: {
          select: {
            name: true,
            profilePicture: true
          }
        },
        child: {
          select: {
            name: true
          }
        },
        parent: true
      }
    })

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 })
    }

    if (booking.parent.clerkId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('[BOOKING_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// For parents to update booking details
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const bookingId = parseInt(params.bookingId)
    if (isNaN(bookingId)) {
      return new NextResponse('Invalid booking ID', { status: 400 })
    }

    const body = await request.json()
    const { startTime, endTime, additionalInfo } = body

    // Verify the booking belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { parent: true }
    })

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 })
    }

    if (booking.parent.clerkId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Validate dates
    const newStartTime = new Date(startTime)
    const newEndTime = new Date(endTime)

    if (isNaN(newStartTime.getTime()) || isNaN(newEndTime.getTime())) {
      return new NextResponse('Invalid date format', { status: 400 })
    }

    if (newEndTime <= newStartTime) {
      return new NextResponse('End time must be after start time', { status: 400 })
    }

    if (newStartTime < new Date()) {
      return new NextResponse('Cannot update past bookings', { status: 400 })
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        additionalInfo,
        status: 'pending' // Reset to pending since times changed
      },
      include: {
        childminder: {
          select: {
            name: true,
            profilePicture: true
          }
        },
        child: {
          select: {
            name: true
          }
        }
      }
    })

    // Create notification for childminder about the change
    await prisma.notification.create({
      data: {
        userId: booking.childminderId,
        title: "Booking Updated",
        message: `A booking has been modified and needs your review`,
        type: "booking",
      },
    });

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('[BOOKING_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

// For childminders to accept/reject/complete bookings
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body - JSON required" },
        { status: 400 }
      );
    }

    const { status } = body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];

    if (!status) {
      return NextResponse.json(
        { error: "Status field is required" },
        { status: 400 }
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: "Invalid status value",
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          receivedStatus: status
        },
        { status: 400 }
      );
    }

    const bookingId = parseInt(params.bookingId);
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID format" },
        { status: 400 }
      );
    }

    // Get the user with childminder role
    const user = await prisma.user.findFirst({
      where: {
        clerkId: userId,
        role: 'childminder',
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Only childminders can update booking status" },
        { status: 403 }
      );
    }

    // Get the booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        child: {
          select: {
            name: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.childminderId !== user.id) {
      return NextResponse.json(
        { error: "You can only update bookings assigned to you" },
        { status: 403 }
      );
    }

    // Update the booking status
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status,
      },
      include: {
        child: {
          select: {
            name: true,
            parent: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Create a notification for the parent
    const notificationMessages = {
      accepted: `Your booking for ${booking.child.name} has been accepted`,
      rejected: `Your booking for ${booking.child.name} has been rejected`,
      completed: `Your booking for ${booking.child.name} has been marked as completed`,
      pending: `Your booking for ${booking.child.name} status has been updated to pending`,
    };

    await prisma.notification.create({
      data: {
        userId: booking.child.parent.id,
        title: "Booking Update",
        message: notificationMessages[status as keyof typeof notificationMessages],
        type: "booking",
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        child: updatedBooking.child.name,
        parent: updatedBooking.child.parent.name,
        date: updatedBooking.startTime.toISOString().split('T')[0],
        time: updatedBooking.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: updatedBooking.status,
      }
    });
  } catch (error) {
    console.error("[BOOKING_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 