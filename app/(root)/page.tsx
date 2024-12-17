import { Main } from '@/components/layout/main';

export default function DashboardPage() {
    return (
        <Main fixed>
            <section className='flex h-full gap-6'>
                <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
                    <div className='-mx-4 sticky top-0 z-10 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
                        <div className='flex items-center justify-between py-2'>
                            <div className='flex gap-2'>
                                <h1 className='font-bold text-2xl'>Inbox</h1>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width={20}
                                    height={20}
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={2}
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='tabler-icon tabler-icon-messages'>
                                    <path d='M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10' />
                                    <path d='M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2' />
                                </svg>
                            </div>
                            <button
                                type='button'
                                className='inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-lg font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width={24}
                                    height={24}
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={2}
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='tabler-icon tabler-icon-edit stroke-muted-foreground'>
                                    <path d='M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1' />
                                    <path d='M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z' />
                                    <path d='M16 5l3 3' />
                                </svg>
                            </button>
                        </div>
                        <label className='flex h-12 w-full items-center space-x-0 rounded-md border border-input pl-2 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width={15}
                                height={15}
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth={2}
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='tabler-icon tabler-icon-search mr-2 stroke-slate-500'>
                                <path d='M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0' />
                                <path d='M21 21l-6 -6' />
                            </svg>
                            <span className='sr-only'>Search</span>
                            <input
                                className='w-full flex-1 bg-inherit text-sm focus-visible:outline-none'
                                placeholder='Search chat...'
                                type='text'
                            />
                        </label>
                    </div>
                    <div dir='ltr' className='-mx-3 relative h-full overflow-hidden p-3'>
                        <div
                            data-radix-scroll-area-viewport
                            className='h-full w-full rounded-[inherit]'
                            style={{ overflow: 'hidden scroll' }}>
                            <div style={{ minWidth: '100%', display: 'table' }}>
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75 sm:bg-muted'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='alex_dev'
                                                src='https://randomuser.me/api/portraits/men/32.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>Alex John</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                You: See you later, Alex!
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='taylor.codes'
                                                src='https://randomuser.me/api/portraits/women/45.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>Taylor Grande</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                Yeah, it's really well-explained. You should give it a try.
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='john_stack'
                                                src='https://randomuser.me/api/portraits/men/54.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>John Doe</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                You: Yep, see ya. 👋🏼
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='megan_frontend'
                                                src='https://randomuser.me/api/portraits/women/29.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>Megan Flux</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                You: Sure ✌🏼
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='dev_david'
                                                src='https://randomuser.me/api/portraits/men/72.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>David Brown</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                You: Great, I'll review them now!
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='julia.design'
                                                src='https://randomuser.me/api/portraits/women/68.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>Julia Carter</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                Same here! It's coming together nicely.
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='brad_dev'
                                                src='https://randomuser.me/api/portraits/men/24.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>Brad Wilson</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                Got it! Thanks for the update.
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='katie_ui'
                                                src='https://randomuser.me/api/portraits/women/34.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>Katie Lee</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                I'll join the call in a few minutes.
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='matt_fullstack'
                                                src='https://randomuser.me/api/portraits/men/67.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>Matt Green</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                Sure thing, I'll send over the updates shortly.
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                                <button
                                    type='button'
                                    className='-mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/75'>
                                    <div className='flex gap-2'>
                                        <span className='relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full'>
                                            <img
                                                className='aspect-square h-full w-full'
                                                alt='sophie_dev'
                                                src='https://randomuser.me/api/portraits/women/56.jpg'
                                            />
                                        </span>
                                        <div>
                                            <span className='col-start-2 row-span-2 font-medium'>Sophie Alex</span>
                                            <span className='col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis text-muted-foreground'>
                                                You: Thanks! I'll review your code and get back to you.
                                            </span>
                                        </div>
                                    </div>
                                </button>
                                <div data-orientation='horizontal' className='my-1 h-[1px] w-full shrink-0 bg-border' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col rounded-md border bg-background shadow-sm transition-all duration-200 sm:static sm:z-auto sm:flex'>
                    <div className='mb-1 flex flex-none justify-between rounded-t-md bg-secondary p-4 shadow-lg'>
                        <div className='flex gap-3'>
                            <button
                                type='button'
                                className='-ml-2 inline-flex h-full w-9 items-center justify-center whitespace-nowrap rounded-md font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:hidden'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width={24}
                                    height={24}
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={2}
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='tabler-icon tabler-icon-arrow-left'>
                                    <path d='M5 12l14 0' />
                                    <path d='M5 12l6 6' />
                                    <path d='M5 12l6 -6' />
                                </svg>
                            </button>
                            <div className='flex items-center gap-2 lg:gap-4'>
                                <span className='relative flex size-9 shrink-0 overflow-hidden rounded-full lg:size-11'>
                                    <img
                                        className='aspect-square h-full w-full'
                                        alt='alex_dev'
                                        src='https://randomuser.me/api/portraits/men/32.jpg'
                                    />
                                </span>
                                <div>
                                    <span className='col-start-2 row-span-2 font-medium text-sm lg:text-base'>Alex John</span>
                                    <span className='col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-ellipsis text-nowrap text-muted-foreground text-xs lg:max-w-none lg:text-sm'>
                                        Senior Backend Dev
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
                            <button
                                type='button'
                                className='hidden size-8 items-center justify-center whitespace-nowrap rounded-full font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:inline-flex lg:size-10'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width={22}
                                    height={22}
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={2}
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='tabler-icon tabler-icon-video stroke-muted-foreground'>
                                    <path d='M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z' />
                                    <path d='M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z' />
                                </svg>
                            </button>
                            <button
                                type='button'
                                className='hidden size-8 items-center justify-center whitespace-nowrap rounded-full font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:inline-flex lg:size-10'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width={22}
                                    height={22}
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={2}
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='tabler-icon tabler-icon-phone stroke-muted-foreground'>
                                    <path d='M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2' />
                                </svg>
                            </button>
                            <button
                                type='button'
                                className='inline-flex h-10 w-9 items-center justify-center whitespace-nowrap rounded-md font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:h-8 sm:w-4 lg:h-10 lg:w-6'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width={24}
                                    height={24}
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={2}
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    className='tabler-icon tabler-icon-dots-vertical stroke-muted-foreground sm:size-5'>
                                    <path d='M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' />
                                    <path d='M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' />
                                    <path d='M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0' />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4'>
                        <div className='flex size-full flex-1'>
                            <div className='chat-text-container -mr-4 relative flex flex-1 flex-col overflow-y-hidden'>
                                <div className='chat-flex flex h-40 w-full flex-grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pr-4 pb-4'>
                                    <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 shadow-lg'>
                                        See you later, Alex!{' '}
                                        <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>
                                            11:15 AM
                                        </span>
                                    </div>
                                    <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 shadow-lg'>
                                        Alright, talk to you later!{' '}
                                        <span className='mt-1 block font-light text-muted-foreground text-xs italic'>11:11 AM</span>
                                    </div>
                                    <div className='text-center text-xs'>24 Aug, 2024</div>
                                    <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 shadow-lg'>
                                        For sure. Anyway, I should get back to reviewing the project.
                                        <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>
                                            9:26 AM
                                        </span>
                                    </div>
                                    <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 shadow-lg'>
                                        Yeah, let me know what you think.{' '}
                                        <span className='mt-1 block font-light text-muted-foreground text-xs italic'>9:25 AM</span>
                                    </div>
                                    <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 shadow-lg'>
                                        Oh, nice! I've been waiting for that. I'll check it out later.
                                        <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>
                                            9:24 AM
                                        </span>
                                    </div>
                                    <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 shadow-lg'>
                                        They've added a dark mode option! It looks really sleek.
                                        <span className='mt-1 block font-light text-muted-foreground text-xs italic'>9:23 AM</span>
                                    </div>
                                    <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 shadow-lg'>
                                        No, not yet. What's new?{' '}
                                        <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>
                                            9:22 AM
                                        </span>
                                    </div>
                                    <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 shadow-lg'>
                                        By the way, have you seen the new feature update?
                                        <span className='mt-1 block font-light text-muted-foreground text-xs italic'>9:21 AM</span>
                                    </div>
                                    <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 shadow-lg'>
                                        Will do! Thanks, Alex.{' '}
                                        <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>
                                            9:20 AM
                                        </span>
                                    </div>
                                    <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 shadow-lg'>
                                        Great! Let me know if you need any help.{' '}
                                        <span className='mt-1 block font-light text-muted-foreground text-xs italic'>9:19 AM</span>
                                    </div>
                                    <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 shadow-lg'>
                                        Almost done. Just need to review a few things.
                                        <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>
                                            9:18 AM
                                        </span>
                                    </div>
                                    <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 shadow-lg'>
                                        I'm good, thanks! Did you finish the project?
                                        <span className='mt-1 block font-light text-muted-foreground text-xs italic'>9:17 AM</span>
                                    </div>
                                    <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 shadow-lg'>
                                        Hey Alex, I'm doing well! How about you?
                                        <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>
                                            9:16 AM
                                        </span>
                                    </div>
                                    <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 shadow-lg'>
                                        Hey Bob, how are you doing?{' '}
                                        <span className='mt-1 block font-light text-muted-foreground text-xs italic'>9:15 AM</span>
                                    </div>
                                    <div className='text-center text-xs'>23 Aug, 2024</div>
                                </div>
                            </div>
                        </div>
                        <form className='flex w-full flex-none gap-2'>
                            <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
                                <div className='space-x-1'>
                                    <button
                                        className='inline-flex h-8 w-9 items-center justify-center whitespace-nowrap rounded-md font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                        type='button'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width={20}
                                            height={20}
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth={2}
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className='tabler-icon tabler-icon-plus stroke-muted-foreground'>
                                            <path d='M12 5l0 14' />
                                            <path d='M5 12l14 0' />
                                        </svg>
                                    </button>
                                    <button
                                        className='hidden h-8 w-9 items-center justify-center whitespace-nowrap rounded-md font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 lg:inline-flex'
                                        type='button'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width={20}
                                            height={20}
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth={2}
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className='tabler-icon tabler-icon-photo-plus stroke-muted-foreground'>
                                            <path d='M15 8h.01' />
                                            <path d='M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5' />
                                            <path d='M3 16l5 -5c.928 -.893 2.072 -.893 3 0l4 4' />
                                            <path d='M14 14l1 -1c.67 -.644 1.45 -.824 2.182 -.54' />
                                            <path d='M16 19h6' />
                                            <path d='M19 16v6' />
                                        </svg>
                                    </button>
                                    <button
                                        className='hidden h-8 w-9 items-center justify-center whitespace-nowrap rounded-md font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 lg:inline-flex'
                                        type='button'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width={20}
                                            height={20}
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth={2}
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            className='tabler-icon tabler-icon-paperclip stroke-muted-foreground'>
                                            <path d='M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5' />
                                        </svg>
                                    </button>
                                </div>
                                <label className='flex-1'>
                                    <span className='sr-only'>Chat Text Box</span>
                                    <input
                                        placeholder='Type your messages...'
                                        className='h-8 w-full bg-inherit focus-visible:outline-none'
                                        type='text'
                                    />
                                </label>
                                <button
                                    type='button'
                                    className='hidden h-9 w-9 items-center justify-center whitespace-nowrap rounded-md font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:inline-flex'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width={20}
                                        height={20}
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth={2}
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='tabler-icon tabler-icon-send'>
                                        <path d='M10 14l11 -11' />
                                        <path d='M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5' />
                                    </svg>
                                </button>
                            </div>
                            <button
                                type='button'
                                className='inline-flex h-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:hidden'>
                                Send
                                <div className='ml-2'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width={18}
                                        height={18}
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth={2}
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='tabler-icon tabler-icon-send'>
                                        <path d='M10 14l11 -11' />
                                        <path d='M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5' />
                                    </svg>
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </Main>
    );
}
