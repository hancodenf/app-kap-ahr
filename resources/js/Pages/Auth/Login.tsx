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
                        Demo Login - Quick Access
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Click any button below to autofill credentials
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => autofillCredentials('admin@example.com', 'password')}
                        className="flex items-center justify-center px-4 py-3 border border-primary-300 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                    >
                        <div className="text-center">
                            <div className="font-semibold">Admin</div>
                            <div className="text-xs opacity-75">Full Access</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => autofillCredentials('partner@example.com', 'password')}
                        className="flex items-center justify-center px-4 py-3 border border-primary-400 rounded-lg text-sm font-medium text-primary-800 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                    >
                        <div className="text-center">
                            <div className="font-semibold">Partner</div>
                            <div className="text-xs opacity-75">Business Access</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => autofillCredentials('staff@example.com', 'password')}
                        className="flex items-center justify-center px-4 py-3 border border-primary-500 rounded-lg text-sm font-medium text-primary-900 bg-primary-200 hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                    >
                        <div className="text-center">
                            <div className="font-semibold">Staff</div>
                            <div className="text-xs opacity-75">Operational Access</div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => autofillCredentials('klien@example.com', 'password')}
                        className="flex items-center justify-center px-4 py-3 border border-primary-600 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                    >
                        <div className="text-center">
                            <div className="font-semibold">Klien</div>
                            <div className="text-xs opacity-75">Client Access</div>
                        </div>
                    </button>
                </div>
            </div>
        </GuestLayout>
    );
}
