import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header/app-header';
import { ProfileDropdown } from '@/components/layout/header/profile-dropdown';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getNavItems } from '@/constants';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export default async function RouteComponent({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

    const session = await auth();
    const navItems = getNavItems(session?.userRole);
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar navItems={navItems} />
            <SidebarInset>
                <Header sticky>
                    <div className='ml-auto flex items-center space-x-4'>
                        <ProfileDropdown session={session} />
                    </div>
                </Header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
