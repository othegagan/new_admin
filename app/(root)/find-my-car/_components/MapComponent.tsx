'use client';
import { toTitleCase } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
    FullscreenControl,
    type LngLatBoundsLike,
    Map as MapGL,
    type MapRef,
    Marker,
    NavigationControl,
    Popup,
    ScaleControl
} from 'react-map-gl';

export default function MapComponent({
    filteredCars = []
}: {
    filteredCars: any[];
}) {
    const [carPopInfo, setCarPopInfo] = useState<any>(null);
    const [carsPopInfo, setCarsPopInfo] = useState<any>(null);
    const [pins, setPins] = useState<any[]>([]);

    const mapRef = useRef<MapRef>(null);

    const [viewState, setViewState] = useState({
        width: '100%',
        height: '100%',
        latitude: 30.2672,
        longitude: -97.7431,
        zoom: 12
    });

    useEffect(() => {
        if (!Array.isArray(filteredCars) || filteredCars.length === 0) {
            setPins([]);
            return;
        }

        const validCoordinates = filteredCars.filter(isValidCoordinate);

        if (validCoordinates.length > 0) {
            fitMapToBounds(validCoordinates);
        }

        const groupedPoints = groupBySameLatLng(validCoordinates);
        const groupedMarkers = createMarkers(groupedPoints);
        setPins(groupedMarkers);
    }, [filteredCars]);

    const fitMapToBounds = (coordinates: any[]) => {
        if (!mapRef.current || coordinates.length === 0) return;

        const bounds: LngLatBoundsLike = coordinates.reduce(
            (bounds, coord) => [
                Math.min(bounds[0], coord.longitude),
                Math.min(bounds[1], coord.latitude),
                Math.max(bounds[2], coord.longitude),
                Math.max(bounds[3], coord.latitude)
            ],
            [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
        );

        mapRef.current.fitBounds(bounds as LngLatBoundsLike, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 16
        });
    };

    const onMove = (evt: any) => {
        setViewState(evt.viewState);
    };

    const createMarkers = (groupedPoints: any) => {
        return Object.values(groupedPoints).map((group: any, index) => (
            <Marker
                key={`grouped-marker-${index}`}
                latitude={Number(group[0].latitude)}
                longitude={Number(group[0].longitude)}
                onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setCarPopInfo(null);
                    setCarsPopInfo(null);
                    if (group.length > 1) {
                        setCarsPopInfo(group);
                    } else {
                        setCarPopInfo(group[0]);
                    }
                }}
                className='cursor-pointer'>
                {group.length === 1 ? (
                    <img src='./images/car-top.png' alt='car' className='h-full w-full rotate-270 object-cover' />
                ) : (
                    <div className='relative flex flex-col items-center justify-center'>
                        <div className='grouped-marker-count absolute top-1 font-semibold text-md'>{group.length}</div>
                        <svg
                            width='436'
                            height='624'
                            viewBox='0 0 436 624'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                            className='size-10 cursor-pointer'>
                            <path
                                d='M218 0C97.4771 0 0 97.656 0 218.4C0 382.2 218 624 218 624C218 624 436 382.2 436 218.4C436 97.656 338.523 0 218 0Z'
                                fill='currentColor'
                            />
                            <circle cx='218' cy='222' r='160' fill='white' />
                        </svg>
                    </div>
                )}
            </Marker>
        ));
    };

    return (
        <div className='relative h-full w-full'>
            <MapGL
                {...viewState}
                mapStyle='mapbox://styles/mapbox/streets-v9'
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                onMove={onMove}
                ref={mapRef}>
                <FullscreenControl position='top-right' />
                <ScaleControl />
                <NavigationControl />

                {pins}

                {carPopInfo && (
                    <Popup
                        longitude={Number(carPopInfo.longitude)}
                        latitude={Number(carPopInfo.latitude)}
                        onClose={() => {
                            setCarPopInfo(null);
                            setCarsPopInfo(null);
                        }}
                        className='rounded-lg'>
                        <Link href={`/vehicles/${carPopInfo?.id}/calendar`} className='flex flex-col border-0 outline-none focus:border-0'>
                            <img
                                width='100%'
                                src={carPopInfo?.imageresponse[0]?.imagename}
                                className='rounded-md'
                                alt={`${carPopInfo?.make}`}
                            />
                            <div className='mt-1 font-semibold text-sm'>{`${toTitleCase(carPopInfo?.make)} ${carPopInfo?.model.toLocaleUpperCase()} ${carPopInfo?.year}`}</div>
                            <p>{fullAddress(carPopInfo?.locationResponses)}</p>
                        </Link>
                    </Popup>
                )}

                {carsPopInfo && (
                    <Popup
                        longitude={Number(carsPopInfo[0].longitude)}
                        latitude={Number(carsPopInfo[0].latitude)}
                        onClose={() => {
                            setCarPopInfo(null);
                            setCarsPopInfo(null);
                        }}
                        style={{ maxWidth: '350px' }}
                        className='w-[400px] rounded-lg'>
                        <p>{carsPopInfo.length} cars are available here.</p>
                        <div className='flex max-h-60 w-full select-none flex-col overflow-y-auto rounded-lg border-1'>
                            {carsPopInfo.map((car: any) => (
                                <Link
                                    key={car?.id}
                                    href={`/vehicles/${car?.id}/calendar`}
                                    className='my-1 grid grid-cols-3 gap-2 rounded-md border hover:bg-neutral-200/70'>
                                    <div className='aspect-video h-16 w-full border'>
                                        {car?.imageresponse[0]?.imagename ? (
                                            <img
                                                src={car?.imageresponse[0]?.imagename}
                                                alt={car.make}
                                                className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-105 lg:h-full lg:w-full'
                                            />
                                        ) : (
                                            <img
                                                src='./images/image_not_available.png'
                                                alt='image_not_found'
                                                className='h-full w-full scale-[0.7] object-cover object-center transition-all ease-in-out lg:h-full lg:w-full'
                                            />
                                        )}
                                    </div>

                                    <div className='col-span-2 flex flex-col'>
                                        <div className='mt-1 font-semibold text-sm'>{`${toTitleCase(car?.make)} ${car?.model.toLocaleUpperCase()} ${car?.year}`}</div>

                                        <p>{fullAddress(car?.locationResponses)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Popup>
                )}
            </MapGL>
        </div>
    );
}

// Helper functions
const isValidCoordinate = (car: { latitude: any; longitude: any }) => {
    const { latitude, longitude } = car;
    return latitude !== 0 && longitude !== 0;
};

function groupBySameLatLng(data: any[]) {
    const groupedPoints: { [key: string]: any[] } = {};
    data.forEach((point: { latitude: any; longitude: any }) => {
        const key = `${point.latitude}_${point.longitude}`;
        if (!groupedPoints[key]) {
            groupedPoints[key] = [point];
        } else {
            groupedPoints[key].push(point);
        }
    });
    return groupedPoints;
}

function fullAddress(locationResponses: any[]) {
    const address = locationResponses[0];
    const addressParts = [];

    if (address.address1) {
        addressParts.push(toTitleCase(address.address1));
    }
    if (address.address2) {
        addressParts.push(toTitleCase(address.address2));
    }
    if (address.zipcode) {
        addressParts.push(address.zipcode);
    }
    if (address.cityname) {
        addressParts.push(toTitleCase(address.cityname));
    }
    if (address.state) {
        addressParts.push(toTitleCase(address.state));
    }

    return toTitleCase(addressParts.join(', '));
}
