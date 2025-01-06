import { CarLoadingSkeleton } from '@/components/skeletons';

export default function Loading() {
    return (
        <div className='flex h-full w-full items-center justify-center'>
            <CarLoadingSkeleton />
        </div>
    );
}
