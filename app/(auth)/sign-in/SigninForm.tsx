'use client';

import { Copyright } from '@/components/layout/footer';
import Logo from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { InputPassword } from '@/components/ui/extension/input-password';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { AUTH_ROUTES } from '@/constants/routes';
import { auth, getFirebaseErrorMessage } from '@/lib/firebase';
import { loginSchema } from '@/schemas';
import { login } from '@/server/auth-operations';
import { zodResolver } from '@hookform/resolvers/zod';
import { type AuthError, type UserCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { LogIn, TriangleAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof loginSchema>;

export default function SigninForm() {
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const {
        register,
        handleSubmit,
        setError,
        watch,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(loginSchema),
        mode: 'onSubmit'
    });

    const onSubmit: SubmitHandler<FormFields> = async (values) => {
        startTransition(async () => {
            try {
                const email = values.email as string;
                const password = values.password as string;

                // Firebase Authentication
                const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
                const firebaseToken = await userCredential.user.getIdToken();

                const loginValues = { ...values, firebaseToken };

                // Custom backend login
                const result = await login({ values: loginValues, callbackUrl: callbackUrl });
                if (result?.error) {
                    reset({ password: '' });
                    setError('root', { type: 'custom', message: result.error });
                }
            } catch (error: any) {
                reset({ password: '' });

                if (error?.code) {
                    // Handle Firebase specific errors
                    handleAuthError(error as AuthError);
                } else if (error.message?.includes('NEXT_REDIRECT') || error.status === 303) {
                    // Handle Redirect Errors (303 status or NEXT_REDIRECT)
                    // console.warn('Redirection error encountered:', error);
                } else {
                    // Handle Generic Errors
                    setError('root', {
                        type: 'custom',
                        message: 'Something went wrong. Please try again later.'
                    });
                }
            }
        });
    };

    const handleAuthError = (error: AuthError) => {
        const errorMessage = getFirebaseErrorMessage(error.code);
        setError('root', {
            type: 'custom',
            message: errorMessage
        });
    };

    return (
        <div className='flex h-screen w-full justify-center overflow-hidden lg:grid lg:min-h-screen lg:grid-cols-2'>
            <div className='relative hidden bg-muted lg:block'>
                <Image
                    src='/images/signin.webp'
                    alt='Image'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    priority
                    fill
                    className='h-full w-full object-cover'
                />
            </div>

            <div className='my-auto flex flex-col items-center justify-center gap-10 py-12'>
                <Logo />
                <div className='mx-auto grid min-w-[350px] gap-6'>
                    <h1 className='text-center font-bold text-3xl'>Host Sign In</h1>

                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <InputText
                            type='email'
                            label='Email'
                            placeholder='m@example.com'
                            {...register('email')}
                            error={errors.email?.message}
                        />

                        <div className='grid gap-2'>
                            <div className='flex justify-between'>
                                <Label htmlFor='password'>Password</Label>
                                <Link href={AUTH_ROUTES.FORGOT_PASSWORD} className='text-sm underline'>
                                    Forgot password
                                </Link>
                            </div>
                            <InputPassword
                                id='password'
                                type='password'
                                placeholder='Enter your password'
                                {...register('password')}
                                value={watch('password') || ''}
                                error={errors.password?.message}
                            />
                        </div>

                        {errors.root?.message && (
                            <div className='my-3 flex select-none items-center gap-4 rounded-md bg-red-50 p-3'>
                                <TriangleAlert className='size-5 text-red-600' />
                                <p className='font-medium text-red-600 text-sm'>{errors.root?.message}</p>
                            </div>
                        )}

                        <Button
                            className='!w-full'
                            type='submit'
                            loading={isPending}
                            loadingText='Signing in...'
                            suffix={<LogIn className='size-4 transition-all ease-linear group-hover:translate-x-2' />}>
                            Sign In
                        </Button>
                    </form>
                </div>
                <Copyright />
            </div>
        </div>
    );
}
