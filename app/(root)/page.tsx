import ActionRequiredAlert from '@/components/extra/action-required-alert';
import { Main } from '@/components/layout/main';
import { homePageNavItems } from '@/constants';
import { auth } from '@/lib/auth';
import type { Role } from '@/types';
import Link from 'next/link';

function getNavItems(role: Role) {
    return homePageNavItems.filter((item) => item.roles.includes(role));
}

export default async function DashboardPage() {
    const session = await auth();
    const navItems = getNavItems(session?.userRole);

    return (
        <Main>
            <div className='mx-auto max-w-7xl'>
                <div className='mb-8 flex flex-wrap-reverse items-start justify-between gap-4'>
                    <div>
                        <h3>Hello, {session?.name || 'Host'}!</h3>
                        <p className='text-muted-foreground'>Discover all the features available to you.</p>
                    </div>
                    <ActionRequiredAlert />
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            prefetch={false}
                            className='group flex flex-col items-center justify-center rounded-lg border-2 border-primary/70 bg-card pb-2 text-foreground/70 transition-colors hover:border-2 hover:border-primary hover:bg-accent md:h-40 md:gap-1'>
                            <div className='scale-[0.75] group-hover:text-primary'>{item.icon}</div>
                            <div className='md:text-xl'>{item.label}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </Main>
    );
}
