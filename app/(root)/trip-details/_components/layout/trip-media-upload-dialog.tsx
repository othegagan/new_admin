'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { env } from '@/env';
import axios from 'axios';
import { Camera, ImageIcon, RotateCcw, X } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { toast } from 'sonner';

interface TripMediaUploadDialogProps {
    tripid: number;
    hostId: string | number | any;
    belongsTo: 'starting' | 'ending';
    hostTripStartingBlobs?: any[] | [];
    hostTripCompletingBlobs?: any[] | [];
}

const MAX_IMAGES = 10;

export default function TripMediaUploadDialog({ tripid, hostId, belongsTo }: TripMediaUploadDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [showCamera, setShowCamera] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: 'environment' // Default to back camera for better photos
    };

    const capture = useCallback(() => {
        if (webcamRef.current && selectedImages.length < MAX_IMAGES) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setSelectedImages((prev) => [...prev, imageSrc]);
                // Show success toast
                toast.success('Photo captured successfully');
            }
        }
    }, [selectedImages]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const remainingSlots = MAX_IMAGES - selectedImages.length;
            const filesToProcess = Array.from(files).slice(0, remainingSlots);

            if (filesToProcess.length + selectedImages.length > MAX_IMAGES) {
                toast.warning(`You can only select up to ${MAX_IMAGES} images`);
            }

            filesToProcess.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setSelectedImages((prev) => [...prev, e.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
        event.target.value = '';
    };

    async function handleSubmit() {
        if (selectedImages.length === 0) {
            toast.error('Please select at least one image');
            return;
        }

        setIsUploading(true);
        const session = await getSession();

        try {
            // Convert base64 images to files
            const imageFiles = await Promise.all(
                selectedImages.map(async (base64, index) => {
                    const response = await fetch(base64);
                    const blob = await response.blob();
                    return new File([blob], `image-${index}.jpg`, { type: 'image/jpeg' });
                })
            );

            const url = `${env.BOOKING_SERVICES_BASEURL}/v1/booking/uploadMediaFiles`;

            // Upload each file sequentially
            for (const file of imageFiles) {
                const formData = new FormData();
                const jsonData = {
                    tripId: tripid,
                    isUploadedByHost: true,
                    isUploadedAtStarting: belongsTo === 'starting',
                    url: '',
                    storageRef: '',
                    caption: '',
                    userId: hostId,
                    video: false
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

            toast.success('All images uploaded successfully!');
            handleClose();
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error('Error uploading files', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Failed to upload images. Please try again. ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    }

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
        setIsUploading(false);
        setSelectedImages([]);
        setShowCamera(false);
        setIsCameraReady(false);
    }

    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        // toast.info('Photo removed');
    };

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
                <AdaptiveDialog
                    onClose={handleClose}
                    isOpen={isOpen}
                    size='xl'
                    title={`Add Photos (${selectedImages.length}/${MAX_IMAGES})`}
                    interactOutside={false}
                    description='You can upload up to 10 photos at once.'>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <div className='grid gap-4'>
                            {/* Selected Images Grid */}
                            {selectedImages.length > 0 && (
                                <div className='grid grid-cols-4 gap-4 md:grid-cols-5'>
                                    {selectedImages.map((image, index) => (
                                        <div key={index} className='group relative aspect-square'>
                                            <img
                                                src={image}
                                                alt={`Selected media ${index + 1}`}
                                                className='h-full w-full rounded-lg object-cover'
                                            />
                                            <button
                                                type='button'
                                                onClick={() => removeImage(index)}
                                                className='absolute top-2 right-2 rounded-full bg-destructive/90 p-1.5 text-destructive-foreground transition-colors hover:bg-destructive'>
                                                <X className='h-4 w-4' />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Camera View */}
                            {showCamera && (
                                <div className='grid gap-4'>
                                    <div className='relative aspect-video overflow-hidden rounded-md bg-muted'>
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat='image/jpeg'
                                            videoConstraints={videoConstraints}
                                            onUserMedia={() => setIsCameraReady(true)}
                                            className='h-full w-full object-cover'
                                        />
                                        <div className='absolute right-0 bottom-4 left-0 flex justify-center gap-4'>
                                            <Button
                                                onClick={capture}
                                                disabled={!isCameraReady || selectedImages.length >= MAX_IMAGES}
                                                className='w-fit rounded-full bg-white/90 hover:bg-white'>
                                                <Camera className='h-6 w-6 text-primary' />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Selection Buttons */}
                            {!showCamera && selectedImages.length < MAX_IMAGES && (
                                <div className='grid grid-cols-2 gap-4'>
                                    <Button
                                        onClick={() => setShowCamera(true)}
                                        variant='outline'
                                        className='flex h-auto flex-col gap-2 rounded-md py-6 md:w-full'>
                                        <Camera className='h-8 w-8' />
                                        <span>Take Photo</span>
                                    </Button>
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant='outline'
                                        className='flex h-auto flex-col gap-2 rounded-md py-6 md:w-full'>
                                        <ImageIcon className='h-8 w-8' />
                                        <span>Choose from Gallery</span>
                                    </Button>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        multiple
                                        className='hidden'
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            )}
                        </div>
                    </AdaptiveBody>

                    <AdaptiveFooter>
                        {showCamera ? (
                            <>
                                <Button variant='ghost' onClick={() => setShowCamera(false)} className='flex-1'>
                                    Back
                                </Button>
                                <Button
                                    variant='default'
                                    onClick={capture}
                                    disabled={!isCameraReady || selectedImages.length >= MAX_IMAGES}
                                    className='flex-1'>
                                    Capture Photo
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className='flex gap-2'>
                                    <Button variant='ghost' onClick={handleClose} disabled={isUploading}>
                                        Back to Trip
                                    </Button>
                                    {selectedImages.length > 0 && (
                                        <Button
                                            variant='outline'
                                            onClick={() => setSelectedImages([])}
                                            disabled={isUploading}
                                            className='gap-2'>
                                            <RotateCcw className='h-4 w-4' />
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                                <Button
                                    variant='default'
                                    onClick={handleSubmit}
                                    disabled={selectedImages.length === 0 || isUploading}
                                    loading={isUploading}
                                    loadingText='Uploading...'
                                    className='gap-2'>
                                    Upload {selectedImages.length > 0 ? `(${selectedImages.length})` : ''}
                                </Button>
                            </>
                        )}
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
