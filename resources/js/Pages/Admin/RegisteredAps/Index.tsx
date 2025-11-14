import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';

interface RegisteredAp {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    user_position: string;
    ap_number: string;
    registration_date: string;
    formatted_registration_date: string;
    expiry_date: string | null;
    formatted_expiry_date: string | null;
    status: 'active' | 'inactive' | 'expired';
    status_color: string;
    is_expired: boolean;
    created_at: string;
}

interface RegisteredApsPageProps extends PageProps {
    registeredAps: {
        data: RegisteredAp[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ registeredAps, filters }: RegisteredApsPageProps) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [apToDelete, setApToDelete] = useState<RegisteredAp | null>(null);

    const handleSearch = () => {
        router.get(route('admin.registered-aps.index'), { search, status }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get(route('admin.registered-aps.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDeleteClick = (ap: RegisteredAp) => {
        setApToDelete(ap);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (apToDelete) {
            router.delete(route('admin.registered-aps.destroy', apToDelete.id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setApToDelete(null);
                },
            });
        }
    };

    const getStatusBadge = (ap: RegisteredAp) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            expired: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[ap.status]}`}>
                {ap.status.charAt(0).toUpperCase() + ap.status.slice(1)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        Registered AP
                    </h2>
                    <Link
                        href={route('admin.registered-aps.create')}
                        className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                    >
                        + Add Registered AP
                    </Link>
                </div>
            }
        >
            <Head title="Registered APs" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                            {flash.success}
                        </div>
                    )}
                    
                    {flash?.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6">
                            {/* Search & Filter Bar */}
                            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Search AP number, user name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="expired">Expired</option>
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                                    >
                                        Search
                                    </button>
                                    {(filters.search || filters.status) && (
                                        <button
                                            onClick={handleReset}
                                            className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                AP Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registration Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Expiry Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {registeredAps.data.map((ap, index) => (
                                            <tr key={ap.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {(registeredAps.current_page - 1) * registeredAps.per_page + index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <Link
                                                            href={route('admin.users.show', ap.user_id)}
                                                            className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline"
                                                        >
                                                            {ap.user_name}
                                                        </Link>
                                                        <div className="text-xs text-gray-500">{ap.user_email}</div>
                                                        {ap.user_position && (
                                                            <div className="text-xs text-gray-500">{ap.user_position}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {ap.ap_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {ap.formatted_registration_date}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {ap.formatted_expiry_date || '-'}
                                                    </div>
                                                    {ap.is_expired && (
                                                        <div className="text-xs text-red-600 font-medium">Expired</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(ap)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('admin.registered-aps.show', ap.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            href={route('admin.registered-aps.edit', ap.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(ap)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {registeredAps.data.map((ap, index) => (
                                    <div key={ap.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    #{(registeredAps.current_page - 1) * registeredAps.per_page + index + 1}
                                                </div>
                                                <Link
                                                    href={route('admin.users.show', ap.user_id)}
                                                    className="text-base font-medium text-primary-600 hover:text-primary-800 hover:underline"
                                                >
                                                    {ap.user_name}
                                                </Link>
                                                <div className="text-xs text-gray-500 mt-1">{ap.user_email}</div>
                                                {ap.user_position && (
                                                    <div className="text-xs text-gray-500">{ap.user_position}</div>
                                                )}
                                            </div>
                                            {getStatusBadge(ap)}
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <div>
                                                <div className="text-xs text-gray-500">AP Number</div>
                                                <div className="text-sm font-medium text-gray-900">{ap.ap_number}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <div className="text-xs text-gray-500">Registration Date</div>
                                                    <div className="text-sm text-gray-900">{ap.formatted_registration_date}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Expiry Date</div>
                                                    <div className="text-sm text-gray-900">
                                                        {ap.formatted_expiry_date || '-'}
                                                        {ap.is_expired && (
                                                            <span className="block text-xs text-red-600 font-medium">Expired</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                href={route('admin.registered-aps.show', ap.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </Link>
                                            <Link
                                                href={route('admin.registered-aps.edit', ap.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(ap)}
                                                className="inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {registeredAps.data.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            {filters.search || filters.status ? 'No registered APs found' : 'No registered APs yet'}
                                        </h3>
                                        {!filters.search && !filters.status && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Get started by creating your first registered AP.
                                            </p>
                                        )}
                                        <div className="mt-6">
                                            <Link
                                                href={route('admin.registered-aps.create')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                            >
                                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add First Registered AP
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {registeredAps.last_page > 1 && (
                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                                        Showing <span className="font-medium">{(registeredAps.current_page - 1) * registeredAps.per_page + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(registeredAps.current_page * registeredAps.per_page, registeredAps.total)}</span> of{' '}
                                        <span className="font-medium">{registeredAps.total}</span> registered APs
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {registeredAps.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors ${
                                                    link.active
                                                        ? 'bg-primary-600 text-white'
                                                        : link.url
                                                        ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                show={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Registered AP"
                message={`Are you sure you want to delete registered AP "${apToDelete?.ap_number}" for user "${apToDelete?.user_name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
