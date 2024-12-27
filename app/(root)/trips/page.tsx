import { PAGE_ROUTES } from '@/constants/routes';
import { redirect } from 'next/navigation';

export default function page() {
    redirect(`${PAGE_ROUTES.TRIPS}/daily-view`);
}
