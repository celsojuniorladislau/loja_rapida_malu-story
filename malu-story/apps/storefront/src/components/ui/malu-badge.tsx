import { cn } from '@/lib/utils';

type BadgeVariant = 'novo' | 'sale' | 'esgotado' | 'entregue';

interface MaluBadgeProps {
  label: string;
  variant: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  novo: 'bg-yellow-400 text-brand-black',
  sale: 'bg-green-600 text-white',
  esgotado: 'bg-grey-400 text-white',
  entregue: 'bg-grey-100 text-grey-600',
};

export function MaluBadge({ label, variant, className }: MaluBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-sm px-2 py-0.5 font-body text-xs uppercase font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
