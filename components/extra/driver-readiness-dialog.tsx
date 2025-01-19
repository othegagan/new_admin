'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PAGE_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { CircleCheck, CircleX } from 'lucide-react';
import Link from 'next/link';

interface DriverReadinessDialogProps {
    className?: string;
    isLicenceVerified: boolean;
    isPhoneVerified: boolean;
    isRentalAgreed?: boolean;
    isInsuranceVerified?: boolean;
    tripId?: number;
    userName: string;
    userId: number;
    avatarSrc: string | null;
}

const readyText = 'Ready to Drive';
const notReadyText = 'Not Ready to Drive';

const readyDescription = 'All checks passed and the guest is ready to drive.';
const notReadyDescription = 'Some checks did not pass or are pending, and the guest is not ready to drive.';

export default function DriverReadinessDialog({
    className,
    isLicenceVerified,
    isPhoneVerified,
    isRentalAgreed,
    tripId,
    userId,
    userName,
    avatarSrc
}: DriverReadinessDialogProps) {
    const isReadyToDrive = isLicenceVerified && isPhoneVerified && (isRentalAgreed === undefined || isRentalAgreed);

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <button
                        type='button'
                        className={cn(
                            'w-fit rounded px-2 py-1 font-medium text-white text-xs md:px-5 lg:text-[14px]',
                            isReadyToDrive ? 'bg-[#146439]' : 'bg-[#641414]',
                            className
                        )}>
                        {isReadyToDrive ? readyText : notReadyText}
                    </button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle className='text-left'>Driver Checklist</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col gap-4'>
                        <p className='text-muted-foreground text-sm'>{isReadyToDrive ? readyDescription : notReadyDescription}</p>

                        <div className='w-full flex-between gap-4'>
                            {tripId && <div>Trip: #{tripId}</div>}
                            <div className='flex items-center gap-4'>
                                <Link
                                    prefetch={false}
                                    href={`${PAGE_ROUTES.GUESTS}/${userId}`}
                                    className='flex items-center gap-4 hover:underline hover:underline-offset-2'>
                                    <div className='relative size-9 overflow-hidden rounded-full border md:size-10'>
                                        <img
                                            src={avatarSrc || '/images/dummy_avatar.png'}
                                            alt={userName}
                                            className='h-full w-full object-cover object-center'
                                        />
                                    </div>
                                    <div className='font-light md:font-medium md:text-base'>{userName}</div>
                                </Link>
                            </div>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <CheckListItem className='flex-1' text="Driver's Licence Verification" checkMark={isLicenceVerified} />
                            <CheckListItem className='flex-1' text='Phone Number Verification' checkMark={isPhoneVerified} />
                            {isRentalAgreed !== undefined && (
                                <CheckListItem className='flex-1' text='Rental Agreement' checkMark={isRentalAgreed} />
                            )}
                            {/* <CheckListItem className='flex-1' text='Insurance Verified' checkMark={isInsuranceVerified} /> */}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function CheckListItem({ className, text, checkMark }: { className?: string; text: string; checkMark: boolean }) {
    return (
        <div className={cn('flex items-center gap-4', className)}>
            {checkMark ? <CircleCheck className='text-green-500' /> : <CircleX className='text-red-500' />}
            {text}
        </div>
    );
}
