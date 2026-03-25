import type {Metadata} from "next";
import {FeaturedProducts} from "@/components/commerce/featured-products";
import {SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import Link from "next/link";

export const metadata: Metadata = {
    title: {
        absolute: `Malu Store — Camisas da Seleção Brasileira`,
    },
    description:
        "Camisas oficiais da Seleção Brasileira. Titular, Reserva e Feminina. Masculino, Feminino e Infantil.",
    alternates: {
        canonical: buildCanonicalUrl("/"),
    },
    openGraph: {
        title: `Malu Store — Camisas da Seleção Brasileira`,
        description: "Camisas oficiais da Seleção Brasileira.",
        type: "website",
        url: SITE_URL,
    },
};

export default async function Home(_props: PageProps<'/'>) {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-green-900 min-h-[90vh] flex items-center px-6 md:px-12 lg:px-24">
                <div>
                    <h1 className="font-display font-bold text-6xl md:text-8xl text-white uppercase leading-none">
                        VISTA AS CORES<br />DO BRASIL
                    </h1>
                    <p className="font-body text-lg text-grey-300 mt-4">
                        Camisas oficiais da Seleção Brasileira
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-10">
                        <Link
                            href="/collection/masculino"
                            className="bg-yellow-400 text-brand-black font-display font-bold text-sm uppercase tracking-wider px-8 py-4 hover:bg-yellow-300 transition-colors duration-200 text-center"
                        >
                            COMPRAR AGORA
                        </Link>
                        <Link
                            href="/collection/feminino"
                            className="border-2 border-white text-white font-display font-bold text-sm uppercase tracking-wider px-8 py-4 hover:bg-white hover:text-green-900 transition-colors duration-200 text-center"
                        >
                            VER COLEÇÃO
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-12 py-16">
                {[
                    {label: 'Masculino', href: '/collection/masculino'},
                    {label: 'Feminino', href: '/collection/feminino'},
                    {label: 'Infantil', href: '/collection/infantil'},
                ].map(({label, href}) => (
                    <Link
                        key={label}
                        href={href}
                        className="bg-green-800 rounded-lg p-8 text-white font-display font-bold text-3xl uppercase hover:scale-105 transition-transform duration-200 cursor-pointer block"
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {/* Produtos em Destaque */}
            <section>
                <h2 className="font-display font-bold text-4xl uppercase text-brand-black px-6 md:px-12 pt-16">
                    DESTAQUES
                </h2>
                <FeaturedProducts/>
            </section>

            {/* Banner PIX */}
            <section className="bg-green-600 py-12 px-6 md:px-12 text-center mt-8">
                <h2 className="font-display font-bold text-4xl text-white uppercase">
                    10% OFF PAGANDO COM PIX
                </h2>
                <p className="font-body text-white/80 mt-3">
                    Desconto aplicado automaticamente no checkout
                </p>
            </section>
        </div>
    );
}
