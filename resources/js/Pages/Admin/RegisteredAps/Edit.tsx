import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    position?: string;
}

interface RegisteredAp {
    id: number;
    user_id: number;
    user: User;
    ap_number: string;
    registration_date: string;
    expiry_date: string | null;
    status: 'active' | 'inactive' | 'expired';
}

interface EditRegisteredApPageProps extends PageProps {
    registeredAp: RegisteredAp;
}

export default function Edit({ registeredAp }: EditRegisteredApPageProps) {
    // Get URL parameters for back navigation
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] || '');
    const from_page = params.get('from_page') || '1';
    const search = params.get('search') || '';
    const status = params.get('status') || '';
    
    // Build back URL with preserved state
    const backUrl = `${route('admin.registered-aps.index')}?page=${from_page}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;
    
    const { data, setData, put, processing, errors } = useForm({
        ap_number: registeredAp.ap_number,
        registration_date: registeredAp.registration_date,
        expiry_date: registeredAp.expiry_date || '',
        status: registeredAp.status,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.registered-aps.update', registeredAp.id));
    };

    const statusOptions = [
        { value: 'active', label: 'Active', color: 'text-green-600' },
        { value: 'inactive', label: 'Inactive', color: 'text-gray-600' },
        { value: 'expired', label: 'Expired', color: 'text-red-600' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        Edit Registered AP
                    </h2>
                    <Link
                        href={backUrl}
                        className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                    >
                        ← Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Edit Registered AP" />

            <div className="py-4 sm:py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* User Info (Read-only) */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Registered User</h3>
                                <div className="space-y-1">
                                    <p className="text-base font-medium text-gray-900">{registeredAp.user.name}</p>
                                    <p className="text-sm text-gray-600">{registeredAp.user.email}</p>
                                    {registeredAp.user.position && (
                                        <p className="text-sm text-gray-600">{registeredAp.user.position}</p>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    User cannot be changed after registration
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* AP Number */}
                                <div>
                                    <label htmlFor="ap_number" className="block text-sm font-medium text-gray-700 mb-1">
                                        AP Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="ap_number"
                                        value={data.ap_number}
                                        onChange={(e) => setData('ap_number', e.target.value)}
                                        className={`w-full border ${errors.ap_number ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                        placeholder="Enter AP number (e.g., AP-001234)"
                                    />
                                    {errors.ap_number && (
                                        <p className="mt-1 text-sm text-red-600">{errors.ap_number}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enter the unique AP registration number
                                    </p>
                                </div>

                                {/* Registration Date */}
                                <div>
                                    <label htmlFor="registration_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="registration_date"
                                        value={data.registration_date}
                                        onChange={(e) => setData('registration_date', e.target.value)}
                                        className={`w-full border ${errors.registration_date ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                    />
                                    {errors.registration_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.registration_date}</p>
                                    )}
                                </div>

                                {/* Expiry Date */}
                                <div>
                                    <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        id="expiry_date"
                                        value={data.expiry_date}
                                        onChange={(e) => setData('expiry_date', e.target.value)}
                                        min={data.registration_date || undefined}
                                        className={`w-full border ${errors.expiry_date ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                    />
                                    {errors.expiry_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave empty if there's no expiry date
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'active' | 'inactive' | 'expired')}
                                        className={`w-full border ${errors.status ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Updating...' : 'Update Registered AP'}
                                    </button>
                                    <Link
                                        href={backUrl}
                                        className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors text-center"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Important Notes:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>User information cannot be changed after registration</li>
                                    <li>AP number must be unique across all registrations</li>
                                    <li>Expiry date must be after registration date</li>
                                    <li>Status will be automatically set to 'expired' if expiry date has passed</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
