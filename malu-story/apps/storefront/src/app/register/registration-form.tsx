'use client';

import {useState, useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {registerAction} from './actions';
import Link from 'next/link';

const registrationSchema = z.object({
    emailAddress: z.string().email('Por favor, insira um e-mail válido'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
    redirectTo?: string;
}

export function RegistrationForm({redirectTo}: RegistrationFormProps) {
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const {register, handleSubmit, formState: {errors}} = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            emailAddress: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
        },
    });

    const inputClass = 'h-input rounded-sm border border-grey-300 focus:border-green-600 outline-none px-4 font-body text-sm w-full transition-colors';
    const labelClass = 'font-body text-sm font-medium text-brand-black mb-1 block';
    const errorClass = 'font-body text-xs text-red-500 mt-1';

    const onSubmit = (data: RegistrationFormData) => {
        setServerError(null);
        startTransition(async () => {
            const formData = new FormData();
            formData.append('emailAddress', data.emailAddress);
            if (data.firstName) formData.append('firstName', data.firstName);
            if (data.lastName) formData.append('lastName', data.lastName);
            if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
            formData.append('password', data.password);
            if (redirectTo) formData.append('redirectTo', redirectTo);
            const result = await registerAction(undefined, formData);
            if (result?.error) setServerError(result.error);
        });
    };

    const signInHref = redirectTo
        ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
        : '/sign-in';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className={labelClass}>E-mail</label>
                <input
                    type="email"
                    placeholder="voce@exemplo.com"
                    disabled={isPending}
                    {...register('emailAddress')}
                    className={inputClass}
                />
                {errors.emailAddress && <p className={errorClass}>{errors.emailAddress.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Nome</label>
                    <input
                        type="text"
                        placeholder="João"
                        disabled={isPending}
                        {...register('firstName')}
                        className={inputClass}
                    />
                    {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
                </div>
                <div>
                    <label className={labelClass}>Sobrenome</label>
                    <input
                        type="text"
                        placeholder="Silva"
                        disabled={isPending}
                        {...register('lastName')}
                        className={inputClass}
                    />
                    {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
                </div>
            </div>

            <div>
                <label className={labelClass}>Telefone (opcional)</label>
                <input
                    type="tel"
                    placeholder="(11) 99999-0000"
                    disabled={isPending}
                    {...register('phoneNumber')}
                    className={inputClass}
                />
                {errors.phoneNumber && <p className={errorClass}>{errors.phoneNumber.message}</p>}
            </div>

            <div>
                <label className={labelClass}>Senha</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    disabled={isPending}
                    {...register('password')}
                    className={inputClass}
                />
                {errors.password && <p className={errorClass}>{errors.password.message}</p>}
            </div>

            <div>
                <label className={labelClass}>Confirmar Senha</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    disabled={isPending}
                    {...register('confirmPassword')}
                    className={inputClass}
                />
                {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
            </div>

            {serverError && (
                <p className="font-body text-sm text-red-500">{serverError}</p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full h-input rounded-sm bg-yellow-400 font-body text-sm font-semibold text-brand-black uppercase tracking-wide hover:bg-yellow-300 active:bg-yellow-500 transition-colors disabled:opacity-60"
            >
                {isPending ? 'Criando conta...' : 'Criar Conta'}
            </button>

            <p className="font-body text-sm text-center text-grey-500">
                Já tem conta?{' '}
                <Link href={signInHref} className="text-blue-500 underline">
                    Entrar
                </Link>
            </p>
        </form>
    );
}
