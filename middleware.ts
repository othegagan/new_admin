import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_ROUTES, PAGE_ROUTES } from './constants/routes';
import { createRouterMatcher } from './lib/routeMatcher';
import { getSession } from './lib/sessionCache';

const routeMatcher = createRouterMatcher([
    { matcher: PAGE_ROUTES.DASHBOARD, auth: true },
    { matcher: AUTH_ROUTES.SIGN_IN, auth: false },
    { matcher: AUTH_ROUTES.FORGOT_PASSWORD, auth: false },
    { matcher: PAGE_ROUTES.TRIPS, auth: true },
    { matcher: PAGE_ROUTES.TRIP_DETAILS, auth: true }
]);

export async function middleware(request: NextRequest) {
    const session = await getSession();
    const { pathname } = request.nextUrl;

    const isLoggedIn = session;
    const userRole = session?.userRole;

    // Check for auth pages access first (both sign-in and forgot-password)
    if (pathname === AUTH_ROUTES.SIGN_IN || pathname === AUTH_ROUTES.FORGOT_PASSWORD) {
        if (isLoggedIn) {
            const redirectedFrom = request.nextUrl.searchParams.get('redirectedFrom');
            if (redirectedFrom !== 'home') {
                const redirectUrl = new URL('/', request.url);
                redirectUrl.searchParams.set('redirectedFrom', 'signin');
                return NextResponse.redirect(redirectUrl);
            }
        }
        return NextResponse.next();
    }

    const matchedRoute = routeMatcher(pathname);

    if (!matchedRoute) {
        // If no route matches, continue or handle as needed (e.g., redirect to 404)
        return NextResponse.next();
    }

    if (matchedRoute.auth && !isLoggedIn) {
        // Redirect unauthenticated users to sign-in
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(new URL(`${AUTH_ROUTES.SIGN_IN}?callbackUrl=${callbackUrl}`, request.url));
    }

    if (matchedRoute.role) {
        const roles = Array.isArray(matchedRoute.role) ? matchedRoute.role : [matchedRoute.role];
        if (userRole && !roles.includes(userRole)) {
            // Redirect users without the required role
            return NextResponse.redirect(new URL(PAGE_ROUTES.DASHBOARD, request.url));
        }
    }

    // Handle home redirection from sign-in
    if (pathname === '/' && isLoggedIn) {
        const redirectedFrom = request.nextUrl.searchParams.get('redirectedFrom');
        if (redirectedFrom === AUTH_ROUTES.SIGN_IN) {
            const cleanUrl = new URL('/', request.url);
            return NextResponse.redirect(cleanUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)'
    ]
};
