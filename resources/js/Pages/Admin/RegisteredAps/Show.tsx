import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface User {
    id: number;
    name: string;
    email: string;
    position?: string;
    phone?: string;
}

interface RegisteredAp {
    id: number;
    user_id: number;
    user: User;
    ap_number: string;
    registration_date: string;
    formatted_registration_date: string;
    expiry_date: string | null;
    formatted_expiry_date: string | null;
    status: 'active' | 'inactive' | 'expired';
    status_color: string;
    is_expired: boolean;
    created_at: string;
    updated_at: string;
    formatted_created_at: string;
    formatted_updated_at: string;
}

interface Props {
    registeredAp: RegisteredAp;
}

export default function Show({ registeredAp }: Props) {
    const getStatusBadge = (status: 'active' | 'inactive' | 'expired') => {
        const statusConfig = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
            expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
        };
        const config = statusConfig[status];
        return (
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('admin.registered-aps.index')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                            Registered AP Details
                        </h2>
                    </div>
                    <Link
                        href={route('admin.registered-aps.edit', registeredAp.id)}
                        className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                    >
                        Edit
                    </Link>
                </div>
            }
        >
            <Head title={`Registered AP - ${registeredAp.ap_number}`} />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info Card */}
                        <div className="lg:col-span-2 bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {registeredAp.ap_number}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(registeredAp.status)}
                                            {registeredAp.is_expired && (
                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                    Expired
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Registration Information */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Registration Information
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                    AP Number
                                                </dt>
                                                <dd className="text-base font-semibold text-gray-900">
                                                    {registeredAp.ap_number}
                                                </dd>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                    Status
                                                </dt>
                                                <dd className="text-base">
                                                    {getStatusBadge(registeredAp.status)}
                                                </dd>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                    Registration Date
                                                </dt>
                                                <dd className="text-base font-medium text-gray-900">
                                                    {registeredAp.formatted_registration_date}
                                                </dd>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                    Expiry Date
                                                </dt>
                                                <dd className={`text-base font-medium ${registeredAp.is_expired ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {registeredAp.formatted_expiry_date || 'No expiry date'}
                                                </dd>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Information */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Registered User
                                        </h4>
                                        <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-4 rounded-lg border border-primary-100">
                                            <div className="space-y-2">
                                                <div>
                                                    <dt className="text-xs font-medium text-gray-600 mb-1">Name</dt>
                                                    <dd className="text-base font-semibold text-gray-900">
                                                        <Link
                                                            href={route('admin.users.show', registeredAp.user.id)}
                                                            className="text-primary-600 hover:text-primary-800 hover:underline"
                                                        >
                                                            {registeredAp.user.name}
                                                        </Link>
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs font-medium text-gray-600 mb-1">Email</dt>
                                                    <dd className="text-sm text-gray-900">{registeredAp.user.email}</dd>
                                                </div>
                                                {registeredAp.user.position && (
                                                    <div>
                                                        <dt className="text-xs font-medium text-gray-600 mb-1">Position</dt>
                                                        <dd className="text-sm text-gray-900">{registeredAp.user.position}</dd>
                                                    </div>
                                                )}
                                                {registeredAp.user.phone && (
                                                    <div>
                                                        <dt className="text-xs font-medium text-gray-600 mb-1">Phone</dt>
                                                        <dd className="text-sm text-gray-900">{registeredAp.user.phone}</dd>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Information */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            System Information
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                    Created At
                                                </dt>
                                                <dd className="text-sm text-gray-900">
                                                    {registeredAp.formatted_created_at}
                                                </dd>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                    Last Updated
                                                </dt>
                                                <dd className="text-sm text-gray-900">
                                                    {registeredAp.formatted_updated_at}
                                                </dd>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Panel */}
                        <div className="space-y-4">
                            {/* Quick Actions Card */}
                            <div className="bg-white shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link
                                        href={route('admin.registered-aps.edit', registeredAp.id)}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Registered AP
                                    </Link>
                                    <Link
                                        href={route('admin.users.show', registeredAp.user.id)}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        View User Profile
                                    </Link>
                                    <Link
                                        href={route('admin.registered-aps.index')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to List
                                    </Link>
                                </div>
                            </div>

                            {/* Status Info Card */}
                            {registeredAp.is_expired && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-sm text-red-800">
                                            <p className="font-medium mb-1">Registration Expired</p>
                                            <p>This AP registration has expired. Please update the expiry date or change the status.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Info Card */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">About Registered AP</p>
                                        <p>This AP registration is linked to the user account. Each user can only have one AP registration.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
