'use client';

import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Button as _Button, type ButtonProps as _ButtonProps } from 'react-aria-components';

import { cn } from '@/lib/utils';
import { buttonVariants } from '../button';

export interface ButtonProps extends _ButtonProps, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
    return (
        <_Button
            className={(values) =>
                cn(
                    buttonVariants({
                        variant,
                        size,
                        className: typeof className === 'function' ? className(values) : className
                    })
                )
            }
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
