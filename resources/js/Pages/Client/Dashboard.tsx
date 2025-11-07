import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Project {
    id: number;
    name: string;
    client_id: number;
    working_steps_count: number;
    tasks_count: number;
    created_at: string;
    client: {
        id: number;
        name: string;
    };
}

interface Stats {
    total_projects: number;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
}

interface Props extends PageProps {
    projects: Project[];
    stats: Stats;
}

export default function Dashboard({ projects, stats }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getProgressPercentage = () => {
        if (stats.total_tasks === 0) return 0;
        return Math.round((stats.completed_tasks / stats.total_tasks) * 100);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        Client Dashboard
                    </h2>
                </div>
            }
        >
            <Head title="Client Dashboard" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total Projects */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Projects</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.total_projects}</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Tasks */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.total_tasks}</p>
                                </div>
                            </div>
                        </div>

                        {/* Completed Tasks */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Completed</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.completed_tasks}</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Progress</p>
                                    <p className="text-2xl font-semibold text-gray-900">{getProgressPercentage()}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Projects */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Your Projects</h3>
                                {projects.length > 0 && (
                                    <Link
                                        href={route('klien.projects.index')}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        View All →
                                    </Link>
                                )}
                            </div>

                            {projects.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">Your projects will appear here once they are created.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {projects.slice(0, 5).map((project) => (
                                        <Link
                                            key={project.id}
                                            href={route('klien.projects.show', project.id)}
                                            className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {project.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Created {formatDate(project.created_at)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="bg-blue-50 rounded-lg px-3 py-1.5">
                                                        <p className="text-xs text-blue-600 font-medium">
                                                            {project.working_steps_count} steps
                                                        </p>
                                                    </div>
                                                    <div className="bg-green-50 rounded-lg px-3 py-1.5">
                                                        <p className="text-xs text-green-600 font-medium">
                                                            {project.tasks_count} tasks
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
