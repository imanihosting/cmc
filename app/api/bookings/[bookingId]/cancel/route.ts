import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

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

    // Update the booking status to rejected (since there's no cancelled status)
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'rejected'
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('[BOOKING_CANCEL]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 