import { Input } from '@/components/ui/input';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { FieldError } from './field';

export interface InputPasswordProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
    showStrength?: boolean;
    error?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
    ({ className, type, showStrength = false, value, error, onChange, ...props }, ref) => {
        const [isVisible, setIsVisible] = useState<boolean>(false);

        const toggleVisibility = () => setIsVisible((prevState) => !prevState);

        const checkStrength = (pass: string) => {
            const requirements = [
                { regex: /.{8,}/, text: 'At least 8 characters' },
                { regex: /[0-9]/, text: 'At least 1 number' },
                { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
                { regex: /[A-Z]/, text: 'At least 1 uppercase letter' }
            ];

            return requirements.map((req) => ({
                met: req.regex.test(pass),
                text: req.text
            }));
        };

        const strength = useMemo(() => checkStrength(value), [value]);

        const strengthScore = useMemo(() => {
            return strength.filter((req) => req.met).length;
        }, [strength]);

        const getStrengthColor = (score: number) => {
            if (score === 0) return 'bg-border';
            if (score <= 1) return 'bg-red-500';
            if (score <= 2) return 'bg-orange-500';
            if (score === 3) return 'bg-amber-500';
            return 'bg-emerald-500';
        };

        const getStrengthText = (score: number) => {
            if (score === 0) return 'Enter a password';
            if (score <= 2) return 'Weak password';
            if (score === 3) return 'Medium password';
            return 'Strong password';
        };

        return (
            <div>
                <div className='relative'>
                    <Input
                        type={isVisible ? 'text' : 'password'}
                        value={value}
                        onChange={onChange}
                        aria-invalid={strengthScore < 4}
                        aria-describedby={showStrength ? 'password-strength' : undefined}
                        ref={ref}
                        {...props}
                    />
                    <button
                        className='absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 transition-shadow hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                        type='button'
                        onClick={toggleVisibility}
                        aria-label={isVisible ? 'Hide password' : 'Show password'}
                        aria-pressed={isVisible}
                        aria-controls='password-input'>
                        {isVisible ? (
                            <EyeOff size={16} strokeWidth={2} aria-hidden='true' />
                        ) : (
                            <Eye size={16} strokeWidth={2} aria-hidden='true' />
                        )}
                    </button>
                </div>

                {error && <FieldError>{error}</FieldError>}

                {showStrength && (
                    <>
                        <div
                            className='mt-3 mb-4 h-1 w-full overflow-hidden rounded-full bg-border'
                            aria-valuenow={strengthScore}
                            aria-valuemin={0}
                            aria-valuemax={4}
                            aria-label='Password strength'>
                            <div
                                className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                                style={{ width: `${(strengthScore / 4) * 100}%` }}
                            />
                        </div>

                        <p id='password-strength' className='mb-2 font-medium text-foreground text-sm'>
                            {getStrengthText(strengthScore)}. Must contain:
                        </p>

                        <ul className='space-y-1.5' aria-label='Password requirements'>
                            {strength.map((req, index) => (
                                <li key={index} className='flex items-center gap-2'>
                                    {req.met ? (
                                        <Check size={16} className='text-emerald-500' aria-hidden='true' />
                                    ) : (
                                        <X size={16} className='text-muted-foreground/80' aria-hidden='true' />
                                    )}
                                    <span className={`text-xs ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                        {req.text}
                                        <span className='sr-only'>{req.met ? ' - Requirement met' : ' - Requirement not met'}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        );
    }
);

InputPassword.displayName = 'InputPassword';

export { InputPassword };
