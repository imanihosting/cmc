import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

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

  // Check if the user has completed onboarding
  if (
    userId &&
    !sessionClaims?.publicMetadata?.onboardingComplete &&
    !isPublicRoute(req)
  ) {
    const onboardingUrl = new URL('/role', req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // Handle role-based access after onboarding
  if (userId && isProtectedRoute(req)) {
    const userRole = sessionClaims?.publicMetadata?.role;

    if (!userRole) {
      // Redirect to role selection page if role isn't defined
      const roleSelectionUrl = new URL('/role', req.url);
      return NextResponse.redirect(roleSelectionUrl);
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
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
