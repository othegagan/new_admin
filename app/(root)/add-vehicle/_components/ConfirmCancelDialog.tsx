'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ConfirmCancelDialog() {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const openDialog = () => {
        setOpen(true);
    };

    const closeDialog = () => {
        router.replace('/vehicles');
        setOpen(false);
    };

    return (
        <>
            <Button variant='ghost' onClick={openDialog} className='w-fit'>
                <ArrowLeft className='size-4 transition-all ease-in-out' />
            </Button>

            <AdaptiveDialog isOpen={open} onClose={closeDialog} showCloseButton={false} interactOutside={false} title='Confirm Cancel'>
                <AdaptiveBody>
                    <p>Are you sure you want to cancel?</p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button
                        variant='outline'
                        onClick={() => {
                            setOpen(false);
                        }}>
                        No
                    </Button>
                    <Button variant='black' onClick={closeDialog}>
                        Yes, Confirm
                    </Button>
                </AdaptiveFooter>
            </AdaptiveDialog>
        </>
    );
}
