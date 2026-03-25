import type {Metadata} from 'next';
import {Suspense} from 'react';
import {RegistrationForm} from './registration-form';

export const metadata: Metadata = {
    title: 'Criar Conta',
    description: 'Crie sua conta para começar a comprar na Malu Store.',
};

async function RegisterContent({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
    const resolvedParams = await searchParams;
    const redirectTo = resolvedParams?.redirectTo as string | undefined;
    return <RegistrationForm redirectTo={redirectTo}/>;
}

export default async function RegisterPage({searchParams}: PageProps<'/register'>) {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 bg-grey-50">
            <div className="w-full max-w-sm mx-auto bg-white shadow-100 rounded-lg p-8 mt-16 mb-16">
                <p className="font-display font-bold text-2xl uppercase text-brand-black text-center mb-8 tracking-wide">
                    MALU STORE
                </p>
                <Suspense fallback={<div className="h-64 animate-pulse bg-grey-100 rounded"/>}>
                    <RegisterContent searchParams={searchParams}/>
                </Suspense>
            </div>
        </div>
    );
}
