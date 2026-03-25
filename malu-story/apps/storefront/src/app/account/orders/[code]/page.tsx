import type {Metadata} from 'next';
import {ChevronLeft, CheckCircle2, Circle, Package, Truck, MapPin} from 'lucide-react';
import {query} from '@/lib/vendure/api';
import {GetOrderDetailQuery} from '@/lib/vendure/queries';
import Image from 'next/image';
import {getActiveCustomer} from '@/lib/vendure/actions';
import {notFound, redirect} from 'next/navigation';
import {Price} from '@/components/commerce/price';
import {MaluBadge} from '@/components/ui/malu-badge';
import {formatDate} from '@/lib/format';
import Link from 'next/link';

type OrderDetailPageProps = PageProps<'/account/orders/[code]'>;

export async function generateMetadata({params}: OrderDetailPageProps): Promise<Metadata> {
    const {code} = await params;
    return {title: `Pedido ${code}`};
}

type OrderState = 'Created' | 'PaymentPending' | 'PaymentSettled' | 'Shipped' | 'Delivered' | 'Cancelled';

const STATUS_STEPS: {state: OrderState; label: string; icon: typeof Package}[] = [
    {state: 'PaymentPending', label: 'Aguardando Pagamento', icon: Circle},
    {state: 'PaymentSettled', label: 'Pagamento Confirmado', icon: CheckCircle2},
    {state: 'Shipped', label: 'Enviado', icon: Truck},
    {state: 'Delivered', label: 'Entregue', icon: MapPin},
];

const STATE_ORDER: Record<string, number> = {
    Created: 0,
    PaymentPending: 1,
    PaymentSettled: 2,
    Shipped: 3,
    Delivered: 4,
    Cancelled: -1,
};

