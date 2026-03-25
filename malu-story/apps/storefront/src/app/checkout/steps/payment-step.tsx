'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, QrCode, Copy, Check } from 'lucide-react';
import { useCheckout } from '../checkout-provider';

interface PaymentStepProps {
  onComplete: () => void;
}

// Countdown timer for PIX
function PixCountdown({ expiresAt }: { expiresAt: Date }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const secs = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [expiresAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const colorCls = remaining === 0 ? 'text-red-500' : remaining <= 300 ? 'text-yellow-400' : 'text-green-600';

  return (
    <div className="text-center">
      <p className="font-body text-xs text-grey-500 mb-1">{remaining === 0 ? 'QR Code expirado' : 'Expira em'}</p>
      <p className={`font-title text-2xl font-bold ${colorCls}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  );
}

// PIX section shown when PIX method is selected
function PixSection() {
  const [copied, setCopied] = useState(false);
  // Placeholder PIX code — in production this comes from the payment gateway
  const pixCode = 'PLACEHOLDER_PIX_COPIA_COLA_00020126580014br.gov.bcb.pix0136example-pix-key5204000053039865802BR5913Malu Store6009Sao Paulo62070503***6304ABCD';
  const expiresAt = useRef(new Date(Date.now() + 30 * 60 * 1000)); // 30 min from now

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4 mt-4 p-4 border border-grey-200 rounded-md bg-white">
      <div className="flex justify-center">
        <div className="w-[200px] h-[200px] border border-grey-200 rounded-md bg-grey-50 flex flex-col items-center justify-center gap-2">
          <QrCode className="h-16 w-16 text-grey-300" />
          <p className="font-body text-xs text-grey-400">QR Code PIX</p>
        </div>
      </div>

      <PixCountdown expiresAt={expiresAt.current} />

      <div>
        <p className="font-body text-xs text-grey-500 mb-1">Código copia e cola:</p>
        <div className="font-body text-xs bg-grey-100 rounded-sm p-3 break-all text-grey-700 select-all">
          {pixCode}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleCopy}
      >
        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
        {copied ? 'COPIADO!' : 'COPIAR CÓDIGO'}
      </Button>

      <p className="font-body text-xs text-grey-500 text-center">
        Após o pagamento, seu pedido será confirmado automaticamente.
      </p>
    </div>
  );
}

export default function PaymentStep({ onComplete }: PaymentStepProps) {
  const { paymentMethods, selectedPaymentMethodCode, setSelectedPaymentMethodCode } = useCheckout();

  const handleContinue = () => {
    if (!selectedPaymentMethodCode) return;
    onComplete();
  };

  const isPixMethod = (code: string) => code.toLowerCase().includes('pix');

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-body text-sm text-grey-500">Nenhuma forma de pagamento disponível.</p>
      </div>
    );
  }

  // Separate PIX and non-PIX methods for tab display
  const hasPix = paymentMethods.some(m => isPixMethod(m.code));
  const hasCard = paymentMethods.some(m => !isPixMethod(m.code));
  const showTabs = hasPix && hasCard;

  return (
    <div className="space-y-6">
      <h3 className="font-body text-sm font-medium text-brand-black">Selecione a forma de pagamento</h3>

      {showTabs ? (
        <>
          <div className="flex border-b border-grey-200">
            {paymentMethods.map((method) => (
              <button
                key={method.code}
                type="button"
                onClick={() => setSelectedPaymentMethodCode(method.code)}
                className={`px-4 py-2 font-body text-sm font-medium transition-colors ${
                  selectedPaymentMethodCode === method.code
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-grey-500'
                }`}
              >
                {method.name}
              </button>
            ))}
          </div>

          {selectedPaymentMethodCode && isPixMethod(selectedPaymentMethodCode) && <PixSection />}
          {selectedPaymentMethodCode && !isPixMethod(selectedPaymentMethodCode) && (
            <div className="flex items-center gap-3 p-4 border border-grey-200 rounded-md">
              <CreditCard className="h-5 w-5 text-grey-400" />
              <p className="font-body text-sm text-grey-500">
                {paymentMethods.find(m => m.code === selectedPaymentMethodCode)?.description || 'Pagamento com cartão processado na próxima etapa.'}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.code}
              type="button"
              onClick={() => setSelectedPaymentMethodCode(method.code)}
              className={`w-full text-left border rounded-md p-4 cursor-pointer transition-colors ${
                selectedPaymentMethodCode === method.code
                  ? 'border-green-600 bg-green-50'
                  : 'border-grey-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={`h-5 w-5 flex-shrink-0 ${selectedPaymentMethodCode === method.code ? 'text-green-600' : 'text-grey-400'}`} />
                <div className="flex-1">
                  <p className="font-title text-base text-brand-black">{method.name}</p>
                  {method.description && (
                    <p className="font-body text-sm text-grey-500 mt-0.5">{method.description}</p>
                  )}
                </div>
              </div>
            </button>
          ))}

          {selectedPaymentMethodCode && isPixMethod(selectedPaymentMethodCode) && <PixSection />}
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={!selectedPaymentMethodCode}
        variant="default"
        className="w-full"
      >
        CONTINUAR
      </Button>
    </div>
  );
}
