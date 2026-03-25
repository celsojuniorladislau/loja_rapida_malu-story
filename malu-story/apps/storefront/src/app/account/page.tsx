import type {Metadata} from 'next';
import Link from 'next/link';
import {Package, MapPin, User} from 'lucide-react';
import {getActiveCustomer} from '@/lib/vendure/actions';
import {redirect} from 'next/navigation';

export const metadata: Metadata = {
    title: 'Minha Conta',
};

const shortcuts = [
    {
        href: '/account/orders',
        icon: Package,
        title: 'Meus Pedidos',
        description: 'Acompanhe e gerencie seus pedidos',
    },
    {
        href: '/account/addresses',
        icon: MapPin,
        title: 'Meus Endereços',
        description: 'Gerencie seus endereços de entrega',
    },
    {
        href: '/account/profile',
        icon: User,
        title: 'Dados Pessoais',
        description: 'Atualize seu perfil e senha',
    },
];

export default async function AccountDashboardPage() {
    const customer = await getActiveCustomer();

    if (!customer) {
        return redirect('/sign-in');
    }

    const displayName = customer.firstName || customer.emailAddress;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-title text-2xl text-brand-black">
                    Olá, {displayName}!
                </h1>
                <p className="font-body text-sm text-grey-500 mt-1">
                    Bem-vinda à sua conta Malu Store
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shortcuts.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="border border-grey-200 rounded-lg p-6 hover:border-green-600 transition-colors duration-150 cursor-pointer group"
                    >
                        <item.icon className="h-6 w-6 text-grey-400 group-hover:text-green-600 transition-colors mb-3"/>
                        <p className="font-title text-base font-semibold text-brand-black mb-1">{item.title}</p>
                        <p className="font-body text-sm text-grey-500">{item.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
