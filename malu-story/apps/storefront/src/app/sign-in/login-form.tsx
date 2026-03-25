'use client';

import {useState, useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {loginAction} from './actions';
import Link from 'next/link';

const loginSchema = z.object({
    username: z.email('Por favor, insira um e-mail válido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    redirectTo?: string;
}

export function LoginForm({redirectTo}: LoginFormProps) {
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const {register, handleSubmit, formState: {errors}} = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {username: '', password: ''},
    });

    const onSubmit = (data: LoginFormData) => {
        setServerError(null);
        startTransition(async () => {
            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('password', data.password);
            if (redirectTo) formData.append('redirectTo', redirectTo);
            const result = await loginAction(undefined, formData);
            if (result?.error) setServerError(result.error);
        });
    };

    const registerHref = redirectTo
        ? `/register?redirectTo=${encodeURIComponent(redirectTo)}`
        : '/register';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="font-body text-sm font-medium text-brand-black mb-1 block">
                    E-mail
                </label>
                <input
                    type="email"
                    placeholder="voce@exemplo.com"
                    disabled={isPending}
                    {...register('username')}
                    className="h-input rounded-sm border border-grey-300 focus:border-green-600 outline-none px-4 font-body text-sm w-full transition-colors"
                />
                {errors.username && (
                    <p className="font-body text-xs text-red-500 mt-1">{errors.username.message}</p>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="font-body text-sm font-medium text-brand-black block">
                        Senha
                    </label>
                    <Link href="/forgot-password" className="font-body text-sm text-blue-500 underline">
                        Esqueci a senha
                    </Link>
                </div>
                <input
                    type="password"
                    placeholder="••••••••"
                    disabled={isPending}
                    {...register('password')}
                    className="h-input rounded-sm border border-grey-300 focus:border-green-600 outline-none px-4 font-body text-sm w-full transition-colors"
                />
                {errors.password && (
                    <p className="font-body text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
            </div>

            {serverError && (
                <p className="font-body text-sm text-red-500">{serverError}</p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full h-input rounded-sm bg-yellow-400 font-body text-sm font-semibold text-brand-black uppercase tracking-wide hover:bg-yellow-300 active:bg-yellow-500 transition-colors disabled:opacity-60"
            >
                {isPending ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="font-body text-sm text-center text-grey-500">
                Não tem conta?{' '}
                <Link href={registerHref} className="text-blue-500 underline">
                    Criar conta
                </Link>
            </p>
        </form>
    );
}
