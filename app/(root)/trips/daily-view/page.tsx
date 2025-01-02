import dynamic from 'next/dynamic';
const Dailyview = dynamic(() => import('./daily-view-main'));

export default function DailyviewPage() {
    return <Dailyview />;
}
