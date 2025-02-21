'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { useEmployees } from '@/hooks/useHostsAndEmployees';
import { diableUser } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import type { User } from 'next-auth';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
    iduser: z.string()
});

type FormFields = z.infer<typeof schema>;

export default function DisableEmployeeForm({ cell }: { cell: any }) {
    const [open, setOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<User | null>(null);

    const { refetch } = useEmployees();

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

    return (
        <div className='flex-center'>
            <Button variant='outline' size='icon' className='px-2' toolTip='Delete Employee' onClick={() => handleEdit(cell.getValue())}>
                <Trash2 className='size-4 text-muted-foreground' />
            </Button>
            {selectedRow && (
                <AdaptiveDialog isOpen={open} onClose={handleClose} title='Delete Employee'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <AdaptiveBody>
                            <input type='text' hidden={true} {...register('iduser')} defaultValue={selectedRow.iduser} />
                            <p>
                                Are you sure you want to delete {selectedRow.firstname} {selectedRow.lastname} employee?
                            </p>
                            <FormError>{errors.iduser?.message}</FormError>
                        </AdaptiveBody>
                        <AdaptiveFooter>
                            <Button variant='outline' type='button' onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant='black' type='submit' loading={isSubmitting} loadingText='Deleting...'>
                                Delete Employee
                            </Button>
                        </AdaptiveFooter>
                    </form>
                </AdaptiveDialog>
            )}
        </div>
    );
}
