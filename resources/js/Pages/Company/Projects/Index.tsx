import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Project {
    id: number;
    name: string;
    client_name: string;
    status: string;
    my_role: string;
    created_at: string;
}

interface Props extends PageProps {
    projects: Project[];
    filters: {
        search?: string;
        status?: string;
    };
    statusCounts: {
        open: number;
        closed: number;
    };
}

export default function ProjectsIndex({ auth, projects, filters, statusCounts }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const activeStatus = filters.status || 'open';

    const handleSearch = () => {
        router.get(route('company.projects.index'), { search, status: activeStatus }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('company.projects.index'), { status: activeStatus }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusChange = (status: string) => {
        router.get(route('company.projects.index'), { status, search }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            open: { color: 'bg-green-100 text-green-800', label: 'Open' },
            closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
        return (
            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getRoleBadge = (role: string) => {
        const roleConfig = {
            partner: { color: 'bg-purple-100 text-purple-800', label: 'Partner' },
            manager: { color: 'bg-blue-100 text-blue-800', label: 'Manager' },
            supervisor: { color: 'bg-cyan-100 text-cyan-800', label: 'Supervisor' },
            'team leader': { color: 'bg-orange-100 text-orange-800', label: 'Team Leader' },
            member: { color: 'bg-gray-100 text-gray-800', label: 'Member' },
        };
        const config = roleConfig[role.toLowerCase() as keyof typeof roleConfig] || roleConfig.member;
        return (
            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        My Projects
                    </h2>
                </div>
            }
        >
            <Head title="My Projects" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-xl">
                        <div className="p-4 sm:p-6">
                            {/* Status Tabs */}
                            <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
                                <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
                                    <button
                                        onClick={() => handleStatusChange('open')}
                                        className={`${
                                            activeStatus === 'open'
                                                ? 'border-green-500 text-green-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2`}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Open</span>
                                        <span className={`${
                                            activeStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                        } inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium`}>
                                            {statusCounts.open}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('closed')}
                                        className={`${
                                            activeStatus === 'closed'
                                                ? 'border-gray-500 text-gray-700'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2`}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Closed</span>
                                        <span className={`${
                                            activeStatus === 'closed' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'
                                        } inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium`}>
                                            {statusCounts.closed}
                                        </span>
                                    </button>
                                </nav>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search project name or client..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Search
                                    </button>
                                    {filters.search && (
                                        <button
                                            onClick={handleReset}
                                            className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Projects Table - Desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Project Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Client
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                My Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {projects.map((project, index) => (
                                            <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('company.projects.show', project.id)}
                                                        className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-sm text-gray-700">
                                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        {project.client_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getRoleBadge(project.my_role)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(project.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(project.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <Link
                                                        href={route('company.projects.show', project.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors font-medium"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Projects Cards - Mobile */}
                            <div className="md:hidden space-y-4">
                                {projects.map((project, index) => (
                                    <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    #{index + 1}
                                                </div>
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">
                                                    {project.name}
                                                </h3>
                                            </div>
                                            {getStatusBadge(project.status)}
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-medium text-gray-600">Client:</span>
                                                <span className="ml-1">{project.client_name}</span>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="font-medium text-gray-600">My Role:</span>
                                                </div>
                                                {getRoleBadge(project.my_role)}
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-3 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="font-medium">Created:</span>
                                            <span className="ml-1">{formatDate(project.created_at)}</span>
                                        </div>

                                        <Link
                                            href={route('company.projects.show', project.id)}
                                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Project Details
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {projects.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        {filters.search ? 'No projects found' : `No ${activeStatus} projects`}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {filters.search ? 'Try changing your search keywords.' : `You don't have any ${activeStatus} projects yet.`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
