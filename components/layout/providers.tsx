'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, type SessionProviderProps } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

interface ProvidersProps {
    children: React.ReactNode;
    session: SessionProviderProps['session'];
}

export default function Providers({ children, session }: ProvidersProps) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: 0,
                retry: 2
            }
        }
    });
    return (
        <NextThemesProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
                <SessionProvider session={session}>
                    <TooltipProvider delayDuration={0}>
                        <NuqsAdapter>{children}</NuqsAdapter>
                    </TooltipProvider>
                </SessionProvider>
            </QueryClientProvider>
        </NextThemesProvider>
    );
}
