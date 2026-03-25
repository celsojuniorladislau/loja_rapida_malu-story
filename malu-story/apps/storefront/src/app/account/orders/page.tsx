import type {Metadata} from 'next';
import {query} from '@/lib/vendure/api';
import {GetCustomerOrdersQuery} from '@/lib/vendure/queries';
import {ArrowRightIcon} from 'lucide-react';
import {Price} from '@/components/commerce/price';
import {MaluBadge} from '@/components/ui/malu-badge';
import {formatDate} from '@/lib/format';
import Link from 'next/link';
import {redirect} from 'next/navigation';

export const metadata: Metadata = {
    title: 'Meus Pedidos',
};

const ITEMS_PER_PAGE = 10;

function getOrderBadge(state: string) {
    if (state === 'PaymentPending' || state === 'Created') {
        return <MaluBadge label="Novo" variant="novo"/>;
    }
    if (state === 'PaymentSettled' || state === 'Shipped') {
        return <MaluBadge label={state === 'Shipped' ? 'Enviado' : 'Pago'} variant="sale"/>;
    }
    if (state === 'Delivered') {
        return <MaluBadge label="Entregue" variant="entregue"/>;
    }
    if (state === 'Cancelled') {
        return (
            <span className="inline-block rounded-sm px-2 py-0.5 font-body text-xs uppercase font-medium bg-red-50 text-red-600">
                Cancelado
            </span>
        );
    }
    return <span className="font-body text-xs text-grey-500">{state}</span>;
}

export default async function OrdersPage(props: PageProps<'/account/orders'>) {
    const searchParams = await props.searchParams;
    const pageParam = searchParams.page;
    const currentPage = parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam || '1', 10);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const {data} = await query(
        GetCustomerOrdersQuery,
        {
            options: {
                take: ITEMS_PER_PAGE,
                skip,
                filter: {state: {notEq: 'AddingItems'}},
            },
        },
        {useAuthToken: true}
    );

    if (!data.activeCustomer) {
        return redirect('/sign-in');
    }

    const orders = data.activeCustomer.orders.items;
    const totalItems = data.activeCustomer.orders.totalItems;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div>
            <h1 className="font-title text-2xl text-brand-black mb-6">Meus Pedidos</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 border border-grey-200 rounded-lg">
                    <p className="font-body text-sm text-grey-500">Você ainda não fez nenhum pedido.</p>
                    <Link
                        href="/"
                        className="inline-block mt-4 font-body text-sm text-blue-500 underline"
                    >
                        Explorar produtos
                    </Link>
                </div>
            ) : (
                <>
                    <div className="border border-grey-200 rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-grey-200 bg-grey-50">
                            <span className="font-body text-xs font-medium text-grey-500 uppercase">Pedido</span>
                            <span className="font-body text-xs font-medium text-grey-500 uppercase">Data</span>
                            <span className="font-body text-xs font-medium text-grey-500 uppercase">Status</span>
                            <span className="font-body text-xs font-medium text-grey-500 uppercase">Itens</span>
                            <span className="font-body text-xs font-medium text-grey-500 uppercase text-right">Total</span>
                        </div>

                        {/* Rows */}
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="grid grid-cols-5 gap-4 px-4 py-4 border-b border-grey-100 hover:bg-grey-50 transition-colors items-center last:border-b-0"
                            >
                                <div>
                                    <Link
                                        href={`/account/orders/${order.code}`}
                                        className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-brand-black hover:text-green-600 transition-colors"
                                    >
                                        <span className="truncate max-w-[100px]">{order.code}</span>
                                        <ArrowRightIcon className="h-3.5 w-3.5 flex-shrink-0"/>
                                    </Link>
                                </div>
                                <span className="font-body text-sm text-grey-600">
                                    {formatDate(order.createdAt)}
                                </span>
                                <div>{getOrderBadge(order.state)}</div>
                                <span className="font-body text-sm text-grey-600">
                                    {order.lines.length} {order.lines.length === 1 ? 'item' : 'itens'}
                                </span>
                                <span className="font-body text-sm font-medium text-brand-black text-right">
                                    <Price value={order.totalWithTax} currencyCode={order.currencyCode}/>
                                </span>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            {currentPage > 1 && (
                                <Link
                                    href={`/account/orders?page=${currentPage - 1}`}
                                    className="font-body text-sm text-blue-500 underline px-3 py-1"
                                >
                                    Anterior
                                </Link>
                            )}
                            <span className="font-body text-sm text-grey-500">
                                Página {currentPage} de {totalPages}
                            </span>
                            {currentPage < totalPages && (
                                <Link
                                    href={`/account/orders?page=${currentPage + 1}`}
                                    className="font-body text-sm text-blue-500 underline px-3 py-1"
                                >
                                    Próxima
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
