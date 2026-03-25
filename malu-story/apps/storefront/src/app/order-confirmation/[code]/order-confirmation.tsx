import {connection} from 'next/server';
import {query} from '@/lib/vendure/api';
import {graphql} from '@/graphql';
import {Button} from '@/components/ui/button';
import {CheckCircle2} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {Price} from '@/components/commerce/price';
import {notFound} from "next/navigation";

const GetOrderByCodeQuery = graphql(`
    query GetOrderByCode($code: String!) {
        orderByCode(code: $code) {
            id
            code
            state
            totalWithTax
            currencyCode
            lines {
                id
                productVariant {
                    id
                    name
                    product {
                        id
                        name
                        slug
                        featuredAsset {
                            id
                            preview
                        }
                    }
                }
                quantity
                linePriceWithTax
            }
            shippingAddress {
                fullName
                streetLine1
                streetLine2
                city
                province
                postalCode
                country
            }
        }
    }
`);

const ORDER_STATES = [
  { key: 'awaiting', label: 'Aguardando Pagamento' },
  { key: 'paid', label: 'Pago' },
  { key: 'separating', label: 'Em Separação' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'delivered', label: 'Entregue' },
] as const;

function getActiveStateIndex(state: string): number {
  const s = state.toLowerCase();
  if (s.includes('deliver')) return 4;
  if (s.includes('ship') || s.includes('transit')) return 3;
  if (s.includes('fulfilled') || s.includes('partial')) return 2;
  if (s.includes('settle') || s.includes('authorized') || s.includes('paid')) return 1;
  return 0;
}

function OrderTimeline({ state }: { state: string }) {
  const activeIndex = getActiveStateIndex(state);

  return (
    <div className="py-6">
      <h2 className="font-title text-sm font-bold uppercase text-brand-black mb-4">Status do Pedido</h2>
      <div className="flex flex-col items-start gap-0">
        {ORDER_STATES.map((step, index) => {
          const isComplete = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${
                    isComplete ? 'bg-green-400' : isActive ? 'bg-green-600' : 'bg-grey-300'
                  }`}
                />
                {index < ORDER_STATES.length - 1 && (
                  <div className={`w-0.5 h-8 mx-auto ${isComplete ? 'bg-green-400' : 'bg-grey-200'}`} />
                )}
              </div>
              <p
                className={`font-body text-sm mt-0 ${
                  isActive ? 'text-green-600 font-medium' : isPending ? 'text-grey-400' : 'text-grey-500'
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function OrderConfirmation({params}: PageProps<'/order-confirmation/[code]'>) {
    await connection();
    const {code} = await params;
    let order;

    try {
        const {data} = await query(GetOrderByCodeQuery, {code}, {useAuthToken: true});
        order = data.orderByCode;
    }
    catch (error) {
        notFound();
    }

    if (!order) {
       notFound();
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                    <h1 className="font-display font-bold text-4xl uppercase text-brand-black text-center mt-6">
                        Pedido Confirmado!
                    </h1>
                    <p className="font-body text-lg text-grey-600 text-center mt-2">
                        Obrigado! Seu número de pedido é{' '}
                        <span className="font-medium text-brand-black">#{order.code}</span>
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Order summary */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="border border-grey-200 rounded-md overflow-hidden">
                            <div className="px-4 py-3 border-b border-grey-200 bg-grey-50">
                                <h2 className="font-title text-sm font-bold uppercase text-brand-black">Resumo do Pedido</h2>
                            </div>
                            <div className="divide-y divide-grey-100">
                                {order.lines.map((line) => (
                                    <div key={line.id} className="flex gap-4 items-center p-4">
                                        {line.productVariant.product.featuredAsset && (
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={line.productVariant.product.featuredAsset.preview}
                                                    alt={line.productVariant.name}
                                                    width={72}
                                                    height={72}
                                                    className="rounded-sm object-cover h-[72px] w-[72px] object-center"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-body text-sm font-medium text-brand-black">{line.productVariant.product.name}</p>
                                            {line.productVariant.name !== line.productVariant.product.name && (
                                                <p className="font-body text-xs text-grey-500 mt-0.5">{line.productVariant.name}</p>
                                            )}
                                        </div>
                                        <div className="text-center w-12">
                                            <p className="font-body text-xs text-grey-500">Qtd.</p>
                                            <p className="font-body text-sm font-medium text-brand-black">{line.quantity}</p>
                                        </div>
                                        <div className="text-right w-24">
                                            <p className="font-body text-sm font-medium text-brand-black">
                                                <Price value={line.linePriceWithTax} currencyCode={order.currencyCode}/>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-3 border-t border-grey-200 flex justify-between items-center">
                                <span className="font-title text-base font-bold uppercase text-brand-black">Total</span>
                                <span className="font-body text-base font-medium text-brand-black">
                                    <Price value={order.totalWithTax} currencyCode={order.currencyCode}/>
                                </span>
                            </div>
                        </div>

                        {order.shippingAddress && (
                            <div className="border border-grey-200 rounded-md overflow-hidden">
                                <div className="px-4 py-3 border-b border-grey-200 bg-grey-50">
                                    <h2 className="font-title text-sm font-bold uppercase text-brand-black">Endereço de Entrega</h2>
                                </div>
                                <div className="p-4 space-y-0.5">
                                    <p className="font-body text-sm font-medium text-brand-black">{order.shippingAddress.fullName}</p>
                                    <p className="font-body text-sm text-grey-500">
                                        {order.shippingAddress.streetLine1}
                                        {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
                                    </p>
                                    <p className="font-body text-sm text-grey-500">
                                        {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                                        {order.shippingAddress.postalCode}
                                    </p>
                                    <p className="font-body text-sm text-grey-500">{order.shippingAddress.country}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline + Actions */}
                    <div className="space-y-6">
                        <OrderTimeline state={order.state} />

                        <div className="space-y-3">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/account/orders">VER MEUS PEDIDOS</Link>
                            </Button>
                            <Button asChild variant="default" className="w-full">
                                <Link href="/">CONTINUAR COMPRANDO</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
