import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Project {
    id: number;
    name: string;
    status: string;
    client_id: number;
    working_steps_count: number;
    tasks_count: number;
    created_at: string;
    updated_at: string;
    client: {
        id: number;
        name: string;
    };
}

interface Props extends PageProps {
    projects: {
        data: Project[];
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
    statusCounts: {
        open: number;
        closed: number;
    };
}

export default function Index({ projects, filters, statusCounts }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [activeStatus, setActiveStatus] = useState(filters.status || 'open');

    const handleSearch = () => {
        router.get(route('klien.projects.index'), { search, status: activeStatus }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('klien.projects.index'), { status: activeStatus }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusChange = (status: string) => {
        setActiveStatus(status);
        router.get(route('klien.projects.index'), { status, search }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            open: { color: 'bg-blue-100 text-blue-800', label: 'Open' },
            closed: { color: 'bg-green-100 text-green-800', label: 'Closed' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
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
                            {/* Status Tabs */}
                            <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
                                <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
                                    <button
                                        onClick={() => handleStatusChange('open')}
                                        className={`${
                                            activeStatus === 'open'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2`}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Open</span>
                                        <span className={`${
                                            activeStatus === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                        } inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium`}>
                                            {statusCounts.open}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('closed')}
                                        className={`${
                                            activeStatus === 'closed'
                                                ? 'border-green-500 text-green-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1 sm:gap-2`}
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Closed</span>
                                        <span className={`${
                                            activeStatus === 'closed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                        } inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium`}>
                                            {statusCounts.closed}
                                        </span>
                                    </button>
                                </nav>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Cari nama project..."
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
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Working Steps
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total Tasks
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {projects.data.map((project, index) => (
                                            <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {(projects.current_page - 1) * projects.per_page + index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {project.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(project.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        {project.working_steps_count} steps
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                        </svg>
                                                        {project.tasks_count} tasks
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(project.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route('klien.projects.show', project.id)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                                        title="View Details"
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
                                {projects.data.map((project, index) => (
                                    <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    #{(projects.current_page - 1) * projects.per_page + index + 1}
                                                </div>
                                                <h3 className="text-base font-medium text-gray-900 mb-2">
                                                    {project.name}
                                                </h3>
                                                <div className="mb-2">
                                                    {getStatusBadge(project.status)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="bg-blue-50 rounded-lg p-2">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span className="text-xs font-medium text-blue-900">Steps</span>
                                                </div>
                                                <div className="text-lg font-bold text-blue-700">
                                                    {project.working_steps_count}
                                                </div>
                                            </div>

                                            <div className="bg-green-50 rounded-lg p-2">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                    </svg>
                                                    <span className="text-xs font-medium text-green-900">Tasks</span>
                                                </div>
                                                <div className="text-lg font-bold text-green-700">
                                                    {project.tasks_count}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-3">
                                            <span className="font-medium">Created:</span> {formatDate(project.created_at)}
                                        </div>

                                        <Link
                                            href={route('klien.projects.show', project.id)}
                                            className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Project
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {projects.data.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        {filters.search ? 'Tidak ada project yang ditemukan' : 'Belum ada project'}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {filters.search ? 'Coba ubah kata kunci pencarian Anda.' : 'Project Anda akan muncul di sini.'}
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {projects.last_page > 1 && (
                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                                        Showing <span className="font-medium">{(projects.current_page - 1) * projects.per_page + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(projects.current_page * projects.per_page, projects.total)}</span> of{' '}
                                        <span className="font-medium">{projects.total}</span> projects
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {projects.links.map((link, index) => (
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
        </AuthenticatedLayout>
    );
}
