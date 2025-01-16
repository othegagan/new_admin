import { AppSidebar } from '@/components/layout/app-sidebar';
import { MessagesNotificationButton } from '@/components/layout/header/MessagesNotificationButton';
import { NotificationBellButton } from '@/components/layout/header/NotificationBellButton';
import { Header } from '@/components/layout/header/app-header';
import { ProfileDropdown } from '@/components/layout/header/profile-dropdown';
import Logo from '@/components/layout/logo';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getNavItems } from '@/constants';
import { PAGE_ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { cookies } from 'next/headers';

export default async function RouteComponent({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

    const session = await auth();
    const navItems = getNavItems(session?.userRole);
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar navItems={navItems} />
            <div
                id='content'
                className={cn(
                    'ml-auto w-full max-w-full',
                    'md:peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
                    'md:peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
                    'flex h-svh flex-col'
                )}>
                <Header sticky>
                    <Logo className='-ml-3 w-[72px] pt-2 md:hidden md:w-20' herf={PAGE_ROUTES.DASHBOARD} />
                    <div className='ml-auto flex items-center space-x-3'>
                        <MessagesNotificationButton />
                        <NotificationBellButton />

                        <ProfileDropdown session={session} />
                    </div>
                </Header>
                {children}
            </div>
        </SidebarProvider>
    );
}
