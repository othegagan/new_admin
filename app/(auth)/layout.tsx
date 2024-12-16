import ThemeToggleSwitch from '@/components/ui/theme-toggle';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Host Auth | MyBundee',
    description: 'Host application of MyBundee, a  platform for listing and managing vehicles on MyBundee platform.',
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png'
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className={`${inter.className} min-w-[340px]`}>
            {children}
            <div className='fixed right-4 bottom-4'>
                <ThemeToggleSwitch />
            </div>
            <Toaster position='bottom-center' toastOptions={{ duration: 4500 }} />
        </main>
    );
}
