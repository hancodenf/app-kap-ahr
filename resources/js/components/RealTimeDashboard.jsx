import React from 'react';
import { Activity, Clock, CheckCircle, AlertTriangle, Users, FolderOpen } from 'lucide-react';
import { useRealTimeDashboard } from '../hooks/useRealTimeDashboard';

const RealTimeDashboard = () => {
    const { dashboardData, refreshDashboard, hasUrgentItems } = useRealTimeDashboard(10000); // Poll every 10 seconds
    const summary = dashboardData.summary;

    const dashboardCards = [
        {
            title: 'Pending Approvals',
            value: summary.pending_approvals,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            description: 'Menunggu persetujuan Anda',
            actionText: 'Review Sekarang',
            actionUrl: '/company/dashboard?filter=pending-approvals'
        },
        {
            title: 'Active Assignments',
            value: summary.active_assignments,
            icon: Activity,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            description: 'Task yang sedang dikerjakan',
            actionText: 'Lihat Tasks',
            actionUrl: '/company/dashboard?filter=my-tasks'
        },
        {
            title: 'Completed Today',
            value: summary.completed_today,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            description: 'Selesai hari ini',
            actionText: 'Lihat Riwayat',
            actionUrl: '/company/dashboard?filter=completed-today'
        },
        {
            title: 'Overdue Tasks',
            value: summary.overdue_tasks,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            description: 'Melewati deadline',
            actionText: summary.overdue_tasks > 0 ? 'Prioritaskan' : 'Semua On Track',
            actionUrl: '/company/dashboard?filter=overdue',
            urgent: summary.overdue_tasks > 0
        },
        {
            title: 'Recent Activities',
            value: summary.recent_activities,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            description: 'Aktivitas 24 jam terakhir',
            actionText: 'Lihat Semua',
            actionUrl: '/company/dashboard?filter=recent-activities'
        },
        {
            title: 'Active Projects',
            value: summary.projects_count,
            icon: FolderOpen,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            description: 'Project yang Anda ikuti',
            actionText: 'Kelola Projects',
            actionUrl: '/company/projects'
        }
    ];

    const formatLastUpdated = () => {
        if (!summary.last_updated) return 'Memuat...';
        
        const lastUpdate = new Date(summary.last_updated * 1000);
        const now = new Date();
        const diffSeconds = Math.floor((now - lastUpdate) / 1000);
        
        if (diffSeconds < 60) return `${diffSeconds} detik yang lalu`;
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} menit yang lalu`;
        
        return lastUpdate.toLocaleTimeString('id-ID');
    };

    return (
        <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Real-time</h2>
                    <p className="text-gray-600">
                        Update terakhir: {formatLastUpdated()}
                        {summary.isLoading && (
                            <span className="ml-2 inline-flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                <span className="ml-1 text-sm">Memuat...</span>
                            </span>
                        )}
                    </p>
                </div>
                
                <button
                    onClick={refreshDashboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    disabled={summary.isLoading}
                >
                    <Activity className={`h-4 w-4 ${summary.isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardCards.map((card, index) => {
                    const IconComponent = card.icon;
                    
                    return (
                        <div
                            key={index}
                            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                                card.urgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                            }`}
                        >
                            {/* Icon and Value */}
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                    <IconComponent className={`h-6 w-6 ${card.color}`} />
                                </div>
                                
                                <div className="text-right">
                                    <div className={`text-3xl font-bold ${card.color}`}>
                                        {summary.isLoading ? (
                                            <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                                        ) : (
                                            card.value
                                        )}
                                    </div>
                                    {card.urgent && card.value > 0 && (
                                        <div className="flex items-center text-red-600 text-sm mt-1">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            <span>Butuh Perhatian!</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Title and Description */}
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                                <p className="text-gray-600 text-sm mt-1">{card.description}</p>
                            </div>

                            {/* Action Button */}
                            <div className="mt-4">
                                <a
                                    href={card.actionUrl}
                                    className={`inline-flex items-center text-sm font-medium transition-colors ${
                                        card.urgent && card.value > 0
                                            ? 'text-red-600 hover:text-red-800'
                                            : `${card.color} hover:opacity-80`
                                    }`}
                                >
                                    {card.actionText}
                                    <svg 
                                        className="ml-1 h-3 w-3" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M9 5l7 7-7 7" 
                                        />
                                    </svg>
                                </a>
                            </div>

                            {/* Progress indicator for overdue tasks */}
                            {card.title === 'Overdue Tasks' && card.value > 0 && (
                                <div className="mt-4 bg-red-100 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center text-red-800 text-sm">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        <span>
                                            {card.value} task melewati deadline dan perlu segera diselesaikan
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                        onClick={() => window.location.href = '/company/projects/create'}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                        <FolderOpen className="h-5 w-5 text-blue-600 mb-2" />
                        <div className="font-medium text-gray-900">Buat Project</div>
                        <div className="text-sm text-gray-600">Project baru</div>
                    </button>
                    
                    <button 
                        onClick={() => window.location.href = '/company/tasks/create'}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                        <Activity className="h-5 w-5 text-green-600 mb-2" />
                        <div className="font-medium text-gray-900">Assign Task</div>
                        <div className="text-sm text-gray-600">Task untuk tim</div>
                    </button>
                    
                    <button 
                        onClick={() => window.location.href = '/company/reports'}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                        <Activity className="h-5 w-5 text-purple-600 mb-2" />
                        <div className="font-medium text-gray-900">Lihat Report</div>
                        <div className="text-sm text-gray-600">Progress report</div>
                    </button>
                    
                    <button 
                        onClick={() => window.location.href = '/company/team'}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                        <Users className="h-5 w-5 text-indigo-600 mb-2" />
                        <div className="font-medium text-gray-900">Kelola Tim</div>
                        <div className="text-sm text-gray-600">Team management</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RealTimeDashboard;
