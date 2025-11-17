import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import NewsCard from '@/Components/NewsCard';

interface DashboardStatistics {
	users: {
		total: number;
		newThisMonth: number;
		byRole: Record<string, number>;
		growth: Array<{ month: string; count: number }>;
	};
	clients: {
		total: number;
		newThisMonth: number;
	};
	projects: {
		total: number;
		active: number;
		closed: number;
		newThisMonth: number;
		byStatus: Record<string, number>;
	};
	tasks: {
		total: number;
		byStatus: Record<string, number>;
		byApprovalStatus: Record<string, number>;
	};
	templates: {
		total: number;
	}; 	
	system: {
		working_steps: number;
		documents: number;
		registered_aps: number;
		active_aps: number;
		expired_aps: number;
	};
	team: {
		total: number;
		byRole: Record<string, number>;
	};
	activities: {
		total: number;
		today: number;
		thisWeek: number;
		trend: Array<{ date: string; count: number }>;
		byType: Record<string, number>;
	};
}

interface RecentActivity {
	id: number;
	user_name: string;
	action_type: string;
	action: string;
	target_name: string | null;
	description: string | null;
	created_at: string;
}

interface RecentProject {
	id: number;
	name: string;
	client_name: string;
	status: string;
	created_at: string;
}

interface RecentUser {
	id: number;
	name: string;
	email: string;
	role: string;
	created_at: string;
}

interface TopActiveUser {
	user_id: number;
	user_name: string;
	activity_count: number;
}

