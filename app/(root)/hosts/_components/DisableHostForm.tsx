'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { Switch } from '@/components/ui/switch';
import { useHosts } from '@/hooks/useHostsAndEmployees';
import { diableUser } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from 'next-auth';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
    iduser: z.string()
});

type FormFields = z.infer<typeof schema>;

export default function DisableHostForm({ cell }: { cell: any }) {
    const [open, setOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<User | null>(null);

    const { refetch } = useHosts();

    const handleEdit = (row: User) => {
        setSelectedRow(row);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedRow(null);
    };

    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const { iduser } = data;
            const response = await diableUser(iduser, !cell.getValue().isactive);
            if (response.success) {
                handleClose();
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            handleClose();
            refetch();
        }
    };

    const operation = cell.getValue().isactive ? 'Disable Host' : 'Enable Host';

    return (
        <>
            <Switch checked={cell.getValue().isactive} onCheckedChange={() => handleEdit(cell.getValue())} />

            {selectedRow && (
                <AdaptiveDialog isOpen={open} onClose={handleClose} title={operation}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <AdaptiveBody>
                            <input type='text' hidden={true} {...register('iduser')} defaultValue={selectedRow.iduser} />
                            <p>
                                Are you sure you want to {cell.getValue().isactive ? 'disable' : 'enable'} {selectedRow.firstname}{' '}
                                {selectedRow.lastname} host?
                            </p>
                            <FormError>{errors.iduser?.message}</FormError>
                        </AdaptiveBody>
                        <AdaptiveFooter>
                            <Button variant='outline' type='button' onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                variant='black'
                                type='submit'
                                loading={isSubmitting}
                                loadingText={cell.getValue().isactive ? 'Disabling...' : 'Enabling...'}>
                                {operation}
                            </Button>
                        </AdaptiveFooter>
                    </form>
                </AdaptiveDialog>
            )}
        </>
    );
}
