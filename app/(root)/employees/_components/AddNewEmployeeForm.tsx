'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneNumber from '@/components/ui/phone-number';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLES } from '@/constants';
import { useEmployees } from '@/hooks/useHostsAndEmployees';
import { sendFirebaseResetPasswordEmail } from '@/lib/firebase';
import { addNewUserToFirebase, createEmployeeUser } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSession } from 'next-auth/react';
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
                return phoneNumber.length >= 12;
            },
            { message: 'Invalid mobile number, must be 10 digits' }
        )
        .optional(),
    userRole: z.string().default(ROLES.EMPLOYEE)
});

type FormFields = z.infer<typeof schema>;

export default function AddNewEmployeeForm() {
    const [open, setOpen] = useState(false);

    const { refetch: refetchEmployees } = useEmployees();

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
            const { email, firstName, lastName, mobilePhone, userRole } = data;

            const session = await getSession();

            await addNewUserToFirebase({ email, firstName, lastName });

            const createUserResponse = await createEmployeeUser({
                email: email,
                firstName: firstName,
                lastName: lastName,
                mobilePhone: mobilePhone || '',
                channelName: session?.channelName || 'Bundee',
                hostId: session?.iduser,
                userRole: userRole
            });

            if (createUserResponse?.success) {
                await sendFirebaseResetPasswordEmail(email);
                refetchEmployees();
                closeDialog();
                toast.success('Employee added successfully');
            } else {
                toast.error(createUserResponse?.message);
            }
        } catch (error: any) {
            console.error(error.message);
            toast.error(error.message);
        }
    };

    return (
        <>
            <Button onClick={openDialog}>Add New Employee</Button>

            <AdaptiveDialog isOpen={open} onClose={closeDialog} title='Add New Employee'>
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
                                    render={({ field: { onChange, value } }) => <PhoneNumber onChange={onChange} value={value || ''} />}
                                />
                                <FormError>{errors.mobilePhone?.message}</FormError>
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='userRole'>Role </Label>
                                <Controller
                                    control={control}
                                    name='userRole'
                                    render={({ field: { onChange, value } }) => (
                                        <Select value={value} onValueChange={onChange} defaultValue={ROLES.EMPLOYEE}>
                                            <SelectTrigger className='w-[180px]'>
                                                <SelectValue placeholder='Select Role' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ROLES.EMPLOYEE}>Employee</SelectItem>
                                                <SelectItem value={ROLES.ADMIN}>ADMIN</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError>{errors.mobilePhone?.message}</FormError>
                            </div>
                        </div>

                        <FormError>{errors.root?.message}</FormError>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='outline' onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button type='submit' loading={isSubmitting} loadingText='Adding...'>
                            Add New Employee
                        </Button>
                    </AdaptiveFooter>
                </form>
            </AdaptiveDialog>
        </>
    );
}
