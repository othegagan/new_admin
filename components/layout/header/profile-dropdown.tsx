'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ThemeToggleSwitch from '@/components/ui/theme-toggle';
import { AUTH_ROUTES, PAGE_ROUTES } from '@/constants/routes';
import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { LogOutIcon } from 'lucide-react';
import type { Session } from 'next-auth';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export function ProfileDropdown({ session }: { session: Session | null }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='px-0 md:px-2'>
                    <Avatar className='size-8'>
                        <AvatarImage src={session?.userimage || ''} alt={session?.name ?? ''} />
                        <AvatarFallback className='uppercase'>{session?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <p className='hidden font-medium text-sm capitalize leading-none md:block'>{session?.name}</p>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-2'>
                        <p className='font-medium text-sm capitalize leading-none'>{session?.name}</p>
                        <p className='text-muted-foreground text-xs leading-none'>{session?.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <Link
                    href={PAGE_ROUTES.PROFILE}
                    className='relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground [&amp;>svg]:size-4 [&amp;>svg]:shrink-0'>
                    Profile
                </Link>

                <DropdownMenuItem className='flex-between gap-2 text-accent-foreground'>
                    Theme <ThemeToggleSwitch />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SignOut />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function SignOut() {
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            // Sign out from NextAuth.js
            await nextAuthSignOut({ callbackUrl: AUTH_ROUTES.SIGN_IN });

            // Sign out from Firebase
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error(`Error signing out: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <Button
            variant='ghost'
            onClick={handleSignOut}
            loading={isSigningOut}
            loadingText='Signing out...'
            className='flex-start justify-start gap-4'
            suffix={<LogOutIcon className='size-4 text-muted-foreground' />}
            aria-label='Sign out'>
            Sign out
        </Button>
    );
}
