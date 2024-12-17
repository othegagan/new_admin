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
import type { NavItem } from '@/types';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type * as React from 'react';
import Logo from './logo';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navItems: NavItem[];
}

export function AppSidebar({ navItems, ...props }: AppSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent className='my-4 flex flex-col gap-2'>
                {navItems.map((item) =>
                    item.items && item.items.length > 0 ? (
                        <Collapsible key={item.title} title={item.title} defaultOpen className='group/collapsible'>
                            <SidebarGroup>
                                <SidebarGroupLabel
                                    asChild
                                    className='group/label text-sidebar-foreground text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
                                    <CollapsibleTrigger>
                                        {item.title}{' '}
                                        <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {item.items.map((subItem) => (
                                                <SidebarMenuItem key={subItem.title}>
                                                    <SidebarMenuButton asChild isActive={isActive(subItem.href || '')}>
                                                        <Link href={subItem.href || '#'}>{subItem.title}</Link>
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
                                <div className='flex items-center gap-2'>
                                    {item.icon} <Link href={item.href || '#'}>{item.title}</Link>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                )}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
