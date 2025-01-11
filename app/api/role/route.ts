import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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

    // Update Clerk metadata
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicMetadata: {
          role: role,
          onboardingComplete: false
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update Clerk metadata');
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