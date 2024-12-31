'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { TripsIcon } from '@/public/icons';
import { Check, FilePenLine, MoreVertical, X } from 'lucide-react';

interface TripActionsProps {
    className?: string;
}

export function TripActions({ className }: TripActionsProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Desktop Actions */}
            <div className='hidden items-center gap-2 md:flex'>
                <span className='sr-only'>Trip Actions</span>
                <Button variant='ghost' type='button' className='font-semibold text-neutral-700 dark:text-neutral-300'>
                    <FilePenLine className='size-5 ' /> Modify Trip
                </Button>
                <Button variant='ghost' type='button' className='font-semibold text-neutral-700 dark:text-neutral-300'>
                    <svg className='size-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                        />
                    </svg>{' '}
                    Swap Vehicle
                </Button>
                <Button variant='ghost' type='button' className='font-semibold text-neutral-700 dark:text-neutral-300'>
                    <X className='size-5 ' /> Reject
                </Button>
                <Button variant='ghost' type='button' className='font-semibold text-green-600 hover:text-green-500'>
                    <Check className='size-5 ' /> Approve
                </Button>
            </div>

            {/* Mobile Actions */}
            <div className='md:hidden'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                            <MoreVertical className='h-5 w-5' />
                            <span className='sr-only'>Trip Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-44'>
                        <DropdownMenuItem className='text-green-600'>
                            <Check className='mr-2 size-5' /> Approve Trip
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <X className='mr-2 size-5' /> Reject Trip
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <FilePenLine className='mr-2 size-5' /> Modify Trip
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <TripsIcon className='mr-2 size-5' /> Swap Vehicle
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
