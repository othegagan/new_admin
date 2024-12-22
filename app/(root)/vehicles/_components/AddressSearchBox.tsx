import { Skeleton } from '@/components/skeletons';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMapboxSearch } from '@/hooks/useMapboxSearch';
import { useEffect, useState } from 'react';

const DEBOUNCE_TIME = 300;

export default function AddressSearchBox({
    address1,
    setSavedData
}: {
    address1: string;
    setSavedData: any;
}) {
    const [inputValue, setInputValue] = useState(address1);
    const [show, setShow] = useState(false);
    const [blurTimeoutId, setBlurTimeoutId] = useState<any>(null);

    const { data: locationSuggestions, loading, error, fetchAdresses } = useMapboxSearch();

    useEffect(() => {
        if (inputValue) {
            fetchAdresses(inputValue);
        }
    }, [inputValue, fetchAdresses]);

    const debounceFetchData = debounce(fetchAdresses, DEBOUNCE_TIME);

    const handleInputChange = (e: { target: { value: any } }) => {
        const value = e.target.value;
        setInputValue(value);
        debounceFetchData(value);
    };

    return (
        <div>
            <div className='relative'>
                <Input
                    id='address1'
                    type='text'
                    className='pr-4 font-normal text-foreground placeholder:text-muted-foreground/80'
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder='Enter your address'
                    onClick={(e) => {
                        const inputElement = e.target as HTMLInputElement;
                        inputElement.select();
                        setShow(true);
                    }}
                    onBlur={() => {
                        const timeoutId = setTimeout(() => setShow(false), 200);
                        setBlurTimeoutId(timeoutId);
                    }}
                    aria-haspopup='listbox'
                />
                <div
                    className={`absolute z-[997] mt-1 min-w-[300px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${
                        show && inputValue ? 'scale-1 opacity-100' : 'scale-0 opacity-0'
                    }`}>
                    <p className='mb-1 text-[11px] text-neutral-400'>Suggestions</p>

                    {loading ? (
                        <div className='flex w-[300px] flex-col gap-2 px-2'>
                            <Skeleton className='h-4 w-3/4 rounded-md bg-muted' />
                            <Skeleton className='h-4 w-1/2 rounded-md bg-muted' />
                        </div>
                    ) : error ? (
                        <p className='my-6 w-[300px] text-center text-xs'>{error}</p>
                    ) : locationSuggestions.length === 0 ? (
                        <div className='flex w-[300px] flex-col gap-2'>
                            <p className='my-6 text-center text-xs'>No Suggestions</p>
                        </div>
                    ) : (
                        <ScrollArea className='flex max-h-60 w-full select-none flex-col rounded-lg border-1 p-1'>
                            {locationSuggestions.map((item: any, index: number) => (
                                <div
                                    className='relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-[13px] outline-none hover:bg-muted hover:text-accent-foreground'
                                    key={index}
                                    onMouseDown={() => {
                                        setShow(false);
                                        setInputValue(item.address1);
                                        setSavedData(item);
                                        clearTimeout(blurTimeoutId);
                                    }}>
                                    <span>{item.placeName}</span>
                                </div>
                            ))}
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    );
}

// Debounce function
export const debounce = (func: any, delay: number) => {
    let timeoutId: any;
    return (...args: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};
