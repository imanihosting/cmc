import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        childminder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        child: {
          select: {
            id: true,
            name: true,
            dateOfBirth: true,
          },
        },
      },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const booking = await prisma.booking.create({
      data: {
        parentId: body.parentId,
        childminderId: body.childminderId,
        childId: body.childId,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: body.status || 'pending',
        additionalInfo: body.additionalInfo,
      },
      include: {
        parent: {
          select: {
            name: true,
            email: true,
          },
        },
        childminder: {
          select: {
            name: true,
            email: true,
          },
        },
        child: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
} 