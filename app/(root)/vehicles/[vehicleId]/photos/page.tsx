'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { FileInput, FileUploader } from '@/components/ui/extension/file-uploader';
import { Progress } from '@/components/ui/progress';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { vehicleConfigTabsContent } from '@/constants';
import { QUERY_KEYS } from '@/constants/query-keys';
import { env } from '@/env';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { FileUploadDropzoneIcon } from '@/public/icons';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { closestCorners } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Star, Trash2 } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { DropzoneOptions } from 'react-dropzone';
import { TiStarFullOutline } from 'react-icons/ti';
import { toast } from 'sonner';
import SubHeader from '../../_components/layout/subheader';

export default function PhotosPage() {
    const { vehicleId } = useParams();

    const { data: response, isLoading, error } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!response?.success) {
        return <div>Error: {response?.message}</div>;
    }

    let images = response?.data?.vehicleAllDetails[0]?.imageresponse || [];
    images = images
        .sort((a: { orderNumber: number }, b: { orderNumber: number }) => a.orderNumber - b.orderNumber)
        .map((image: any) => ({
            id: image.idimage,
            vehicleid: image.vehicleid,
            imagename: image.imagename,
            userid: image.userid,
            isactive: image.isactive,
            createdate: image.createdate,
            updatedate: image.updatedate,
            imageNumber: image.imageNumber,
            imageUuid: image.imageUuid,
            orderNumber: image.orderNumber,
            isPrimary: image.isPrimary
        }));

    return (
        <div className='flex flex-col gap-4'>
            <SubHeader title={vehicleConfigTabsContent.photos.title} description={vehicleConfigTabsContent.photos.description} />
            <PhotoRearrangeForm vehicleId={Number(vehicleId)} vehicleImages={images} />
        </div>
    );
}

interface PhotoRearrangeFormProps {
    vehicleId: number;
    vehicleImages: any[];
}

