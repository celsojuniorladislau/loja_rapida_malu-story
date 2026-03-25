'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '../checkout-provider';
import { setShippingMethod as setShippingMethodAction } from '../actions';

interface DeliveryStepProps {
  onComplete: () => void;
}

export default function DeliveryStep({ onComplete }: DeliveryStepProps) {
  const router = useRouter();
  const { shippingMethods, order } = useCheckout();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(() => {
    if (order.shippingLines && order.shippingLines.length > 0) {
      return order.shippingLines[0].shippingMethod.id;
    }
    return shippingMethods.length === 1 ? shippingMethods[0].id : null;
  });
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedMethodId) return;

    setSubmitting(true);
    try {
      await setShippingMethodAction(selectedMethodId);
      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting shipping method:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (shippingMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-body text-sm text-grey-500">Nenhum método de entrega disponível. Verifique seu endereço.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-body text-sm font-medium text-brand-black">Selecione o método de entrega</h3>

      <div className="space-y-3">
        {shippingMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelectedMethodId(method.id)}
            className={`w-full text-left border rounded-md p-4 cursor-pointer transition-colors ${
              selectedMethodId === method.id
                ? 'border-green-600 bg-green-50'
                : 'border-grey-300'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Truck className={`h-5 w-5 flex-shrink-0 ${selectedMethodId === method.id ? 'text-green-600' : 'text-grey-400'}`} />
                <div>
                  <p className="font-title text-base text-brand-black">{method.name}</p>
                  {method.description && (
                    <p className="font-body text-sm text-grey-500 mt-0.5">{method.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-body text-sm font-medium text-brand-black">
                  {method.priceWithTax === 0
                    ? 'GRÁTIS'
                    : (method.priceWithTax / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedMethodId || submitting}
        variant="default"
        className="w-full"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        CONTINUAR
      </Button>
    </div>
  );
}
