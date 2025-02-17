'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Camera } from 'lucide-react';
import { useState } from 'react';

export default function TripMediaUploadDialog() {
    const [isOpen, setIsOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
        setIsSubmitting(true);
        try {
            const payload = {
                tripid: 1,
                mediaurl: 'https://fiat.b-cdn.net/H4185736.jpeg',
                mediatype: 'image'
            };
            // const response = await uploadMedia(payload);
            // if (response.success) {
            //     setIsOpen(false);
            //     setIsSubmitting(false);
            // } else {
            //     setIsSubmitting(false);
            // }
        } catch (error: any) {
            console.error(error.message);
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
    }

    return (
        <>
            <Button
                onClick={handleOpen}
                variant='ghost'
                type='button'
                className='ml-auto w-fit font-semibold text-primary hover:text-primary'>
                <Camera className='mr-2 h-4 w-4' /> Add Photos
            </Button>

            {isOpen && (
                <AdaptiveDialog onClose={handleClose} isOpen={isOpen} size='xl' title='Add Photos' interactOutside={false}>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-1 text-sm'>
                            <div>
                                Upload media files to be displayed on the trip detail page. Supported file types are JPG, PNG, and PDF.
                            </div>
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='ghost' className='w-fit' disabled={isSubmitting} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button className='w-fit' loading={isSubmitting} onClick={handleSubmit}>
                            Upload Media
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
