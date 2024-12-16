'use client';

import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { LogOutIcon } from 'lucide-react';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

export default function SignOut() {
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            // Sign out from NextAuth.js
            await nextAuthSignOut({ callbackUrl: '/' });

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
        <Button onClick={handleSignOut} loading={isSigningOut} loadingText='Signing out...' suffix={<LogOutIcon />} aria-label='Sign out'>
            Sign out
        </Button>
    );
}
