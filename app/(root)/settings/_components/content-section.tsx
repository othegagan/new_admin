import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentSectionProps {
    title: string;
    desc: string;
    children: React.JSX.Element;
}

export default function ContentSection({ title, desc, children }: ContentSectionProps) {
    return (
        <ScrollArea className='-mx-4 flex-1 scroll-smooth px-4 '>
            <div className='-mx-1 px-1.5 lg:max-w-xl'>{children}</div>
        </ScrollArea>
    );
}
