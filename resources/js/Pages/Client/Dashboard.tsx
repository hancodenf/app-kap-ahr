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

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Welcome Section */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
                        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
                        {user.client && (
                            <div className="space-y-1 opacity-90">
                                <p className="text-sm">Organization: <span className="font-semibold">{user.client.name}</span></p>
                                <p className="text-sm">Ministry: {user.client.kementrian}</p>
                                <p className="text-sm">Satker Code: {user.client.kode_satker}</p>
                            </div>
                        )}
                        <div className="mt-4 flex gap-4 text-sm">
                            <div>
                                <span className="opacity-80">Active Projects: </span>
                                <span className="font-bold text-lg">{statistics.projects.open}</span>
                            </div>
                            <div>
                                <span className="opacity-80">Completion Rate: </span>
                                <span className="font-bold text-lg">{taskCompletionRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Total Projects */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border-l-4 border-primary-600 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.projects.total}</p>
                                    <p className="text-xs text-gray-500 mt-1">{statistics.projects.open} active</p>
                                </div>
                                <div className="p-3 bg-primary-100 rounded-lg">
                                    <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Tasks */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.tasks.total}</p>
                                    <p className="text-xs text-gray-500 mt-1">All project tasks</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Completed Tasks */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.tasks.completed}</p>
                                    <p className="text-xs text-gray-500 mt-1">{taskCompletionRate}% complete</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* In Progress Tasks */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.tasks.in_progress}</p>
                                    <p className="text-xs text-gray-500 mt-1">Active tasks</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Documents</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{statistics.documents.total_documents}</p>
                                    <p className="text-xs text-gray-500 mt-1">{statistics.documents.client_documents} from you</p>
                                </div>
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Completion Trend */}
                    <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Trend (Last 7 Days)</h3>
                        <div className="flex items-end justify-between h-48 gap-2">
                            {taskTrend.map((item, index) => {
                                const height = maxTrendValue > 0 ? (item.count / maxTrendValue) * 100 : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-gray-200 rounded-t relative group" style={{ height: `${height}%`, minHeight: height > 0 ? '20px' : '2px' }}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"></div>
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {item.count} tasks
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 text-center">
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Recent Projects */}
                        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                                {recentProjects.length > 0 && (
                                    <Link href="/client/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                        View All →
                                    </Link>
                                )}
                            </div>
                            
                            {recentProjects.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-sm">No projects yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentProjects.map((project) => (
                                        <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-primary-50 hover:border-primary-300 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">{project.name}</h4>
                                                {getStatusBadge(project.status)}
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-600">
                                                <span>{project.working_steps_count} steps</span>
                                                <span>{project.tasks_count} tasks</span>
                                                <span className="text-gray-400">•</span>
                                                <span>{formatDate(project.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tasks Requiring Action */}
                        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks Requiring Your Action</h3>
                            
                            {tasksRequiringAction.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm">No pending actions</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {tasksRequiringAction.map((task) => (
                                        <div key={task.id} className="border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-4 hover:bg-orange-100 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm">{task.name}</h4>
                                                {getStatusBadge(task.completion_status)}
                                            </div>
                                            <div className="space-y-1 text-xs text-gray-600">
                                                <p>Project: {task.project_name}</p>
                                                <p>Step: {task.working_step_name}</p>
                                                <p className="text-gray-400">{formatDate(task.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    {recentActivities.length > 0 && (
                        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                            <div className="space-y-3">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                <svg className="h-4 w-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">{activity.user_name}</span>
                                                {' '}{activity.action}{' '}
                                                <span className="font-medium">{activity.target_name}</span>
                                            </p>
                                            {activity.description && (
                                                <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">{formatDateTime(activity.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link
                                href="/client/projects"
                                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors group"
                            >
                                <div className="p-2 bg-primary-100 group-hover:bg-primary-200 rounded-lg">
                                    <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">View Projects</p>
                                    <p className="text-xs text-gray-500">Browse all projects</p>
                                </div>
                            </Link>
                            
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
                            >
                                <div className="p-2 bg-green-100 group-hover:bg-green-200 rounded-lg">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Refresh Data</p>
                                    <p className="text-xs text-gray-500">Update statistics</p>
                                </div>
                            </button>

                            <a
                                href="#"
                                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                            >
                                <div className="p-2 bg-indigo-100 group-hover:bg-indigo-200 rounded-lg">
                                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">View Documents</p>
                                    <p className="text-xs text-gray-500">Access all files</p>
                                </div>
                            </a>
                        </div>
                    </div>


				{/* Latest News Section */}
				{latestNews && latestNews.length > 0 && (
					<div className="mt-8">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-bold text-gray-900">Latest News & Updates</h2>
							<div className="flex items-center text-primary-600 hover:text-primary-700 transition-colors cursor-pointer">
								<span className="text-sm font-medium">View All</span>
								<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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