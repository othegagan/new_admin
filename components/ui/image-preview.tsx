'use client';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface ImagePreviewProps {
    url: string | null | undefined;
    alt?: string;
    className?: string;
}

export default function ImagePreview({ url: imageUrl, alt = 'Image preview', className }: ImagePreviewProps) {
    if (!imageUrl) {
        return (
            <div className='flex aspect-3/2 h-24 w-full select-none items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-center text-neutral-500 text-xs dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400'>
                No image
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative select-none overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700',
                className
            )}>
            <Dialog>
                <DialogTrigger asChild>
                    <div className='group relative h-full w-full cursor-pointer'>
                        <Avatar className='absolute inset-0 h-full w-full rounded-none'>
                            <AvatarImage src={imageUrl} alt={alt} className='h-full w-full object-cover' />
                            <AvatarFallback className='w-full rounded-none text-center text-xs'>
                                <span className='max-w-36'>The image is corrupted and cannot be displayed</span>{' '}
                            </AvatarFallback>
                        </Avatar>

                        <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100'>
                            <Eye className='h-6 w-6 text-white' />
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className='max-w-3xl'>
                    <div className='relative aspect-video'>
                        <Avatar className='absolute inset-0 h-full w-full rounded-none'>
                            <AvatarImage src={imageUrl} alt={alt} className='h-full w-full' style={{ objectFit: 'contain' }} />
                            <AvatarFallback className='w-full rounded-none text-center text-xs'>
                                <span className='max-w-36'>The image is corrupted and cannot be displayed</span>{' '}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
