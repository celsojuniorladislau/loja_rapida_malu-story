import Link from "next/link";

interface HeroSectionProps {
    title: string;
    subtitle?: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel?: string;
    ctaSecondaryHref?: string;
}

export function HeroSection({
    title,
    subtitle,
    ctaPrimaryLabel,
    ctaPrimaryHref,
    ctaSecondaryLabel,
    ctaSecondaryHref,
}: HeroSectionProps) {
    return (
        <section className="bg-green-900 min-h-[90vh] flex items-center px-6 md:px-12 lg:px-24">
            <div>
                <h1 className="font-display font-bold text-5xl md:text-7xl text-white uppercase leading-none">
                    {title}
                </h1>
                {subtitle && (
                    <p className="font-body text-lg text-grey-300 mt-4">{subtitle}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                    <Link
                        href={ctaPrimaryHref}
                        className="bg-yellow-400 text-brand-black font-display font-bold text-sm uppercase tracking-wider px-8 py-4 hover:bg-yellow-300 transition-colors duration-200 text-center"
                    >
                        {ctaPrimaryLabel}
                    </Link>
                    {ctaSecondaryLabel && ctaSecondaryHref && (
                        <Link
                            href={ctaSecondaryHref}
                            className="border-2 border-white text-white font-display font-bold text-sm uppercase tracking-wider px-8 py-4 hover:bg-white hover:text-green-900 transition-colors duration-200 text-center"
                        >
                            {ctaSecondaryLabel}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
