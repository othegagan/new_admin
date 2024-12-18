'use client';

import { Main } from '@/components/layout/main';
import type { ReactNode } from 'react';
import MessagesList from './_components/MessagesList';

export default function MessagesLayout({ children }: { children: ReactNode }) {
    return (
        <Main fixed className='h-full'>
            <section className='flex h-full gap-6'>
                <MessagesList />

                {children}
            </section>
        </Main>
    );
}

// export default function MessageDetail({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = use(params);
