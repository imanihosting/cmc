import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

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
    const { childminderId, childId, startTime, endTime, additionalInfo } = body;

    const booking = await prisma.booking.create({
      data: {
        parentId: dbUser.id,
        childminderId,
        childId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
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
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
} 