import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { children } = await request.json();

    if (!Array.isArray(children) || children.length === 0) {
      return NextResponse.json({ error: 'At least one child is required' }, { status: 400 });
    }

    // Update user in database
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        children: {
          create: children.map((child: any) => ({
            name: child.name,
            dateOfBirth: new Date(child.dob),
            gender: child.gender.toLowerCase(),
            additionalInfo: child.additionalInfo || null
          }))
        }
      }
    });

    // Update Clerk metadata to mark onboarding as complete
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicMetadata: {
          role: 'parent',
          onboardingComplete: true
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update Clerk metadata');
    }

    return NextResponse.json({ message: 'Onboarding completed successfully' });

  } catch (error) {
    console.error('Error in parent onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
} 