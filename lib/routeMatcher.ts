import type { Role } from '@/types';

type RouteConfig = {
    matcher: string | RegExp;
    auth?: boolean;
    roles?: Role | Role[];
};

export function createRouterMatcher(routes: RouteConfig[]) {
    return (pathname: string): RouteConfig | null => {
        for (const route of routes) {
            const matcher = typeof route.matcher === 'string' ? route.matcher : route.matcher.source;
            const regex = new RegExp(`^${matcher}$`);
            if (regex.test(pathname)) {
                // console.log(`Matched Route: ${JSON.stringify(route)} for Pathname: ${pathname}`);
                return route;
            }
        }
        console.warn(`No match found for pathname: ${pathname}`);
        return null;
    };
}
