import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';

interface User {
    id: number;
    name: string;
    email: string;
    profile_photo?: string | null;
    email_verified_at: string | null;
    position?: string | null;
    user_type?: string | null;
    client_id?: number | null;
    client_name?: string | null;
    is_active: boolean;
    role: {
        id: number;
        name: string;
        display_name: string;
    } | null;
    created_at: string;
    project_teams_count?: number;
    activity_logs_count?: number;
    registered_ap_count?: number;
}

interface UsersPageProps extends PageProps {
    users: {
        data: User[];
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
        role?: string;
    };
    roleCounts: {
        admin: number;
        company: number;
        client: number;
    };
}

export default function Index({ users, filters, roleCounts }: UsersPageProps) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [activeRole, setActiveRole] = useState(filters.role || 'admin');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRelationDialog, setShowRelationDialog] = useState(false);
    const [showToggleStatusDialog, setShowToggleStatusDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToToggle, setUserToToggle] = useState<User | null>(null);
    const [relationMessage, setRelationMessage] = useState('');

    const handleSearch = () => {
        router.get(route('admin.users.index'), { search, role: activeRole }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('admin.users.index'), { role: activeRole }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleRoleChange = (role: string) => {
        setActiveRole(role);
        router.get(route('admin.users.index'), { role, search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDeleteClick = (user: User) => {
        // Check if user has related data
        const hasRelations = (user.project_teams_count || 0) > 0 || (user.activity_logs_count || 0) > 0 || (user.registered_ap_count || 0) > 0;
        
        if (hasRelations) {
            // Show relation dialog instead of delete dialog
            const messages = [];
            if ((user.project_teams_count || 0) > 0) {
                messages.push(`${user.project_teams_count} project team`);
            }
            if ((user.activity_logs_count || 0) > 0) {
                messages.push(`${user.activity_logs_count} activity log`);
            }
            if ((user.registered_ap_count || 0) > 0) {
                messages.push(`registrasi AP`);
            }
            
            setUserToDelete(user);
            setRelationMessage(`User "${user.name}" tidak dapat dihapus karena masih memiliki ${messages.join(', ')} yang terkait.\n\nSilakan hapus atau pindahkan data terkait terlebih dahulu.`);
            setShowRelationDialog(true);
            return;
        }
        
        setUserToDelete(user);
        setShowDeleteDialog(true);
    };

    const handleToggleStatus = (user: User) => {
        setUserToToggle(user);
        setShowToggleStatusDialog(true);
    };

    const handleToggleStatusConfirm = () => {
        if (userToToggle) {
            router.post(route('admin.users.toggle-status', userToToggle.id), {}, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowToggleStatusDialog(false);
                    setUserToToggle(null);
                },
            });
        }
    };

    const handleDeleteConfirm = () => {
        if (userToDelete) {
            router.delete(route('admin.users.destroy', userToDelete.id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        User Management
                    </h2>
                    <Link
                        href={route('admin.users.create')}
                        className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                    >
                        + Tambah User
                    </Link>
                </div>
            }
        >
            <Head title="User Management" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
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
                            {/* Role Tabs */}
                            <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
                                <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
                                    <button
                                        onClick={() => handleRoleChange('admin')}
                                        className={`${
                                            activeRole === 'admin'
                                                ? 'border-red-500 text-red-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2`}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <span className="hidden sm:inline">Administrator</span>
                                        <span className="sm:hidden">Admin</span>
                                        <span className={`${
                                            activeRole === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                                        } inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium`}>
                                            {roleCounts.admin}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleRoleChange('company')}
                                        className={`${
                                            activeRole === 'company'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2`}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                        </svg>
                                        <span>Company</span>
                                        <span className={`${
                                            activeRole === 'company' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                        } inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium`}>
                                            {roleCounts.company}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleRoleChange('client')}
                                        className={`${
                                            activeRole === 'client'
                                                ? 'border-green-500 text-green-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2`}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>Client</span>
                                        <span className={`${
                                            activeRole === 'client' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                        } inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium`}>
                                            {roleCounts.client}
                                        </span>
                                    </button>
                                </nav>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Cari nama, email, atau role..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                                    >
                                        Cari
                                    </button>
                                    {filters.search && (
                                        <button
                                            onClick={handleReset}
                                            className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Users Table - Desktop */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            {activeRole === 'company' && (
                                                <>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Position
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                </>
                                            )}
                                            {activeRole === 'client' && (
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Client
                                                </th>
                                            )}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Projects
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th> 
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.data.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {(users.current_page - 1) * users.per_page + index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.profile_photo ? (
                                                            <img 
                                                                src={`/storage/${user.profile_photo}`} 
                                                                alt={user.name}
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold border-2 border-gray-300">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {activeRole === 'company' && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {user.position || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {user.user_type && (
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    user.user_type === 'Tenaga Ahli' 
                                                                        ? 'bg-purple-100 text-purple-800' 
                                                                        : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {user.user_type}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                                {activeRole === 'client' && (
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {user.client_name ? (
                                                            <div>
                                                                {user.client_name} 
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <span className="font-medium">{user.project_teams_count || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                                            user.is_active ? 'bg-green-600' : 'bg-gray-300'
                                                        }`}
                                                        title={user.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                user.is_active ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                        />
                                                    </button>
                                                </td> 
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-1">
                                                        <Link
                                                            href={route('admin.users.show', user.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            href={route('admin.users.edit', user.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
                                                                (user.project_teams_count || 0) > 0 || (user.activity_logs_count || 0) > 0 || (user.registered_ap_count || 0) > 0
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                            }`}
                                                            title={
                                                                (user.project_teams_count || 0) > 0 || (user.activity_logs_count || 0) > 0 || (user.registered_ap_count || 0) > 0
                                                                    ? 'Tidak dapat dihapus karena memiliki data terkait'
                                                                    : 'Delete'
                                                            }
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

                            {/* Users Cards - Mobile/Tablet */}
                            <div className="lg:hidden space-y-4">
                                {users.data.map((user, index) => (
                                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-start gap-3 mb-3">
                                            {user.profile_photo ? (
                                                <img 
                                                    src={`/storage/${user.profile_photo}`} 
                                                    alt={user.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-base flex-shrink-0">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    #{(users.current_page - 1) * users.per_page + index + 1}
                                                </div>
                                                <h3 className="text-base font-medium text-gray-900 truncate">
                                                    {user.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        {/* Company specific fields */}
                                        {activeRole === 'company' && (
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                {user.position && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <div className="text-[10px] text-gray-500 mb-0.5">Position</div>
                                                        <div className="text-sm font-medium text-gray-900 truncate">{user.position}</div>
                                                    </div>
                                                )}
                                                {user.user_type && (
                                                    <div className="bg-gray-50 rounded-lg p-2">
                                                        <div className="text-[10px] text-gray-500 mb-0.5">Type</div>
                                                        <div className="text-sm">
                                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                user.user_type === 'Tenaga Ahli' 
                                                                    ? 'bg-purple-100 text-purple-800' 
                                                                    : 'bg-cyan-100 text-cyan-800'
                                                            }`}>
                                                                {user.user_type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Client specific fields */}
                                        {activeRole === 'client' && user.client_name && (
                                            <div className="mb-3">
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <div className="text-[10px] text-gray-500 mb-0.5">Client</div>
                                                    <div className="text-sm font-medium text-gray-900 truncate">{user.client_name}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Project Teams Count */}
                                        <div className="mb-3">
                                            <div className="bg-gray-50 rounded-lg p-2">
                                                <div className="text-[10px] text-gray-500 mb-0.5">Project Teams</div>
                                                <div className="text-sm font-medium text-gray-900">{user.project_teams_count || 0} teams</div>
                                            </div>
                                        </div>

                                        {/* Status Toggle */}
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-sm text-gray-700 font-medium">Status Akun:</span>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                                    user.is_active ? 'bg-green-600' : 'bg-gray-300'
                                                }`}
                                                title={user.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        user.is_active ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-3">
                                            <span className="font-medium">Bergabung:</span> {formatDate(user.created_at)}
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                href={route('admin.users.show', user.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </Link>
                                            <Link
                                                href={route('admin.users.edit', user.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                className={`inline-flex items-center justify-center px-3 py-2 rounded-md transition-colors ${
                                                    (user.project_teams_count || 0) > 0 || (user.activity_logs_count || 0) > 0 || (user.registered_ap_count || 0) > 0
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                }`}
                                                title={
                                                    (user.project_teams_count || 0) > 0 || (user.activity_logs_count || 0) > 0 || (user.registered_ap_count || 0) > 0
                                                        ? 'Tidak dapat dihapus karena memiliki data terkait'
                                                        : 'Delete'
                                                }
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
                            {users.data.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">
                                        {filters.search ? 'Tidak ada user yang ditemukan.' : 'Belum ada user.'}
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {users.last_page > 1 && (
                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                                        Showing <span className="font-medium">{(users.current_page - 1) * users.per_page + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(users.current_page * users.per_page, users.total)}</span> of{' '}
                                        <span className="font-medium">{users.total}</span> users
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {users.links.map((link, index) => (
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
                title="Hapus User"
                message={`Apakah Anda yakin ingin menghapus user "${userToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                onConfirm={handleDeleteConfirm}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setUserToDelete(null);
                }}
                type="danger"
            />

            {/* Relation Warning Dialog */}
            <ConfirmDialog
                show={showRelationDialog}
                title="Tidak Dapat Menghapus User"
                message={relationMessage}
                confirmText="Mengerti"
                cancelText=""
                onConfirm={() => {
                    setShowRelationDialog(false);
                    setUserToDelete(null);
                    setRelationMessage('');
                }}
                onClose={() => {
                    setShowRelationDialog(false);
                    setUserToDelete(null);
                    setRelationMessage('');
                }}
                type="warning"
            />

            {/* Toggle Status Confirmation Dialog */}
            <ConfirmDialog
                show={showToggleStatusDialog}
                title={userToToggle?.is_active ? 'Nonaktifkan User' : 'Aktifkan User'}
                message={
                    userToToggle?.is_active
                        ? `Apakah Anda yakin ingin menonaktifkan user "${userToToggle?.name}"? User tidak akan bisa login setelah dinonaktifkan.`
                        : `Apakah Anda yakin ingin mengaktifkan user "${userToToggle?.name}"? User akan bisa login kembali setelah diaktifkan.`
                }
                confirmText={userToToggle?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                cancelText="Batal"
                onConfirm={handleToggleStatusConfirm}
                onClose={() => {
                    setShowToggleStatusDialog(false);
                    setUserToToggle(null);
                }}
                type={userToToggle?.is_active ? 'warning' : 'info'}
            />
        </AuthenticatedLayout>
    );
}