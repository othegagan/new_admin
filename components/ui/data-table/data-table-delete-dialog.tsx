'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Trash } from 'lucide-react';
import { useState } from 'react';

interface DataTableDeleteDialogProps {
    selectedRows?: any;
    deleteFn?: (data?: any) => void;
}

export default function DataTableDeleteDialog({ deleteFn, selectedRows }: DataTableDeleteDialogProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function openDialog() {
        setIsDialogOpen(true);
    }

    function closeDialog() {
        setIsDialogOpen(false);
    }

    function handleSubmit() {
        setIsSubmitting(true);
        deleteFn?.();
        setIsSubmitting(false);
        closeDialog();
    }

    return (
        <>
            <Button onClick={openDialog} variant='outline' size='sm' prefix={<Trash className='h-4 w-4' />} className='h-8 w-fit'>
                Delete ({selectedRows.length})
            </Button>

            {selectedRows && (
                <AdaptiveDialog title='Are you absolutely sure?' isOpen={isDialogOpen} onClose={closeDialog}>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        <p>
                            This action cannot be undone. <br /> This will permanently delete {selectedRows.length} row(s).
                        </p>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='secondary' onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button type='submit' variant='danger' onClick={handleSubmit} loading={isSubmitting}>
                            Delete
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
