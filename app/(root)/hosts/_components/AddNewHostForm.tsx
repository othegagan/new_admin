'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneNumber from '@/components/ui/phone-number';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHosts } from '@/hooks/useHostsAndEmployees';
import { sendFirebaseResetPasswordEmail } from '@/lib/firebase';
import { addNewUserToFirebase } from '@/server/user';
import { createHostUser } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
    firstName: z.string({ message: 'First Name is required' }).min(2, { message: 'Min 2 characters' }),
    lastName: z.string({ message: 'Last Name is required' }).min(2, { message: 'Min 2 characters' }),
    email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email address' }),
    mobilePhone: z
        .string({ message: 'Phone Number is required' })
        .min(1, { message: 'Phone Number is required' })
        .refine(
            (value) => {
                const phoneNumber = value.replace(/\s/g, '');
                return phoneNumber.length >= 11;
            },
            { message: 'Invalid mobile number, must be 10 digits' }
        ),
    channelName: z.string({ message: 'Channel is required' }).default('Bundee')
});

type FormFields = z.infer<typeof schema>;

export default function AddNewHostForm() {
    const [open, setOpen] = useState(false);

    const { refetch: refetchHosts } = useHosts();

    function openDialog() {
        setOpen(true);
    }

    function closeDialog() {
        setOpen(false);
        reset();
    }

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data) => {
        try {
            const { email, firstName, lastName, mobilePhone, channelName } = data;
            await addNewUserToFirebase({ email, firstName, lastName });

            const createUserResponse = await createHostUser({
                email: email,
                firstName: firstName,
                lastName: lastName,
                mobilePhone: `+${mobilePhone}`,
                channelName: channelName
            });

            if (createUserResponse?.success) {
                await sendFirebaseResetPasswordEmail(email);
                refetchHosts();
                closeDialog();
                toast.success('Host added successfully');
            } else {
                toast.error(createUserResponse?.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <Button variant='black' onClick={openDialog}>
                Add New Host
            </Button>

            <AdaptiveDialog isOpen={open} onClose={closeDialog} title='Add New Host'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <AdaptiveBody className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='firstName'>First Name </Label>
                                <Input type='text' id='firstName' {...register('firstName')} />
                                <FormError>{errors.firstName?.message}</FormError>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='lastName'>Last Name </Label>
                                <Input type='text' id='lastName' {...register('lastName')} />
                                <FormError>{errors.lastName?.message}</FormError>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email </Label>
                            <Input placeholder='name@example.com' type='email' id='EmailId' {...register('email')} />
                            <FormError>{errors.email?.message}</FormError>
                        </div>

                        <div className='grid grid-cols-5 gap-4'>
                            <div className='col-span-5 space-y-2 md:col-span-3'>
                                <Label htmlFor='phone'>Phone </Label>
                                <Controller
                                    control={control}
                                    name='mobilePhone'
                                    render={({ field: { onChange, value } }) => <PhoneNumber onValueChange={onChange} value={value} />}
                                />
                                <FormError>{errors.mobilePhone?.message}</FormError>
                            </div>

                            <div className='col-span-5 space-y-2 md:col-span-2'>
                                <Label htmlFor='channelName'>Channel </Label>
                                <Controller
                                    control={control}
                                    name='channelName'
                                    defaultValue='Bundee'
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <>
                                            <Select onValueChange={onChange} value={value} defaultValue={value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select channel' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='Bundee'>Bundee</SelectItem>
                                                    <SelectItem value='Flux'>Flux</SelectItem>
                                                    <SelectItem value='Turo'>Turo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {error}
                                        </>
                                    )}
                                />
                                <FormError>{errors.channelName?.message}</FormError>
                            </div>
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='outline' onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button variant='black' type='submit' loading={isSubmitting} loadingText='Adding...'>
                            Add New Host
                        </Button>
                    </AdaptiveFooter>
                </form>
            </AdaptiveDialog>
        </>
    );
}
