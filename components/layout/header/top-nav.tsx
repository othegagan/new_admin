import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
    links: {
        title: string;
        href: string;
        isActive: boolean;
        disabled?: boolean;
    }[];
}

export function TopNav({ className, links, ...props }: TopNavProps) {
    return (
        <>
            <div className='md:hidden'>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button size='icon' variant='outline'>
                            <Menu />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side='bottom' align='start'>
                        {links.map(({ title, href, isActive, disabled }) => (
                            <DropdownMenuItem key={`${title}-${href}`} asChild>
                                <Link href={href} prefetch={false} className={!isActive ? 'text-muted-foreground' : ''}>
                                    {title}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <nav className={cn('hidden items-center space-x-4 md:flex lg:space-x-6', className)} {...props}>
                {links.map(({ title, href, isActive, disabled }) => (
                    <Link
                        prefetch={false}
                        key={`${title}-${href}`}
                        href={href}
                        className={`font-medium text-sm transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`}>
                        {title}
                    </Link>
                ))}
            </nav>
        </>
    );
}
