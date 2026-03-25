'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { useForm, Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '../checkout-provider';
import { setShippingAddress, createCustomerAddress } from '../actions';
import { CountrySelect } from '@/components/shared/country-select';

interface ShippingAddressStepProps {
  onComplete: () => void;
}

interface AddressFormData {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  company?: string;
}

const inputCls = "h-input rounded-sm border border-grey-300 px-4 font-body text-sm w-full focus-visible:border-green-600 focus-visible:ring-0";
const labelCls = "font-body text-sm font-medium text-brand-black mb-1 block";
const errorCls = "font-body text-xs text-red-500 mt-1";

function AddressForm({
  onSubmit,
  register,
  errors,
  control,
  loading,
  countries,
  setValue,
  onBack,
  submitLabel = 'CONTINUAR',
}: {
  onSubmit: () => void;
  register: ReturnType<typeof useForm<AddressFormData>>['register'];
  errors: ReturnType<typeof useForm<AddressFormData>>['formState']['errors'];
  control: ReturnType<typeof useForm<AddressFormData>>['control'];
  loading: boolean;
  countries: { id: string; code: string; name: string }[];
  setValue: ReturnType<typeof useForm<AddressFormData>>['setValue'];
  onBack?: () => void;
  submitLabel?: string;
}) {
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (data.logradouro) setValue('streetLine1', data.logradouro);
        if (data.localidade) setValue('city', data.localidade);
        if (data.uf) setValue('province', data.uf);
      }
    } catch {
      // silently ignore ViaCEP errors
    } finally {
      setCepLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="fullName" className={labelCls}>Nome Completo *</label>
            <Input id="fullName" className={inputCls} {...register('fullName', { required: 'Nome é obrigatório' })} />
            {errors.fullName?.message && <p className={errorCls}>{errors.fullName.message}</p>}
          </div>

          <div className="col-span-2">
            <label htmlFor="company" className={labelCls}>Empresa</label>
            <Input id="company" className={inputCls} {...register('company')} />
          </div>

          <div className="col-span-2">
            <label htmlFor="postalCode" className={labelCls}>CEP *</label>
            <div className="relative">
              <Input
                id="postalCode"
                className={inputCls}
                {...register('postalCode', { required: 'CEP é obrigatório' })}
                onBlur={handleCepBlur}
                placeholder="00000-000"
              />
              {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-grey-400" />}
            </div>
            {errors.postalCode?.message && <p className={errorCls}>{errors.postalCode.message}</p>}
          </div>

          <div className="col-span-2">
            <label htmlFor="streetLine1" className={labelCls}>Rua *</label>
            <Input id="streetLine1" className={inputCls} {...register('streetLine1', { required: 'Rua é obrigatória' })} />
            {errors.streetLine1?.message && <p className={errorCls}>{errors.streetLine1.message}</p>}
          </div>

          <div className="col-span-2">
            <label htmlFor="streetLine2" className={labelCls}>Complemento / Apto.</label>
            <Input id="streetLine2" className={inputCls} {...register('streetLine2')} />
          </div>

          <div>
            <label htmlFor="city" className={labelCls}>Cidade *</label>
            <Input id="city" className={inputCls} {...register('city', { required: 'Cidade é obrigatória' })} />
            {errors.city?.message && <p className={errorCls}>{errors.city.message}</p>}
          </div>

          <div>
            <label htmlFor="province" className={labelCls}>Estado</label>
            <Input id="province" className={inputCls} {...register('province')} />
            {errors.province?.message && <p className={errorCls}>{errors.province.message}</p>}
          </div>

          <div>
            <label htmlFor="countryCode" className={labelCls}>País *</label>
            <Controller
              name="countryCode"
              control={control}
              rules={{ required: 'País é obrigatório' }}
              render={({ field }) => (
                <CountrySelect
                  countries={countries}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading}
                />
              )}
            />
            {errors.countryCode?.message && <p className={errorCls}>{errors.countryCode.message}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className={labelCls}>Telefone *</label>
            <Input id="phoneNumber" type="tel" className={inputCls} {...register('phoneNumber', { required: 'Telefone é obrigatório' })} />
            {errors.phoneNumber?.message && <p className={errorCls}>{errors.phoneNumber.message}</p>}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack} disabled={loading} className="flex-1">
              VOLTAR
            </Button>
          )}
          <Button type="submit" variant="default" disabled={loading} className="flex-1">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

