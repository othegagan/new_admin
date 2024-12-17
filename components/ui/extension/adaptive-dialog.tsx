'use client';

import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type React from 'react';
import { forwardRef, useEffect, useRef } from 'react';

export interface AdaptiveDialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    interactOutside?: boolean;
    title?: React.ReactNode;
    description?: React.ReactNode;
    showCloseButton?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const AdaptiveDialog = forwardRef<HTMLDivElement, AdaptiveDialogProps>(
    ({ isOpen, onClose, children, className, interactOutside = true, title, description, showCloseButton = true, size = 'lg' }, ref) => {
        const dialogRef = useRef<HTMLDivElement>(null);
        const previousFocusedElementRef = useRef<Element | null>(null);

        useEffect(() => {
            const body = document.body;
            if (isOpen) {
                previousFocusedElementRef.current = document.activeElement;
                if (dialogRef.current) {
                    dialogRef.current.focus();
                }
                body.style.overflow = 'hidden';
            } else {
                if (previousFocusedElementRef.current) {
                    (previousFocusedElementRef.current as HTMLElement).focus();
                }
                body.style.overflow = '';
            }

            return () => {
                body.style.overflow = '';
            };
        }, [isOpen]);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Tab') {
                const focusableElements = dialogRef.current?.querySelectorAll(
                    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusableElements) return;

                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        const sizeClasses = {
            sm: 'sm:max-w-sm',
            md: 'sm:max-w-md',
            lg: 'sm:max-w-lg',
            xl: 'sm:max-w-xl',
            full: 'sm:max-w-full sm:w-[90%]'
        };

        return (
            <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
                <DialogPrimitive.Portal>
                    <div className={cn('fixed inset-0 z-50 flex items-center justify-center ', isOpen ? ' fade-in-0' : 'fade-out-0')}>
                        <DialogPrimitive.Overlay className={cn('fixed inset-0 bg-black/50 backdrop-blur-[1px] ')} />
                        <DialogPrimitive.Content
                            aria-describedby={description ? 'dialog-description' : undefined}
                            ref={ref || dialogRef}
                            onKeyDown={handleKeyDown}
                            onInteractOutside={(e) => {
                                if (!interactOutside) {
                                    e.preventDefault();
                                } else {
                                    onClose();
                                }
                            }}
                            onEscapeKeyDown={(e) => {
                                if (!interactOutside) {
                                    e.preventDefault();
                                } else {
                                    onClose();
                                }
                            }}
                            className={cn(
                                'fixed z-50 grid w-full gap-4 rounded-lg rounded-b-lg border bg-background p-4 shadow-lg',
                                'zoom-in-95 slide-in-from-bottom-2 animate-in',
                                sizeClasses[size],
                                className
                            )}>
                            {(title || description) && (
                                <div className='mb-2 flex flex-col space-y-2 text-left'>
                                    {title && (
                                        <DialogPrimitive.Title className='p-0 font-semibold text-lg leading-none tracking-tight'>
                                            {title}
                                        </DialogPrimitive.Title>
                                    )}
                                    {description && (
                                        <DialogPrimitive.Description className='mt-0 text-muted-foreground text-sm leading-none'>
                                            {description}
                                        </DialogPrimitive.Description>
                                    )}
                                </div>
                            )}
                            {children}
                            {showCloseButton && (
                                <DialogPrimitive.Close
                                    onClick={onClose}
                                    className='absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
                                    <X className='h-4 w-4' />
                                    <span className='sr-only'>Close</span>
                                </DialogPrimitive.Close>
                            )}
                        </DialogPrimitive.Content>
                    </div>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
        );
    }
);

AdaptiveDialog.displayName = 'AdaptiveDialog';

interface AdaptiveBodyProps {
    children: React.ReactNode;
    className?: string;
}

function AdaptiveBody({ children, className }: AdaptiveBodyProps) {
    return <div className={cn('max-h-[calc(100vh-16rem)] overflow-y-auto p-0.5', className)}>{children}</div>;
}

interface AdaptiveFooterProps {
    children: React.ReactNode;
    className?: string;
}

function AdaptiveFooter({ children, className }: AdaptiveFooterProps) {
    return <div className={cn('ml-auto flex-end gap-4', className)}>{children}</div>;
}

export { AdaptiveBody, AdaptiveDialog, AdaptiveFooter };
