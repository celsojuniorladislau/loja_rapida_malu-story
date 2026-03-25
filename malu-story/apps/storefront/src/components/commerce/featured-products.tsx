import Image from 'next/image';
import Link from 'next/link';
import {Suspense} from 'react';
import {cacheLife} from "next/cache";
import {query} from "@/lib/vendure/api";
import {GetCollectionProductsQuery} from "@/lib/vendure/queries";
import {readFragment} from "@/graphql";
import {ProductCardFragment} from "@/lib/vendure/fragments";

async function getFeaturedCollectionProducts() {
    'use cache'
    cacheLife('days')

    const result = await query(GetCollectionProductsQuery, {
        slug: "masculino",
        input: {
            collectionSlug: "masculino",
            take: 8,
            skip: 0,
            groupByProduct: true
        }
    });

    return result.data.search.items;
}

export async function FeaturedProducts() {
    const products = await getFeaturedCollectionProducts();

    if (!products.length) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 md:px-12 py-8">
            {products.map((productProp, i) => {
                const product = readFragment(ProductCardFragment, productProp);
                return (
                    <Link
                        key={i}
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
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-grey-400 text-sm">
                                    Sem imagem
                                </div>
                            )}
                        </div>
                        <p className="font-title text-base text-brand-black mt-2 line-clamp-2">
                            {product.productName}
                        </p>
                        <Suspense fallback={<div className="h-4 w-20 bg-grey-200 rounded mt-1 animate-pulse"/>}>
                            <p className="font-body text-sm text-grey-600">
                                {product.priceWithTax.__typename === 'PriceRange' ? (
                                    product.priceWithTax.min !== product.priceWithTax.max
                                        ? `a partir de ${(product.priceWithTax.min / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`
                                        : (product.priceWithTax.min / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
                                ) : product.priceWithTax.__typename === 'SinglePrice' ? (
                                    (product.priceWithTax.value / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
                                ) : null}
                            </p>
                        </Suspense>
                    </Link>
                );
            })}
        </div>
    );
}