function PhotoRearrangeForm({ vehicleId, vehicleImages }: PhotoRearrangeFormProps) {
    const [images, setImages] = useState<any[]>(vehicleImages);
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
    const [uploading, setUploading] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const queryClient = useQueryClient();

    useEffect(() => {
        setImages(vehicleImages);
    }, [vehicleImages]);

    function updateOrderNumbers(updatedImages: any[]) {
        return updatedImages.map((image: any, index: number) => ({
            ...image,
            orderNumber: index + 1
        }));
    }

    async function rearrangeImages(rearrangedImages: any[]) {
        try {
            const updatedImages = updateOrderNumbers(rearrangedImages);
            setImages(updatedImages);

            const payload = {
                deleteImageIds: [],
                images: updatedImages.map((image) => ({
                    orderNumber: image.orderNumber,
                    imagename: image.imagename,
                    imageUuid: image.id
                })),
                primaryPicture: updatedImages.find((image) => image.isPrimary)?.orderNumber,
                vehicleId: vehicleId
            };

            toast.promise(
                updateVehicleFeaturesById({
                    type: 'update_photos',
                    payload
                }),
                {
                    loading: 'Rearranging photos...',
                    success: (response) => {
                        if (response.success) refetchData();
                        return response.message;
                    },
                    error: (error) => `Error: ${error.message}`
                }
            );
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    async function handleDelete(id: number) {
        try {
            const imagesClone = images.filter((image: any) => image.id !== id);
            if (imagesClone.length > 0 && !imagesClone.some((image: any) => image.isPrimary)) {
                imagesClone[0].isPrimary = true;
            }
            const updatedImages = updateOrderNumbers(imagesClone);

            const payload = {
                deleteImageIds: [id],
                images: updatedImages.map((image) => ({
                    orderNumber: image.orderNumber,
                    imagename: image.imagename,
                    imageUuid: image.id
                })),
                primaryPicture: updatedImages.find((image) => image.isPrimary)?.orderNumber,
                vehicleId: vehicleId
            };

            toast.promise(
                updateVehicleFeaturesById({
                    type: 'update_photos',
                    payload
                }),
                {
                    loading: 'Deleting photo...',
                    success: (response) => {
                        if (response.success) {
                            setImages(imagesClone);
                            refetchData();
                        }
                        return response.message;
                    },
                    error: (error) => `Error: ${error.message}`
                }
            );
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    async function makePrimary(id: number) {
        try {
            const imagesClone = images.map((image: any) => ({
                ...image,
                isPrimary: image.id === id
            }));
            const updatedImages = updateOrderNumbers(imagesClone);

            const payload = {
                deleteImageIds: [],
                images: updatedImages.map((image) => ({
                    orderNumber: image.orderNumber,
                    imagename: image.imagename,
                    imageUuid: image.id
                })),
                primaryPicture: updatedImages.find((image) => image.id === id)?.orderNumber,
                vehicleId: vehicleId
            };

            toast.promise(
                updateVehicleFeaturesById({
                    type: 'update_photos',
                    payload
                }),
                {
                    loading: 'Making primary...',
                    success: (response) => {
                        if (response.success) refetchData();
                        return response.message;
                    },
                    error: (error) => `Error: ${error.message}`
                }
            );
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const refetchData = async () => {
        await queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
    };

    const dropzone = {
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png']
        },
        multiple: true,
        maxFiles: 20,
        maxSize: 15 * 1024 * 1024
    } as DropzoneOptions;

    function handleFileUpload(newFiles: File[] | null) {
        if (newFiles) {
            setFiles(newFiles);
            newFiles.forEach((file, index) => uploadFile(file, index));
        }
    }

    async function uploadFile(file: File, index: number) {
        try {
            const session = await getSession();
            const url = `${env.NEXT_PUBLIC_HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/uploadVehicleImage`;

            const formData = new FormData();
            formData.append(`${vehicleId},${session?.iduser}`, file);

            await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    bundee_auth_token: session?.bundeeToken || ''
                },
                onUploadProgress: (progressEvent) => {
                    //@ts-ignore
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setUploadProgress((prevProgress) => ({
                        ...prevProgress,
                        [index]: progress
                    }));
                }
            });

            toast.success('Image uploaded successfully!', { duration: 300 });
            setUploading((prev) => {
                const updatedUploading = new Set(prev);
                updatedUploading.delete(index);
                return updatedUploading;
            });
            refetchData();
            setFiles([]);
        } catch (error: any) {
            console.error('Error uploading file', error);
            setError('Error uploading file. Please try again later.');
            setUploading((prev) => {
                const updatedUploading = new Set(prev);
                for (let i = 0; i < files.length; i++) {
                    updatedUploading.delete(i);
                }
                return updatedUploading;
            });
        }
    }

    return (
        <main className='grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-10'>
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
                {files.length > 0 && (
                    <div className='mt-4 w-full space-y-2'>
                        <div className='flex justify-between text-sm'>
                            <span>
                                {files.length} file{files.length !== 1 ? 's' : ''} selected
                            </span>
                            <span>
                                {Object.values(uploadProgress).filter((p) => p === 100).length} / {files.length} uploaded
                            </span>
                        </div>
                        <Progress
                            value={(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / (files.length * 100)) * 100}
                            className='h-2'
                        />
                    </div>
                )}
                {error && <div className='mt-4 text-red-500 text-sm'>{error}</div>}
            </div>

            <div className='col-span-2'>
                <Sortable orientation='mixed' collisionDetection={closestCorners} value={images} onValueChange={rearrangeImages}>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4'>
                        {images?.map((image: any) => (
                            <SortableItem key={image.id} value={image.id} asChild>
                                <div className='overflow-hidden rounded-md border'>
                                    <SortableDragHandle
                                        variant='ghost'
                                        size='icon'
                                        className='flex h-32 w-full flex-col items-center justify-center'>
                                        <img
                                            src={image.imagename}
                                            alt={` ${image.id}`}
                                            className='aspect-16/9 h-full w-full object-cover object-center'
                                        />
                                    </SortableDragHandle>
                                    <div className='flex w-full justify-between px-1.5 py-0.5'>
                                        <Button variant='ghost' size='icon' type='button' onClick={() => makePrimary(image.id)}>
                                            {image.isPrimary ? (
                                                <TiStarFullOutline className='size-6 text-yellow-400' />
                                            ) : (
                                                <Star className='size-5 text-neutral-300' />
                                            )}
                                        </Button>
                                        <Button variant='ghost' size='icon' type='button' onClick={() => handleDelete(image.id)}>
                                            <Trash2 className='size-5 text-red-400' />
                                        </Button>
                                    </div>
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </Sortable>
            </div>
        </main>
    );
}
