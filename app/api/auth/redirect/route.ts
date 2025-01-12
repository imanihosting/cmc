import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    }

    const metadata = sessionClaims?.metadata as { role?: string; onboardingComplete?: boolean } || {};
    const { role, onboardingComplete } = metadata;

    // If admin role, redirect directly to admin portal
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/portal/admin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    }

    // If no role, redirect to role selection
    if (!role) {
      return NextResponse.redirect(new URL('/role', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    }

    // If role but onboarding not complete (for non-admin users), redirect to onboarding
    if (!onboardingComplete) {
      return NextResponse.redirect(new URL(`/onboarding/${role}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    }

    // If role and onboarding complete, redirect to appropriate portal
    return NextResponse.redirect(new URL(`/portal/${role}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));

  } catch (error) {
    console.error('Error during auth redirect:', error);
    return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }
} 