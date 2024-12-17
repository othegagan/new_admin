'use client';
import PhoneInput from 'react-phone-input-2';
import './phone-number-input-style.css';

interface PhoneNumberProps {
    props?: any;
    value: string | undefined;
    onValueChange: (value: string) => void;
    className?: string;
}

export default function PhoneNumber({ value, onValueChange: onChangeValue, className, props }: PhoneNumberProps) {
    return (
        <div className={`w-full ${className}`}>
            <PhoneInput
                specialLabel={''}
                placeholder='Ex : +1234567890'
                country={'us'}
                prefix={'+'}
                value={value}
                onChange={(value) => onChangeValue(value)}
                countryCodeEditable={true}
                {...props}
            />
        </div>
    );
}
