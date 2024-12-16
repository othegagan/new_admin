'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggleSwitch() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div>
            <Label htmlFor='theme-toggle' className='sr-only'>
                Toggle switch
            </Label>
            <div className='group inline-flex items-center gap-2'>
                <div
                    id='switch-off-label'
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className={cn(
                        'transform rounded-md p-2 transition-all duration-300 ease-in-out',
                        theme === 'light' ? 'rotate-0 scale-100 bg-accent text-accent-foreground' : 'rotate-180 scale-110'
                    )}>
                    <Sun className='size-4 transition-transform duration-300 ease-in-out' />
                </div>

                <Switch
                    id='theme-toggle'
                    checked={theme === 'dark'}
                    onCheckedChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    aria-labelledby='switch-off-label switch-on-label'
                    aria-label='Toggle between dark and light mode'
                />

                <div
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className={cn(
                        'transform rounded-md p-2 transition-all duration-300 ease-in-out ',
                        theme === 'dark' ? 'rotate-0 scale-100 bg-accent text-accent-foreground' : '-rotate-90 scale-110'
                    )}>
                    <Moon className='size-4 transition-transform duration-300 ease-in-out' />
                </div>
            </div>
        </div>
    );
}
