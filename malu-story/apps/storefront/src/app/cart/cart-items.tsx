import Image from 'next/image';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Minus, Plus, X, ShoppingBag} from 'lucide-react';
import {Price} from '@/components/commerce/price';
import {removeFromCart, adjustQuantity} from './actions';

type ActiveOrder = {
    id: string;
    currencyCode: string;
    lines: Array<{
        id: string;
        quantity: number;
        unitPriceWithTax: number;
        linePriceWithTax: number;
        productVariant: {
            id: string;
            name: string;
            sku: string;
            product: {
                name: string;
                slug: string;
                featuredAsset?: {
                    preview: string;
                } | null;
            };
        };
    }>;
};

export async function CartItems({activeOrder}: { activeOrder: ActiveOrder | null }) {
    if (!activeOrder || activeOrder.lines.length === 0) {
        return (
            <div className="text-center py-20">
                <ShoppingBag className="mx-auto mb-4 text-grey-300" size={64} strokeWidth={1.2} />
                <p className="font-body text-grey-500 text-lg mb-6">Seu carrinho está vazio</p>
                <Button asChild variant="outline">
                    <Link href="/collection/masculino">Continuar comprando</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2">
            {activeOrder.lines.map((line) => (
                <div
                    key={line.id}
                    className="flex gap-4 py-4 border-b border-grey-200"
                >
                    {/* Product image */}
                    {line.productVariant.product.featuredAsset && (
                        <Link href={`/product/${line.productVariant.product.slug}`} className="flex-shrink-0">
                            <Image
                                src={line.productVariant.product.featuredAsset.preview}
                                alt={line.productVariant.name}
                                width={80}
                                height={80}
                                className="rounded-md object-cover w-20 h-20"
                            />
                        </Link>
                    )}

                    <div className="flex-grow min-w-0">
                        <Link
                            href={`/product/${line.productVariant.product.slug}`}
                            className="font-title text-base text-brand-black hover:underline block"
                        >
                            {line.productVariant.product.name}
                        </Link>

                        {line.productVariant.name !== line.productVariant.product.name && (
                            <p className="font-body text-sm text-grey-500 mt-0.5">
                                {line.productVariant.name}
                            </p>
                        )}

                        <p className="font-body text-sm font-medium text-brand-black mt-1">
                            <Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode} />
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center border border-grey-300 rounded-sm">
                                <form
                                    action={async () => {
                                        'use server';
                                        await adjustQuantity(line.id, Math.max(1, line.quantity - 1));
                                    }}
                                >
                                    <button
                                        type="submit"
                                        disabled={line.quantity <= 1}
                                        className="w-8 h-8 flex items-center justify-center text-brand-black hover:bg-grey-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                </form>

                                <span className="w-8 text-center font-body text-sm font-medium text-brand-black">
                                    {line.quantity}
                                </span>

                                <form
                                    action={async () => {
                                        'use server';
                                        await adjustQuantity(line.id, line.quantity + 1);
                                    }}
                                >
                                    <button
                                        type="submit"
                                        className="w-8 h-8 flex items-center justify-center text-brand-black hover:bg-grey-100 transition-colors"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </form>
                            </div>

                            {/* Remove button */}
                            <form
                                action={async () => {
                                    'use server';
                                    await removeFromCart(line.id);
                                }}
                            >
                                <button
                                    type="submit"
                                    className="text-grey-400 hover:text-red-500 transition-colors p-1"
                                    aria-label="Remover item"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
