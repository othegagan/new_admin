'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneNumber from '@/components/ui/phone-number';
import { useHosts } from '@/hooks/useHostsAndEmployees';
import { updateUser } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import type { User } from 'next-auth';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
    firstName: z.string().min(2, { message: 'Min 2 characters' }),
    lastName: z.string().min(2, { message: 'Min 2 characters' }),
    mobilePhone: z.string().refine((value) => value.replace(/\s/g, '').length >= 10, {
        message: 'Invalid mobile number, must be 10 digits'
    })
});

type FormFields = z.infer<typeof schema>;

export default function UpdateHostForm({ cell }: { cell: any }) {
    const [open, setOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<User | null | any>(null);
    const { refetch: refetchHosts } = useHosts();

    const handleEdit = (row: User) => {
        setSelectedRow(row);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedRow(null);
        reset();
    };

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

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const { firstName, lastName, mobilePhone } = data;

            const payload: any = {
                address_1: selectedRow?.address_1 || '',
                address_2: selectedRow?.address_2 || '',
                address_3: selectedRow?.address_3 || '',
                city: selectedRow?.city || '',
                country: selectedRow?.country || '',
                driverlisense: selectedRow?.driverlisense || '',
                firstname: firstName,
                iduser: selectedRow?.iduser || '',
                isEmailVarified: selectedRow?.isEmailVarified || '',
                isPhoneVarified: selectedRow?.isPhoneVarified || '',
                language: selectedRow?.language || '',
                lastname: lastName,
                middlename: '',
                mobilePhone: mobilePhone,
                postcode: selectedRow?.postcode || '',
                state: selectedRow?.state || '',
                userimage: selectedRow?.userimage || '',
                vehicleowner: true,
                fromValue: 'completeProfile',
                channelName: selectedRow?.channelName || ''
            };

            const response = await updateUser(payload);

            if (response.success) {
                handleClose();
                toast.success(response.message);
                refetchHosts();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <Button variant='outline' size='icon' toolTip='Edit Host Details' className='px-2' onClick={() => handleEdit(cell.getValue())}>
                <Pencil className='size-4 text-muted-foreground' />
            </Button>

            {selectedRow && (
                <AdaptiveDialog isOpen={open} onClose={handleClose} title='Edit Host' description='Edit Host details'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <AdaptiveBody>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='firstName'>First Name</Label>
                                    <Input
                                        type='text'
                                        id='firstName'
                                        {...register('firstName')}
                                        defaultValue={selectedRow?.firstname || ''}
                                    />
                                    <FormError>{errors.firstName?.message}</FormError>
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='lastName'>Last Name</Label>
                                    <Input type='text' id='lastName' {...register('lastName')} defaultValue={selectedRow?.lastname || ''} />
                                    <FormError>{errors.lastName?.message}</FormError>
                                </div>
                            </div>

                            <div className='w-full space-y-2'>
                                <Label htmlFor='phone'>Phone</Label>
                                <Controller
                                    control={control}
                                    name='mobilePhone'
                                    defaultValue={selectedRow?.mobilephone || ''}
                                    render={({ field: { onChange, value } }) => <PhoneNumber onValueChange={onChange} value={value} />}
                                />
                                <FormError>{errors.mobilePhone?.message}</FormError>
                            </div>
                        </AdaptiveBody>
                        <AdaptiveFooter>
                            <Button variant='outline' type='button' onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant='black' type='submit' loading={isSubmitting} loadingText='Updating...'>
                                Update
                            </Button>
                        </AdaptiveFooter>
                    </form>
                </AdaptiveDialog>
            )}
        </>
    );
}
