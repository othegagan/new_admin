import { Main } from '@/components/layout/main';
import { PAGE_ROUTES, homePageItems } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { TriangleAlert } from 'lucide-react';
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

function ActionRequiredAlert() {
    return (
        <div className=' rounded-lg border border-border bg-background p-4 shadow shadow-black/5'>
            <div className='flex gap-2'>
                <div className='flex grow flex-col gap-3'>
                    <div className='space-y-1'>
                        <p className='flex-start gap-2 font-medium text-sm'>
                            <TriangleAlert className='mt-0.5 shrink-0 text-amber-500' size={20} strokeWidth={2} aria-hidden='true' />
                            Host Action Required
                        </p>
                        <p className=' text-muted-foreground text-sm'>
                            There are some items that need your review.
                            <Link
                                href={PAGE_ROUTES.TRIPS}
                                className=' ml-2 inline-block whitespace-nowrap font-medium underline underline-offset-2 hover:text-primary'>
                                See More
                            </Link>
                        </p>
                    </div>
                </div>
                {/* <Button
                    variant='ghost'
                    className='group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent'
                    aria-label='Close notification'>
                    <X size={16} strokeWidth={2} className='opacity-60 transition-opacity group-hover:opacity-100' aria-hidden='true' />
                </Button> */}
            </div>
        </div>
    );
}
