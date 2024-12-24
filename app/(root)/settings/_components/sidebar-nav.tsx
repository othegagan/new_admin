'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

export default function SidebarNav() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <>
            {/* <div className="p-1 md:hidden">
                <Select value={val} onValueChange={handleSelect}>
                    <SelectTrigger className="h-12 sm:w-48">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map((item) => (
                            <SelectItem key={item.href} value={item.href}>
                                <div className="flex gap-x-4 px-2 py-1">
                                    <span className="scale-125">{item.icon}</span>
                                    <span className="text-md">{item.title}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div> */}

            <ScrollArea orientation='horizontal' type='always' className='hidden w-full min-w-40 bg-background px-1 py-2 md:block'>
                <nav className={cn('flex space-x-2 pb-2 ')}>
                    {/* {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
                                "justify-start"
                            )}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.title}
                        </Link>
                    ))} */}

                    <button
                        type='button'
                        className='group inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full bg-primary/80 px-4 py-2 font-medium text-sm transition-all duration-75 ease-linear hover:bg-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none md:w-fit'>
                        <a href='/vehicles/230/calendar'>Calendar</a>
                    </button>
                    <div className='group flex items-center text-nowrap'>
                        <a
                            className='inline-flex h-9 items-center justify-center rounded-r-none rounded-l-full pr-2 pl-4 font-medium text-muted-foreground text-sm duration-75 group-hover:bg-accent group-hover:text-primary'
                            href='/vehicles/230/master-data'>
                            Master Data
                        </a>
                        <div aria-orientation='vertical' className='h-5 w-px bg-muted-foreground/50' />
                        <button
                            id='dropdown-trigger-button'
                            type='button'
                            className='h-9 rounded-r-full rounded-l-none pr-3 pl-2 font-medium text-muted-foreground text-sm shadow duration-75 group-hover:bg-accent group-hover:text-primary group-hover:shadow-none'
                            aria-haspopup='menu'
                            aria-expanded='false'
                            data-state='closed'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width={24}
                                height={24}
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth={2}
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='lucide lucide-chevron-down h-4 w-4 group-hover:animate-bounce'>
                                <path d='m6 9 6 6 6-6' />
                            </svg>
                        </button>
                    </div>
                    <button
                        type='button'
                        className='group inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full px-4 py-2 font-medium text-muted-foreground text-sm transition-all duration-75 ease-linear hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none md:w-fit'>
                        <a href='/vehicles/230/pricing-discounts'>Pricing &amp; Discounts</a>
                    </button>
                    <button
                        type='button'
                        className='group inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full px-4 py-2 font-medium text-muted-foreground text-sm transition-all duration-75 ease-linear hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none md:w-fit'>
                        <a href='/vehicles/230/platform-sync'>Platform Sync</a>
                    </button>
                    <button
                        type='button'
                        className='group inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full px-4 py-2 font-medium text-muted-foreground text-sm transition-all duration-75 ease-linear hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none md:w-fit'>
                        <a href='/vehicles/230/telematics'>Telematics</a>
                    </button>
                    <button
                        type='button'
                        className='group inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full px-4 py-2 font-medium text-muted-foreground text-sm transition-all duration-75 ease-linear hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none md:w-fit'>
                        <a href='/vehicles/230/notifications'>Notifications</a>
                    </button>
                    <button
                        type='button'
                        className='group inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full px-4 py-2 font-medium text-muted-foreground text-sm transition-all duration-75 ease-linear hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none md:w-fit'>
                        <a href='/vehicles/230/maintenance'>Maintenance</a>
                    </button>
                    <button
                        type='button'
                        className='group inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full px-4 py-2 font-medium text-muted-foreground text-sm transition-all duration-75 ease-linear hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none md:w-fit'>
                        <a href='/vehicles/230/trp-history'>Trip History</a>
                    </button>
                    <button
                        type='button'
                        className='group inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full px-4 py-2 font-medium text-muted-foreground text-sm transition-all duration-75 ease-linear hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none md:w-fit'>
                        <a href='/vehicles/230/logs'>Activity Logs</a>
                    </button>
                </nav>
            </ScrollArea>
        </>
    );
}
