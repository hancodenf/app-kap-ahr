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
    const [showTenagaAhli, setShowTenagaAhli] = useState(false);
    const [showStaff, setShowStaff] = useState(false);
    const [showClient, setShowClient] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [showWarning, setShowWarning] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
            onError: () => {
                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);
                
                // Show warning on 2nd attempt
                if (newAttempts >= 2) {
                    setShowWarning(true);
                }
            },
            onSuccess: () => {
                setFailedAttempts(0);
                setShowWarning(false);
            },
        });
    };

    const autofillCredentials = (email: string, password: string) => {
        setData({
            email,
            password,
            remember: false,
        });
    };

    const renderUserCard = (user: DemoUser, colorClass: string) => (
        <div className="flex items-start gap-2">
            {user.profile_photo ? (
                <img 
                    src={`/storage/${user.profile_photo}`} 
                    alt={user.name}
                    className={`w-7 h-7 rounded-full object-cover border-2 border-${colorClass}-300 flex-shrink-0`}
                />
            ) : (
                <div className={`w-7 h-7 rounded-full bg-${colorClass}-200 flex items-center justify-center text-${colorClass}-700 font-bold text-[10px] flex-shrink-0`}>
                    {user.initials}
                </div>
            )}
            <div className="text-left flex-1 min-w-0">
                <div className="font-semibold truncate text-xs">{user.name}</div>
                <div className="text-[10px] opacity-75 truncate">{user.email}</div>
                {user.position && (
                    <div className={`text-[9px] bg-${colorClass}-100 px-1 py-0.5 rounded mt-0.5 inline-block`}> 
                        {user.position}
                    </div>
                )}
                {user.client_name && (
                    <div className={`text-[9px] bg-${colorClass}-100 px-1 py-0.5 rounded mt-0.5 inline-block`}>
                        {user.client_name}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Loading Overlay */}
            {processing && (
                <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 z-50 flex items-center justify-center backdrop-blur-md animate-fadeIn">
                    <div className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-2xl max-w-sm mx-4 animate-scaleIn">
                        {/* Animated Logo/Icon */}
                        <div className="relative w-20 h-20 mb-6">
                            {/* Outer rotating ring */}
                            <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
                            {/* Primary spinner */}
                            <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 border-r-primary-500 rounded-full animate-spin"></div>
                            {/* Inner pulsing circle */}
                            <div className="absolute inset-3 bg-primary-50 rounded-full flex items-center justify-center animate-pulse">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Text content */}
                        <div className="text-center">
                            <h3 className="text-gray-900 font-semibold text-xl mb-2">Signing In</h3>
                            <p className="text-gray-500 text-sm">Authenticating your credentials...</p>
                            
                            {/* Loading dots animation */}
                            <div className="flex justify-center gap-1.5 mt-4">
                                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT COLUMN - Login Form */}
                <div className="lg:pr-8 lg:border-r border-gray-200">
                    {/* Security Warning */}
                    {showWarning && (
                        <div className="mb-4 bg-yellow-50 border border-yellow-400 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-yellow-800">Security Alert</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        You have {3 - failedAttempts} login attempt(s) remaining. 
                                        After 3 failed attempts, your account will be temporarily suspended.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                        {/* Admin Section */}
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
                                            <p className="text-xs text-red-600">{demoUsers.admin.length} users</p>
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
                                                className="w-full flex items-start gap-2 px-2 py-1.5 bg-white border border-red-300 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                            >
                                                {renderUserCard(user, 'red')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Company Section with Sub-groups */}
                        {demoUsers?.company && (
                            <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowCompany(!showCompany)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold text-blue-700">Company</p>
                                            <p className="text-xs text-blue-600">
                                                {demoUsers.company.tenaga_ahli.length + demoUsers.company.staff.length} users
                                            </p>
                                        </div>
                                    </div>
                                    <svg 
                                        className={`w-5 h-5 text-blue-600 transition-transform ${showCompany ? 'rotate-180' : ''}`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showCompany && (
                                    <div className="px-3 pb-3 space-y-2">
                                        {/* Tenaga Ahli Sub-group */}
                                        {demoUsers.company.tenaga_ahli.length > 0 && (
                                            <div className="bg-purple-50 rounded-lg border border-purple-200 overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTenagaAhli(!showTenagaAhli)}
                                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-purple-100 transition-colors"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-xs font-semibold text-purple-700">Tenaga Ahli</p>
                                                        <p className="text-[10px] text-purple-600">{demoUsers.company.tenaga_ahli.length} users</p>
                                                    </div>
                                                    <svg 
                                                        className={`w-4 h-4 text-purple-600 transition-transform ${showTenagaAhli ? 'rotate-180' : ''}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                
                                                {showTenagaAhli && (
                                                    <div className="px-2 pb-2 space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
                                                        {demoUsers.company.tenaga_ahli.map((user, index) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => autofillCredentials(user.email, 'password')}
                                                                className="w-full px-2 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-medium text-purple-700 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                                            >
                                                                {renderUserCard(user, 'purple')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Staff Sub-group */}
                                        {demoUsers.company.staff.length > 0 && (
                                            <div className="bg-cyan-50 rounded-lg border border-cyan-200 overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowStaff(!showStaff)}
                                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-cyan-100 transition-colors"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-xs font-semibold text-cyan-700">Staff</p>
                                                        <p className="text-[10px] text-cyan-600">{demoUsers.company.staff.length} users</p>
                                                    </div>
                                                    <svg 
                                                        className={`w-4 h-4 text-cyan-600 transition-transform ${showStaff ? 'rotate-180' : ''}`}
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                
                                                {showStaff && (
                                                    <div className="px-2 pb-2 space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-cyan-100">
                                                        {demoUsers.company.staff.map((user, index) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => autofillCredentials(user.email, 'password')}
                                                                className="w-full px-2 py-1.5 bg-white border border-cyan-300 rounded-lg text-xs font-medium text-cyan-700 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                                                            >
                                                                {renderUserCard(user, 'cyan')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Client Section */}
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
                                            <p className="text-xs text-green-600">{demoUsers.client.length} users</p>
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
                                                className="w-full px-2 py-1.5 bg-white border border-green-300 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                            >
                                                {renderUserCard(user, 'green')}
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
