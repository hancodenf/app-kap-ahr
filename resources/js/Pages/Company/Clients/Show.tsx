import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Project {
    id: number;
    name: string;
    status: string;
    working_steps_count: number;
    tasks_count: number;
    created_at: string;
    updated_at: string;
}

interface Client {
    id: number;
    name: string;
    alamat: string;
    kementrian: string;
    kode_satker: string;
    created_at: string;
    updated_at: string;
    projects: Project[];
}

interface Props extends PageProps {
    client: Client;
}

export default function Show({ client }: Props) {
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Client Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{client.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ministry</label>
                                    <p className="mt-1 text-sm text-gray-900">{client.kementrian}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <p className="mt-1 text-sm text-gray-900">{client.alamat}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Satker Code</label>
                                    <p className="mt-1 text-sm text-gray-900">{client.kode_satker}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Projects</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {client.projects.length} projects
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Projects You're Working On ({client.projects.length})
                            </h3>

                            {client.projects.length > 0 ? (
                                <div className="space-y-4">
                                    {client.projects.map((project) => (
                                        <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="text-base font-medium text-gray-900">
                                                            {project.name}
                                                        </h4>
                                                        {getStatusBadge(project.status)}
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
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">You are not assigned to any projects for this client.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
