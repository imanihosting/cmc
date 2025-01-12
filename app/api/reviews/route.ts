import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const childminderId = searchParams.get('childminderId');

    const where = childminderId ? { childminderId: parseInt(childminderId) } : {};

    const reviews = await prisma.review.findMany({
      where,
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
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const review = await prisma.review.create({
      data: {
        parentId: body.parentId,
        childminderId: body.childminderId,
        bookingId: body.bookingId,
        rating: body.rating,
        review: body.review,
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
        booking: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });
    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
} 