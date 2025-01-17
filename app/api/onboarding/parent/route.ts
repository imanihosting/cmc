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

    // Update user in database with children
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

    console.log('Before parent onboarding, onboardingComplete:', false);
    
    // Update Clerk metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        role: 'parent' // Preserve the role while updating onboardingComplete
      }
    });

    console.log('After parent onboarding, onboardingComplete:', true);

    // Set cookie to force client-side session refresh
    const response = NextResponse.json({ 
      message: 'Parent onboarding completed successfully',
      requiresRefresh: true
    });

    response.cookies.set('clerk-force-refresh', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 // 1 minute
    });

    return response;

  } catch (error) {
    console.error('Error during parent onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete parent onboarding' },
      { status: 500 }
    );
  }
}
