'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/utils/use-mobile';
import type { NavItem } from '@/types';
import { ChevronRight } from 'lucide-react';
import type { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import type * as React from 'react';
import Logo from './logo';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navItems: NavItem[];
    session: Session | null;
}

export function AppSidebar({ navItems, session, ...props }: AppSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    const isMobile = useIsMobile();

    if (!isMobile && pathname === '/') {
        return null;
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader className='mt-4'>
                <div className='-ml-8 flex-center'>
                    <Logo className='mx-auto ' herf='/' />
                </div>
            </SidebarHeader>
            <SidebarContent className='my-4 flex flex-col gap-4 pl-2'>
                {navItems.map((item) =>
                    item.items && item.items.length > 0 ? (
                        <Collapsible key={item.title} title={item.title} defaultOpen className='group/collapsible'>
                            <SidebarGroup>
                                <SidebarGroupLabel
                                    asChild
                                    className='group/label text-sidebar-foreground text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
                                    <CollapsibleTrigger>
                                        {item.title}
                                        <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {item.items.map((subItem) => (
                                                <SidebarMenuItem key={subItem.title}>
                                                    <SidebarMenuButton asChild isActive={isActive(subItem.href || '')}>
                                                        <a href={item.href || '#'} className='flex items-center gap-3'>
                                                            {item.icon} {item.title}
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title} className='px-2'>
                            <SidebarMenuButton asChild className='px-2' isActive={isActive(item.href || '')}>
                                <a href={item.href || '#'} className='flex items-center gap-3'>
                                    {item.icon} {item.title}
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                )}
            </SidebarContent>
            {/* <SidebarFooter>
                <div className='mx-auto mb-4 flex-center gap-5'>
                    <span className='text-md text-muted-foreground'>Theme</span> <ThemeToggleSwitch />
                </div>
                <ul data-sidebar='menu' className='mb-3 flex w-full min-w-0 flex-col gap-1'>
                    <li data-sidebar='menu-item' className='group/menu-item relative'>
                        <div className=' flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left '>
                            <Avatar className='relative flex h-8 w-8 shrink-0 overflow-hidden rounded-md '>
                                <AvatarImage src={session?.userimage || ''} alt={session?.name ?? ''} className='aspect-square' />
                                <AvatarFallback className='rounded-lg uppercase'>{session?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-semibold'>{session?.name}</span>
                                <span className='truncate text-xs'>{session?.email}</span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' size='icon'>
                                        <DotsVerticalIcon />
                                        <span className='sr-only'>Toggle user menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <SignOut />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </li>
                </ul>
            </SidebarFooter> */}
            <SidebarRail />
        </Sidebar>
    );
}
