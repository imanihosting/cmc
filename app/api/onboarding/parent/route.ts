import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
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

    // Update Clerk metadata using the SDK
    const userFromClerk = await clerkClient.users.getUser(userId);
    console.log('Before parent onboarding, onboardingComplete:', userFromClerk.publicMetadata.onboardingComplete);
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: 'parent',
        onboardingComplete: true
      }
    });
    const updatedUserFromClerk = await clerkClient.users.getUser(userId);
    console.log('After parent onboarding, onboardingComplete:', updatedUserFromClerk.publicMetadata.onboardingComplete);

    return NextResponse.json({ message: 'Onboarding completed successfully' });

  } catch (error) {
    console.error('Error in parent onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
