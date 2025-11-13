import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    is_suspended: boolean;
    suspended_until: string | null;
    failed_login_count: number;
}

interface Attempt {
    id: number;
    email: string;
    user_id: number | null;
    user: User | null;
    ip_address: string;
    user_agent: string | null;
    mac_address: string | null;
    location: string | null;
    photo_path: string | null;
    attempt_number: number;
    resulted_in_suspension: boolean;
    attempted_at: string;
    attempted_at_human: string;
}

interface SameIpAttempt {
    id: number;
    email: string;
    attempted_at: string;
    resulted_in_suspension: boolean;
}

interface ShowPageProps extends PageProps {
    attempt: Attempt;
    sameIpAttempts: SameIpAttempt[];
}

export default function Show({ attempt, sameIpAttempts }: ShowPageProps) {
    const unsuspendUser = () => {
        if (confirm('Are you sure you want to unsuspend this user?')) {
            router.post(route('admin.login-security.unsuspend', attempt.user!.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        Failed Login Attempt Details
                    </h2>
                    <Link
                        href={route('admin.login-security.index')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        ← Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Login Attempt Details" />

            <div className="py-4 sm:py-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Alert if resulted in suspension */}
                    {attempt.resulted_in_suspension && (
                        <div className="bg-red-50 border border-red-400 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-red-800">Account Suspended</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        This login attempt resulted in account suspension due to multiple failed login attempts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attempt Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <div className="mt-1 text-gray-900">{attempt.email}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">IP Address</label>
                                <div className="mt-1 text-gray-900 font-mono">{attempt.ip_address}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Location</label>
                                <div className="mt-1 text-gray-900">{attempt.location || 'Unknown'}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">MAC Address</label>
                                <div className="mt-1 text-gray-900 font-mono">{attempt.mac_address || 'Not available'}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Attempt Number</label>
                                <div className="mt-1">
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                        attempt.attempt_number >= 3 ? 'bg-red-100 text-red-800' :
                                        attempt.attempt_number === 2 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        Attempt #{attempt.attempt_number}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Attempted At</label>
                                <div className="mt-1 text-gray-900">{attempt.attempted_at}</div>
                                <div className="text-xs text-gray-500">{attempt.attempted_at_human}</div>
                            </div>
                        </div>
                        {attempt.user_agent && (
                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-500">User Agent</label>
                                <div className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded">
                                    {attempt.user_agent}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Camera Photo */}
                    {attempt.photo_path && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Capture</h3>
                            <img 
                                src={attempt.photo_path} 
                                alt="Camera capture" 
                                className="max-w-md rounded-lg border border-gray-300"
                            />
                        </div>
                    )}

                    {/* User Information */}
                    {attempt.user && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <div className="mt-1">
                                        <Link 
                                            href={route('admin.users.show', attempt.user.id)}
                                            className="text-primary-600 hover:text-primary-900 font-medium"
                                        >
                                            {attempt.user.name}
                                        </Link>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <div className="mt-1 text-gray-900">{attempt.user.email}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Suspension Status</label>
                                    <div className="mt-1">
                                        {attempt.user.is_suspended ? (
                                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                                                Suspended
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {attempt.user.suspended_until && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Suspended Until</label>
                                        <div className="mt-1 text-gray-900">{attempt.user.suspended_until}</div>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Failed Login Count</label>
                                    <div className="mt-1 text-gray-900">{attempt.user.failed_login_count}</div>
                                </div>
                            </div>
                            {attempt.user.is_suspended && (
                                <div className="mt-4">
                                    <button
                                        onClick={unsuspendUser}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Unsuspend User
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Other Attempts from Same IP */}
                    {sameIpAttempts.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Other Attempts from Same IP ({sameIpAttempts.length})
                            </h3>
                            <div className="space-y-2">
                                {sameIpAttempts.map((sa) => (
                                    <div key={sa.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-medium text-gray-900">{sa.email}</div>
                                            <div className="text-sm text-gray-600">{sa.attempted_at}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {sa.resulted_in_suspension && (
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                    Suspended
                                                </span>
                                            )}
                                            <Link
                                                href={route('admin.login-security.show', sa.id)}
                                                className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
