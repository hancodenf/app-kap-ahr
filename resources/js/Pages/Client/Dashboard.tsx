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
                    
                    {/* Welcome Section - Enhanced with more info */}
                    <div className="overflow-hidden shadow-lg rounded-2xl relative">
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: 'url(/AHR-horizontal.jpg)' }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/85 to-emerald-900/90"></div>
                        <div className="relative p-8">
                            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-3">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                        </span>
                                        <span className="text-xs font-semibold text-white drop-shadow">Status: Aktif</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-xl">Selamat Datang, {user.name}!</h1>
                                    <p className="text-white/90 drop-shadow mb-4">Portal Klien - KAP Abdul Hamid dan Rekan</p>
                                    {user.client && (
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                            <div className="space-y-2 text-sm text-white/95">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-semibold text-white drop-shadow">{user.client.name}</p>
                                                        <p className="text-xs text-white/70 drop-shadow mt-0.5">Nama Instansi</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="font-medium text-white drop-shadow">{user.client.kementrian}</p>
                                                        <p className="text-xs text-white/70 drop-shadow mt-0.5">Kementerian/Lembaga</p>
                                                    </div>
                                                </div>
                                                {user.client.kode_satker && (
                                                    <div className="flex items-start gap-3">
                                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        <div>
                                                            <p className="font-mono text-white drop-shadow">{user.client.kode_satker}</p>
                                                            <p className="text-xs text-white/70 drop-shadow mt-0.5">Kode Satker</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex lg:flex-col gap-3">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                                        <div className="text-3xl font-black text-white drop-shadow-lg">{statistics.projects.total}</div>
                                        <div className="text-xs text-white/80 drop-shadow mt-1">Total Proyek</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                                        <div className="text-3xl font-black text-emerald-300 drop-shadow-lg">{taskCompletionRate}%</div>
                                        <div className="text-xs text-white/80 drop-shadow mt-1">Penyelesaian</div>
                                    </div>
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
                                            <path strokeLinecap="round" strokeL inejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-sm">
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
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-700 to-green-800 flex items-center justify-center shadow-sm">
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
                                    <Link href={route('klien.projects.index')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
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
                                        <Link 
                                            key={project.id} 
                                            href={route('klien.projects.show', project.id)}
                                            className="block bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">{project.name}</h4>
                                                {getStatusBadge(project.status)}
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    <span className="font-medium">{project.tasks_count} tugas</span>
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(project.created_at)}
                                                </span>
                                            </div>
                                        </Link>
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

                    {/* Quick Actions - Enhanced & Informative */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900 mb-5">Aksi Cepat</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <Link
                                href={route('klien.projects.index')}
                                className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl hover:shadow-md transition-all border border-emerald-200 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">Semua Proyek</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{statistics.projects.total} proyek aktif</p>
                                </div>
                            </Link>
                            
                            <Link
                                href={route('news.index')}
                                className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl hover:shadow-md transition-all border border-emerald-200 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">Berita & Info</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Pembaruan terbaru</p>
                                </div>
                            </Link>

                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl hover:shadow-md transition-all border border-emerald-200 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-700 to-green-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">Profil Saya</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Kelola akun</p>
                                </div>
                            </Link>

                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all border border-gray-200 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="font-semibold text-gray-900 text-sm">Muat Ulang</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Perbarui dashboard</p>
                                </div>
                            </button>
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