export default function ShippingAddressStep({ onComplete }: ShippingAddressStepProps) {
  const router = useRouter();
  const { addresses, countries, order, isGuest } = useCheckout();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    if (order.shippingAddress) {
      const matchingAddress = addresses.find(
        (a) =>
          a.streetLine1 === order.shippingAddress?.streetLine1 &&
          a.postalCode === order.shippingAddress?.postalCode
      );
      if (matchingAddress) return matchingAddress.id;
    }
    const defaultAddress = addresses.find((a) => a.defaultShippingAddress);
    return defaultAddress?.id || null;
  });
  const [dialogOpen, setDialogOpen] = useState(addresses.length === 0 && !isGuest);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useSameForBilling, setUseSameForBilling] = useState(true);

  const getDefaultFormValues = (): Partial<AddressFormData> => {
    const customerFullName = order.customer
      ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
      : '';

    if (isGuest && order.shippingAddress?.streetLine1) {
      return {
        fullName: order.shippingAddress.fullName || customerFullName,
        streetLine1: order.shippingAddress.streetLine1 || '',
        streetLine2: order.shippingAddress.streetLine2 || '',
        city: order.shippingAddress.city || '',
        province: order.shippingAddress.province || '',
        postalCode: order.shippingAddress.postalCode || '',
        countryCode: countries.find(c => c.name === order.shippingAddress?.country)?.code || countries[0]?.code || 'BR',
        phoneNumber: order.shippingAddress.phoneNumber || order.customer?.phoneNumber || '',
        company: order.shippingAddress.company || '',
      };
    }
    return {
      fullName: customerFullName,
      countryCode: countries[0]?.code || 'BR',
      phoneNumber: order.customer?.phoneNumber || '',
    };
  };

  const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<AddressFormData>({
    defaultValues: getDefaultFormValues()
  });

  const handleSelectExistingAddress = async () => {
    if (!selectedAddressId) return;

    setLoading(true);
    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddress) return;

      await setShippingAddress({
        fullName: selectedAddress.fullName || '',
        company: selectedAddress.company || '',
        streetLine1: selectedAddress.streetLine1,
        streetLine2: selectedAddress.streetLine2 || '',
        city: selectedAddress.city || '',
        province: selectedAddress.province || '',
        postalCode: selectedAddress.postalCode || '',
        countryCode: selectedAddress.country.code,
        phoneNumber: selectedAddress.phoneNumber || '',
      }, useSameForBilling);

      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting address:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSaveNewAddress = async (data: AddressFormData) => {
    setSaving(true);
    try {
      const newAddress = await createCustomerAddress(data);
      setDialogOpen(false);
      reset();
      router.refresh();
      setSelectedAddressId(newAddress.id);
    } catch (error) {
      console.error('Error creating address:', error);
      alert(`Erro ao criar endereço: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const onSubmitGuestAddress = async (data: AddressFormData) => {
    setLoading(true);
    try {
      await setShippingAddress(data, useSameForBilling);
      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting address:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="same-billing-guest"
            checked={useSameForBilling}
            onCheckedChange={(checked) => setUseSameForBilling(checked === true)}
          />
          <label htmlFor="same-billing-guest" className="font-body text-sm text-brand-black cursor-pointer">
            Usar o mesmo endereço para cobrança
          </label>
        </div>
        <AddressForm
          onSubmit={handleSubmit(onSubmitGuestAddress)}
          register={register}
          errors={errors}
          control={control}
          loading={loading}
          countries={countries}
          setValue={setValue}
          submitLabel="CONTINUAR"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-body text-sm font-medium text-brand-black">Selecione um endereço salvo</h3>
          <RadioGroup value={selectedAddressId || ''} onValueChange={setSelectedAddressId}>
            {addresses.map((address) => (
              <label
                key={address.id}
                htmlFor={address.id}
                className={`flex items-start gap-3 border rounded-md p-4 cursor-pointer transition-colors ${
                  selectedAddressId === address.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-grey-300'
                }`}
              >
                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                <div className="flex-1 space-y-0.5">
                  <p className="font-body text-sm font-medium text-brand-black">{address.fullName}</p>
                  {address.company && <p className="font-body text-xs text-grey-500">{address.company}</p>}
                  <p className="font-body text-xs text-grey-500">
                    {address.streetLine1}{address.streetLine2 && `, ${address.streetLine2}`}
                  </p>
                  <p className="font-body text-xs text-grey-500">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p className="font-body text-xs text-grey-500">{address.country.name}</p>
                  <p className="font-body text-xs text-grey-500">{address.phoneNumber}</p>
                </div>
              </label>
            ))}
          </RadioGroup>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="same-billing"
              checked={useSameForBilling}
              onCheckedChange={(checked) => setUseSameForBilling(checked === true)}
            />
            <label htmlFor="same-billing" className="font-body text-sm text-brand-black cursor-pointer">
              Usar o mesmo endereço para cobrança
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSelectExistingAddress}
              disabled={!selectedAddressId || loading}
              variant="default"
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              CONTINUAR
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  NOVO ENDEREÇO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-title text-lg font-bold uppercase text-brand-black">Novo Endereço</DialogTitle>
                  <DialogDescription className="font-body text-sm text-grey-500">
                    Preencha os dados do novo endereço de entrega
                  </DialogDescription>
                </DialogHeader>
                <div className="my-4">
                  <AddressForm
                    onSubmit={handleSubmit(onSaveNewAddress)}
                    register={register}
                    errors={errors}
                    control={control}
                    loading={saving}
                    countries={countries}
                    setValue={setValue}
                    onBack={() => setDialogOpen(false)}
                    submitLabel="SALVAR ENDEREÇO"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {addresses.length === 0 && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-title text-lg font-bold uppercase text-brand-black">Endereço de Entrega</DialogTitle>
              <DialogDescription className="font-body text-sm text-grey-500">
                Preencha os dados do endereço de entrega
              </DialogDescription>
            </DialogHeader>
            <div className="my-4">
              <AddressForm
                onSubmit={handleSubmit(onSaveNewAddress)}
                register={register}
                errors={errors}
                control={control}
                loading={saving}
                countries={countries}
                setValue={setValue}
                submitLabel="SALVAR ENDEREÇO"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
