import { Main } from '@/components/layout/main';
import VehicleSearch from './_components/VehicleSearch';

export default function FindMyCar() {
    return (
        <Main fixed className='h-full'>
            <VehicleSearch />
        </Main>
    );
}
