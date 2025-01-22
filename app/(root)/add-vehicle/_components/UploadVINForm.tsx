'use client';

import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { PAGE_ROUTES } from '@/constants/routes';
import { env } from '@/env';
import { delay } from '@/lib/utils';
import { ExcelIcon } from '@/public/icons';
import { createVehicle } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { type SubmitHandler, type UseFormSetError, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface UploadVINFormProps {
    nextStep: () => void;
}

interface ExcelUploadData {
    fileName: string;
    b64Contents: string;
    hostId: number | undefined;
}

const schema = z.object({
    vin: z
        .string({ message: 'VIN is required' })
        .trim()
        .min(16, { message: 'VIN must be at least 17 characters' })
        .max(17, { message: 'VIN must be at most 17 characters' })
        .optional()
});

type FormFields = z.infer<typeof schema>;

export default function UploadVINForm({ nextStep }: UploadVINFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            vin: undefined
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        setError('root', { type: 'manual', message: undefined });

        try {
            const session = await getSession();
            const { vin } = formData;

            if (session?.iduser && vin) {
                const response = await createVehicle(session?.iduser, vin);

                if (response.success) {
                    toast.success(response.message);
                    //set url params
                    const generatedVIN = response.data.vehicles[0].vin;
                    const vehicleId = response.data.vehicles[0].id;

                    // Using the URL API to set parameters
                    const url = new URL(window.location.href);
                    url.searchParams.set('vin', generatedVIN);
                    url.searchParams.set('vehicleId', vehicleId);

                    // Update the URL without reloading the page
                    window.history.pushState({}, '', url.toString());
                    await delay(1000);
                    nextStep();
                } else {
                    setError('vin', { type: 'manual', message: response.message });
                }
            }
        } catch (error: any) {
            console.error('Error updating description:', error);
            toast.error('Error in updating description :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-4'>
                <CardTitle>Add VIN Details</CardTitle>
                <CardDescription>
                    Please enter the VIN number of the vehicle to be uploaded. <br className='hidden md:block' /> It will fetch all the
                    master vehicle data and display from the vehicle database.
                </CardDescription>

                <div className='flex w-full flex-col md:flex-row md:items-start md:justify-between md:gap-4'>
                    <div className='w-full space-y-2'>
                        <Label>Vehicle Identification Number (VIN)</Label>
                        <Input
                            placeholder='VIN'
                            {...register('vin')}
                            onPaste={(event) => {
                                event.preventDefault();
                                const clipboardText = event.clipboardData.getData('text/plain');
                                const trimmedText = clipboardText.trim();
                                (event.target as HTMLInputElement).value = trimmedText; // Set the trimmed value
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    const inputElement = event.target as HTMLInputElement;
                                    const trimmedValue = inputElement.value.trim();
                                    inputElement.value = trimmedValue; // Trim whitespace
                                }
                            }}
                            maxLength={17}
                        />
                        <FormError>{errors.vin?.message}</FormError>
                    </div>
                    <div className='my-auto flex items-center md:w-2/4'>
                        <div className='flex-1 border-muted-foreground/50 border-t' />
                        <span className=' px-3 text-muted-foreground/50'>OR</span>
                        <div className='flex-1 border-muted-foreground/50 border-t' />
                    </div>
                    <div className='flex w-full flex-col gap-2'>
                        <UploadExcelFile setError={setError} />
                        <a
                            href='/vehicle_upload_template.csv'
                            download={true}
                            className='text-12 text-muted-foreground underline underline-offset-2'>
                            Download Sample Template
                        </a>
                    </div>
                </div>

                {errors.root?.message && (
                    <div className='my-3 flex select-none items-center gap-4 rounded-md bg-red-50 p-3 dark:bg-red-200'>
                        <p className='font-medium text-red-600 text-sm'>{errors.root?.message}</p>
                    </div>
                )}
            </div>

            <div className='mt-6 flex justify-end'>
                <Button type='submit' variant='black' loading={isSubmitting} suffix={<ArrowRight className='size-4' />}>
                    Next
                </Button>
            </div>
        </form>
    );
}

function UploadExcelFile({ setError }: { setError: UseFormSetError<FormFields> }) {
    const router = useRouter();
    const [uploading, setUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            const file = event.target?.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    if (!e.target?.result) {
                        throw new Error('Failed to read file.');
                    }
                    const b64Contents = Buffer.from(new Uint8Array(e.target.result as ArrayBuffer)).toString('base64');

                    const uploadData = {
                        fileName: file.name,
                        b64Contents
                    };

                    await bulkUpload(uploadData);
                    resetFileInput(); // Reset the file input after processing
                };
                reader.readAsArrayBuffer(file);
            } else {
                setError('root', { type: 'manual', message: 'Please select a file' });
            }
        } catch (error) {
            console.error('Error in reading file:', error);
            setError('root', { type: 'manual', message: 'Something went wrong! Please try again.' });
            resetFileInput(); // Reset the file input on error
        }
    }

    async function bulkUpload(uploadData: { fileName: string; b64Contents: string }) {
        setUploading(true);
        setError('root', { type: 'manual', message: undefined });
        try {
            const session = await getSession();

            const url = `${env.NEXT_PUBLIC_HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/createVehiclesWithImageByCsv`;

            const payload: ExcelUploadData = {
                ...uploadData,
                hostId: session?.iduser
            };

            const response = await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    bundee_auth_token: session?.bundeeToken
                }
            });

            // Ensure response.data exists and is an object
            if (!response || !response.data) {
                throw new Error('Invalid response data');
            }

            const {
                errorCode = '0',
                errorMessage = '',
                failedVins = [],
                unavailableDbVins = [],
                wrongVins = [],
                duplicateVins = []
            } = response.data;

            if (errorCode === '1') {
                // Initialize an array to collect error messages
                const errorMessages: string[] = [];

                // Add the main error message
                if (errorMessage) {
                    errorMessages.push(`Upload failed: ${errorMessage}`);
                }

                // Helper function to add VIN-related errors
                const addVinErrors = (vins: string[], message: string) => {
                    if (vins.length > 0) {
                        errorMessages.push(`${message}: ${vins.join(', ')}`);
                    }
                };

                // Add VIN-related errors to the array
                addVinErrors(failedVins, 'Failed VINs');
                addVinErrors(unavailableDbVins, 'Unavailable DB VINs');
                addVinErrors(wrongVins, 'Wrong VINs');
                addVinErrors(duplicateVins, 'Duplicate VINs');

                // Combine all error messages and assign to setError
                setError('root', { type: 'manual', message: errorMessages.join('\n') });

                return; // Exit if there's an error
            }

            // If no errorCode, assume success
            toast.success('Successfully uploaded vehicles!');
            router.replace(PAGE_ROUTES.VEHICLES);
        } catch (error: any) {
            console.error('Error in bulk upload:', error);

            setError('root', {
                type: 'manual',
                message: `Something went wrong! Please try again. ${error.message}`
            });
        } finally {
            setUploading(false);
        }
    }

    function resetFileInput() {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset the input value
        }
    }

    return (
        <div className='w-full space-y-2'>
            <Label className='flex items-center gap-2'>
                Upload Excel File <ExcelIcon className='mr-2 size-6' />
            </Label>
            <Input
                ref={fileInputRef}
                disabled={uploading}
                id='excel-upload'
                type='file'
                accept='.csv'
                className='cursor-pointer'
                onChange={handleFileChange}
            />
            {uploading && <div className='mt-4 w-full space-y-2'>Uploading...</div>}
        </div>
    );
}
