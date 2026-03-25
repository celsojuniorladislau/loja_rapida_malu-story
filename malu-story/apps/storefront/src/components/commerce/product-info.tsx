'use client';

import {useState, useMemo, useTransition} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {SizeSelector} from '@/components/ui/size-selector';
import {ShoppingCart, CheckCircle2} from 'lucide-react';
import {addToCart} from '@/app/product/[slug]/actions';
import {toast} from 'sonner';
import Link from 'next/link';

interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        description: string;
        variants: Array<{
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            stockLevel: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
                groupId: string;
                group: {
                    id: string;
                    code: string;
                    name: string;
                };
            }>;
        }>;
        optionGroups: Array<{
            id: string;
            code: string;
            name: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
            }>;
        }>;
    };
    searchParams: { [key: string]: string | string[] | undefined };
    collection?: { name: string; slug: string } | null;
}

export function ProductInfo({product, searchParams, collection}: ProductInfoProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);

    // Freight calculator state
    const [cep, setCep] = useState('');
    const [freteInfo, setFreteInfo] = useState<string | null>(null);
    const [freteLoading, setFreteLoading] = useState(false);

    // Initialize selected options from URL
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};

        product.optionGroups.forEach((group) => {
            const paramValue = searchParams[group.code];
            if (typeof paramValue === 'string') {
                const option = group.options.find((opt) => opt.code === paramValue);
                if (option) {
                    initialOptions[group.id] = option.id;
                }
            }
        });

        return initialOptions;
    });

    // Find the matching variant based on selected options
    const selectedVariant = useMemo(() => {
        if (product.variants.length === 1) {
            return product.variants[0];
        }

        if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
            return null;
        }

        return product.variants.find((variant) => {
            const variantOptionIds = variant.options.map((opt) => opt.id);
            const selectedOptionIds = Object.values(selectedOptions);
            return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
        });
    }, [selectedOptions, product.variants, product.optionGroups]);

    const handleOptionChange = (groupId: string, optionId: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupId]: optionId,
        }));

        const group = product.optionGroups.find((g) => g.id === groupId);
        const option = group?.options.find((opt) => opt.id === optionId);

        if (group && option) {
            const params = new URLSearchParams(currentSearchParams);
            params.set(group.code, option.code);
            router.push(`${pathname}?${params.toString()}`, {scroll: false});
        }
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) return;

        startTransition(async () => {
            const result = await addToCart(selectedVariant.id, 1);

            if (result.success) {
                setIsAdded(true);
                toast.success('Adicionado ao carrinho', {
                    description: `${product.name} foi adicionado ao seu carrinho`,
                });
                setTimeout(() => setIsAdded(false), 2000);
            } else {
                toast.error('Erro', {
                    description: result.error || 'Não foi possível adicionar ao carrinho',
                });
            }
        });
    };

    const handleCalcFrete = async () => {
        const cleaned = cep.replace(/\D/g, '');
        if (cleaned.length !== 8) {
            setFreteInfo('CEP inválido. Digite 8 dígitos.');
            return;
        }
        setFreteLoading(true);
        setFreteInfo(null);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
            const data = await res.json();
            if (data.erro) {
                setFreteInfo('CEP não encontrado.');
            } else {
                setFreteInfo(`${data.logradouro ? data.logradouro + ', ' : ''}${data.bairro ? data.bairro + ' — ' : ''}${data.localidade}/${data.uf}`);
            }
        } catch {
            setFreteInfo('Erro ao consultar o CEP.');
        } finally {
            setFreteLoading(false);
        }
    };

    const isInStock = selectedVariant && selectedVariant.stockLevel !== 'OUT_OF_STOCK';
    const canAddToCart = selectedVariant && isInStock;

    const price = selectedVariant
        ? (selectedVariant.priceWithTax / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
        : null;

    return (
        <div>
            {/* Breadcrumb */}
            {collection && (
                <nav className="font-body text-sm text-grey-500 mb-4">
                    <Link href="/" className="hover:underline">Início</Link>
                    <span className="mx-1">/</span>
                    <Link href={`/collection/${collection.slug}`} className="hover:underline">{collection.name}</Link>
                    <span className="mx-1">/</span>
                    <span>{product.name}</span>
                </nav>
            )}

            {/* Product Name */}
            <h1 className="font-title font-medium text-3xl text-brand-black">{product.name}</h1>

            {/* Price */}
            {price && (
                <p className="font-body font-medium text-2xl text-brand-black mt-2">{price}</p>
            )}

            <div className="border-t border-grey-200 my-6" />

            {/* Option Groups (Size Selectors) */}
            {product.optionGroups.length > 0 && (
                <div className="space-y-5">
                    {product.optionGroups.map((group) => {
                        const sizes = group.options.map((opt) => opt.name);
                        const selectedOptionId = selectedOptions[group.id];
                        const selectedSize = group.options.find((opt) => opt.id === selectedOptionId)?.name ?? null;

                        const handleSizeSelect = (sizeName: string) => {
                            const option = group.options.find((opt) => opt.name === sizeName);
                            if (option) handleOptionChange(group.id, option.id);
                        };

                        return (
                            <div key={group.id}>
                                <p className="font-body text-sm font-medium text-brand-black uppercase mb-3">
                                    {group.name}
                                </p>
                                <SizeSelector
                                    sizes={sizes}
                                    selectedSize={selectedSize}
                                    onSelect={handleSizeSelect}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Size Guide Link */}
            <a
                href="#guia-tamanhos"
                className="font-body text-sm text-blue-500 underline mt-2 mb-6 inline-block"
            >
                Guia de tamanhos
            </a>

            {/* Stock Status */}
            {selectedVariant && !isInStock && (
                <p className="font-body text-sm text-red-600 mb-3">Produto esgotado</p>
            )}

            {/* Add to Cart Button */}
            <Button
                size="lg"
                className="w-full"
                disabled={!canAddToCart || isPending}
                onClick={handleAddToCart}
            >
                {isAdded ? (
                    <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Adicionado!
                    </>
                ) : (
                    <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {isPending
                            ? 'Adicionando...'
                            : !selectedVariant && product.optionGroups.length > 0
                                ? 'Selecione um tamanho'
                                : !isInStock
                                    ? 'Esgotado'
                                    : 'ADICIONAR AO CARRINHO'}
                    </>
                )}
            </Button>

            {/* Freight Calculator */}
            <div className="mt-6">
                <p className="font-body text-sm font-medium uppercase mb-2">CALCULAR FRETE</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Digite seu CEP"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        maxLength={9}
                        className="h-input flex-1 rounded-sm border border-grey-300 focus:border-green-600 outline-none px-4 font-body text-sm"
                    />
                    <Button
                        variant="outline"
                        size="default"
                        type="button"
                        onClick={handleCalcFrete}
                        disabled={freteLoading}
                    >
                        {freteLoading ? '...' : 'CALCULAR'}
                    </Button>
                </div>
                {freteInfo && (
                    <p className="font-body text-sm text-grey-700 mt-2">{freteInfo}</p>
                )}
            </div>

            {/* Description */}
            <div
                className="font-body text-base text-grey-700 mt-6 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{__html: product.description}}
            />

            {/* SKU */}
            {selectedVariant && (
                <div className="font-body text-xs text-grey-500 mt-4">
                    SKU: {selectedVariant.sku}
                </div>
            )}
        </div>
    );
}
