'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Truck, CreditCard, Edit, Mail } from 'lucide-react';
import { useCheckout } from '../checkout-provider';
import { placeOrder as placeOrderAction } from '../actions';
import { Price } from '@/components/commerce/price';

interface ReviewStepProps {
  onEditStep: (step: 'contact' | 'shipping' | 'delivery' | 'payment') => void;
}

export default function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { order, paymentMethods, selectedPaymentMethodCode, isGuest } = useCheckout();
  const [loading, setLoading] = useState(false);

  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.code === selectedPaymentMethodCode
  );

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethodCode) return;

    setLoading(true);
    try {
      await placeOrderAction(selectedPaymentMethodCode);
    } catch (error) {
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
      }
      console.error('Error placing order:', error);
      setLoading(false);
    }
  };

  const sectionCls = "space-y-2";
  const sectionTitleCls = "flex items-center gap-2 font-body text-xs font-medium text-grey-500 uppercase tracking-wide";
  const sectionValueCls = "font-body text-sm text-brand-black";
  const sectionSubCls = "font-body text-xs text-grey-500";

  return (
    <div className="space-y-6">
      <h3 className="font-title text-base font-bold uppercase text-brand-black">Revisar pedido</h3>

      <div className={`grid grid-cols-1 gap-6 ${isGuest ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
        {isGuest && order.customer && (
          <div className={sectionCls}>
            <p className={sectionTitleCls}>
              <Mail className="h-4 w-4" />
              Contato
            </p>
            <div>
              <p className={sectionValueCls}>{order.customer.firstName} {order.customer.lastName}</p>
              <p className={sectionSubCls}>{order.customer.emailAddress}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEditStep('contact')}>
              <Edit className="h-4 w-4 mr-1" />
              EDITAR
            </Button>
          </div>
        )}

        <div className={sectionCls}>
          <p className={sectionTitleCls}>
            <MapPin className="h-4 w-4" />
            Endereço
          </p>
          {order.shippingAddress ? (
            <>
              <div>
                <p className={sectionValueCls}>{order.shippingAddress.fullName}</p>
                <p className={sectionSubCls}>
                  {order.shippingAddress.streetLine1}
                  {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
                </p>
                <p className={sectionSubCls}>
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </p>
                <p className={sectionSubCls}>{order.shippingAddress.country}</p>
                <p className={sectionSubCls}>{order.shippingAddress.phoneNumber}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onEditStep('shipping')}>
                <Edit className="h-4 w-4 mr-1" />
                EDITAR
              </Button>
            </>
          ) : (
            <p className={sectionSubCls}>Endereço não definido</p>
          )}
        </div>

        <div className={sectionCls}>
          <p className={sectionTitleCls}>
            <Truck className="h-4 w-4" />
            Entrega
          </p>
          {order.shippingLines && order.shippingLines.length > 0 ? (
            <>
              <div>
                <p className={sectionValueCls}>{order.shippingLines[0].shippingMethod.name}</p>
                <p className={sectionSubCls}>
                  {order.shippingLines[0].priceWithTax === 0
                    ? 'GRÁTIS'
                    : <Price value={order.shippingLines[0].priceWithTax} currencyCode={order.currencyCode} />}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onEditStep('delivery')}>
                <Edit className="h-4 w-4 mr-1" />
                EDITAR
              </Button>
            </>
          ) : (
            <p className={sectionSubCls}>Método não selecionado</p>
          )}
        </div>

        <div className={sectionCls}>
          <p className={sectionTitleCls}>
            <CreditCard className="h-4 w-4" />
            Pagamento
          </p>
          {selectedPaymentMethod ? (
            <>
              <div>
                <p className={sectionValueCls}>{selectedPaymentMethod.name}</p>
                {selectedPaymentMethod.description && (
                  <p className={sectionSubCls}>{selectedPaymentMethod.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => onEditStep('payment')}>
                <Edit className="h-4 w-4 mr-1" />
                EDITAR
              </Button>
            </>
          ) : (
            <p className={sectionSubCls}>Forma não selecionada</p>
          )}
        </div>
      </div>

      <Button
        onClick={handlePlaceOrder}
        disabled={loading || !order.shippingAddress || !order.shippingLines?.length || !selectedPaymentMethodCode}
        variant="default"
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        CONFIRMAR PEDIDO
      </Button>

      {(!order.shippingAddress || !order.shippingLines?.length || !selectedPaymentMethodCode) && (
        <p className="font-body text-xs text-red-500 text-center">
          Complete todas as etapas anteriores para finalizar o pedido
        </p>
      )}
    </div>
  );
}
