import { Main } from '@/components/layout/main';
import SidebarNav from './_components/sidebar-nav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <Main fixed>
            <div className='space-y-0.5'>
                <h1 className='font-bold text-2xl tracking-tight md:text-3xl'>Settings</h1>
                <p className='text-muted-foreground'>Manage your account settings and set e-mail preferences.</p>
            </div>
            <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 '>
                <SidebarNav />

                <div className='flex w-full overflow-y-hidden p-1 pr-4'>{children}</div>
            </div>
        </Main>
    );
}
