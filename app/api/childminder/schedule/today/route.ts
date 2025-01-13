import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';

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

    // Get today's bookings
    const today = new Date();
    const bookings = await prisma.booking.findMany({
      where: {
        childminderId: dbUser.id,
        status: 'accepted',
        startTime: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        }
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
      time: `${booking.startTime.toLocaleTimeString()} - ${booking.endTime.toLocaleTimeString()}`
    }));

    return NextResponse.json(formattedBookings);

  } catch (error) {
    console.error('[CHILDMINDER_SCHEDULE_TODAY]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 