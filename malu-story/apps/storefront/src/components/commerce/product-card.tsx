import Image from 'next/image';
import {FragmentOf, readFragment} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {Suspense} from "react";
import Link from "next/link";

interface ProductCardProps {
    product: FragmentOf<typeof ProductCardFragment>;
}

export function ProductCard({product: productProp}: ProductCardProps) {
    const product = readFragment(ProductCardFragment, productProp);

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block"
        >
            <div className="aspect-square relative rounded-md overflow-hidden shadow-100 bg-grey-100">
                {product.productAsset ? (
                    <Image
                        src={product.productAsset.preview}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-grey-400 text-sm">
                        Sem imagem
                    </div>
                )}
            </div>
            <div className="mt-2">
                <h3 className="font-title text-base text-brand-black line-clamp-2 group-hover:text-green-600 transition-colors">
                    {product.productName}
                </h3>
                <Suspense fallback={<div className="h-4 w-24 rounded bg-grey-200 mt-1 animate-pulse"/>}>
                    <p className="font-body text-sm text-grey-600 mt-1">
                        {product.priceWithTax.__typename === 'PriceRange' ? (
                            product.priceWithTax.min !== product.priceWithTax.max ? (
                                `a partir de ${(product.priceWithTax.min / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`
                            ) : (
                                (product.priceWithTax.min / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
                            )
                        ) : product.priceWithTax.__typename === 'SinglePrice' ? (
                            (product.priceWithTax.value / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
                        ) : null}
                    </p>
                </Suspense>
            </div>
        </Link>
    );
}
