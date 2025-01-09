'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Separator } from 'react-aria-components';

interface Option {
    label: string;
    href: string;
}

interface SplitButtonDropdownProps {
    options: Option[];
    defaultOption: Option;
    onSelect: (option: Option) => void;
    isActive: boolean;
}

export function SplitButtonDropdown({ options, defaultOption, onSelect, isActive }: SplitButtonDropdownProps) {
    const pathname = usePathname();
    const [selectedOption, setSelectedOption] = React.useState<Option>(defaultOption);

    React.useEffect(() => {
        const activeOption = options.find((option) => option.href === pathname);
        if (activeOption) {
            setSelectedOption(activeOption);
        }
    }, [pathname, options]);

    const handleSelect = (option: Option) => {
        setSelectedOption(option);
        onSelect(option);
    };

    return (
        <div className={cn('group flex items-center text-nowrap', isActive && 'rounded-full bg-primary/80')}>
            <Link
                prefetch={false}
                href={selectedOption.href}
                className={cn(
                    'inline-flex h-9 items-center justify-center rounded-r-none rounded-l-full pr-2 pl-4 font-medium text-sm duration-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    isActive ? 'text-foreground hover:bg-primary' : 'text-muted-foreground group-hover:bg-accent group-hover:text-primary'
                )}>
                {selectedOption.label}
            </Link>
            <Separator orientation='vertical' className='h-5 w-px bg-muted-foreground/50' />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        id='dropdown-trigger-button'
                        type='button'
                        className={cn(
                            'h-9 rounded-r-full rounded-l-none pr-3 pl-2 font-medium text-sm shadow duration-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                            isActive
                                ? 'text-foreground hover:bg-primary'
                                : 'text-muted-foreground group-hover:bg-accent group-hover:text-primary group-hover:shadow-none'
                        )}>
                        <ChevronDown className='h-4 w-4 group-hover:animate-bounce' />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    {options.map((option, index) => (
                        <DropdownMenuItem key={index} asChild>
                            <Link href={option.href} prefetch={false} onClick={() => handleSelect(option)}>
                                {option.label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
