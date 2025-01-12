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

    const formData = await request.json();
    
    // Update user in database
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        experience: formData.experience || null,
        qualifications: formData.qualifications || null,
        availability: formData.availability || null,
        serviceArea: formData.serviceArea || null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        gardaVetted: formData.gardaVetted || false,
        tuslaRegistered: formData.tuslaRegistered || false
      }
    });

    console.log('Before childminder onboarding, onboardingComplete:', false);
    
    // Update Clerk metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        role: 'childminder' // Preserve the role while updating onboardingComplete
      }
    });

    console.log('After childminder onboarding, onboardingComplete:', true);

    // Set cookie to force client-side session refresh
    const response = NextResponse.json({ 
      message: 'Childminder onboarding completed successfully',
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
    console.error('Error during childminder onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete childminder onboarding' },
      { status: 500 }
    );
  }
}
