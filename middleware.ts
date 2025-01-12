// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/about',
  '/api/(.*)',
  '/contact',
  '/onboarding/parent',
  '/onboarding/childminder',
  '/role',
  '/sign-in',
  '/sign-up',
]);

const isProtectedRoute = createRouteMatcher([
  '/portal',
  '/portal/admin',
  '/portal/parent',
  '/portal/childminder',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // If the route is public, allow access without further checks
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If the user isn't signed in and the route is protected, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Special handling for admin users
  if (userId && sessionClaims?.publicMetadata?.role === 'admin') {
    // If admin is accessing admin portal, allow it
    if (req.nextUrl.pathname === '/portal/admin') {
      return NextResponse.next();
    }
    // If admin is accessing other protected routes, redirect to admin portal
    if (isProtectedRoute(req)) {
      return NextResponse.redirect(new URL('/portal/admin', req.url));
    }
  }

  // Check if the user has completed onboarding (skip for admin)
  if (
    userId &&
    !sessionClaims?.publicMetadata?.onboardingComplete &&
    sessionClaims?.publicMetadata?.role !== 'admin' &&
    !isPublicRoute(req)
  ) {
    const role = sessionClaims?.publicMetadata?.role;
    if (role && !req.nextUrl.pathname.includes('/onboarding')) {
      return NextResponse.redirect(new URL(`/onboarding/${role}`, req.url));
    }
    return NextResponse.redirect(new URL('/role', req.url));
  }

  // Handle role-based access after onboarding
  if (userId && isProtectedRoute(req)) {
    const userRole = sessionClaims?.publicMetadata?.role;

    if (!userRole) {
      // Redirect to role selection page if role isn't defined
      return NextResponse.redirect(new URL('/role', req.url));
    }

    // Redirect users to their specific portal based on their role
    const rolePortals: Record<string, string> = {
      admin: '/portal/admin',
      parent: '/portal/parent',
      childminder: '/portal/childminder',
    };

    const portalUrl = rolePortals[userRole];
    if (portalUrl && req.nextUrl.pathname !== portalUrl) {
      return NextResponse.redirect(new URL(portalUrl, req.url));
    }
  }

  // Allow access if none of the above conditions are met
  return NextResponse.next();
});

// Match configuration to skip internal and static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/(api|trpc)(.*)',
  ],
};