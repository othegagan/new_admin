import { Card, CardContent } from '@/components/ui/card';
import Discounts from './_components/Discounts';
import Pricing from './_components/PricingForm';

export default function PricingAndDiscountsPage() {
    return (
        <div className='flex flex-col gap-6'>
            <Card>
                <CardContent>
                    <Pricing />
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Discounts />
                </CardContent>
            </Card>
        </div>
    );
}
