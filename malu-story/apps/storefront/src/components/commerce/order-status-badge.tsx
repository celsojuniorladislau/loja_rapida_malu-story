import {Badge} from '@/components/ui/badge';
import {
    ShoppingCart,
    CreditCard,
    Clock,
    CheckCircle,
    Truck,
    PackageCheck,
    Package,
    XCircle,
    type LucideIcon,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: LucideIcon }> = {
    AddingItems: {color: 'bg-grey-100 text-grey-700', label: 'Carrinho', icon: ShoppingCart},
    ArrangingPayment: {color: 'bg-yellow-50 text-grey-700', label: 'Aguardando Pagamento', icon: CreditCard},
    PaymentAuthorized: {color: 'bg-blue-50 text-blue-600', label: 'Pagamento Autorizado', icon: Clock},
    PaymentSettled: {color: 'bg-green-50 text-green-600', label: 'Pago', icon: CheckCircle},
    PartiallyShipped: {color: 'bg-blue-50 text-blue-600', label: 'Parcialmente Enviado', icon: Package},
    Shipped: {color: 'bg-green-50 text-green-600', label: 'Enviado', icon: Truck},
    PartiallyDelivered: {color: 'bg-green-50 text-green-600', label: 'Parcialmente Entregue', icon: PackageCheck},
    Delivered: {color: 'bg-green-50 text-green-600', label: 'Entregue', icon: PackageCheck},
    Cancelled: {color: 'bg-red-100 text-red-600', label: 'Cancelado', icon: XCircle},
};

interface OrderStatusBadgeProps {
    state: string;
}

export function OrderStatusBadge({state}: OrderStatusBadgeProps) {
    const config = STATUS_CONFIG[state] || {color: 'bg-gray-100 text-gray-800', label: state, icon: Clock};
    const Icon = config.icon;

    return (
        <Badge className={config.color} variant="secondary">
            <Icon className="h-3 w-3 mr-1"/>
            {config.label}
        </Badge>
    );
}
