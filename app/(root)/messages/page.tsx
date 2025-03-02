export default function page() {
    return (
        <div className='flex h-full flex-1 items-center justify-center rounded-lg border border-dashed bg-black/5 shadow-xs dark:bg-muted/50'>
            <div className='flex flex-col items-center gap-1 text-center'>
                <h3 className='font-bold text-2xl text-muted-foreground tracking-tight'>Select a conversation</h3>
                <p className='text-muted-foreground'>Select a conversation from the left to view messages.</p>
            </div>
        </div>
    );
}
