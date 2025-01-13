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

    // Get recent reviews
    const reviews = await prisma.review.findMany({
      where: {
        childminderId: dbUser.id
      },
      include: {
        parent: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Format reviews for response
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      parent: review.parent.name,
      rating: review.rating,
      comment: review.review || '',
      date: format(review.createdAt, 'yyyy-MM-dd')
    }));

    return NextResponse.json(formattedReviews);

  } catch (error) {
    console.error('[CHILDMINDER_REVIEWS]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 