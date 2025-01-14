import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        childminderBookings: true,
        childminderReviews: true
      }
    });

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (dbUser.role !== 'childminder') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Calculate stats
    const totalBookings = dbUser.childminderBookings.length;
    const rating = dbUser.childminderReviews.length > 0 
      ? dbUser.childminderReviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / dbUser.childminderReviews.length 
      : 0;
    const hourlyRate = Number(dbUser.hourlyRate) || 0;

    return NextResponse.json({
      totalBookings,
      rating,
      profile: 'View Profile',
      hourlyRate
    });

  } catch (error) {
    console.error('[CHILDMINDER_STATS]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 