'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { Textarea } from '@/components/ui/textarea';
import { PAGE_ROUTES } from '@/constants/routes';
import { sendMessageInChat } from '@/server/chat';
import { swapVehicle } from '@/server/trips';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import SwapVehicleCard from './swap-vehicle-card';
import useSwapDialog from './useSwapDialog';

const force = 'This action will immediately swap the current vehicle for the selected vehicle. The driver will be notified of this change.';
const propose = 'This action will send a request to the driver to swap vehicles. They will need to accept the swap proposal. ';

export default function SwapDialog() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comments, setComments] = useState('');
    const {
        isOpen,
        onClose,
        swapType,
        tripId,
        userId,
        hostId,
        currentVehicleDetails,
        newVehicleDetails,
        setCurrentVehicleDetails,
        setNewVehicleDetails
    } = useSwapDialog();

    function closeDialog() {
        setIsSubmitting(false);
        setCurrentVehicleDetails(null);
        setNewVehicleDetails(null);
        setComments('');
        onClose();
    }
    async function handleSubmit() {
        setIsSubmitting(true);

        const commonPayload = {
            tripId,
            userId,
            hostID: hostId,
            fromVehicleId: currentVehicleDetails.id,
            toVehicleid: newVehicleDetails.id,
            message: comments || '',
            changedBy: 'HOST'
        };

        const handleError = (message: string) => {
            toast.error(message);
            setIsSubmitting(false);
        };

        const handleSuccess = async (message: string) => {
            if (comments) await sendMessageInChat(tripId, comments);
            toast.success(message);
            closeDialog();
            router.replace(`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`);
        };

        try {
            const requestPayload = {
                ...commonPayload,
                statusCode: 'SWAPPR'
            };

            // propse swap request
            const response = await swapVehicle(requestPayload);

            if (!response.success) {
                return handleError(response.message);
            }

            // if it is force swap request then accept the swap request in behalf of the guest
            if (swapType === 'force') {
                const acceptPayload = {
                    ...commonPayload,
                    statusCode: 'SWAPACC'
                };

                const acceptResponse = await swapVehicle(acceptPayload);

                if (!acceptResponse.success) {
                    return handleError(acceptResponse.message);
                }

                await handleSuccess(acceptResponse.message);
            } else {
                await handleSuccess(response.message);
            }
        } catch (error: any) {
            handleError(error.message);
            console.error(error.message);
        } finally {
            setIsSubmitting(false);
            setComments('');
        }
    }

    return (
        <>
            {isOpen && (
                <AdaptiveDialog
                    isOpen={isOpen}
                    onClose={closeDialog}
                    title={swapType === 'force' ? 'Force Swap Vehicle' : 'Propose Vehicle Swap'}
                    className='lg:max-w-[1000px]'
                    interactOutside={false}>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <div className='text-muted-foreground text-sm'>{swapType === 'force' ? force : propose}</div>

                        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                            <div className='flex flex-col gap-2'>
                                <h4>Current Vehicle</h4>
                                <SwapVehicleCard vehicle={currentVehicleDetails} hideButtons />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <h4>NewVehicle</h4>
                                <SwapVehicleCard vehicle={newVehicleDetails} hideButtons />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Message <span className='text-muted-foreground'>(Optional)</span>
                            </Label>
                            <Textarea
                                autoFocus={false}
                                className='w-full'
                                placeholder=''
                                rows={2}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button type='button' onClick={closeDialog} variant='outline'>
                            Cancel
                        </Button>
                        <Button type='button' onClick={handleSubmit} loading={isSubmitting}>
                            {swapType === 'force' ? 'Confirm Swap' : 'Propose Swap'}
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
