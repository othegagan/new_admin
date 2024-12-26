import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

export const shimmer =
    'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-black/10 before:to-transparent';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('rounded-md bg-neutral-200 dark:bg-neutral-700', shimmer, className)} {...props} />;
}

export function ChatHeaderSkeleton() {
    return (
        <div className='flex gap-3'>
            <div className='flex items-center gap-2 md:px-4 md:py-1 lg:gap-4'>
                <div className={`${shimmer} size-14 rounded-full bg-neutral-200 dark:bg-neutral-700`} />

                <div className='flex flex-col gap-2'>
                    <div className={`${shimmer} h-6 w-40 rounded bg-neutral-200 dark:bg-neutral-700`} />
                    <div className={`${shimmer} h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-700`} />
                </div>
            </div>
        </div>
    );
}

export function CardsSkeleton({ className }: { className?: string }) {
    return <Skeleton className={cn('h-[190px] w-[400px] rounded-[20px] lg:w-full', className)} />;
}

export function DrivingLicenseSkeleton() {
    return (
        <>
            <h4 className='mb-4 font-semibold text-xl'>Driver's License</h4>

            <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-6'>
                <div className='grid grid-cols-2 gap-4 md:col-span-4 md:grid-cols-3'>
                    <div>
                        <p className='mb-2 font-medium text-sm'>Selfie</p>
                        <div className={`${shimmer} aspect-[3/2] rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                    </div>
                    <div>
                        <p className='mb-2 font-medium text-sm'>Driver's License Front</p>
                        <div className={`${shimmer} aspect-[3/2] rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                    </div>
                    <div>
                        <p className='mb-2 font-medium text-sm'>Driver's License Back</p>
                        <div className={`${shimmer} aspect-[3/2] rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                    </div>
                </div>

                <div className='gap-6 md:col-span-2'>
                    <p className='mb-2 font-medium text-sm'>Extracted Details</p>

                    <div className='space-y-2'>
                        <div className={`${shimmer} h-5 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                        <div className={`${shimmer} h-5 w-[70%] rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                        <div className={`${shimmer} h-5 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                        <div className={`${shimmer} h-5 w-[70%] rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                        <div className={`${shimmer} h-5 w-[90%] rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className={`${shimmer} h-16 rounded-lg bg-neutral-200 dark:bg-neutral-700`} />
                ))}
            </div>
        </>
    );
}

export function DriverProfileSkeleton() {
    return (
        <>
            <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
                <div className='flex items-center gap-4'>
                    <div className={`size-24 rounded-md lg:size-28 ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                    <div className='flex flex-1 flex-col gap-2'>
                        <div className={`h-10 w-[200px] rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                        <div className={`h-5 rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                        <div className={`h-5 rounded-md ${shimmer} hidden bg-neutral-200 md:block dark:bg-neutral-700`} />
                        <div className='mt-1 flex items-center gap-2'>
                            <div className={`w-10 rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                            <div className={`w-10 rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                        </div>
                        <div className={`w-10 rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                    </div>
                </div>
                <Card className='w-full md:max-w-xs'>
                    <CardContent className='space-y-3 p-4'>
                        <div className={`h-8 w-[60%] rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                        <div className={`h-10 w-[80%] rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                    </CardContent>
                </Card>
            </div>

            <div>
                <h4 className='mb-4 font-semibold text-lg'>Personal Information</h4>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-2 text-sm'>Contact Number</div>
                        <div className={`h-7 w-[80%] rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-2 text-sm'>Email</div>
                        <div className={`h-7 w-[80%] rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                    </div>
                    <div className='flex flex-col gap-1'>
                        <div className='text-sm'>Address</div>
                        <div className={`h-7 w-[80%] rounded-md ${shimmer} bg-neutral-200 dark:bg-neutral-700`} />
                    </div>
                </div>
            </div>

            <hr />

            <DrivingLicenseSkeleton />
        </>
    );
}

export function CarLoadingSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('flex h-full w-full flex-col items-center justify-center gap-6', className)}>
            <img src='/images/car_loading.gif' className='h-auto w-40 dark:invert' alt='Loading...' />
        </div>
    );
}
