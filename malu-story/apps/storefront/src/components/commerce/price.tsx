'use client';

interface PriceProps {
    value: number;
    currencyCode?: string;
}

export function Price({value, currencyCode = 'BRL'}: PriceProps) {
    return (
        <>
            {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: currencyCode,
            }).format(value / 100)}
        </>
    );
}
