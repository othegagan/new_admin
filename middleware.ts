import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_ROUTES, PAGE_ROUTES } from './constants/routes';
import { auth } from './lib/auth';
import { createRouterMatcher } from './lib/routeMatcher';

const routeMatcher = createRouterMatcher([
    { matcher: PAGE_ROUTES.ACTIVITY_LOGS, auth: true },
    { matcher: PAGE_ROUTES.ADD_VEHICLE, auth: true, roles: ['Admin', 'SuperHost', 'Host'] },
    { matcher: PAGE_ROUTES.CONFIGURATIONS, auth: true },
    { matcher: PAGE_ROUTES.DASHBOARD, auth: true },
    { matcher: PAGE_ROUTES.EMPLOYEES, auth: true, roles: ['Admin', 'SuperHost', 'Host'] },
    { matcher: PAGE_ROUTES.FIND_MY_CAR, auth: true },
    { matcher: PAGE_ROUTES.GUESTS, auth: true },
    { matcher: PAGE_ROUTES.HOSTS, auth: true, roles: ['Admin', 'SuperHost', 'Host'] },
    { matcher: PAGE_ROUTES.MESSAGES, auth: true },
    { matcher: PAGE_ROUTES.PROFILE, auth: true },
    { matcher: PAGE_ROUTES.TRIPS, auth: true },
    { matcher: PAGE_ROUTES.TRIP_DETAILS, auth: true },
    { matcher: PAGE_ROUTES.TRIP_DETAILS_SWAP, auth: true },
    { matcher: PAGE_ROUTES.TRIPS, auth: true },
    { matcher: PAGE_ROUTES.VEHICLES, auth: true },
    { matcher: AUTH_ROUTES.FORGOT_PASSWORD, auth: false },
    { matcher: AUTH_ROUTES.SIGN_IN, auth: false }
]);

export async function middleware(request: NextRequest) {
    const session = await auth();
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

    if (matchedRoute.roles) {
        const roles = Array.isArray(matchedRoute.roles) ? matchedRoute.roles : [matchedRoute.roles];
        if (!userRole || !roles.includes(userRole)) {
            // console.warn(`Access denied for ${pathname}: UserRole ${userRole} not in ${roles}`);
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
        // Apply middleware to all routes except `_next` assets, static files, and excluded API routes
        '/((?!_next|api/auth/session|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ]
};
