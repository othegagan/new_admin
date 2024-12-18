import type { Role } from '@/types';

type RouteConfig = {
    matcher: string | RegExp;
    auth?: boolean;
    role?: Role | Role[];
};

export function createRouterMatcher(routes: RouteConfig[]) {
    return (pathname: string): RouteConfig | null => {
        for (const route of routes) {
            const matcher = typeof route.matcher === 'string' ? route.matcher : route.matcher.source;
            const regex = new RegExp(`^${matcher}`);
            const match = regex.test(pathname);

            if (match) {
                return route;
            }
        }
        return null;
    };
}
