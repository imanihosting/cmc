import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();

    if (!role || !['parent', 'childminder'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update user role in database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { role },
      create: {
        clerkId: userId,
        role,
        name: '', // We'll update this later
        email: '', // We'll update this later
        password: '', // We don't need password as we're using Clerk
      },
    });

    // Update Clerk metadata using the SDK
    const userFromClerk = await clerkClient.users.getUser(userId);
    if (!userFromClerk.publicMetadata.role) {
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          role: role,
          onboardingComplete: false
        }
      });
    } else {
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          role: role,
        }
      });
    }

    return NextResponse.json({ 
      message: 'Role set successfully',
      user 
    });

  } catch (error) {
    console.error('Error setting role:', error);
    return NextResponse.json(
      { error: 'Failed to set role' },
      { status: 500 }
    );
  }
}
