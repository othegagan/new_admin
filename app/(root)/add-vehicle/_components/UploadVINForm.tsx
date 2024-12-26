'use client';

import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { delay } from '@/lib/utils';
import { ExcelIcon } from '@/public/icons';
import { createVehicle } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface UploadVINFormProps {
    nextStep: () => void;
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
    const [excelFile, setExcelFile] = useState<File | null>(null);

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
                        <div className='flex-1 border-neutral-300 border-t' />
                        <span className=' px-3 text-neutral-500'>OR</span>
                        <div className='flex-1 border-neutral-300 border-t' />
                    </div>
                    <div className='flex w-full flex-col gap-2'>
                        <UploadExcelFile nextStep={nextStep} setError={setError} />
                        <Link href='as' download={true} className='text-12 underline underline-offset-2'>
                            Download Sample Template
                        </Link>
                    </div>
                </div>

                <FormError>{errors.root?.message}</FormError>
            </div>

            <div className='mt-6 flex justify-end'>
                <Button type='submit' variant='black' loading={isSubmitting} suffix={<ArrowRight className='size-4' />}>
                    Next
                </Button>
            </div>
        </form>
    );
}

function UploadExcelFile({
    nextStep,
    setError
}: {
    nextStep: () => void;
    setError: any;
}) {
    const router = useRouter();

    const [excelUpload, setExcelUpload] = useState({});

    const branchIDCode = 1;

    async function handleFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== 'text/csv') {
                setError('root', {
                    type: 'manual',
                    message: 'Please select a CSV file'
                });
                return;
            }

            const session = await getSession();
            const reader: any = new FileReader();

            reader.onload = () => {
                setTimeout(() => {
                    const b64Contents = btoa(reader.result.toString());
                    setExcelUpload({
                        fileName: file.name,
                        b64Contents,
                        branchId: branchIDCode,
                        hostId: session?.iduser
                    });
                    bulkUpload();
                }, 500);
            };

            reader.readAsBinaryString(file);
        } else {
            setError('root', { type: 'manual', message: 'Please select a file' });
        }
    }

    async function bulkUpload() {
        // if (branchIDCode === -1) {
        //     toastService.showWarning('Please select a branch');
        //     return;
        // }
        // const uploadData = { ...excelUpload, branchId: branchIDCode };
        // try {
        //     const response = await restService.vehiclesPost('/api/v1/vehicle/createVehiclesWithImageByCsv', uploadData);
        //     const { failedVins, unavailableDbVins, wrongVins, duplicateVins } = response.data;
        //     let isHavingError = false;
        //     const showErrorMessages = (vins: any[], message: string) => {
        //         if (vins.length > 0) {
        //             isHavingError = true;
        //             setError('root', { type: 'manual', message: `${message} ${vins.join(', ')}` });
        //         }
        //     };
        //     showErrorMessages(failedVins, 'Failed VINs!!!');
        //     showErrorMessages(unavailableDbVins, 'Unavailable Db VINs!!!');
        //     showErrorMessages(wrongVins, 'Wrong VINs!!!');
        //     showErrorMessages(duplicateVins, 'Duplicate VINs!!!');
        //     if (!isHavingError) {
        //         toast.success('Successfully Added CSV records!!!');
        //         router.replace('/vehicles');
        //     }
        // } catch (error) {
        //     setError('root', { type: 'manual', message: 'Something went wrong!!!, please try again' });
        // }
    }

    return (
        <div className='w-full space-y-2'>
            <Label className='flex items-center gap-2'>
                Upload Excel File <ExcelIcon className='mr-2 size-6' />
            </Label>
            <Input id='picture' type='file' accept='.csv' className='cursor-pointer' onChange={handleFileChange} />
        </div>
    );
}
