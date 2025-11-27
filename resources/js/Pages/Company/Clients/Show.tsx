import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, FormEventHandler } from 'react';

interface Project {
    id: number;
    name: string;
    slug: string;
    status: string;
    year: number;
    working_steps_count: number;
    tasks_count: number;
    created_at: string;
    updated_at: string;
}

interface Client {
    id: string;
    slug: string;
    name: string;
    alamat: string;
    kementrian: string;
    kode_satker: string;
    type: string;
    logo: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginatedProjects {
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
}

interface Props extends PageProps {
    client: Client;
    projects: PaginatedProjects;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Show({ client, projects, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

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

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('company.clients.show', client.id),
            { search: searchTerm, status: statusFilter },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            route('company.clients.show', client.id),
            { search: searchTerm, status: status },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setSearchTerm('');
        setStatusFilter('');
        router.get(route('company.clients.show', client.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <Link
                            href={route('company.clients.index')}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to My Clients
                        </Link>
                        <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                            {client.name}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Client: ${client.name}`} />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Client Information Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
                                {client.logo && (
                                    <img 
                                        src={`/storage/${client.logo}`} 
                                        alt={`${client.name} logo`}
                                        className="h-16 w-16 object-contain rounded-lg border border-gray-200"
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Client Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{client.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Client Type</label>
                                    <p className="mt-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {client.type}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ministry</label>
                                    <p className="mt-1 text-sm text-gray-900">{client.kementrian}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Satker Code</label>
                                    <p className="mt-1 text-sm text-gray-900">{client.kode_satker}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <p className="mt-1 text-sm text-gray-900">{client.alamat}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Registered Since</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(client.created_at)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Projects</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {projects.total} projects
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Projects You're Working On ({projects.total})
                                </h3>
                            </div>

                            {/* Search and Filter */}
                            <div className="mb-6 space-y-4">
                                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search projects..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            Search
                                        </button>
                                        {(searchTerm || statusFilter) && (
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </form>

                                {/* Status Filter Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleFilterChange('')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            statusFilter === ''
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        All Status
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('open')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            statusFilter === 'open'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                        }`}
                                    >
                                        Open
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('closed')}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            statusFilter === 'closed'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                        }`}
                                    >
                                        Closed
                                    </button>
                                </div>
                            </div>

                            {projects.data.length > 0 ? (
                                <>
                                    <div className="space-y-4">
                                        {projects.data.map((project) => (
                                            <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="text-base font-medium text-gray-900">
                                                                {project.name}
                                                            </h4>
                                                            {getStatusBadge(project.status)}
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                                {project.year}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                            <span className="inline-flex items-center">
                                                                <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                                {project.working_steps_count} steps
                                                            </span>
                                                            <span className="inline-flex items-center">
                                                                <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                                </svg>
                                                                {project.tasks_count} tasks
                                                            </span>
                                                            <span className="inline-flex items-center">
                                                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {formatDate(project.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={route('company.projects.show', project.id)}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Project
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {projects.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                            <div className="flex-1 flex justify-between sm:hidden">
                                                {projects.links[0]?.url && (
                                                    <Link
                                                        href={projects.links[0].url}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        Previous
                                                    </Link>
                                                )}
                                                {projects.links[projects.links.length - 1]?.url && (
                                                    <Link
                                                        href={projects.links[projects.links.length - 1].url || '#'}
                                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        Next
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Showing <span className="font-medium">{(projects.current_page - 1) * projects.per_page + 1}</span> to{' '}
                                                        <span className="font-medium">
                                                            {Math.min(projects.current_page * projects.per_page, projects.total)}
                                                        </span>{' '}
                                                        of <span className="font-medium">{projects.total}</span> results
                                                    </p>
                                                </div>
                                                <div>
                                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                        {projects.links.map((link, index) => {
                                                            if (index === 0 || index === projects.links.length - 1) {
                                                                return (
                                                                    <Link
                                                                        key={index}
                                                                        href={link.url || '#'}
                                                                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                                                            link.url
                                                                                ? 'text-gray-500 hover:bg-gray-50'
                                                                                : 'text-gray-300 cursor-not-allowed'
                                                                        } ${
                                                                            index === 0 ? 'rounded-l-md' : 'rounded-r-md'
                                                                        }`}
                                                                        preserveState
                                                                        preserveScroll
                                                                    >
                                                                        <span className="sr-only">{link.label}</span>
                                                                        {index === 0 ? (
                                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                    </Link>
                                                                );
                                                            }
                                                            return (
                                                                <Link
                                                                    key={index}
                                                                    href={link.url || '#'}
                                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                        link.active
                                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    }`}
                                                                    preserveState
                                                                    preserveScroll
                                                                >
                                                                    {link.label}
                                                                </Link>
                                                            );
                                                        })}
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm || statusFilter
                                            ? 'Try adjusting your search or filter to find what you are looking for.'
                                            : 'You are not assigned to any projects for this client.'}
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
