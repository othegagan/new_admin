import type { Role } from '@/types';

type RouteConfig = {
    matcher: string | RegExp;
    auth?: boolean;
    roles?: Role | Role[];
};

export function createRouterMatcher(routes: RouteConfig[]) {
    return (pathname: string): RouteConfig | null => {
        // First check for exact matches
        const exactMatch = routes.find((route) =>
            // console.log(`Matched Route: ${JSON.stringify(route)} for Pathname: ${pathname}`)
            typeof route.matcher === 'string' ? route.matcher === pathname : route.matcher.test(pathname)
        );

        if (exactMatch) return exactMatch;

        // Then check for dynamic routes (path segments)
        const dynamicMatch = routes.find((route) => typeof route.matcher === 'string' && pathname.startsWith(`${route.matcher}/`));

        if (dynamicMatch) return dynamicMatch;

        return null;
    };
}
