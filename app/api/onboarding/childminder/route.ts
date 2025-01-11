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

    const data = await request.json();

    // Update user in database
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        name: data.name,
        email: data.email,
        experience: data.experience || null,
        qualifications: data.qualifications || null,
        availability: data.availability || null,
        serviceArea: data.serviceArea || null,
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        gardaVetted: data.gardaVetted || false,
        tuslaRegistered: data.tuslaRegistered || false
      }
    });

    // Update Clerk metadata using the SDK
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: 'childminder',
        onboardingComplete: true
      }
    });

    return NextResponse.json({ message: 'Onboarding completed successfully' });

  } catch (error) {
    console.error('Error in childminder onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
} 