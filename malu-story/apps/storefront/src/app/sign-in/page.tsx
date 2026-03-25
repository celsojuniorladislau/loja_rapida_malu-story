import type {Metadata} from 'next';
import {Suspense} from 'react';
import {LoginForm} from './login-form';

export const metadata: Metadata = {
    title: 'Entrar',
    description: 'Entre na sua conta para acessar seus pedidos e mais.',
};

async function SignInContent({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
    const resolvedParams = await searchParams;
    const redirectTo = resolvedParams?.redirectTo as string | undefined;
    return <LoginForm redirectTo={redirectTo}/>;
}

export default async function SignInPage({searchParams}: PageProps<'/sign-in'>) {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 bg-grey-50">
            <div className="w-full max-w-sm mx-auto bg-white shadow-100 rounded-lg p-8 mt-16 mb-16">
                <p className="font-display font-bold text-2xl uppercase text-brand-black text-center mb-8 tracking-wide">
                    MALU STORE
                </p>
                <Suspense fallback={<div className="h-48 animate-pulse bg-grey-100 rounded"/>}>
                    <SignInContent searchParams={searchParams}/>
                </Suspense>
            </div>
        </div>
    );
}
