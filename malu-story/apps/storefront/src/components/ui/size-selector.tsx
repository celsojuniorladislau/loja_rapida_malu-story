'use client';

import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  unavailableSizes?: string[];
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  unavailableSizes = [],
}: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const isUnavailable = unavailableSizes.includes(size);
        const isSelected = selectedSize === size;

        return (
          <button
            key={size}
            type="button"
            onClick={() => !isUnavailable && onSelect(size)}
            disabled={isUnavailable}
            className={cn(
              'h-btn-sm rounded-pill border font-body text-sm px-4 transition-colors duration-150 ease-functional',
              isSelected
                ? 'bg-green-600 text-white border-green-600'
                : 'border-grey-300 text-brand-black hover:border-brand-black',
              isUnavailable && 'opacity-35 line-through cursor-not-allowed pointer-events-none',
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
