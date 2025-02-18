'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FileInput, FileUploader } from '@/components/ui/extension/file-uploader';
import { env } from '@/env';
import { FileUploadDropzoneIcon } from '@/public/icons';
import axios from 'axios';
import { Camera, Files } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import type { DropzoneOptions } from 'react-dropzone';
import { toast } from 'sonner';

interface TripMediaUploadDialogProps {
    tripid: number;
    hostId: string | number | any;
    belongsTo: 'starting' | 'ending';
    hostTripStartingBlobs?: any[] | [];
    hostTripCompletingBlobs?: any[] | [];
}

export default function TripMediaUploadDialog({ tripid, hostId, belongsTo }: TripMediaUploadDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    function handleFileUpload(selectedFiles: File[] | null) {
        if (!selectedFiles) return;
        setFiles((prevFiles) => {
            const fileNames = prevFiles.map((file) => file.name.toLowerCase());
            const newFiles = selectedFiles.filter(
                (file) => !fileNames.includes(file.name.toLowerCase()) // Prevent duplicates
            );
            return [...prevFiles, ...newFiles];
        });
    }

    async function handleSubmit() {
        if (files.length === 0) return;

        setIsUploading(true);

        const session = await getSession();

        try {
            // Loop over files sequentially instead of running them all concurrently
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                const url = `${env.BOOKING_SERVICES_BASEURL}/v1/booking/uploadMediaFiles`;

                const formData = new FormData();
                const jsonData = {
                    tripId: tripid,
                    isUploadedByHost: true,
                    isUploadedAtStarting: belongsTo === 'starting',
                    url: '',
                    storageRef: '',
                    caption: '',
                    userId: hostId,
                    video: file.type.includes('video')
                };
                formData.append('json', JSON.stringify(jsonData));
                formData.append('hostid', hostId);
                formData.append('image', file);

                // Perform upload for each file
                await axios.post(url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        bundee_auth_token: session?.bundeeToken
                    }
                });
            }

            toast.success('File(s) uploaded successfully!');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error('Error uploading files', error);
            setIsUploading(false);
            setError('Error uploading files. Please try again later.');
        }
    }

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
        setFiles([]);
        setError('');
        setIsUploading(false);
    }

    const dropzone = {
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png']
        },
        multiple: true,
        maxFiles: 10,
        maxSize: 15 * 1024 * 1024
    } as DropzoneOptions;

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
                        <div className='flex flex-col gap-4 text-sm'>
                            <div>
                                Upload media files to be displayed on the trip detail page. Supported file types are JPG, PNG, and PDF.
                            </div>

                            <div className='flex w-full flex-col gap-4 overflow-hidden'>
                                <FileUploader
                                    value={files}
                                    onValueChange={handleFileUpload}
                                    dropzoneOptions={dropzone}
                                    className='relative h-40 rounded-lg '>
                                    <FileInput className='flex h-full flex-col items-center justify-center bg-muted'>
                                        <FileUploadDropzoneIcon />
                                        <p className='mb-1 text-muted-foreground text-sm'>
                                            <span className='font-semibold'>Click to upload vehicle photos</span>
                                            &nbsp; or drag and drop
                                        </p>
                                        <p className='text-muted-foreground text-xs'>SVG, PNG, JPG or GIF</p>
                                    </FileInput>
                                </FileUploader>

                                {error && <div className='mt-4 text-red-500 text-sm'>{error}</div>}
                            </div>

                            {files.length > 0 && (
                                <div className='flex items-center gap-4 text-base'>
                                    <Files />
                                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                                </div>
                            )}
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='ghost' className='w-fit' disabled={isUploading} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button className='w-fit' loading={isUploading} onClick={handleSubmit} loadingText='Uploading...'>
                            Upload Media
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
