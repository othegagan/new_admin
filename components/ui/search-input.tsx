import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type SearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    debounce?: number;
    variant?: 'default' | 'command';
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>;

export function SearchInput({ value: initialValue, onChange, debounce = 300, className, variant = 'default', ...props }: SearchInputProps) {
    const [value, setValue] = useState<string>(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onChange]);

    if (variant === 'default') {
        return (
            <div className='relative flex flex-1 items-center gap-2'>
                <Search className='absolute left-3 mr-3 size-4 text-muted-foreground' />
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    type='text'
                    placeholder='Search...'
                    className={cn('pl-9', className)}
                    {...props}
                />
                {value !== '' && (
                    <X
                        className='absolute right-2 mr-2 size-4 cursor-pointer rounded-full text-muted-foreground hover:bg-muted'
                        onClick={() => setValue('')}
                        aria-label='Clear search'
                    />
                )}
            </div>
        );
    }
    return (
        <div className='flex items-center px-3'>
            <Search className=' h-4 w-4 shrink-0 opacity-50' />
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type='text'
                placeholder='Search...'
                className={cn(
                    'flex h-10 w-full border-0 bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            />
            {value !== '' && (
                <X
                    className='absolute right-2 mr-2 size-4 cursor-pointer rounded-full text-muted-foreground hover:bg-muted'
                    onClick={() => setValue('')}
                    aria-label='Clear search'
                />
            )}
        </div>
    );
}
