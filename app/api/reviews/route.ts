import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        childminder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const transformedReviews = reviews.map(review => ({
      id: review.id.toString(),
      reviewer: {
        id: review.parent.id.toString(),
        name: review.parent.name,
      },
      childminder: {
        id: review.childminder.id.toString(),
        name: review.childminder.name,
      },
      rating: review.rating,
      review: review.review,
      createdAt: review.createdAt.toISOString(),
    }));

    return NextResponse.json(transformedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
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