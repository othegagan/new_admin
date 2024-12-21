'use client';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navItems: NavGroupProps[];
    session: Session | null;
}

import { NavGroup } from '@/components/layout/nav-group';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { PAGE_ROUTES } from '@/constants/routes';
import type { NavGroupProps } from '@/types';
import type { Session } from 'next-auth';
import Logo from './logo';

export function AppSidebar({ session, navItems, ...props }: AppSidebarProps) {
    return (
        <Sidebar collapsible='icon' variant='sidebar' {...props}>
            <SidebarHeader>
                <Logo className='pt-4' herf={PAGE_ROUTES.DASHBOARD} />
            </SidebarHeader>
            <SidebarContent>
                {navItems.map((props) => (
                    <NavGroup key={props.title} {...props} />
                ))}
            </SidebarContent>
            {/* <SidebarRail /> */}
        </Sidebar>
    );
}
