import type {Metadata} from 'next';
import Link from 'next/link';
import {Package, User, MapPin} from 'lucide-react';
import {noIndexRobots} from '@/lib/metadata';

export const metadata: Metadata = {
    robots: noIndexRobots(),
};

const navItems = [
    {href: '/account', label: 'Início', icon: User},
    {href: '/account/orders', label: 'Pedidos', icon: Package},
    {href: '/account/addresses', label: 'Endereços', icon: MapPin},
    {href: '/account/profile', label: 'Perfil', icon: User},
];

export default async function AccountLayout({children}: LayoutProps<'/account'>) {
    return (
        <div className="bg-white min-h-screen"><div className="container mx-auto px-4 pt-20 pb-16">
            <div className="flex gap-8">
                <aside className="w-56 shrink-0">
                    <p className="font-display font-bold text-xs uppercase text-grey-400 tracking-widest mb-4 px-3">
                        Minha Conta
                    </p>
                    <nav className="space-y-0.5">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 font-body text-sm font-medium text-brand-black rounded-md hover:bg-grey-100 transition-colors duration-150"
                            >
                                <item.icon className="h-4 w-4 text-grey-400 flex-shrink-0"/>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div></div>
    );
}
