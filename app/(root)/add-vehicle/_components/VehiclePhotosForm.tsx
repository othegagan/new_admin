import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { FileInput, FileUploader } from '@/components/ui/extension/file-uploader';
import { Progress } from '@/components/ui/progress';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { QUERY_KEYS } from '@/constants/query-keys';
import { env } from '@/env';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { FileUploadDropzoneIcon } from '@/public/icons';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { closestCorners } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Star, Trash2 } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { DropzoneOptions } from 'react-dropzone';
import { TiStarFullOutline } from 'react-icons/ti';
import { toast } from 'sonner';

interface VehiclePhotosFormProps {
    nextStep: () => void;
    previousStep: () => void;
    alreadyUploaded: boolean;
}

export default function VehiclePhotosForm({ nextStep, previousStep, alreadyUploaded }: VehiclePhotosFormProps) {
    const searchParams = useSearchParams();
    const vin = searchParams.get('vin');
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId || !vin) {
        return <div>Error: Invalid vehicle ID or VIN</div>;
    }

    const queryClient = useQueryClient();

    const refetchData = async () => {
        await queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
    };

    const { data: response, isLoading, error } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoading) {
        return (
            <div className='flex h-full w-full flex-col items-center justify-center'>
                <CarLoadingSkeleton />
            </div>
        );
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
            <PhotoRearrangeForm
                vehicleId={Number(vehicleId)}
                vehicleImages={images}
                refetchData={refetchData}
                nextStep={nextStep}
                previousStep={previousStep}
                alreadyUploaded={alreadyUploaded}
            />
        </div>
    );
}

interface PhotoRearrangeFormProps {
    vehicleId: number;
    vehicleImages: any[];
    refetchData: () => void;
    nextStep: () => void;
    previousStep: () => void;
    alreadyUploaded: boolean;
}

function PhotoRearrangeForm({ vehicleId, vehicleImages, refetchData, nextStep, previousStep }: PhotoRearrangeFormProps) {
    const [images, setImages] = useState<any[]>(vehicleImages);

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

    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
    const [uploading, setUploading] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const dropzone = {
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png']
        },
        multiple: true,
        maxFiles: 20
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

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    bundee_auth_token: session?.bundeeToken
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

            toast.success('Image uploaded successfully!', { duration: 1000 });
            setUploading((prev) => {
                const updatedUploading = new Set(prev);
                updatedUploading.delete(index);
                return updatedUploading;
            });
            refetchData();
            setFiles([]);
        } catch (error: any) {
            console.error('Error uploading file', error);
            toast.error('Error uploading file. Please try again later.');
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
        <main className='space-y-4'>
            <CardTitle>Vehicle Photos</CardTitle>

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
            <hr />

            <Sortable orientation='mixed' collisionDetection={closestCorners} value={images} onValueChange={rearrangeImages}>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4'>
                    {images.map((image: any) => (
                        <SortableItem key={image.id} value={image.id} asChild>
                            <div className='overflow-hidden rounded-md border'>
                                <SortableDragHandle
                                    variant='ghost'
                                    size='icon'
                                    className='flex h-32 w-full flex-col items-center justify-center'>
                                    <img src={image.imagename} alt={` ${image.id}`} className='h-full w-full object-cover object-center' />
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

            <div className='mt-6 flex items-center justify-between gap-x-6'>
                <Button onClick={previousStep} variant='outline'>
                    <ArrowLeft className='size-4' /> Prev
                </Button>

                <Button onClick={nextStep} variant='black' suffix={<ArrowRight className='size-4' />}>
                    Next
                </Button>
            </div>
        </main>
    );
}
