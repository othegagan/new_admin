import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import Logo from '@/components/layout/logo';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getNavItems } from '@/constants';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
    const session = await auth();
    const navItems = getNavItems(session?.userRole);
    return (
        <SidebarProvider>
            <AppSidebar navItems={navItems} session={session} />
            <div
                id='content'
                className={cn(
                    'ml-auto w-full max-w-full',
                    'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
                    'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
                    'transition-[width] duration-200 ease-linear',
                    'flex h-svh flex-col'
                )}>
                <AppHeader sticky>
                    <Logo className='md:hidden' />
                    <div className='ml-auto flex items-center space-x-4'>
                        <UserNav session={session} />
                    </div>
                </AppHeader>
                {children}
            </div>
        </SidebarProvider>
    );
}
