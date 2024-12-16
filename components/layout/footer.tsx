import { cn } from '@/lib/utils';

export default function Footer() {
    return (
        <footer className='mt-auto border-neutral-200 border-t py-4 md:px-8 md:py-0 dark:border-neutral-700'>
            <div className='container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row'>
                <Copyright />
            </div>
        </footer>
    );
}

export function Copyright({ className }: { className?: string }) {
    const currentYear = new Date().getFullYear();

    return (
        <p className={cn('select-none text-balance text-center text-muted-foreground text-sm leading-loose', className)}>
            Copyright © {currentYear} MyBundee. All rights reserved.
        </p>
    );
}
