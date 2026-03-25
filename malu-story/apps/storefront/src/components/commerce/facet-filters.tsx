'use client';

import { use } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { ResultOf } from '@/graphql';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {SearchProductsQuery} from "@/lib/vendure/queries";

interface FacetFiltersProps {
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
}

export  function FacetFilters({ productDataPromise }: FacetFiltersProps) {
    const result = use(productDataPromise);
    const searchResult = result.data.search;
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Group facet values by facet
    interface FacetGroup {
        id: string;
        name: string;
        values: Array<{ id: string; name: string; count: number }>;
    }

    const facetGroups = searchResult.facetValues.reduce((acc: Record<string, FacetGroup>, item) => {
        const facetName = item.facetValue.facet.name;
        if (!acc[facetName]) {
            acc[facetName] = {
                id: item.facetValue.facet.id,
                name: facetName,
                values: []
            };
        }
        acc[facetName].values.push({
            id: item.facetValue.id,
            name: item.facetValue.name,
            count: item.count
        });
        return acc;
    }, {});

    const selectedFacets = searchParams.getAll('facets');

    const toggleFacet = (facetId: string) => {
        const params = new URLSearchParams(searchParams);
        const current = params.getAll('facets');

        if (current.includes(facetId)) {
            params.delete('facets');
            current.filter(id => id !== facetId).forEach(id => params.append('facets', id));
        } else {
            params.append('facets', facetId);
        }

        // Reset to page 1 when filters change
        params.delete('page');

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('facets');
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    const hasActiveFilters = selectedFacets.length > 0;

    if (Object.keys(facetGroups).length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg uppercase text-brand-black">Filtros</h2>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}
                            className="font-body text-xs text-grey-500 hover:text-green-600">
                        Limpar
                    </Button>
                )}
            </div>

            {Object.entries(facetGroups).map(([facetName, facet]) => (
                <div key={facet.id} className="space-y-3">
                    <h3 className="font-title font-semibold text-sm text-brand-black uppercase tracking-wide">
                        {facetName}
                    </h3>
                    <div className="space-y-2">
                        {facet.values.map((value) => {
                            const isChecked = selectedFacets.includes(value.id);
                            return (
                                <div key={value.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={value.id}
                                        checked={isChecked}
                                        onCheckedChange={() => toggleFacet(value.id)}
                                        className={isChecked ? 'border-green-600 text-green-600' : 'border-grey-300'}
                                    />
                                    <Label
                                        htmlFor={value.id}
                                        className={`font-body text-sm cursor-pointer flex items-center gap-2 ${isChecked ? 'text-green-600' : 'text-brand-black'}`}
                                    >
                                        {value.name}
                                        <span className="text-xs text-grey-400">
                                            ({value.count})
                                        </span>
                                    </Label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
