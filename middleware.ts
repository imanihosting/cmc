import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/api',
  '/about',
  '/contact',
  '/onboarding(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/test-webhook(.*)',
  '/api/webhook(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  // Skip webhook routes entirely
  if (request.nextUrl.pathname.startsWith('/api/webhooks') ||
      request.nextUrl.pathname.startsWith('/api/test-webhook') ||
      request.nextUrl.pathname.startsWith('/api/webhook')) {
    return;
  }

  // If not a public route, protect it
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // If user is signed in, handle metadata and redirects
  const { userId, sessionClaims } = auth;
  if (userId) {
    const metadata = sessionClaims?.unsafeMetadata as {
      role?: string;
      onboardingComplete?: boolean;
    } | undefined;

    // Skip middleware for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return;
    }

    // If no role selected and not on role selection page,
    // redirect to role selection
    if (!metadata?.role && !request.nextUrl.pathname.startsWith('/sign-up/role')) {
      return Response.redirect(new URL('/sign-up/role', request.url));
    }

    // If role selected but onboarding not complete,
    // redirect to onboarding (unless already on onboarding page)
    if (metadata?.role && !metadata?.onboardingComplete && 
        !request.nextUrl.pathname.startsWith('/onboarding')) {
      return Response.redirect(new URL(`/onboarding/${metadata.role.toLowerCase()}`, request.url));
    }

    // If trying to access onboarding or role pages when already onboarded,
    // redirect to dashboard
    if (metadata?.onboardingComplete && 
        (request.nextUrl.pathname.startsWith('/onboarding') || 
         request.nextUrl.pathname === '/sign-up/role')) {
      return Response.redirect(new URL(`/dashboard/${metadata.role?.toLowerCase()}`, request.url));
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
