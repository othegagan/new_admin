interface PageHeaderProps {
    title: string;
    description?: string;
}
export default function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className='w-fit space-y-1'>
            <h3 className='font-bold text-2xl text-card-foreground leading-7 sm:truncate sm:text-2xl sm:tracking-tight'>{title}</h3>
            <p className='text-muted-foreground text-sm'>{description}</p>
        </div>
    );
}
