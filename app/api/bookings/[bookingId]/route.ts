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

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('[BOOKING_UPDATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 