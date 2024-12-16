'use server';
import { signIn } from '@/lib/auth';
import type { loginSchema } from '@/schemas';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';

interface LoginSceham {
    values: z.infer<typeof loginSchema>;
    callbackUrl?: string | null;
}

export async function login({ values, callbackUrl }: LoginSceham) {
    try {
        const { email, password, firebaseToken } = values;
        await signIn('credentials', {
            email,
            password,
            firebaseToken,
            redirectTo: callbackUrl || '/',
            redirect: true
        });
        revalidatePath('/');
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: error.message || 'Invalid credentials!' };
                default:
                    return { error: error.message || 'Something went wrong!' };
            }
        }

        throw error;
    }
}
