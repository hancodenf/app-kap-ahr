import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface AdminDashboardProps extends PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: {
            id: number;
            name: string;
            display_name: string;
            description: string;
        };
    };
    statistics: {
        users: {
            total: number;
            newThisMonth: number;
            byRole: Record<string, number>;
        };
        audits: {
            total: number;
            thisMonth: number;
            completed: number;
            pending: number;
        };
        templates: {
            total: number;
            byWorkingStep: Record<string, number>;
        };
        system: {
            working_steps: number;
            tasks: number;
            documents: number;
        };
    };
    recentActivities: {
        audits: Array<{
            id: number;
            working_step: { name: string };
            task: { name: string };
            status: string;
            created_at: string;
        }>;
        users: Array<{
            id: number;
            name: string;
            email: string;
            role: { display_name: string };
            created_at: string;
        }>;
    };
}

export default function AdminDashboard({ user, statistics, recentActivities }: AdminDashboardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Welcome Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Welcome, {user.name}!
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Role: <span className="font-medium text-primary-600">{user.role.display_name}</span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {user.role.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* User Statistics */}
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-blue-900 mb-1">Total Users</h4>
                                    <p className="text-2xl font-bold text-blue-800">{statistics.users.total}</p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        +{statistics.users.newThisMonth} this month
                                    </p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Audit Statistics */}
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-green-900 mb-1">Total Audits</h4>
                                    <p className="text-2xl font-bold text-green-800">{statistics.audits.total}</p>
                                    <p className="text-sm text-green-600 mt-1">
                                        {statistics.audits.completed} completed
                                    </p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Template Statistics */}
                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-purple-900 mb-1">Templates</h4>
                                    <p className="text-2xl font-bold text-purple-800">{statistics.templates.total}</p>
                                    <p className="text-sm text-purple-600 mt-1">
                                        {Object.keys(statistics.templates.byWorkingStep).length} working_steps
                                    </p>
                                </div>
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* System Statistics */}
                        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-orange-900 mb-1">Documents</h4>
                                    <p className="text-2xl font-bold text-orange-800">{statistics.system.documents}</p>
                                    <p className="text-sm text-orange-600 mt-1">
                                        {statistics.system.working_steps} working_steps, {statistics.system.tasks} tasks
                                    </p>
                                </div>
                                <div className="bg-orange-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts and Progress */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Audit Progress */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Progress</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="text-gray-700">Completed</span>
                                        <span className="text-green-600">{statistics.audits.completed}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full" 
                                            style={{ 
                                                width: `${statistics.audits.total > 0 ? (statistics.audits.completed / statistics.audits.total) * 100 : 0}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="text-gray-700">Pending</span>
                                        <span className="text-orange-600">{statistics.audits.pending}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-orange-600 h-2 rounded-full" 
                                            style={{ 
                                                width: `${statistics.audits.total > 0 ? (statistics.audits.pending / statistics.audits.total) * 100 : 0}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Users by Role */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Role</h3>
                            <div className="space-y-3">
                                {Object.entries(statistics.users.byRole).map(([role, count]) => (
                                    <div key={role} className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600 capitalize">{role}</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Audits */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Recent Audits</h3>
                                <Link 
                                    href="/admin/audit" 
                                    className="text-sm text-primary-600 hover:text-primary-800"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentActivities.audits.length > 0 ? (
                                    recentActivities.audits.map((audit) => (
                                        <div key={audit.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {audit.working_step.name} - {audit.task.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{audit.status}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(audit.created_at)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No recent audits</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
                                <Link 
                                    href="/admin/users" 
                                    className="text-sm text-primary-600 hover:text-primary-800"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentActivities.users.length > 0 ? (
                                    recentActivities.users.map((user) => (
                                        <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.role.display_name}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(user.created_at)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No recent users</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link 
                                href="/admin/users"
                                className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-blue-900">Manage Users</span>
                            </Link>

                            <Link 
                                href="/admin/audit"
                                className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                            >
                                <div className="bg-green-100 p-2 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-green-900">View Audits</span>
                            </Link>

                            <Link 
                                href="/admin/templates"
                                className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                            >
                                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-purple-900">Manage Templates</span>
                            </Link>

                            <Link 
                                href="/admin/audit"
                                className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                            >
                                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-orange-900">View Reports</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}