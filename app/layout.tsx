import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/components/layout/providers';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: 'Host | MyBundee',
    description: 'Host application of MyBundee, a  platform for listing and managing vehicles on MyBundee platform.',
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png'
    }
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default async function RootLayout({ children }: Readonly<RootLayoutProps>) {
    const session = await auth();
    return (
        <html lang='en' suppressHydrationWarning>
            <head>
                <link href='https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css' rel='stylesheet' />
                <script src='https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.js' />
            </head>
            <body className={cn('flex h-screen min-w-[360px] bg-background font-sans antialiased', geistSans.variable, geistMono.variable)}>
                <Providers session={session}>{children}</Providers>
                <Toaster position='bottom-right' closeButton={true} duration={3000} richColors className={`${geistSans.className}`} />
                {/* {env.NODE_ENV === 'development' && <ScreenSize />} */}
            </body>
        </html>
    );
}