interface TopActiveProject {
	id: number;
	name: string;
	client_name: string;
	tasks_count: number;
	status: string;
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

interface AdminDashboardProps extends PageProps {
	user: {
		id: number;
		name: string;
		email: string;
		role: {
			name: string;
			display_name: string;
			description: string;
		};
	};
	statistics: DashboardStatistics;
	recentActivities: RecentActivity[];
	recentProjects: RecentProject[];
	recentUsers: RecentUser[];
	topActiveUsers: TopActiveUser[];
	topActiveProjects: TopActiveProject[];
	latestNews: NewsItem[];
}

export default function AdminDashboard({
	user,
	statistics,
	recentActivities,
	recentProjects,
	recentUsers,
	topActiveUsers,
	topActiveProjects,
	latestNews,
}: AdminDashboardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const formatShortDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
		});
	};

	const getActionIcon = (actionType: string) => {
		const icons: Record<string, JSX.Element> = {
			project: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			),
			task: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
				</svg>
			),
			user: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			),
			client: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
				</svg>
			),
		};
		return icons[actionType] || icons.project;
	};

	const getStatusBadge = (status: string) => {
		const config = {
			open: { bg: 'bg-green-100', text: 'text-green-800', label: 'Open' },
			closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed' },
			pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
			in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
			completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
		};
		const statusConfig = config[status as keyof typeof config] || config.pending;
		return (
			<span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
				{statusConfig.label}
			</span>
		);
	};

	// Calculate percentages
	const taskCompletionRate =
		statistics.tasks.total > 0
			? Math.round((statistics.tasks.byStatus.completed / statistics.tasks.total) * 100)
			: 0;

	const projectActiveRate =
		statistics.projects.total > 0
			? Math.round((statistics.projects.active / statistics.projects.total) * 100)
			: 0;

	const apActiveRate =
		statistics.system.registered_aps > 0
			? Math.round((statistics.system.active_aps / statistics.system.registered_aps) * 100)
			: 0;

	return (
		<AuthenticatedLayout
			header={
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold leading-tight text-gray-800">Admin Dashboard</h2>
					<span className="text-sm text-gray-600">
						{new Date().toLocaleDateString('id-ID', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</span>
				</div>
			}
		>
			<Head title="Admin Dashboard" />

			<div className="py-6">
				<div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
					{/* Welcome Section */}
					<div className="overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg sm:rounded-lg">
						<div className="p-6 text-white">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h3>
									<p className="text-primary-100 text-sm">{user.role.description}</p>
								</div>
								<div className="hidden md:block">
									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
										<div className="text-center">
											<p className="text-3xl font-bold">{statistics.activities.today}</p>
											<p className="text-xs text-primary-100 mt-1">Activities Today</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Main Statistics Cards - Grid 1 */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Users Card */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-3">
								<div className="p-2 bg-blue-100 rounded-lg">
									<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
								</div>
								<span className="text-xs text-green-600 font-medium">+{statistics.users.newThisMonth} this month</span>
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.users.total}</h4>
							<p className="text-sm text-gray-600 mt-1">Total Users</p>
							<div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
								<span className="text-gray-500">Admin: {statistics.users.byRole.admin || 0}</span>
								<span className="text-gray-500">Company: {statistics.users.byRole.company || 0}</span>
								<span className="text-gray-500">Client: {statistics.users.byRole.client || 0}</span>
							</div>
						</div>

						{/* Projects Card */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-3">
								<div className="p-2 bg-purple-100 rounded-lg">
									<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<span className="text-xs text-green-600 font-medium">{projectActiveRate}% active</span>
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.projects.total}</h4>
							<p className="text-sm text-gray-600 mt-1">Total Projects</p>
							<div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
								<span className="text-green-600 font-medium">Active: {statistics.projects.active}</span>
								<span className="text-gray-500">Closed: {statistics.projects.closed}</span>
							</div>
						</div>

						{/* Tasks Card */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-3">
								<div className="p-2 bg-orange-100 rounded-lg">
									<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
								<span className="text-xs text-green-600 font-medium">{taskCompletionRate}% done</span>
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.tasks.total}</h4>
							<p className="text-sm text-gray-600 mt-1">Total Tasks</p>
							<div className="mt-3 pt-3 border-t border-gray-100">
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div className="bg-green-600 h-2 rounded-full" style={{ width: `${taskCompletionRate}%` }}></div>
								</div>
							</div>
						</div>

						{/* Clients Card */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
							<div className="flex items-center justify-between mb-3">
								<div className="p-2 bg-green-100 rounded-lg">
									<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
								</div>
								<span className="text-xs text-green-600 font-medium">+{statistics.clients.newThisMonth} this month</span>
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.clients.total}</h4>
							<p className="text-sm text-gray-600 mt-1">Total Clients</p>
							<div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
								<span className="text-gray-500">Templates: {statistics.templates.total}</span>
								<span className="text-gray-500">Docs: {statistics.system.documents}</span>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="bg-white shadow-sm rounded-lg p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							<Link href={route('admin.users.index')} className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-100 transition-all group">
								<div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors mb-2">
									<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
								</div>
								<span className="text-sm font-medium text-blue-900">Manage Users</span>
							</Link>

							<Link href={route('admin.clients.index')} className="flex flex-col items-center p-4 bg-green-50 rounded-lg border-2 border-green-100 hover:border-green-300 hover:bg-green-100 transition-all group">
								<div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors mb-2">
									<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
								</div>
								<span className="text-sm font-medium text-green-900">Manage Clients</span>
							</Link>

							<Link href={route('admin.projects.bundles.index')} className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-100 transition-all group">
								<div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors mb-2">
									<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<span className="text-sm font-medium text-purple-900">View Projects</span>
							</Link>

							<Link href={route('admin.project-templates.template-bundles.index')} className="flex flex-col items-center p-4 bg-orange-50 rounded-lg border-2 border-orange-100 hover:border-orange-300 hover:bg-orange-100 transition-all group">
								<div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors mb-2">
									<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
									</svg>
								</div>
								<span className="text-sm font-medium text-orange-900">Templates</span>
							</Link>
						</div>
					</div>

					{/* Latest News Section */}
					{latestNews && latestNews.length > 0 && (
						<div className="bg-white shadow-sm rounded-lg p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-gray-900">Latest News & Updates</h3>
								<Link href={route('admin.news.index')} className="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
									<span className="text-sm font-medium">Manage News</span>
									<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</Link>
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
