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
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter users based on search query
    const filterUsers = (users: DemoUser[]) => {
        if (!searchQuery.trim()) return users;
        
        const query = searchQuery.toLowerCase();
        return users.filter(user => 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.position?.toLowerCase().includes(query) ||
            user.client_name?.toLowerCase().includes(query)
        );
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

            <div className="max-w-md mx-auto">
                {/* Login Form */}
                <div>
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
                </div>
            </div>
        </GuestLayout>
    );
}
