import { cn } from '@/lib/utils';

interface SubHeaderProps {
    className?: string;
    title: string;
    description?: string;
}
export default function SubHeader({ title, className, description = '' }: SubHeaderProps) {
    return (
        <div className={cn('mt-3 flex flex-col gap-2', className)}>
            <h3 className='leading-none'>{title}</h3>
            {description && <p className='text-muted-foreground text-sm'>{description}</p>}
        </div>
    );
}
