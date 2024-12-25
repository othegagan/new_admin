'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { vehicleConfigTabsContent } from '@/constants';
import { useVehicleUpdateLogsById } from '@/hooks/useVehicles';
import { getFullAddress } from '@/lib/utils';
import { format } from 'date-fns';
import { CircleCheck, CircleX } from 'lucide-react';
import { useParams } from 'next/navigation';
import SubHeader from '../../_components/layout/subheader';

export default function UpdateLogsPage() {
    const { vehicleId } = useParams();
    const { data: response, isLoading, error } = useVehicleUpdateLogsById(Number(vehicleId));

    if (isLoading) {
        return (
            <div>
                {/* {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className='group relative flex w-full rounded-lg'>
                        <div className='after:-translate-x-[0.5px] relative after:absolute after:start-3.5 after:top-0 after:bottom-0 after:w-px after:bg-neutral-200 last:after:hidden'>
                            <div className='relative z-10 flex size-7 items-center justify-center'>
                                <div className='size-2.5 rounded-full border-2 border-neutral-200 bg-neutral-200' />
                            </div>
                        </div>

                        <div className='flex max-w-lg grow flex-col space-y-2 p-2 pb-4'>
                            <Skeleton className='h-12 w-full' />
                            <Skeleton className='h-4 w-3/4' />
                        </div>
                    </div>
                ))} */}
                Loading..
            </div>
        );
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!response?.success) {
        return <div>Error: {response?.message}</div>;
    }

    const vehicleLogs = response?.data?.vehicleLogResponses || [];

    if (vehicleLogs.length === 0) {
        return <div>No logs found</div>;
    }

    return (
        <div className='flex flex-col gap-4 text-wrap'>
            <SubHeader
                title={vehicleConfigTabsContent.activity_logs.title}
                description={vehicleConfigTabsContent.activity_logs.description}
            />
            <div className='h-[calc(75dvh-200px)] overflow-y-auto'>
                <Accordion type='single' collapsible className='max-w-6xl '>
                    {vehicleLogs.map((log: any) => (
                        <AccordionItem key={log.id} value={log.id.toString()}>
                            <AccordionTrigger className='hover:no-underline'>
                                <div className='flex flex-col space-y-1 text-left'>
                                    <div className='font-semibold text-lg capitalize'>{log.message}</div>
                                    <p className='mt-1 text-muted-foreground text-sm'>
                                        By <span className='font-medium capitalize'>{log.userName || '-'}</span> on{' '}
                                        <span className='mx-1 font-medium'>{format(log.updatedDate, 'PPP, h:mm a')}</span>
                                    </p>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <LogContent log={log} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}

function LogContent({ log }: { log: any }) {
    const oldData = log.oldJson ? JSON.parse(log.oldJson) : null;
    const newData = log.newJson ? JSON.parse(log.newJson) : null;

    const displayData = (data: any, type: 'old' | 'new') => {
        const icon = type === 'old' ? <CircleX className='size-5 text-red-500' /> : <CircleCheck className='size-5 text-green-500' />;

        if (!data || Object.keys(data).length === 0) {
            return (
                <div className='flex w-full flex-col gap-4 gap-y-2'>
                    <p>No {type} data available</p>
                </div>
            );
        }

        switch (log.updateTag) {
            case 'VehicleProfile':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Vehicle Profile
                        </div>
                        <div>
                            <p>Vehicle Color: {data?.vehicleColor}</p>
                            <p>Vehicle Number Plate: {data?.vehicleNumberPlate}</p>
                            <p>Year: {data?.year}</p>
                            <p>Vehicle State: {data?.vehicleState}</p>
                        </div>
                    </div>
                );

            case 'Discounts':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Pricing Details
                        </div>
                        <div>
                            {data?.Price && (
                                <p className='font-semibold'>
                                    Price: <span className='font-normal'> ${data.Price}</span>
                                </p>
                            )}
                            {data?.Discounts && (
                                <>
                                    <p className='font-semibold'>Discounts:</p>
                                    <ul className='ml-4'>
                                        {data.Discounts.constraintValue?.map((discount: any, index: number) => (
                                            <li key={index}>{`${discount.numberOfDays} days discount: ${discount.discountPercentage}%`}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                );

            case 'Description':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Description
                        </div>
                        {data.Description && (
                            <pre className='w-full text-wrap font-sans font-semibold'>
                                <span className='font-normal'>{data.Description}</span>
                            </pre>
                        )}
                    </div>
                );

            case 'MileageConstraint':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Mileage Constraint
                        </div>
                        <div>
                            <p>Daily Mileage Limit: {data.dailyMileageLimit}</p>
                            <p>Extra Mileage Cost: {data.extraMileageCost}</p>
                        </div>
                    </div>
                );

            case 'Location':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2 font-semibold'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Location
                        </div>
                        <p className='font-normal capitalize'>{getFullAddress({ vehicleDetails: data })}.</p>
                        <p>Latitude: {data.latitude || '-'}</p>
                        <p>Longitude: {data.longitude || '-'}</p>
                    </div>
                );

            case 'DeliveryDetails':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Delivery Details
                        </div>
                        {JSON.parse(data.delivery)?.map((detail: any, index: any) => (
                            <div key={index}>
                                <p>Delivery to Airport: {detail.deliveryToAirport ? 'Yes' : 'No'}</p>
                                <p>Airport Delivery Cost: ${detail.airportDeliveryCost}</p>
                                <p>Delivery Radius: {detail.deliveryRadius} miles</p>
                                <p>Non-Airport Delivery Cost: ${detail.nonAirportDeliveryCost}</p>
                            </div>
                        ))}
                    </div>
                );

            case 'MinimumMaximumDays':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Minimum and Maximum Days
                        </div>
                        <div>
                            {data.minimumDays && <p>Minimum Days: {data.minimumDays}</p>}
                            {data.maximumDays && <p>Maximum Days: {data.maximumDays}</p>}
                        </div>
                    </div>
                );

            case 'GuestInstructionsAndGuideLines':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Guest Instructions and GuideLines
                        </div>
                        {data.GuestInstructionsAndGuideLines && (
                            <pre className='w-full text-wrap font-sans font-semibold'>
                                <span className='font-normal'>{data.GuestInstructionsAndGuideLines}</span>
                            </pre>
                        )}
                    </div>
                );

            case 'VehicleConstraintLink':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Vehicle Constraint Link
                        </div>
                        {data.VehicleConstraintLink?.map((constraint: any, index: any) => (
                            <div key={index}>
                                {constraint.constraintValue.map((value: any, vIndex: any) => (
                                    <div key={vIndex}>
                                        <p>ID/URL: {value.url}</p>
                                        <p>Channel Name: {value.channelName}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                );

            case 'Images':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Image
                        </div>
                        {data.imageName ? (
                            <div className='aspect-video w-full overflow-hidden rounded-md bg-neutral-200 group-hover:opacity-75 lg:aspect-video lg:h-44 lg:w-1/2'>
                                <img
                                    src={data.imageName}
                                    alt={`${type}-${data.imageName}`}
                                    className='h-full w-full object-cover object-center'
                                />
                            </div>
                        ) : (
                            <p>No {type} image available</p>
                        )}
                    </div>
                );

            case 'Unavailability':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Unavailability
                        </div>
                        <div>
                            {data.newStartDate && <p>Start Date: {format(new Date(data.newStartDate), 'PPP, h:mm a')}</p>}
                            {data.newEndDate && <p>End Date: {format(new Date(data.newEndDate), 'PPP, h:mm a')}</p>}
                            {data.startDate && <p>Start Date: {format(new Date(data.startDate), 'PPP, h:mm a')}</p>}
                            {data.endDate && <p>End Date: {format(new Date(data.endDate), 'PPP, h:mm a')}</p>}
                            {data.deletedStartDate && <p>Deleted Start Date: {format(new Date(data.deletedStartDate), 'PPP, h:mm a')}</p>}
                            {data.deletedEndDate && <p>Deleted End Date: {format(new Date(data.deletedEndDate), 'PPP, h:mm a')}</p>}
                        </div>
                    </div>
                );

            case 'VehicleActivation':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Vehicle Status:
                            <span> {data.vehicleActivation ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                );

            case 'DynamicPrice':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Pricing
                        </div>
                        <div>
                            {data.fromDate && <p>From Date: {format(new Date(data.fromDate), 'PPP, h:mm a')}</p>}
                            {data.toDate && <p>To Date: {format(new Date(data.toDate), 'PPP, h:mm a')}</p>}
                            {data.price && <p>Price: {data.price}</p>}
                            {data.newFromDate && <p>New From Date: {format(new Date(data.newFromDate), 'PPP, h:mm a')}</p>}
                            {data.newToDate && <p>New To Date: {format(new Date(data.newToDate), 'PPP, h:mm a')}</p>}
                            {data.newPrice && <p>New Price: {data.newPrice}</p>}
                            {data.deletedPriceToDate && (
                                <p>Deleted Price To Date: {format(new Date(data.deletedPriceToDate), 'PPP, h:mm a')}</p>
                            )}
                            {data.deletedPrice && <p>Deleted Price: {data.deletedPrice}</p>}
                        </div>
                    </div>
                );

            case '12HBTRCOM':
            case '1HATRSTR':
            case 'REAPP':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Alert Message
                        </div>
                        <div>
                            <p>{data.message}</p>
                        </div>
                    </div>
                );

            default:
                return <pre className='text-wrap rounded bg-neutral-100 p-2 text-sm'>{JSON.stringify(data, null, 2)}</pre>;
        }
    };

    return (
        <div className='mt-4 flex flex-col gap-5 md:flex-row'>
            {displayData(oldData, 'old')}
            <div className='w-px bg-neutral-400' />
            {displayData(newData, 'new')}
        </div>
    );
}
