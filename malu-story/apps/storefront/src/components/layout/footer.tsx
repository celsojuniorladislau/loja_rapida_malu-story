import {cacheLife} from 'next/cache';
import Link from "next/link";

const NAV_LINKS = [
    { label: 'Masculino', href: '/collection/masculino' },
    { label: 'Feminino', href: '/collection/feminino' },
    { label: 'Infantil', href: '/collection/infantil' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Contato', href: '/contato' },
];

async function Copyright() {
    'use cache'
    cacheLife('days');

    return (
        <p className="font-body text-sm text-white/60">
            © {new Date().getFullYear()} Malu Store. Todos os direitos reservados.
        </p>
    )
}

export async function Footer() {
    'use cache'
    cacheLife('days');

    return (
        <footer className="bg-green-900 mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <Link href="/" className="font-display font-bold text-2xl uppercase text-white tracking-tight">
                            MALU STORE
                        </Link>
                    </div>

                    <div>
                        <p className="font-title font-semibold text-sm uppercase tracking-wide text-white mb-4">
                            Navegação
                        </p>
                        <ul className="space-y-2">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="font-body text-sm text-white/70 hover:text-white transition-colors duration-150"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <Copyright/>
                </div>
            </div>
        </footer>
    );
}
