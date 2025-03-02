'use client';

import { useEffect, useRef, useState } from 'react';
import { FullscreenControl, Layer, Map as MapGL, type MapRef, Marker, NavigationControl, ScaleControl, Source } from 'react-map-gl/mapbox';

interface Route {
    id: number;
    tripId: number;
    vehicleId: number;
    vehicleSpeed: number;
    latitude: number;
    longitude: number;
}

interface TelematicsMapProps {
    tripRoutes: Route[];
}

const StartMarker = () => (
    <div className='marker'>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='30' height='30'>
            <circle cx='12' cy='12' r='10' fill='#4CAF50' />
            <text x='12' y='16' fontFamily='Arial' fontSize='12' fill='white' textAnchor='middle'>
                S
            </text>
        </svg>
    </div>
);

const EndMarker = () => (
    <div className='marker'>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='30' height='30'>
            <circle cx='12' cy='12' r='10' fill='#F44336' />
            <text x='12' y='16' fontFamily='Arial' fontSize='12' fill='white' textAnchor='middle'>
                E
            </text>
        </svg>
    </div>
);

export default function TelematicsMap({ tripRoutes }: TelematicsMapProps) {
    const mapRef = useRef<MapRef>(null);

    const [viewState, setViewState] = useState({
        latitude: 30.2672,
        longitude: -97.7431,
        zoom: 12
    });

    const [routeData, setRouteData] = useState<any>(null);

    const fitBounds = (coordinates: [number, number][]) => {
        if (!mapRef.current || coordinates.length === 0) return;

        const bounds: [number, number, number, number] = [coordinates[0][0], coordinates[0][1], coordinates[0][0], coordinates[0][1]];

        coordinates.forEach(([longitude, latitude]) => {
            bounds[0] = Math.min(bounds[0], longitude);
            bounds[1] = Math.min(bounds[1], latitude);
            bounds[2] = Math.max(bounds[2], longitude);
            bounds[3] = Math.max(bounds[3], latitude);
        });

        mapRef.current.fitBounds(
            [
                [bounds[0], bounds[1]],
                [bounds[2], bounds[3]]
            ],
            {
                padding: { top: 50, bottom: 50, left: 50, right: 50 },
                maxZoom: 16
            }
        );
    };

    useEffect(() => {
        if (!tripRoutes || tripRoutes.length === 0) {
            clearMap();
            return;
        }

        const coordinates = tripRoutes.map(({ longitude, latitude }) => [longitude, latitude]);

        setRouteData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates
            }
        });

        if (mapRef.current) {
            //@ts-ignore
            fitBounds(coordinates);
        }
    }, [tripRoutes]);

    const clearMap = () => {
        setRouteData(null);
    };

    const handleMapLoad = () => {
        if (tripRoutes && tripRoutes.length > 0) {
            const coordinates = tripRoutes.map(({ longitude, latitude }) => [longitude, latitude]);
            //@ts-ignore
            fitBounds(coordinates);
        }
    };

    return (
        <div className='relative h-full w-full'>
            <MapGL
                {...viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                onLoad={handleMapLoad}
                mapStyle='mapbox://styles/mapbox/streets-v11'
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                ref={mapRef}>
                <FullscreenControl position='top-right' />
                <ScaleControl />
                <NavigationControl />

                {routeData && (
                    <Source id='route' type='geojson' data={routeData}>
                        <Layer
                            id='route'
                            type='line'
                            paint={{
                                'line-color': '#8A2BE2',
                                'line-width': 4
                            }}
                            layout={{
                                'line-join': 'round',
                                'line-cap': 'round'
                            }}
                        />
                    </Source>
                )}

                {tripRoutes.length > 0 && (
                    <Marker longitude={tripRoutes[0].longitude} latitude={tripRoutes[0].latitude}>
                        <StartMarker />
                    </Marker>
                )}

                {tripRoutes.length > 1 && (
                    <Marker longitude={tripRoutes[tripRoutes.length - 1].longitude} latitude={tripRoutes[tripRoutes.length - 1].latitude}>
                        <EndMarker />
                    </Marker>
                )}
            </MapGL>
        </div>
    );
}
