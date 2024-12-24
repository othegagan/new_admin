'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type React from 'react';
import { useState } from 'react';

interface TextWithSuggestionsProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    placeholder?: string;
    className?: string;
}

const TextWithSuggestions: React.FC<TextWithSuggestionsProps> = ({
    value,
    onChange,
    suggestions,
    placeholder = 'Enter text',
    className
}) => {
    const [show, setShow] = useState(false);
    const [blurTimeoutId, setBlurTimeoutId] = useState<NodeJS.Timeout>();

    const filteredSuggestions = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase()));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={cn('relative', className)}>
            <Input
                type='text'
                className='pr-4 font-normal text-foreground placeholder:text-muted-foreground/80'
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
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
                className={cn(
                    'absolute z-[997] mt-1 min-w-[300px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
                    show && value && filteredSuggestions.length > 0 ? 'scale-1 opacity-100' : 'scale-0 opacity-0'
                )}>
                <p className='mb-1 text-[11px] text-neutral-400'>Suggestions</p>

                <ScrollArea className='flex max-h-60 w-full select-none flex-col rounded-lg border-1 p-1'>
                    {filteredSuggestions.map((item, index) => (
                        <div
                            className='relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-[13px] outline-none hover:bg-muted hover:text-accent-foreground'
                            key={index}
                            onMouseDown={() => {
                                setShow(false);
                                onChange(item);
                                clearTimeout(blurTimeoutId);
                            }}>
                            <span>{item}</span>
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
    );
};

export default TextWithSuggestions;
