import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import NewsCard from '@/Components/NewsCard';

// TypeScript Interfaces
interface ProjectStats {
    total: number;
    open: number;
    closed: number;
}

interface TaskStats {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
}

interface DocumentStats {
    total_documents: number;
    client_documents: number;
}

interface RecentProject {
    id: number;
    name: string;
    status: string;
    working_steps_count: number;
    tasks_count: number;
    created_at: string;
}

interface TaskRequiringAction {
    id: number;
    name: string;
    project_name: string;
    working_step_name: string;
    status: string;
    completion_status: string;
    created_at: string;
}

interface TaskTrendItem {
    date: string;
    count: number;
}

interface RecentActivity {
    id: number;
    user_name: string;
    action_type: string;
    action: string;
    target_name: string;
    description: string;
    created_at: string;
}

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image?: string | null;
    published_at: string;
    creator: {
        name: string;
    };
}

interface Client {
    id: number;
    name: string;
    alamat: string;
    kementrian: string;
    kode_satker: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: {
        name: string;
        display_name: string;
        description: string;
    };
    client: Client | null;
}

interface ClientDashboardProps extends PageProps {
    user: User;
    statistics: {
        projects: ProjectStats;
        tasks: TaskStats;
        documents: DocumentStats;
    };
    recentProjects: RecentProject[];
    tasksRequiringAction: TaskRequiringAction[];
    taskTrend: TaskTrendItem[];
    recentActivities: RecentActivity[];
    latestNews: NewsItem[];
}

export default function Dashboard({ 
    user, 
    statistics, 
    recentProjects, 
    tasksRequiringAction,
    taskTrend,
    recentActivities,
    latestNews
}: ClientDashboardProps) {
    
    // Helper Functions
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { bg: string; text: string } } = {
            'open': { bg: 'bg-green-100', text: 'text-green-800' },
            'closed': { bg: 'bg-gray-100', text: 'text-gray-800' },
            'completed': { bg: 'bg-green-100', text: 'text-green-800' },
            'in_progress': { bg: 'bg-blue-100', text: 'text-blue-800' },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        };

        const statusStyle = statusMap[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                {status}
            </span>
        );
    };

    // Calculations
    const taskCompletionRate = statistics.tasks.total > 0 
        ? Math.round((statistics.tasks.completed / statistics.tasks.total) * 100) 
        : 0;
    
    const projectActiveRate = statistics.projects.total > 0
        ? Math.round((statistics.projects.open / statistics.projects.total) * 100)
        : 0;

    const maxTrendValue = Math.max(...taskTrend.map(item => item.count), 1);

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

            <div className="py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Welcome Section - Clean & Minimal */}
                    <div className="overflow-hidden shadow-lg rounded-2xl relative">
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: 'url(/AHR-horizontal.jpg)' }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/20"></div>
                        <div className="relative p-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-white/80 mb-1 drop-shadow">Selamat Datang</p>
                                    <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">{user.name}</h1>
                                    {user.client && (
                                        <div className="space-y-1.5 text-sm text-white/90">
                                            <p className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="font-medium text-white drop-shadow">{user.client.name}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="drop-shadow">{user.client.kementrian}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Clean & Soft */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Total Projects */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-2xl font-bold text-gray-900">{statistics.projects.total}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Jumlah Proyek</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Tasks */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-2xl font-bold text-gray-900">{statistics.tasks.total}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Total Tugas</p>
                                </div>
                            </div>
                        </div>

                        {/* Completed Tasks */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-sm">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-2xl font-bold text-gray-900">{statistics.tasks.completed}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Selesai</p>
                                </div>
                            </div>
                        </div>

                        {/* In Progress Tasks */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-2xl font-bold text-gray-900">{statistics.tasks.in_progress}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Dikerjakan</p>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-sm">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-2xl font-bold text-gray-900">{statistics.documents.total_documents}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Dokumen</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Completion Trend - Clean Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900 mb-6">Tren Penyelesaian Tugas (7 Hari Terakhir)</h3>
                        <div className="flex items-end justify-between h-48 gap-3">
                            {taskTrend.map((item, index) => {
                                const height = maxTrendValue > 0 ? (item.count / maxTrendValue) * 100 : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="w-full bg-gray-100 rounded-t-lg relative group" style={{ height: `${height}%`, minHeight: height > 0 ? '24px' : '4px' }}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg"></div>
                                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2.5 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                                                {item.count} tugas
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 text-center font-medium">
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Two Column Layout - Clean Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Recent Projects */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-base font-semibold text-gray-900">Proyek Terbaru</h3>
                                {recentProjects.length > 0 && (
                                    <Link href="/client/projects" className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                                        Lihat Semua
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                            
                            {recentProjects.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-sm">Belum ada proyek</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentProjects.map((project) => (
                                        <div key={project.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                                                {getStatusBadge(project.status)}
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    {project.tasks_count} tugas
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span>{formatDate(project.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tasks Requiring Action */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900 mb-5">Tugas Memerlukan Tindakan</h3>
                            
                            {tasksRequiringAction.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm">Tidak ada tugas yang tertunda</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {tasksRequiringAction.map((task) => (
                                        <div key={task.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-orange-200 hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm">{task.name}</h4>
                                                {getStatusBadge(task.completion_status)}
                                            </div>
                                            <div className="space-y-1 text-xs text-gray-600">
                                                <p className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                    </svg>
                                                    {task.project_name}
                                                </p>
                                                <p className="text-gray-400 ml-5">{formatDate(task.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activities - Clean */}
                    {recentActivities.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900 mb-5">Aktivitas Terbaru</h3>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="h-9 w-9 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800">
                                                <span className="font-semibold">{activity.user_name}</span>
                                                {' '}{activity.action}{' '}
                                                <span className="font-medium text-gray-900">{activity.target_name}</span>
                                            </p>
                                            {activity.description && (
                                                <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1.5">{formatDateTime(activity.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions - Clean & Minimal */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900 mb-5">Aksi Cepat</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Link
                                href="/client/projects"
                                className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all border border-green-100 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm">Lihat Proyek</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Semua proyek Anda</p>
                                </div>
                            </Link>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl hover:shadow-md transition-all border border-emerald-100 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="font-semibold text-gray-900 text-sm">Muat Ulang</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Perbarui data</p>
                                </div>
                            </button>

                            <a
                                href="#"
                                className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl hover:shadow-md transition-all border border-purple-100 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>3
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm">Dokumen</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Akses semua file</p>
                                </div>
                            </a>
                        </div>
                    </div>


				{/* Latest News Section - Clean */}
				{latestNews && latestNews.length > 0 && (
					<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-base font-semibold text-gray-900">Berita & Pembaruan Terbaru</h3>
							<Link href={route('news.index')} className="flex items-center text-green-600 hover:text-green-700 transition-colors">
								<span className="text-xs font-medium">Lihat Semua</span>
								<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</Link>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
							{latestNews.map((news) => (
								<NewsCard key={news.id} {...news} />
							))}
						</div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
					</div>
				)}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}