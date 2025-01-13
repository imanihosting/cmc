import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const childminders = await prisma.user.findMany({
      where: {
        role: 'childminder',
        // Only get verified childminders
        gardaVetted: true,
        tuslaRegistered: true
      },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        hourlyRate: true,
        experience: true,
        qualifications: true,
        serviceArea: true,
        availability: true
      }
    });

    return NextResponse.json(childminders);
  } catch (error) {
    console.error('Error fetching childminders:', error);
    return NextResponse.json({ error: 'Failed to fetch childminders' }, { status: 500 });
  }
} 