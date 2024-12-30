'use client';

import { Main } from '@/components/layout/main';
import { Badge } from '@/components/ui/badge';
import { CircleCheckBig, Dot } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ConfirmCancelDialog from './_components/ConfirmCancelDialog';
import CopyVehicleData from './_components/CopyVehicleData';
import Description from './_components/Description';
import GuestGuidelines from './_components/GuestGuidelines';
import LocationDelivery from './_components/LocationDelivery';
import MasterDataForm from './_components/MasterDataForm';
import MileageLimits from './_components/MileageLimits';
import PricingAndDiscount from './_components/PricingAndDiscount';
import RentalDuration from './_components/RentalDuration';
import Status from './_components/Status';
import UploadVINForm from './_components/UploadVINForm';
import VehiclePhotosForm from './_components/VehiclePhotosForm';

const steps = [
    { id: 0, name: 'Upload VIN Data', step: 0 },
    { id: 1, name: 'Master Vehicle Data', step: 1 },
    { id: 2, name: 'Import Vehicle', step: 2 },
    { id: 3, name: 'Pricing & Discounts', step: 3 },
    { id: 4, name: 'Vehicle Photos', step: 4 },
    { id: 5, name: 'Vehicle Description', step: 5 },
    { id: 6, name: 'Guest Guidelines', step: 6 },
    { id: 7, name: 'Location & Delivery', step: 7 },
    { id: 8, name: 'Mileage Limits', step: 8 },
    { id: 9, name: 'Rental Duration', step: 9 },
    { id: 10, name: 'Vehicle Status', step: 10 }
];

export default function CreateVehiclePage() {
    const searchParams = useSearchParams();

    const alreadyUploaded = searchParams.get('alreadyUploaded') === 'true' || false;

    const [previousStep, setPreviousStep] = useState(0);
    const [currentStep, setCurrentStep] = useState(alreadyUploaded ? 1 : 0);

    function nextStep() {
        if (currentStep < steps.length - 1) {
            setPreviousStep(currentStep);
            setCurrentStep((step) => step + 1);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            setPreviousStep(currentStep);
            setCurrentStep((step) => step - 1);
        }
    }

    return (
        <Main fixed className='relative mx-auto flex w-full max-w-6xl flex-col md:flex-row'>
            {/* Sidebar with steps */}
            <div className='md:w-1/4'>
                <div className='mb-4 flex items-center gap-4 md:mb-10'>
                    <ConfirmCancelDialog />
                    <h4>Add Vehicle</h4>
                </div>
                <div aria-label='Progress' className='hidden md:block'>
                    {steps.map((step, index) => (
                        <div key={step.id} className='relative flex pb-6'>
                            {index !== steps.length - 1 && (
                                <div className='absolute inset-0 flex h-full w-6 items-center justify-center'>
                                    <div
                                        className={`h-full w-0.5 ${index < currentStep ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-600'} pointer-events-none`}
                                    />
                                </div>
                            )}

                            {index < currentStep ? (
                                <div className='relative z-10 inline-flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-background'>
                                    <CircleCheckBig className='size-4 text-background' />
                                </div>
                            ) : index === currentStep ? (
                                <div className='relative z-10 inline-flex size-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-primabg-primary bg-background'>
                                    <Dot className='size-10 text-primabg-primary' />
                                </div>
                            ) : (
                                <div className='relative z-10 inline-flex size-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-neutral-400 bg-background text-neutral-400' />
                            )}

                            <div className='flex-grow pt-1 pl-3'>
                                <div
                                    className={`font-medium text-sm ${index <= currentStep ? 'text-neutral-900 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-600'}`}>
                                    {step.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content area */}
            <div className='min-h-[50%] overflow-y-auto rounded-md md:flex md:flex-1 md:flex-col md:gap-6 md:border md:px-6 md:py-10'>
                <div className='mb-4 flex items-center gap-4'>
                    <Badge variant='outline'>
                        Step {currentStep + 1} of {steps.length}
                    </Badge>

                    {currentStep !== steps.length - 1 ? (
                        <p className='text-neutral-500 text-xs'>Next - {steps[currentStep + 1]?.name}</p>
                    ) : null}
                </div>

                {currentStep === 0 && <UploadVINForm nextStep={nextStep} />}

                {currentStep === 1 && <MasterDataForm nextStep={nextStep} alreadyUploaded={alreadyUploaded} />}

                {currentStep === 2 && <CopyVehicleData nextStep={nextStep} previousStep={prevStep} />}

                {currentStep === 3 && <PricingAndDiscount nextStep={nextStep} previousStep={prevStep} />}

                {currentStep === 4 && <VehiclePhotosForm nextStep={nextStep} previousStep={prevStep} alreadyUploaded={alreadyUploaded} />}

                {currentStep === 5 && <Description nextStep={nextStep} previousStep={prevStep} />}

                {currentStep === 6 && <GuestGuidelines nextStep={nextStep} previousStep={prevStep} />}

                {currentStep === 7 && <LocationDelivery nextStep={nextStep} previousStep={prevStep} />}

                {currentStep === 8 && <MileageLimits nextStep={nextStep} previousStep={prevStep} />}

                {currentStep === 9 && <RentalDuration nextStep={nextStep} previousStep={prevStep} />}

                {currentStep === 10 && <Status previousStep={prevStep} alreadyUploaded={alreadyUploaded} />}
            </div>
        </Main>
    );
}
