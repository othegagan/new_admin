'use client';

import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_ROUTES } from '@/constants/routes';
import { usePathname } from 'next/navigation';
import { useQueryState } from 'nuqs';

export default function TripsFilter() {
    const pathname = usePathname();

    const [searchTerm, setSearchTerm] = useQueryState('search', { defaultValue: '' });
    const [selectedChannel, setSelectedChannel] = useQueryState('channel', { defaultValue: '' });
    const [selectedStatus, setSelectedStatus] = useQueryState('status', { defaultValue: '' });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedChannel('');
        setSelectedStatus('');
    };

    if (pathname === `${PAGE_ROUTES.TRIPS}${PAGE_ROUTES.TRIPS_TABS.REVIEW_REUIRED}`) {
        return null;
    }

    return (
        <div className='mb-6 flex w-full flex-col flex-wrap gap-4 md:flex-row md:items-center'>
            <div className='w-full md:max-w-md'>
                <SearchInput
                    placeholder='Search by vehicle, guest, plate, trip'
                    className='w-full'
                    onChange={(value) => {
                        setSearchTerm(value);
                    }}
                    value={searchTerm ?? ''}
                />
            </div>
            <div className='flex flex-wrap items-center gap-4 md:ml-auto'>
                <Select
                    value={selectedChannel}
                    onValueChange={(value) => {
                        setSelectedChannel(value);
                    }}>
                    <SelectTrigger className='w-[100px]'>
                        <SelectValue placeholder='Channel' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Flux'>Flux</SelectItem>
                        <SelectItem value='Bundee'>Bundee</SelectItem>
                        <SelectItem value='Turo'>Turo</SelectItem>
                    </SelectContent>
                </Select>
                {pathname !== `${PAGE_ROUTES.TRIPS}${PAGE_ROUTES.TRIPS_TABS.REVIEW_REUIRED}` && (
                    <Select
                        value={selectedStatus}
                        onValueChange={(value) => {
                            setSelectedStatus(value);
                        }}>
                        <SelectTrigger className='w-[120px]'>
                            <SelectValue placeholder='Trip Status' />
                        </SelectTrigger>
                        <SelectContent>
                            {['Requested', 'Approved', 'Started', 'Completed', 'Cancelled', 'Rejected'].map((status) => (
                                <SelectItem key={status} value={status}>
                                    <span className='capitalize'>{status}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {(searchTerm || selectedChannel || selectedStatus) && (
                    <Button variant='ghost' onClick={clearFilters} className=' w-fit px-0 text-muted-foreground'>
                        Clear <span className='hidden lg:inline-block'>Filters</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
