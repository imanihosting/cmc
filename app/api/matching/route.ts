import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MatchingService } from '@/lib/services/matching-service';

const matchingService = new MatchingService();

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { type, filters } = body;

    switch (type) {
      case 'recommendations':
        const recommendations = await matchingService.getRecommendedChildminders(session.userId);
        return NextResponse.json(recommendations);

      case 'search':
        const matches = await matchingService.findMatches(filters);
        return NextResponse.json(matches);

      default:
        return new NextResponse('Invalid request type', { status: 400 });
    }
  } catch (error) {
    console.error('[MATCHING_ERROR]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 