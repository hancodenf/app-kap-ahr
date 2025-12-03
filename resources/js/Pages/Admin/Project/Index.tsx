import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';

interface ProjectBundle {
    id: number;
    name: string;
    client_name: string;
    status: string;
    year: string;
    updated_at: string;
    client?: {
        id: number;
        name: string;
    };
    project_teams?: Array<{
        id: number;
        user_id?: number;
        user_name: string;
        role: string;
    }>;
    task_stats?: {
        total: number;
        completed: number;
        in_progress: number;
        pending: number;
        percentage: number;
    };
}

interface Props extends PageProps {
    bundles: {
        data: ProjectBundle[];
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
        year?: string;
        status?: string;
        archived?: string;
    };
    availableYears: number[];
    overallStats: {
        total_projects: number;
        completed_projects: number;
        in_progress_projects: number;
        not_started_projects: number;
        suspended_projects: number;
        canceled_projects: number;
        archived_projects: number;
    };
    statusCounts: {
        total: number;
        draft: number;
        in_progress: number;
        completed: number;
        suspended: number;
        canceled: number;
        active: number;
        archived: number;
    };
}

export default function Index({ bundles, filters, availableYears, overallStats, statusCounts }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [year, setYear] = useState(filters.year || '');
    const [status, setStatus] = useState(filters.status || '');
    const [archived, setArchived] = useState(filters.archived === 'true');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [bundleToDelete, setBundleToDelete] = useState<ProjectBundle | null>(null);

    // Auto-trigger search when status or archived changes
    useEffect(() => {
        handleSearch();
    }, [status, archived]);

    const handleSearch = () => {
        router.get(route('admin.projects.bundles.index'), { 
            search, 
            year, 
            status, 
            archived: archived ? 'true' : 'false' 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setYear('');
        setStatus('');
        setArchived(false);
        router.get(route('admin.projects.bundles.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDeleteClick = (bundle: ProjectBundle) => {
        setBundleToDelete(bundle);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (bundleToDelete) {
            router.delete(route('admin.projects.bundles.destroy', bundleToDelete.id), {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setBundleToDelete(null);
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getPartners = (projectTeams?: Array<{ user_id?: number; user_name: string; role: string }>) => {
        if (!projectTeams || projectTeams.length === 0) return [];
        return projectTeams.filter(team => team.role === 'partner');
    };

    const renderPartners = (partners: Array<{ user_id?: number; user_name: string; role: string }>) => {
        if (partners.length === 0) return <span className="text-sm text-gray-700">No partner</span>;
        
        return (
            <div className="flex flex-wrap gap-1">
                {partners.map((partner, index) => (
                    <span key={index}>
                        {partner.user_id ? (
                            <Link
                                href={route('admin.users.show', partner.user_id)}
                                className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                            >
                                {partner.user_name}
                            </Link>
                        ) : (
                            <span className="text-sm text-gray-700">{partner.user_name}</span>
                        )}
                        {index < partners.length - 1 && <span className="text-gray-700">, </span>}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        Project Management
                    </h2>
                    <Link
                        href={route('admin.projects.bundles.create')}
                        className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                    >
                        + Add New Project
                    </Link>
                </div>
            }
        >
            <Head title="Projects" />

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

                    {/* Stats Section - Compact Modern Cards */}
                    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                        {/* Total Projects */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all p-4 group cursor-pointer">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-blue-500 p-3 mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-blue-900 mb-1">{statusCounts.total}</p>
                                <p className="text-xs font-semibold text-blue-700 truncate w-full">Total</p>
                            </div>
                        </div>

                        {/* Draft Projects */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 shadow-sm hover:shadow-md transition-all p-4 group cursor-pointer">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-gray-500 p-3 mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{statusCounts.draft || 0}</p>
                                <p className="text-xs font-semibold text-gray-700 truncate w-full">Draft</p>
                            </div>
                        </div>

                        {/* In Progress Projects */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-300 shadow-sm hover:shadow-md transition-all p-4 group cursor-pointer">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-yellow-500 p-3 mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-yellow-900 mb-1">{statusCounts.in_progress || 0}</p>
                                <p className="text-xs font-semibold text-yellow-700 truncate w-full">In Progress</p>
                            </div>
                        </div>

                        {/* Completed Projects */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300 shadow-sm hover:shadow-md transition-all p-4 group cursor-pointer">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-green-500 p-3 mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-green-900 mb-1">{statusCounts.completed || 0}</p>
                                <p className="text-xs font-semibold text-green-700 truncate w-full">Completed</p>
                            </div>
                        </div>

                        {/* Suspended Projects */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-300 shadow-sm hover:shadow-md transition-all p-4 group cursor-pointer">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-orange-500 p-3 mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-orange-900 mb-1">{statusCounts.suspended || 0}</p>
                                <p className="text-xs font-semibold text-orange-700 truncate w-full">Suspended</p>
                            </div>
                        </div>

                        {/* Canceled Projects */}
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300 shadow-sm hover:shadow-md transition-all p-4 group cursor-pointer">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-red-500 p-3 mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-red-900 mb-1">{statusCounts.canceled || 0}</p>
                                <p className="text-xs font-semibold text-red-700 truncate w-full">Canceled</p>
                            </div>
                        </div>

                        {/* Active Projects */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-300 shadow-sm hover:shadow-md transition-all p-4 group cursor-pointer">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-indigo-500 p-3 mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-indigo-900 mb-1">{statusCounts.active || 0}</p>
                                <p className="text-xs font-semibold text-indigo-700 truncate w-full">Active</p>
                            </div>
                        </div>

                        {/* Archived Projects */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 shadow-sm hover:shadow-md transition-all p-4 group cursor-pointer">
                            <div className="flex flex-col items-center text-center">
                                <div className="rounded-full bg-purple-500 p-3 mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m-6 0l6-6m2-5v20m6-19a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h10z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-purple-900 mb-1">{statusCounts.archived || 0}</p>
                                <p className="text-xs font-semibold text-purple-700 truncate w-full">Archived</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Navigation Tabs */}
                    <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setStatus('')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === '' 
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                            >
                                All Status
                            </button>
                            <button
                                onClick={() => setStatus('Draft')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === 'Draft' 
                                        ? 'bg-gray-100 text-gray-700 border border-gray-300' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                Draft
                            </button>
                            <button
                                onClick={() => setStatus('In Progress')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === 'In Progress' 
                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                In Progress
                            </button>
                            <button
                                onClick={() => setStatus('Completed')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === 'Completed' 
                                        ? 'bg-green-100 text-green-700 border border-green-300' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setStatus('Suspended')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === 'Suspended' 
                                        ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                Suspended
                            </button>
                            <button
                                onClick={() => setStatus('Canceled')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    status === 'Canceled' 
                                        ? 'bg-red-100 text-red-700 border border-red-300' 
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                Canceled
                            </button>
                        </div>
                        
                        {/* Archived Toggle */}
                        <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={archived}
                                    onChange={(e) => setArchived(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                    archived ? 'bg-purple-600' : 'bg-gray-200'
                                }`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                        archived ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    Show Archived Projects Only
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6">
                            {/* Search & Filter Bar */}
                            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Search project or client..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Years</option>
                                    {availableYears.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSearch}
                                        className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                                    >
                                        Search
                                    </button>
                                    {(filters.search || filters.year) && (
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
                                                Client
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Partner
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Progress
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Year
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {bundles.data.map((bundle, index) => (
                                            <tr key={bundle.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {(bundles.current_page - 1) * bundles.per_page + index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {bundle.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2"> 
                                                        {bundle.client ? (
                                                            <Link 
                                                                href={route('admin.clients.show', bundle.client.id)}
                                                                className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                                                            >
                                                                {bundle.client_name || bundle.client.name}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm text-gray-900">N/A</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2"> 
                                                        {renderPartners(getPartners(bundle.project_teams))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 w-64">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 min-w-[160px]">
                                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                                <div 
                                                                    className={`h-3 rounded-full transition-all duration-300 ${
                                                                        (bundle.task_stats?.percentage || 0) === 100 
                                                                            ? 'bg-green-600' 
                                                                            : (bundle.task_stats?.percentage || 0) > 0 
                                                                            ? 'bg-blue-600' 
                                                                            : 'bg-gray-400'
                                                                    }`}
                                                                    style={{ width: `${bundle.task_stats?.percentage || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-600">
                                                                {bundle.task_stats?.completed || 0}/{bundle.task_stats?.total || 0} tasks
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-700 min-w-[45px] text-right">
                                                            {bundle.task_stats?.percentage || 0}%
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        bundle.status === 'In Progress' 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : bundle.status === 'Completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : bundle.status === 'Draft'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : bundle.status === 'Suspended'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : bundle.status === 'Canceled'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {bundle.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {bundle.year}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('admin.projects.bundles.show', bundle.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </Link>
                                                        <Link
                                                            href={route('admin.projects.bundles.edit', bundle.id)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(bundle)}
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

                            {/* Projects Cards - Mobile */}
                            <div className="md:hidden space-y-4">
                                {bundles.data.map((bundle, index) => (
                                    <div key={bundle.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    #{(bundles.current_page - 1) * bundles.per_page + index + 1}
                                                </div>
                                                <h3 className="text-base font-medium text-gray-900 mb-2">
                                                    {bundle.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"> 
                                                    {bundle.client ? (
                                                        <Link 
                                                            href={route('admin.clients.show', bundle.client.id)}
                                                            className="text-primary-600 hover:text-primary-800 hover:underline"
                                                        >
                                                            {bundle.client_name || bundle.client.name}
                                                        </Link>
                                                    ) : (
                                                        <span>N/A</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2"> 
                                                    <span className="text-xs">{renderPartners(getPartners(bundle.project_teams))}</span>
                                                </div>
                                                
                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-gray-600">
                                                            {bundle.task_stats?.completed || 0}/{bundle.task_stats?.total || 0} tasks
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {bundle.task_stats?.percentage || 0}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                (bundle.task_stats?.percentage || 0) === 100 
                                                                    ? 'bg-green-600' 
                                                                    : (bundle.task_stats?.percentage || 0) > 0 
                                                                    ? 'bg-blue-600' 
                                                                    : 'bg-gray-400'
                                                            }`}
                                                            style={{ width: `${bundle.task_stats?.percentage || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    bundle.status === 'In Progress' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : bundle.status === 'Completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : bundle.status === 'Draft'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : bundle.status === 'Suspended'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : bundle.status === 'Canceled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {bundle.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-3">
                                            <span className="font-medium">Dibuat:</span> {formatDate(bundle.year)}
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                href={route('admin.projects.bundles.show', bundle.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </Link>
                                            <Link
                                                href={route('admin.projects.bundles.edit', bundle.id)}
                                                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteClick(bundle)}
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
                            {bundles.data.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            {filters.search || filters.year ? 'No projects found' : 'No projects yet'}
                                        </h3>
                                        {!filters.search && !filters.year && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Get started by creating your first project.
                                            </p>
                                        )}
                                        <div className="mt-6">
                                            <Link
                                                href={route('admin.projects.bundles.create')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                            >
                                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add First Project
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {bundles.last_page > 1 && (
                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                                        Showing <span className="font-medium">{(bundles.current_page - 1) * bundles.per_page + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(bundles.current_page * bundles.per_page, bundles.total)}</span> of{' '}
                                        <span className="font-medium">{bundles.total}</span> projects
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {bundles.links.map((link, index) => (
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
                show={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Project"
                message={`Are you sure you want to delete "${bundleToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
