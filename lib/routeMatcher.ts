import type { Role } from '@/constants';

type RouteConfig = {
    matcher: string | RegExp;
    auth?: boolean;
    role?: Role | Role[];
};

export function createRouterMatcher(routes: RouteConfig[]) {
    return (pathname: string): RouteConfig | null => {
        for (const route of routes) {
            const match = typeof route.matcher === 'string' ? pathname === route.matcher : route.matcher.test(pathname);

            if (match) {
                return route;
            }
        }
        return null;
    };
}
