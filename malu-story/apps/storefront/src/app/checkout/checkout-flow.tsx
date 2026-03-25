'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ContactStep from './steps/contact-step';
import ShippingAddressStep from './steps/shipping-address-step';
import DeliveryStep from './steps/delivery-step';
import PaymentStep from './steps/payment-step';
import ReviewStep from './steps/review-step';
import OrderSummary from './order-summary';
import { useCheckout } from './checkout-provider';

type CheckoutStep = 'contact' | 'shipping' | 'delivery' | 'payment' | 'review';

export default function CheckoutFlow() {
  const { order, isGuest } = useCheckout();

  const getStepOrder = (): CheckoutStep[] => {
    if (isGuest) {
      return ['contact', 'shipping', 'delivery', 'payment', 'review'];
    }
    return ['shipping', 'delivery', 'payment', 'review'];
  };

  const stepOrder = getStepOrder();

  const getInitialState = () => {
    const completed = new Set<CheckoutStep>();
    let current: CheckoutStep = stepOrder[0];

    if (isGuest) {
      if (order.customer?.emailAddress) {
        completed.add('contact');
        current = 'shipping';
      }
    }

    if (order.shippingAddress?.streetLine1 && order.shippingAddress?.country) {
      if (!isGuest || completed.has('contact')) {
        completed.add('shipping');
        current = 'delivery';
      }
    }

    if (order.shippingLines && order.shippingLines.length > 0) {
      if (completed.has('shipping')) {
        completed.add('delivery');
        current = 'payment';
      }
    }

    return { completed, current };
  };

  const initialState = getInitialState();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(initialState.current);
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(initialState.completed);

  const handleStepComplete = (step: CheckoutStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));

    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const canAccessStep = (step: CheckoutStep): boolean => {
    const stepIndex = stepOrder.indexOf(step);

    if (stepIndex === 0) return true;

    const previousStep = stepOrder[stepIndex - 1];
    return completedSteps.has(previousStep);
  };

  const getStepNumber = (step: CheckoutStep): number => {
    return stepOrder.indexOf(step) + 1;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Accordion
          type="single"
          collapsible
          value={currentStep}
          onValueChange={(value) => {
            if (value && canAccessStep(value as CheckoutStep)) {
              setCurrentStep(value as CheckoutStep);
            }
          }}
          className="space-y-4"
        >
          {isGuest && (
            <AccordionItem value="contact" className="border border-grey-200 rounded-md px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-body text-sm font-medium ${
                    completedSteps.has('contact')
                      ? 'bg-green-400 text-white'
                      : currentStep === 'contact'
                      ? 'bg-green-600 text-white'
                      : 'bg-grey-200 text-grey-500'
                  }`}>
                    {completedSteps.has('contact') ? '✓' : getStepNumber('contact')}
                  </div>
                  <span className={`font-body text-base font-medium ${currentStep === 'contact' ? 'text-green-600' : 'text-brand-black'}`}>Informações de Contato</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ContactStep
                  onComplete={() => handleStepComplete('contact')}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem
            value="shipping"
            className="border border-grey-200 rounded-md px-6"
            disabled={!canAccessStep('shipping')}
          >
            <AccordionTrigger
              className="hover:no-underline"
              disabled={!canAccessStep('shipping')}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-body text-sm font-medium ${
                  completedSteps.has('shipping')
                    ? 'bg-green-400 text-white'
                    : currentStep === 'shipping'
                    ? 'bg-green-600 text-white'
                    : 'bg-grey-200 text-grey-500'
                }`}>
                  {completedSteps.has('shipping') ? '✓' : getStepNumber('shipping')}
                </div>
                <span className={`font-body text-base font-medium ${currentStep === 'shipping' ? 'text-green-600' : 'text-brand-black'}`}>Endereço de Entrega</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ShippingAddressStep
                onComplete={() => handleStepComplete('shipping')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="delivery"
            className="border border-grey-200 rounded-md px-6"
            disabled={!canAccessStep('delivery')}
          >
            <AccordionTrigger
              className="hover:no-underline"
              disabled={!canAccessStep('delivery')}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-body text-sm font-medium ${
                  completedSteps.has('delivery')
                    ? 'bg-green-400 text-white'
                    : currentStep === 'delivery'
                    ? 'bg-green-600 text-white'
                    : 'bg-grey-200 text-grey-500'
                }`}>
                  {completedSteps.has('delivery') ? '✓' : getStepNumber('delivery')}
                </div>
                <span className={`font-body text-base font-medium ${currentStep === 'delivery' ? 'text-green-600' : 'text-brand-black'}`}>Método de Entrega</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <DeliveryStep
                onComplete={() => handleStepComplete('delivery')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="payment"
            className="border border-grey-200 rounded-md px-6"
            disabled={!canAccessStep('payment')}
          >
            <AccordionTrigger
              className="hover:no-underline"
              disabled={!canAccessStep('payment')}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-body text-sm font-medium ${
                  completedSteps.has('payment')
                    ? 'bg-green-400 text-white'
                    : currentStep === 'payment'
                    ? 'bg-green-600 text-white'
                    : 'bg-grey-200 text-grey-500'
                }`}>
                  {completedSteps.has('payment') ? '✓' : getStepNumber('payment')}
                </div>
                <span className={`font-body text-base font-medium ${currentStep === 'payment' ? 'text-green-600' : 'text-brand-black'}`}>Forma de Pagamento</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <PaymentStep
                onComplete={() => handleStepComplete('payment')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="review"
            className="border border-grey-200 rounded-md px-6"
            disabled={!canAccessStep('review')}
          >
            <AccordionTrigger
              className="hover:no-underline"
              disabled={!canAccessStep('review')}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-body text-sm font-medium ${
                  currentStep === 'review'
                    ? 'bg-green-600 text-white'
                    : 'bg-grey-200 text-grey-500'
                }`}>
                  {getStepNumber('review')}
                </div>
                <span className={`font-body text-base font-medium ${currentStep === 'review' ? 'text-green-600' : 'text-brand-black'}`}>Revisar Pedido</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ReviewStep
                onEditStep={setCurrentStep}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="lg:col-span-1">
        <OrderSummary />
      </div>
    </div>
  );
}
