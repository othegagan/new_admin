import { Main } from '@/components/layout/main';
import { PAGE_ROUTES } from '@/constants/routes';
import { ArrowRight, TriangleAlert } from 'lucide-react';

export default function page() {
    return (
        <Main>
            <div className='rounded-lg border border-border px-4 py-3'>
                <div className='flex gap-3'>
                    <TriangleAlert className='hrink-0 mt-0.5 text-amber-500' size={16} strokeWidth={2} aria-hidden='true' />
                    <div className='flex grow justify-between gap-3'>
                        <p className='text-sm'>
                            <b> Host Action Required:</b> There are some items that need your review.{' '}
                            <a
                                href={PAGE_ROUTES.TRIPS}
                                className='group ml-1 whitespace-nowrap font-medium text-sm underline underline-offset-2'>
                                See More
                                <ArrowRight
                                    className='-mt-0.5 ms-1 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5'
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden='true'
                                />
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </Main>
    );
}
