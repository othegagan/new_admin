'use client';

import { Input } from '@/components/ui/input';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface SuggestionInputProps {
    value: string; // Controlled value
    onChange: (value: string) => void; // Callback for value changes
    suggestions: string[]; // List of suggestions
    placeholder?: string; // Optional placeholder
}

export function SuggestionInput({ value, onChange, suggestions, placeholder = 'Type something...' }: SuggestionInputProps) {
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update filtered suggestions whenever the input value changes
    useEffect(() => {
        if (value) {
            const filtered = suggestions.filter((suggestion) => suggestion.toLowerCase().includes(value.toLowerCase()));
            setFilteredSuggestions(filtered);
            setIsSuggestionsVisible(true); // Show suggestions when there's input
        } else {
            setFilteredSuggestions([]);
            setIsSuggestionsVisible(false); // Hide suggestions when input is empty
        }
    }, [value, suggestions]);

    // Handle clicking outside the input and suggestions list
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsSuggestionsVisible(false); // Hide suggestions when clicking outside
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue); // Notify parent of the new value
    };

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion); // Notify parent of the selected suggestion
        setIsSuggestionsVisible(false); // Hide suggestions after selection
    };

    return (
        <div className='relative w-full' ref={inputRef}>
            <Input
                type='text'
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                className='w-full'
                onFocus={() => setIsSuggestionsVisible(true)} // Show suggestions on focus
            />
            {isSuggestionsVisible && filteredSuggestions.length > 0 && (
                <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-muted shadow shadow-accent'>
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className='cursor-pointer px-4 py-2 hover:bg-muted'
                            onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
