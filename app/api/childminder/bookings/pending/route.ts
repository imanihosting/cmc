import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true
      }
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (dbUser.role !== 'childminder') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get pending bookings
    const bookings = await prisma.booking.findMany({
      where: {
        childminderId: dbUser.id,
        status: 'pending'
      },
      include: {
        child: {
          select: {
            name: true
          }
        },
        parent: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Format bookings for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      child: booking.child.name,
      parent: booking.parent.name,
      date: format(booking.startTime, 'yyyy-MM-dd'),
      time: `${format(booking.startTime, 'HH:mm')} - ${format(booking.endTime, 'HH:mm')}`
    }));

    return NextResponse.json(formattedBookings);

  } catch (error) {
    console.error('[CHILDMINDER_BOOKINGS_PENDING]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { bookingId, action } = await req.json();

    if (!bookingId || !action || !['accept', 'decline'].includes(action)) {
      return new NextResponse('Invalid request', { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        role: true
      }
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (dbUser.role !== 'childminder') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        childminderId: true,
        status: true
      }
    });

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 });
    }

    if (booking.childminderId !== dbUser.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (booking.status !== 'pending') {
      return new NextResponse('Booking is not pending', { status: 400 });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: action === 'accept' ? 'accepted' : 'rejected'
      }
    });

    return NextResponse.json(updatedBooking);

  } catch (error) {
    console.error('[CHILDMINDER_BOOKINGS_PENDING]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 