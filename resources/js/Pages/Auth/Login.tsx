import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const autofillCredentials = (email: string, password: string) => {
        setData({
            email,
            password,
            remember: false,
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>

            {/* Quick Login Demo Buttons */}
            <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 font-medium">
                        🚀 Demo Login - Quick Access
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Click any button below to autofill credentials (password: <span className="font-mono font-semibold">password</span>)
                    </p>
                </div>
                
                <div className="space-y-3">
                    {/* Admin */}
                    <button
                        type="button"
                        onClick={() => autofillCredentials('admin@example.com', 'password')}
                        className="w-full flex items-center justify-between px-4 py-3 border-2 border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-bold">Admin User</div>
                                <div className="text-xs opacity-75">admin@example.com • Full System Access</div>
                            </div>
                        </div>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Company Users */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-2">Company Users (Project Team Members)</p>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => autofillCredentials('partner@company.com', 'password')}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        JP
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">John Partner</div>
                                        <div className="text-xs opacity-75">partner@company.com</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-100 px-2 py-1 rounded">Partner</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => autofillCredentials('manager@company.com', 'password')}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        JM
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Jane Manager</div>
                                        <div className="text-xs opacity-75">manager@company.com</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-100 px-2 py-1 rounded">Manager</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => autofillCredentials('supervisor@company.com', 'password')}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        BS
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Bob Supervisor</div>
                                        <div className="text-xs opacity-75">supervisor@company.com</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-100 px-2 py-1 rounded">Supervisor</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => autofillCredentials('teamleader@company.com', 'password')}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        AT
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Alice Team Leader</div>
                                        <div className="text-xs opacity-75">teamleader@company.com</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-100 px-2 py-1 rounded">Team Leader</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => autofillCredentials('auditor@company.com', 'password')}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                                        MA
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Mike Auditor</div>
                                        <div className="text-xs opacity-75">auditor@company.com</div>
                                    </div>
                                </div>
                                <span className="text-xs bg-blue-100 px-2 py-1 rounded">Sr. Auditor</span>
                            </button>
                        </div>
                    </div>

                    {/* Client */}
                    <button
                        type="button"
                        onClick={() => autofillCredentials('client@client.com', 'password')}
                        className="w-full flex items-center justify-between px-4 py-3 border-2 border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-bold">Client Representative</div>
                                <div className="text-xs opacity-75">client@client.com • Client Portal Access</div>
                            </div>
                        </div>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                        💡 All accounts use password: <span className="font-mono font-bold text-gray-700">password</span>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
