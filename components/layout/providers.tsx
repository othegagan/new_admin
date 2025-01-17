'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

interface ProvidersProps {
    children: React.ReactNode;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 0,
            retry: 2
        }
    }
});

export default function Providers({ children }: ProvidersProps) {
    return (
        <NextThemesProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider delayDuration={0}>
                    <NuqsAdapter>{children}</NuqsAdapter>
                </TooltipProvider>
            </QueryClientProvider>
        </NextThemesProvider>
    );
}
