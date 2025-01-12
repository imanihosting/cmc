// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/api/(.*)',
  '/contact',
  '/role',
  '/onboarding/parent',
  '/onboarding/childminder',
  '/sign-in',
  '/sign-up',
]);

const isProtectedRoute = createRouteMatcher([
  '/portal/(.*)',
]);

interface PublicMetadata {
  role?: string;
  onboardingComplete?: boolean;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = await auth();
  console.log('Middleware - Current path:', req.nextUrl.pathname);
  console.log('Middleware - User ID:', userId);
  console.log('Middleware - Session claims:', sessionClaims);

  // If the route is public, allow access without further checks
  if (isPublicRoute(req)) {
    console.log('Middleware - Public route, allowing access');
    return NextResponse.next();
  }

  // If no user, redirect to sign-in
  if (!userId) {
    console.log('Middleware - No user, redirecting to sign-in');
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const metadata = sessionClaims?.metadata as PublicMetadata || {};
  const userRole = metadata.role;
  const onboardingComplete = metadata.onboardingComplete;

  console.log('Middleware - User role:', userRole);
  console.log('Middleware - Onboarding complete:', onboardingComplete);

  // If no role selected, redirect to role selection
  if (!userRole && !req.nextUrl.pathname.startsWith('/role')) {
    console.log('Middleware - No role, redirecting to role selection');
    return NextResponse.redirect(new URL('/role', req.url));
  }

  // If role selected but onboarding not complete, redirect to onboarding
  if (userRole && !onboardingComplete && !req.nextUrl.pathname.startsWith('/onboarding')) {
    console.log('Middleware - Onboarding incomplete, redirecting to onboarding');
    return NextResponse.redirect(new URL(`/onboarding/${userRole}`, req.url));
  }

  // Handle portal access
  if (req.nextUrl.pathname.startsWith('/portal/')) {
    const requestedRole = req.nextUrl.pathname.split('/')[2]; // Get role from URL
    console.log('Middleware - Portal access, requested role:', requestedRole);

    // If trying to access wrong portal
    if (requestedRole !== userRole) {
      console.log('Middleware - Wrong portal, redirecting to correct portal');
      return NextResponse.redirect(new URL(`/portal/${userRole}`, req.url));
    }

    // If onboarding not complete
    if (!onboardingComplete) {
      console.log('Middleware - Portal access denied, onboarding incomplete');
      return NextResponse.redirect(new URL(`/onboarding/${userRole}`, req.url));
    }
  }

  console.log('Middleware - All checks passed, allowing access');
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};