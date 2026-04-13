import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface DemoUser {
    name: string;
    email: string;
    profile_photo?: string | null;
    position?: string;
    user_type?: string;
    client_name?: string;
    initials: string;
}

interface DemoUsers {
    admin: DemoUser[];
    company: {
        tenaga_ahli: DemoUser[];
        staff: DemoUser[];
    };
    client: DemoUser[];
}

export default function Login({
    status,
    canResetPassword,
    demoUsers,
}: {
    status?: string;
    canResetPassword: boolean;
    demoUsers?: DemoUsers;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showAdmin, setShowAdmin] = useState(false);
    const [showCompany, setShowCompany] = useState(false);
    const [showClient, setShowClient] = useState(false);

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN - Login Form */}
                <div className="lg:pr-8 lg:border-r border-gray-200">
                    {/* Header Section */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Sign in to your account to continue
                        </p>
                    </div>

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

                        <div className="mt-6">
                            <PrimaryButton className="w-full justify-center" disabled={processing}>
                                Log in
                            </PrimaryButton>
                        </div>

                        <div className="mt-4 text-center">
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none"
                                >
                                    Forgot your password?
                                </Link>
                            )}
                        </div>
                    </form>

                    {/* Password hint */}
                    <div className="mt-6 text-center lg:hidden">
                        <p className="text-xs text-gray-500">
                            💡 Demo password: <span className="font-mono font-bold text-gray-700">password</span>
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN - Demo Login */}
                <div className="lg:pl-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Quick Demo Access</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Click any account below to autofill login credentials
                        </p>
                    </div>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {/* Company Section - Collapsible */}
                        {demoUsers?.company && (demoUsers.company.tenaga_ahli?.length > 0 || demoUsers.company.staff?.length > 0) && (
                            <div className="bg-amber-50 rounded-lg border border-amber-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowCompany(!showCompany)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                            <path d="M15 7h1a2 2 0 012 2v10a2 2 0 01-2 2h-1V7z" fillOpacity="0.5" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-amber-700">Company</p>
                                            <p className="text-xs text-amber-600">
                                                {(demoUsers.company.tenaga_ahli?.length || 0) + (demoUsers.company.staff?.length || 0)} users
                                            </p>
                                        </div>
                                    </div>
                                    <svg 
                                        className={`w-5 h-5 text-amber-600 transition-transform ${showCompany ? 'rotate-180' : ''}`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showCompany && (
                                    <div className="px-4 py-3 space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100">
                                        {/* Tenaga Ahli Sub-section */}
                                        {demoUsers.company.tenaga_ahli && demoUsers.company.tenaga_ahli.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">Tenaga Ahli ({demoUsers.company.tenaga_ahli.length})</p>
                                                <div className="space-y-1.5">
                                                    {demoUsers.company.tenaga_ahli.map((user, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => autofillCredentials(user.email, 'password')}
                                                            className="w-full flex items-start gap-2.5 px-2.5 py-1.5 bg-white border border-purple-200 rounded hover:bg-purple-50 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                                                        >
                                                            <div className="w-7 h-7 rounded-full bg-purple-300 flex items-center justify-center text-purple-700 font-bold text-[10px] flex-shrink-0 mt-0.5">
                                                                {user.initials}
                                                            </div>
                                                            <div className="text-left flex-1 min-w-0">
                                                                <div className="text-xs font-medium text-gray-800">{user.name}</div>
                                                                <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                                                                {user.position && (
                                                                    <div className="text-[9px] text-purple-600 mt-0.5">{user.position}</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Divider */}
                                        {demoUsers.company.tenaga_ahli?.length > 0 && demoUsers.company.staff?.length > 0 && (
                                            <div className="border-t border-amber-200"></div>
                                        )}
                                        
                                        {/* Staff Sub-section */}
                                        {demoUsers.company.staff && demoUsers.company.staff.length > 0 && (
                                            <div>
                                                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Staff ({demoUsers.company.staff.length})</p>
                                                <div className="space-y-1.5">
                                                    {demoUsers.company.staff.map((user, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => autofillCredentials(user.email, 'password')}
                                                            className="w-full flex items-start gap-2.5 px-2.5 py-1.5 bg-white border border-blue-200 rounded hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
                                                        >
                                                            <div className="w-7 h-7 rounded-full bg-blue-300 flex items-center justify-center text-blue-700 font-bold text-[10px] flex-shrink-0 mt-0.5">
                                                                {user.initials}
                                                            </div>
                                                            <div className="text-left flex-1 min-w-0">
                                                                <div className="text-xs font-medium text-gray-800">{user.name}</div>
                                                                <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                                                                {user.position && (
                                                                    <div className="text-[9px] text-blue-600 mt-0.5">{user.position}</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin Section - Collapsible */}
                        {demoUsers?.admin && demoUsers.admin.length > 0 && (
                            <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowAdmin(!showAdmin)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-red-700">Admin</p>
                                            <p className="text-xs text-red-600">{demoUsers.admin.length} users - Full System Access</p>
                                        </div>
                                    </div>
                                    <svg 
                                        className={`w-5 h-5 text-red-600 transition-transform ${showAdmin ? 'rotate-180' : ''}`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showAdmin && (
                                    <div className="px-3 pb-3 space-y-2">
                                        {demoUsers.admin.map((user, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => autofillCredentials(user.email, 'password')}
                                                className="w-full flex items-start gap-2 px-3 py-2 bg-white border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-xs flex-shrink-0 mt-0.5">
                                                    {user.initials}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-semibold truncate">{user.name}</div>
                                                    <div className="text-xs opacity-75 truncate">{user.email}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Client Section - Collapsible */}
                        {demoUsers?.client && demoUsers.client.length > 0 && (
                            <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowClient(!showClient)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-green-700">Client</p>
                                            <p className="text-xs text-green-600">{demoUsers.client.length} users - Client Portal Access</p>
                                        </div>
                                    </div>
                                    <svg 
                                        className={`w-5 h-5 text-green-600 transition-transform ${showClient ? 'rotate-180' : ''}`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showClient && (
                                    <div className="px-3 pb-3 space-y-2">
                                        {demoUsers.client.map((user, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => autofillCredentials(user.email, 'password')}
                                                className="w-full flex items-start gap-2 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0 mt-0.5">
                                                    {user.initials}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <div className="font-semibold truncate">{user.name}</div>
                                                    <div className="text-xs opacity-75 truncate">{user.email}</div>
                                                    {user.client_name && (
                                                        <div className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                            {user.client_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Password hint */}
                    <div className="mt-4 text-center hidden lg:block">
                        <p className="text-xs text-gray-500">
                            💡 All accounts use password: <span className="font-mono font-bold text-gray-700">password</span>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
