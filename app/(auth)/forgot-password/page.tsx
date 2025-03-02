'use client';

import { Copyright } from '@/components/layout/footer';
import Logo from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { AUTH_ROUTES } from '@/constants/routes';
import { auth, getFirebaseErrorMessage } from '@/lib/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { type AuthError, sendPasswordResetEmail } from 'firebase/auth';
import { TriangleAlert } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' })
});

type FormFields = z.infer<typeof schema>;

export default function page() {
    const [resetMailSent, setResetEmailSent] = useState(false);
    const [emailSentTo, setEmailSentTo] = useState('');

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data) => {
        try {
            const email = data.email as string;

            await sendPasswordResetEmail(auth, email);
            setEmailSentTo(email);
            setResetEmailSent(true);
        } catch (error: any) {
            reset({ email: '' });
            handleAuthError(error as AuthError);
        }
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
                    src='/images/forgot.jpeg'
                    alt='Image'
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    priority
                    fill
                    className='h-full w-full object-cover'
                />
            </div>

            <div className='my-auto flex flex-col items-center justify-center gap-10 py-12'>
                <Logo />
                {resetMailSent ? (
                    <div className='flex max-w-[350px] flex-col gap-y-2'>
                        <p className='text-balance text-center text-15'>
                            An email containing the password reset link has been sent to{' '}
                            <span className='whitespace-nowrap font-bold'>{emailSentTo}</span>
                        </p>
                        <Button href={AUTH_ROUTES.SIGN_IN} variant='secondary' className='mt-6 ml-auto w-full'>
                            Back to Sign In
                        </Button>
                    </div>
                ) : (
                    <div className='mx-auto grid w-full max-w-[450px] gap-6'>
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                            <InputText
                                type='email'
                                label='Email'
                                placeholder='name@example.com'
                                {...register('email')}
                                error={errors.email?.message}
                            />

                            {errors.root?.message && (
                                <div className='my-3 flex select-none items-center gap-4 rounded-md bg-red-50 p-3'>
                                    <TriangleAlert className='size-5 text-red-600' />
                                    <p className='font-medium text-red-600 text-sm'>{errors.root?.message}</p>
                                </div>
                            )}

                            <Button type='submit' className='flex w-full!' loading={isSubmitting} loadingText='Sending...'>
                                Send password reset email
                            </Button>
                        </form>

                        <div className='mt-2 text-center text-sm'>
                            Already have an account?{' '}
                            <Link href={AUTH_ROUTES.SIGN_IN} prefetch={false} className='underline'>
                                Sign In
                            </Link>
                        </div>
                    </div>
                )}
                <Copyright />
            </div>
        </div>
    );
}
