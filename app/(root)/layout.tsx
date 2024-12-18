import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import Logo from '@/components/layout/logo';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getNavItems } from '@/constants';
import { auth } from '@/lib/auth';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
    const session = await auth();
    const navItems = getNavItems(session?.userRole);
    return (
        <SidebarProvider>
            <AppSidebar navItems={navItems} session={session} />
            <div id='content' className='ml-auto flex h-svh w-full max-w-full flex-col'>
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
