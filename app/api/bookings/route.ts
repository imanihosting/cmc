import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true, role: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let bookings;

    if (dbUser.role === 'admin') {
      // Admins can see all bookings
      bookings = await prisma.booking.findMany({
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (dbUser.role === 'parent') {
      // Parents can only see their own bookings
      bookings = await prisma.booking.findMany({
        where: {
          parentId: dbUser.id
        },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Childminders can only see bookings where they are the childminder
      bookings = await prisma.booking.findMany({
        where: {
          childminderId: dbUser.id
        },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error in bookings GET endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true, role: true }
    });

    if (!dbUser || dbUser.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can create bookings' }, { status: 403 });
    }

    const body = await request.json();
    const { childminderId, childId, date, startTime, endTime, additionalInfo } = body;

    // Combine date and time strings into DateTime objects
    const startDateTime = new Date(`${date.split('T')[0]}T${startTime}:00`);
    const endDateTime = new Date(`${date.split('T')[0]}T${endTime}:00`);

    const booking = await prisma.booking.create({
      data: {
        parentId: dbUser.id,
        childminderId: parseInt(childminderId),
        childId: parseInt(childId),
        startTime: startDateTime,
        endTime: endDateTime,
        additionalInfo,
        status: 'pending'
      },
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
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error in bookings POST endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { id: true, role: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const bookingId = url.pathname.split('/').pop();
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    // Verify the user has permission to update this booking
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      select: {
        parentId: true,
        childminderId: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only allow updates if user is admin, the parent who created the booking,
    // or the childminder assigned to the booking
    if (
      dbUser.role !== 'admin' &&
      dbUser.id !== booking.parentId &&
      dbUser.id !== booking.childminderId
    ) {
      return NextResponse.json({ error: 'Not authorized to update this booking' }, { status: 403 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: { status },
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
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error in bookings PATCH endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating booking' },
      { status: 500 }
    );
  }
} 