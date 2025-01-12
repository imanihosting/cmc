import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

    // Get user data from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 });
    }

    // Try to find user by either clerkId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: userId },
          { email: primaryEmail }
        ]
      }
    });

    try {
      if (user) {
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            role,
            clerkId: userId,
            email: primaryEmail
          }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: primaryEmail,
            name: clerkUser.firstName && clerkUser.lastName 
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.username || primaryEmail.split('@')[0],
            role,
            password: '',
          }
        });
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          console.log('Attempting to recover from unique constraint violation...');
          user = await prisma.user.update({
            where: { email: primaryEmail },
            data: { 
              clerkId: userId,
              role
            }
          });
        } else {
          throw e;
        }
      } else {
        throw e;
      }
    }

    // Update Clerk metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: role,
        onboardingComplete: false
      }
    });

    // Set cookie to force client-side session refresh
    const response = NextResponse.json({ 
      message: 'Role set successfully',
      user,
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
    console.error('Error setting role:', error);
    return NextResponse.json(
      { error: 'Failed to set role' },
      { status: 500 }
    );
  }
}
