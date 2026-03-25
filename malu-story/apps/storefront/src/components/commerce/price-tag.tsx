'use client';

interface PriceTagProps {
    currentPrice: number;
    originalPrice?: number;
    currencyCode?: string;
}

function formatPrice(value: number, currencyCode: string) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currencyCode,
    }).format(value / 100);
}

export function PriceTag({currentPrice, originalPrice, currencyCode = 'BRL'}: PriceTagProps) {
    return (
        <div className="flex items-center gap-2">
            {originalPrice !== undefined && (
                <span className="font-body text-sm text-grey-400 line-through">
                    {formatPrice(originalPrice, currencyCode)}
                </span>
            )}
            <span className="font-body text-sm font-bold text-green-600">
                {formatPrice(currentPrice, currencyCode)}
            </span>
        </div>
    );
}
