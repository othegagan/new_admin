import dynamic from 'next/dynamic';
const AllTrips = dynamic(() => import('./all-trips-main'));

export default function AllTripsPage() {
    return <AllTrips />;
}
