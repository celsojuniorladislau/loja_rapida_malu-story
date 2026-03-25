import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Price} from '@/components/commerce/price';

type ActiveOrder = {
    id: string;
    currencyCode: string;
    subTotalWithTax: number;
    shippingWithTax: number;
    totalWithTax: number;
    discounts?: Array<{
        description: string;
        amountWithTax: number;
    }> | null;
};

export async function OrderSummary({activeOrder}: { activeOrder: ActiveOrder }) {
    return (
        <div className="bg-grey-50 rounded-lg p-6 sticky top-4">
            <h2 className="font-title text-xl font-medium text-brand-black mb-4">Resumo do pedido</h2>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                    <span className="font-body text-sm text-grey-500">Subtotal</span>
                    <span className="font-body text-sm text-brand-black">
                        <Price value={activeOrder.subTotalWithTax} currencyCode={activeOrder.currencyCode} />
                    </span>
                </div>

                {activeOrder.discounts && activeOrder.discounts.length > 0 && (
                    <>
                        {activeOrder.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between text-green-600">
                                <span className="font-body text-sm">{discount.description}</span>
                                <span className="font-body text-sm">
                                    <Price value={discount.amountWithTax} currencyCode={activeOrder.currencyCode} />
                                </span>
                            </div>
                        ))}
                    </>
                )}

                <div className="flex justify-between">
                    <span className="font-body text-sm text-grey-500">Frete</span>
                    <span className="font-body text-sm text-brand-black">
                        {activeOrder.shippingWithTax > 0
                            ? <Price value={activeOrder.shippingWithTax} currencyCode={activeOrder.currencyCode} />
                            : 'Calculado no checkout'}
                    </span>
                </div>
            </div>

            <div className="border-t border-grey-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-grey-500">Total</span>
                    <span className="font-title text-xl font-medium text-brand-black">
                        <Price value={activeOrder.totalWithTax} currencyCode={activeOrder.currencyCode} />
                    </span>
                </div>
            </div>

            <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">FINALIZAR PEDIDO</Link>
            </Button>

            <Button variant="outline" size="lg" className="w-full mt-3" asChild>
                <Link href="/collection/masculino">CONTINUAR COMPRANDO</Link>
            </Button>
        </div>
    );
}
