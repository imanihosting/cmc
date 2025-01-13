import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(params.bookingId) },
      include: {
        parent: {
          select: {
            name: true,
            email: true
          }
        },
        childminder: {
          select: {
            name: true,
            email: true,
            hourlyRate: true
          }
        },
        child: {
          select: {
            name: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user has permission to view this booking
    if (
      dbUser.role !== 'admin' &&
      dbUser.id !== booking.parentId &&
      dbUser.id !== booking.childminderId
    ) {
      return NextResponse.json({ error: 'Not authorized to view this booking' }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error in booking GET endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, startTime, endTime, additionalInfo } = body

    // Verify the user has permission to update this booking
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(params.bookingId) },
      select: {
        parentId: true,
        childminderId: true,
        status: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only allow updates if user is admin, the parent who created the booking,
    // or the childminder assigned to the booking
    if (
      dbUser.role !== 'admin' &&
      dbUser.id !== booking.parentId &&
      dbUser.id !== booking.childminderId
    ) {
      return NextResponse.json({ error: 'Not authorized to update this booking' }, { status: 403 })
    }

    // Build update data based on user role and current booking status
    const updateData: any = {}

    if (status && (dbUser.role === 'admin' || dbUser.id === booking.childminderId)) {
      updateData.status = status
    }

    if (dbUser.role === 'admin') {
      // Admin can update all fields
      if (startTime) updateData.startTime = new Date(startTime)
      if (endTime) updateData.endTime = new Date(endTime)
      if (additionalInfo !== undefined) updateData.additionalInfo = additionalInfo
    } else if (dbUser.id === booking.parentId && booking.status === 'pending') {
      // Parent can update time and info only if booking is still pending
      if (startTime) updateData.startTime = new Date(startTime)
      if (endTime) updateData.endTime = new Date(endTime)
      if (additionalInfo !== undefined) updateData.additionalInfo = additionalInfo
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(params.bookingId) },
      data: updateData,
      include: {
        parent: {
          select: {
            name: true,
            email: true
          }
        },
        childminder: {
          select: {
            name: true,
            email: true,
            hourlyRate: true
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
    console.error('Error in booking PATCH endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error while updating booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true, role: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the booking exists and user has permission to delete it
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(params.bookingId) },
      select: {
        parentId: true,
        status: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only allow deletion if user is admin or the parent who created the booking
    // and the booking is still pending
    if (
      dbUser.role !== 'admin' &&
      (dbUser.id !== booking.parentId || booking.status !== 'pending')
    ) {
      return NextResponse.json(
        { error: 'Not authorized to delete this booking' },
        { status: 403 }
      )
    }

    await prisma.booking.delete({
      where: { id: parseInt(params.bookingId) }
    })

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    console.error('Error in booking DELETE endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error while deleting booking' },
      { status: 500 }
    )
  }
} 