function OrderStatusTimeline({state}: {state: string}) {
    const currentIndex = STATE_ORDER[state] ?? 0;
    const isCancelled = state === 'Cancelled';

    if (isCancelled) {
        return (
            <div className="flex items-center gap-2 py-3">
                <span className="inline-block rounded-sm px-2 py-0.5 font-body text-xs uppercase font-medium bg-red-50 text-red-600">
                    Cancelado
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
                const stepIndex = STATE_ORDER[step.state];
                const isCompleted = currentIndex >= stepIndex;
                const isCurrent = currentIndex === stepIndex;
                const isLast = idx === STATUS_STEPS.length - 1;

                return (
                    <div key={step.state} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isCompleted
                                        ? 'bg-green-600 text-white'
                                        : 'bg-grey-100 text-grey-400'
                                }`}
                            >
                                <step.icon className="h-3.5 w-3.5"/>
                            </div>
                            {!isLast && (
                                <div className={`w-0.5 h-6 ${isCompleted ? 'bg-green-600' : 'bg-grey-200'}`}/>
                            )}
                        </div>
                        <div className="pb-5">
                            <p
                                className={`font-body text-sm font-medium ${
                                    isCurrent
                                        ? 'text-green-600'
                                        : isCompleted
                                        ? 'text-brand-black'
                                        : 'text-grey-400'
                                }`}
                            >
                                {step.label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function getOrderBadge(state: string) {
    if (state === 'PaymentPending' || state === 'Created') return <MaluBadge label="Novo" variant="novo"/>;
    if (state === 'PaymentSettled') return <MaluBadge label="Pago" variant="sale"/>;
    if (state === 'Shipped') return <MaluBadge label="Enviado" variant="sale"/>;
    if (state === 'Delivered') return <MaluBadge label="Entregue" variant="entregue"/>;
    if (state === 'Cancelled') {
        return (
            <span className="inline-block rounded-sm px-2 py-0.5 font-body text-xs uppercase font-medium bg-red-50 text-red-600">
                Cancelado
            </span>
        );
    }
    return <span className="font-body text-xs text-grey-500">{state}</span>;
}

export default async function OrderDetailPage(props: PageProps<'/account/orders/[code]'>) {
    const params = await props.params;
    const {code} = params;
    const activeCustomer = await getActiveCustomer();

    const {data} = await query(GetOrderDetailQuery, {code}, {useAuthToken: true, fetch: {}});

    if (!data.orderByCode) return redirect('/account/orders');
    if (data.orderByCode.customer?.id !== activeCustomer?.id) return notFound();

    const order = data.orderByCode;

    return (
        <div>
            {/* Back + Header */}
            <div className="mb-6">
                <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-1 font-body text-sm text-grey-500 hover:text-brand-black transition-colors mb-4"
                >
                    <ChevronLeft className="h-4 w-4"/>
                    Voltar para Pedidos
                </Link>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="font-title text-2xl text-brand-black">
                            Pedido {order.code}
                        </h1>
                        <p className="font-body text-sm text-grey-500 mt-0.5">
                            Realizado em {formatDate(order.createdAt, 'long')}
                        </p>
                    </div>
                    {getOrderBadge(order.state)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — Items + Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="border border-grey-200 rounded-lg overflow-hidden">
                        <div className="px-5 py-4 border-b border-grey-200 bg-grey-50">
                            <p className="font-title text-sm font-semibold text-brand-black uppercase tracking-wide">
                                Itens do Pedido
                            </p>
                        </div>
                        <div className="divide-y divide-grey-100">
                            {order.lines.map((line) => (
                                <div key={line.id} className="flex gap-4 px-5 py-4">
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-grey-100 flex-shrink-0">
                                        {line.productVariant.product.featuredAsset && (
                                            <Image
                                                src={line.productVariant.product.featuredAsset.preview}
                                                alt={line.productVariant.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${line.productVariant.product.slug}`}
                                            className="font-title text-sm font-medium text-brand-black hover:text-green-600 transition-colors line-clamp-2"
                                        >
                                            {line.productVariant.product.name}
                                        </Link>
                                        <p className="font-body text-xs text-grey-500 mt-0.5">
                                            {line.productVariant.name}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-body text-sm font-medium text-brand-black">
                                            <Price value={line.linePriceWithTax} currencyCode={order.currencyCode}/>
                                        </p>
                                        <p className="font-body text-xs text-grey-500 mt-0.5">
                                            {line.quantity} × <Price value={line.unitPriceWithTax} currencyCode={order.currencyCode}/>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border border-grey-200 rounded-lg overflow-hidden">
                        <div className="px-5 py-4 border-b border-grey-200 bg-grey-50">
                            <p className="font-title text-sm font-semibold text-brand-black uppercase tracking-wide">
                                Resumo do Pedido
                            </p>
                        </div>
                        <div className="px-5 py-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-body text-sm text-grey-500">Subtotal</span>
                                <span className="font-body text-sm text-brand-black">
                                    <Price value={order.subTotalWithTax} currencyCode={order.currencyCode}/>
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-body text-sm text-grey-500">Frete</span>
                                <span className="font-body text-sm text-brand-black">
                                    <Price value={order.shippingWithTax} currencyCode={order.currencyCode}/>
                                </span>
                            </div>
                            {order.discounts.map((discount, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span className="font-body text-sm text-grey-500">{discount.description}</span>
                                    <span className="font-body text-sm text-green-600">
                                        −<Price value={discount.amountWithTax} currencyCode={order.currencyCode}/>
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-grey-200 pt-3 mt-2 flex justify-between">
                                <span className="font-title text-base font-medium text-brand-black">Total</span>
                                <span className="font-title text-xl font-medium text-brand-black">
                                    <Price value={order.totalWithTax} currencyCode={order.currencyCode}/>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Timeline + Address + Payment */}
                <div className="space-y-6">
                    {/* Status Timeline */}
                    <div className="border border-grey-200 rounded-lg overflow-hidden">
                        <div className="px-5 py-4 border-b border-grey-200 bg-grey-50">
                            <p className="font-title text-sm font-semibold text-brand-black uppercase tracking-wide">
                                Status do Pedido
                            </p>
                        </div>
                        <div className="px-5 py-4">
                            <OrderStatusTimeline state={order.state}/>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="border border-grey-200 rounded-lg overflow-hidden">
                            <div className="px-5 py-4 border-b border-grey-200 bg-grey-50">
                                <p className="font-title text-sm font-semibold text-brand-black uppercase tracking-wide">
                                    Endereço de Entrega
                                </p>
                            </div>
                            <div className="px-5 py-4 font-body text-sm text-grey-600 space-y-0.5">
                                <p className="font-medium text-brand-black">{order.shippingAddress.fullName}</p>
                                {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                                <p>{order.shippingAddress.streetLine1}</p>
                                {order.shippingAddress.streetLine2 && <p>{order.shippingAddress.streetLine2}</p>}
                                <p>
                                    {order.shippingAddress.city}
                                    {order.shippingAddress.province && `, ${order.shippingAddress.province}`}{' '}
                                    {order.shippingAddress.postalCode}
                                </p>
                                <p>{order.shippingAddress.country}</p>
                                {order.shippingAddress.phoneNumber && (
                                    <p className="pt-1">{order.shippingAddress.phoneNumber}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment */}
                    {order.payments && order.payments.length > 0 && (
                        <div className="border border-grey-200 rounded-lg overflow-hidden">
                            <div className="px-5 py-4 border-b border-grey-200 bg-grey-50">
                                <p className="font-title text-sm font-semibold text-brand-black uppercase tracking-wide">
                                    Pagamento
                                </p>
                            </div>
                            <div className="px-5 py-4">
                                {order.payments.map((payment) => (
                                    <div key={payment.id} className="space-y-2 font-body text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-grey-500">Método</span>
                                            <span className="font-medium text-brand-black">{payment.method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-grey-500">Valor</span>
                                            <span className="text-brand-black">
                                                <Price value={payment.amount} currencyCode={order.currencyCode}/>
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-grey-500">Status</span>
                                            <span className="text-brand-black">{payment.state}</span>
                                        </div>
                                        {payment.transactionId && (
                                            <div className="flex justify-between">
                                                <span className="text-grey-500">ID</span>
                                                <span className="font-mono text-xs text-brand-black">{payment.transactionId}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
