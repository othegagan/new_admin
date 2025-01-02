import dynamic from 'next/dynamic';
const ReviewRequired = dynamic(() => import('./review-required-main'));

export default function ReviewRequiredPage() {
    return <ReviewRequired />;
}
