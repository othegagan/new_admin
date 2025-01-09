import ActionRequiredAlert from '@/components/extra/action-required-alert';
import { Main } from '@/components/layout/main';
import { homePageItems } from '@/constants/routes';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await auth();
    return (
        <Main>
            <div className='mx-auto max-w-7xl'>
                <div className='mb-8 flex-between flex-wrap-reverse items-start gap-4'>
                    <div>
                        <h2>Hello, {session?.name || 'Host'}!</h2>
                        <p className='text-muted-foreground'>Discover all the features available to you.</p>
                    </div>
                    <ActionRequiredAlert />
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                    {homePageItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            prefetch={false}
                            className='group flex h-32 flex-col items-center justify-center gap-6 rounded-lg border-2 border-primary/70 bg-card text-foreground/70 transition-colors hover:border-2 hover:border-primary hover:bg-accent md:h-40'>
                            <div className='scale-[0.80] group-hover:text-primary'>{item.icon}</div>
                            <h5>{item.label}</h5>
                        </Link>
                    ))}
                </div>
            </div>
        </Main>
    );
}
