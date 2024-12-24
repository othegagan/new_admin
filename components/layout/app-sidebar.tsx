import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { PAGE_ROUTES } from '@/constants/routes';
import type { ISidebar } from '@/types';
import Logo from './logo';
import { NavGroup } from './nav-group';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navItems: ISidebar[];
}

export function AppSidebar({ navItems, ...props }: AppSidebarProps) {
    return (
        <Sidebar collapsible='icon' variant='sidebar' {...props}>
            <SidebarHeader>
                <Logo className='pt-2' herf={PAGE_ROUTES.DASHBOARD} />
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
