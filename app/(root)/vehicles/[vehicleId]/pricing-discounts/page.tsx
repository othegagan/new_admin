import { Card, CardContent } from '@/components/ui/card';
import Discounts from './_components/Discounts';
import DynamicPricingComponent from './_components/DynamicPricing';
import Pricing from './_components/PricingForm';

export default function PricingAndDiscountsPage() {
    return (
        <div className='flex flex-col gap-6'>
            <Card>
                <CardContent className='flex flex-col gap-10'>
                    <Pricing />
                    <DynamicPricingComponent />
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
