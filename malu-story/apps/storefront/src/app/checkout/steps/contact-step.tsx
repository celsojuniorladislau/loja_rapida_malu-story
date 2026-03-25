'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setCustomerForOrder, SetCustomerForOrderResult } from '../actions';

interface ContactStepProps {
  onComplete: () => void;
}

interface ContactFormData {
  emailAddress: string;
  firstName: string;
  lastName: string;
}

function getErrorMessage(error: SetCustomerForOrderResult) {
  if (error.success) return null;

  switch (error.errorCode) {
    case 'EMAIL_CONFLICT':
      return (
        <>
          An account already exists with this email.{' '}
          <Link href="/sign-in?redirectTo=/checkout" className="underline hover:no-underline">
            Sign in
          </Link>{' '}
          to continue.
        </>
      );
    case 'GUEST_CHECKOUT_DISABLED':
      return 'Guest checkout is not enabled. Please sign in or create an account.';
    case 'NO_ACTIVE_ORDER':
      return (
        <>
          Your cart is empty.{' '}
          <Link href="/" className="underline hover:no-underline">
            Continue shopping
          </Link>
        </>
      );
    default:
      return error.message;
  }
}

export default function ContactStep({ onComplete }: ContactStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SetCustomerForOrderResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await setCustomerForOrder(data);

      if (result.success) {
        router.refresh();
        onComplete();
      } else {
        setError(result);
      }
    } catch (err) {
      console.error('Error setting customer:', err);
      setError({ success: false, errorCode: 'UNKNOWN', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "h-input rounded-sm border border-grey-300 px-4 font-body text-sm w-full focus-visible:border-green-600 focus-visible:ring-0";
  const labelCls = "font-body text-sm font-medium text-brand-black mb-1 block";
  const errorCls = "font-body text-xs text-red-500 mt-1";

  return (
    <div className="space-y-6">
      <p className="font-body text-sm text-grey-500">
        Já tem uma conta?{' '}
        <Link href="/sign-in?redirectTo=/checkout" className="text-green-600 underline hover:no-underline">
          Entrar
        </Link>
      </p>

      {error && !error.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="emailAddress" className={labelCls}>E-mail *</label>
              <Input
                id="emailAddress"
                type="email"
                className={inputCls}
                {...register('emailAddress', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'E-mail inválido',
                  },
                })}
              />
              {errors.emailAddress?.message && <p className={errorCls}>{errors.emailAddress.message}</p>}
            </div>

            <div>
              <label htmlFor="firstName" className={labelCls}>Nome *</label>
              <Input
                id="firstName"
                className={inputCls}
                {...register('firstName', { required: 'Nome é obrigatório' })}
              />
              {errors.firstName?.message && <p className={errorCls}>{errors.firstName.message}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className={labelCls}>Sobrenome *</label>
              <Input
                id="lastName"
                className={inputCls}
                {...register('lastName', { required: 'Sobrenome é obrigatório' })}
              />
              {errors.lastName?.message && <p className={errorCls}>{errors.lastName.message}</p>}
            </div>
          </div>

          <Button type="submit" variant="default" disabled={loading} className="w-full mt-4">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            CONTINUAR
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
