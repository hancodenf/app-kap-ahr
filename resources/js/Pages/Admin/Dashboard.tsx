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

interface Analytics {
	projectsByYear: Array<{ year: number; count: number }>;
	topTeamMembers: Array<{ user_id: number; user_name: string; user_position: string; project_count: number }>;
	teamRoleDistribution: Array<{ role: string; count: number }>;
	projectsByClient: Array<{ client_name: string; project_count: number }>;
	projectStatusByYear: Array<{ year: number; open: number; closed: number }>;
	projectCreationTrend: Array<{ month: string; count: number }>;
	taskCompletionByStep: Array<{ step_name: string; total_tasks: number; completed_tasks: number; completion_rate: number }>;
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
	analytics: Analytics;
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
	analytics,
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
					<div className="overflow-hidden shadow-lg sm:rounded-lg relative">
						<div 
							className="absolute inset-0 bg-cover bg-center"
							style={{ backgroundImage: 'url(/AHR-horizontal.jpg)' }}
						></div>
						<div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/20"></div>
						<div className="relative p-6 text-white">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-2xl font-bold mb-2 drop-shadow-lg">Welcome back, {user.name}! 👋</h3>
									<p className="text-white/90 text-sm drop-shadow">{user.role.description}</p>
								</div>
								<div className="hidden md:block">
									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-xl">
										<div className="text-center">
											<p className="text-3xl font-bold drop-shadow-lg">{statistics.activities.today}</p>
											<p className="text-xs text-white/80 mt-1">Activities Today</p>
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
								<div className="p-2 bg-emerald-100 rounded-lg">
									<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								<div className="p-2 bg-emerald-100 rounded-lg">
									<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
								<div className="p-2 bg-emerald-100 rounded-lg">
									<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
								<span className="text-xs text-green-600 font-medium">{taskCompletionRate}% done</span>
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.tasks.total}</h4>
							<p className="text-sm text-gray-600 mt-1">Total Tasks</p>
							<div className="mt-3 pt-3 border-t border-gray-100">
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${taskCompletionRate}%` }}></div>
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
							<Link href={route('admin.users.index')} className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100 transition-all group">
								<div className="p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors mb-2">
									<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
								</div>
								<span className="text-sm font-medium text-emerald-900">Manage Users</span>
							</Link>

							<Link href={route('admin.clients.index')} className="flex flex-col items-center p-4 bg-emerald-50/70 rounded-lg border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100 transition-all group">
								<div className="p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors mb-2">
									<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
								</div>
								<span className="text-sm font-medium text-emerald-900">Manage Clients</span>
							</Link>

							<Link href={route('admin.projects.bundles.index')} className="flex flex-col items-center p-4 bg-emerald-50/50 rounded-lg border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100 transition-all group">
								<div className="p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors mb-2">
									<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<span className="text-sm font-medium text-emerald-900">View Projects</span>
							</Link>

							<Link href={route('admin.project-templates.template-bundles.index')} className="flex flex-col items-center p-4 bg-emerald-50/30 rounded-lg border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100 transition-all group">
								<div className="p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors mb-2">
									<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
									</svg>
								</div>
								<span className="text-sm font-medium text-orange-900">Templates</span>
							</Link>
						</div>
					</div>

					{/* Advanced Analytics Charts */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Projects by Year - Vertical Bar Chart */}
						<div className="bg-white shadow-sm rounded-lg p-6">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold text-gray-900">Projects by Year</h3>
									<p className="text-sm text-gray-500 mt-1">Distribution of projects across years</p>
								</div>
								<div className="p-2 bg-emerald-100 rounded-lg">
									<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								</div>
							</div>
							{analytics.projectsByYear && analytics.projectsByYear.length > 0 ? (
								<div className="flex items-end justify-between h-64 gap-4 px-2">
									{analytics.projectsByYear.map((item, index) => {
										const maxCount = Math.max(...analytics.projectsByYear.map(p => p.count));
										const heightPercentage = (item.count / maxCount) * 100;
										const color = 'from-emerald-400 to-emerald-600';
										return (
											<div key={index} className="flex-1 flex flex-col items-center gap-3 group">
												<div 
													className={`w-full bg-gradient-to-t ${color} rounded-t-xl shadow-md hover:shadow-xl transition-all duration-300 relative cursor-pointer transform hover:scale-105`}
													style={{ height: `${heightPercentage}%`, minHeight: '40px' }}
												>
													<div className="absolute inset-0 flex items-center justify-center">
														<span className="text-white font-bold text-lg drop-shadow-lg">{item.count}</span>
													</div>
													<div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
														<div className="font-bold">{item.count} Projects</div>
														<div className="text-gray-300 text-[10px]">in {item.year}</div>
													</div>
												</div>
												<div className="text-center">
													<div className="text-sm font-bold text-gray-900">{item.year}</div>
													<div className="text-xs text-gray-500">{((item.count / analytics.projectsByYear.reduce((a, b) => a + b.count, 0)) * 100).toFixed(0)}%</div>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-8 text-gray-400">
									<p className="text-sm">No project data available</p>
								</div>
							)}
						</div>

						{/* Project Creation Trend - Area Chart */}
						<div className="bg-white shadow-sm rounded-lg p-6">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold text-gray-900">Project Creation Trend</h3>
									<p className="text-sm text-gray-500 mt-1">Last 12 months activity</p>
								</div>
								<div className="p-2 bg-emerald-100 rounded-lg">
									<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
									</svg>
								</div>
							</div>
							{analytics.projectCreationTrend && analytics.projectCreationTrend.length > 0 ? (
								<div className="relative h-56">
									{/* SVG Area Chart */}
									<svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
										<defs>
											<linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
												<stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
												<stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
											</linearGradient>
										</defs>
										{(() => {
											const maxCount = Math.max(...analytics.projectCreationTrend.map(t => t.count), 1);
											const points = analytics.projectCreationTrend.map((item, index) => {
												const x = (index / (analytics.projectCreationTrend.length - 1)) * 400;
												const y = 160 - ((item.count / maxCount) * 140);
												return { x, y, count: item.count };
											});
											
											// Create path for area
											const areaPath = [
												`M 0 160`,
												...points.map(p => `L ${p.x} ${p.y}`),
												`L 400 160 Z`
											].join(' ');
											
											// Create path for line
											const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
											
											return (
												<>
													{/* Area fill */}
													<path d={areaPath} fill="url(#areaGradient)" />
													{/* Line */}
													<path 
														d={linePath} 
														fill="none" 
														stroke="#10b981" 
														strokeWidth="3" 
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
													{/* Points */}
													{points.map((point, index) => (
														<g key={index}>
															<circle 
																cx={point.x} 
																cy={point.y} 
																r="5" 
																fill="white" 
																stroke="#10b981" 
																strokeWidth="2"
																className="cursor-pointer hover:r-7 transition-all"
															>
																<title>{analytics.projectCreationTrend[index].month}: {point.count} projects</title>
															</circle>
															<circle 
																cx={point.x} 
																cy={point.y} 
																r="3" 
																fill="#10b981"
																className="pointer-events-none"
															/>
														</g>
													))}
												</>
											);
										})()}
									</svg>
									
									{/* X-axis labels */}
									<div className="flex justify-between mt-2 px-1">
										{analytics.projectCreationTrend.map((item, index) => {
											if (index % 2 === 0 || index === analytics.projectCreationTrend.length - 1) {
												return <span key={index} className="text-[10px] text-gray-500 font-medium">{item.month}</span>;
											}
											return <span key={index}></span>;
										})}
									</div>
								</div>
							) : (
								<div className="text-center py-8 text-gray-400">
									<p className="text-sm">No trend data available</p>
								</div>
							)}
						</div>
					</div>

					{/* Top Team Members & Clients */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Top Team Members - Clean Table */}
					<div className="bg-white shadow-sm rounded-lg p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Top Team Members</h3>
								<p className="text-sm text-gray-500 mt-1">Most active project contributors</p>
							</div>
							<div className="p-2 bg-emerald-100 rounded-lg">
								<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
						</div>
					{analytics.topTeamMembers && analytics.topTeamMembers.length > 0 ? (
						<div className="overflow-x-auto max-h-96 overflow-y-auto">
							<table className="w-full">
								<thead className="sticky top-0 bg-white z-10">
									<tr className="border-b border-gray-200">
										<th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
										<th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
										<th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Position</th>
										<th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{analytics.topTeamMembers.map((member, index) => (
											<tr key={index} className="hover:bg-gray-50 transition-colors">
												<td className="py-4 px-4">
													<div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm">
														{index + 1}
													</div>
												</td>
												<td className="py-4 px-4">
													<div className="font-medium text-gray-900">{member.user_name}</div>
													<div className="text-xs text-gray-500 sm:hidden">{member.user_position}</div>
												</td>
												<td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
													{member.user_position}
												</td>
												<td className="py-4 px-4 text-right">
													<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
														{member.project_count}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="text-center py-8 text-gray-400">
								<p className="text-sm">No team member data available</p>
							</div>
						)}
					</div>

					{/* Top Clients - Clean Table */}
					<div className="bg-white shadow-sm rounded-lg p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
								<p className="text-sm text-gray-500 mt-1">By project count</p>
							</div>
							<div className="p-2 bg-emerald-100 rounded-lg">
								<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
								</svg>
							</div>
						</div>
						{analytics.projectsByClient && analytics.projectsByClient.length > 0 ? (
							<div className="overflow-x-auto max-h-96 overflow-y-auto">
								<table className="w-full">
									<thead className="sticky top-0 bg-white z-10">
										<tr className="border-b border-gray-200">
											<th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
											<th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</th>
											<th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Projects</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{analytics.projectsByClient.map((client, index) => (
												<tr key={index} className="hover:bg-gray-50 transition-colors">
													<td className="py-4 px-4 text-sm text-gray-500">
														{index + 1}
													</td>
													<td className="py-4 px-4">
														<div className="font-medium text-gray-900">{client.client_name}</div>
													</td>
													<td className="py-4 px-4 text-right">
														<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
															{client.project_count}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className="text-center py-8 text-gray-400">
									<p className="text-sm">No client data available</p>
								</div>
							)}
						</div>
					</div>

					{/* Team Role Distribution & Task Completion */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Team Role Distribution - Donut Chart */}
						<div className="bg-white shadow-sm rounded-lg p-6">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold text-gray-900">Team Role Distribution</h3>
									<p className="text-sm text-gray-500 mt-1">Distribution across all projects</p>
								</div>
								<div className="p-2 bg-emerald-100 rounded-lg">
									<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
									</svg>
								</div>
							</div>
						{analytics.teamRoleDistribution && analytics.teamRoleDistribution.length > 0 ? (
							<div className="flex flex-col md:flex-row items-center gap-6">
								{/* Donut Chart */}
								<div className="flex-shrink-0 w-full md:w-auto flex justify-center">
									<div className="relative w-48 h-48">
											<svg viewBox="0 0 100 100" className="transform -rotate-90">
												{(() => {
													const totalRoles = analytics.teamRoleDistribution.reduce((sum, r) => sum + r.count, 0);
													let currentAngle = 0;
													const colors = [
														{ start: '#10b981', end: '#059669' }, // emerald-500 to emerald-600
														{ start: '#34d399', end: '#10b981' }, // emerald-400 to emerald-500
														{ start: '#6ee7b7', end: '#34d399' }, // emerald-300 to emerald-400
														{ start: '#10b981', end: '#047857' }, // emerald-500 to emerald-700
														{ start: '#34d399', end: '#059669' }, // emerald-400 to emerald-600
													];
													
													return analytics.teamRoleDistribution.map((role, index) => {
														const percentage = (role.count / totalRoles) * 100;
														const angle = (percentage / 100) * 360;
														const radius = 40;
														const strokeWidth = 16;
														const normalizedRadius = radius - strokeWidth / 2;
														const circumference = normalizedRadius * 2 * Math.PI;
														const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
														const rotation = currentAngle;
														currentAngle += angle;
														const color = colors[index % colors.length];
														
														return (
															<circle
																key={index}
																cx="50"
																cy="50"
																r={normalizedRadius}
																fill="transparent"
																stroke={`url(#gradient-${index})`}
																strokeWidth={strokeWidth}
																strokeDasharray={strokeDasharray}
																strokeLinecap="round"
																style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}
																className="transition-all duration-300 hover:opacity-80 cursor-pointer"
															>
																<title>{role.role}: {role.count} ({percentage.toFixed(1)}%)</title>
															</circle>
														);
													});
												})()}
												{/* Gradients */}
												<defs>
													{analytics.teamRoleDistribution.map((_, index) => {
														const colors = [
															{ start: '#10b981', end: '#059669' },
															{ start: '#34d399', end: '#10b981' },
															{ start: '#6ee7b7', end: '#34d399' },
															{ start: '#10b981', end: '#047857' },
															{ start: '#34d399', end: '#059669' },
														];
														const color = colors[index % colors.length];
														return (
															<linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
																<stop offset="0%" stopColor={color.start} />
																<stop offset="100%" stopColor={color.end} />
															</linearGradient>
														);
													})}
												</defs>
											</svg>
											{/* Center Circle */}
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="bg-white rounded-full w-24 h-24 shadow-inner flex items-center justify-center border-4 border-gray-50">
													<div className="text-center">
														<div className="text-2xl font-bold text-gray-900">
															{analytics.teamRoleDistribution.reduce((sum, r) => sum + r.count, 0)}
														</div>
														<div className="text-xs text-gray-500">Members</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									{/* Legend */}
									<div className="flex-1 space-y-2">
										{analytics.teamRoleDistribution.map((role, index) => {
											const totalRoles = analytics.teamRoleDistribution.reduce((sum, r) => sum + r.count, 0);
											const percentage = ((role.count / totalRoles) * 100).toFixed(1);
											const bgColors = [
												'bg-emerald-500',
												'bg-emerald-400', 
												'bg-emerald-300',
												'bg-emerald-600',
												'bg-emerald-200'
											];
											const bgColor = bgColors[index % bgColors.length];
											return (
												<div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
													<div className="flex items-center gap-2">
														<div className={`w-4 h-4 rounded ${bgColor} shadow-sm`}></div>
														<span className="text-sm font-medium text-gray-700">{role.role}</span>
													</div>
													<div className="flex items-center gap-3">
														<span className="text-sm font-bold text-gray-900">{role.count}</span>
														<span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							) : (
								<div className="text-center py-8 text-gray-400">
									<p className="text-sm">No role distribution data</p>
								</div>
							)}
						</div>

						{/* Task Completion by Working Step - Radial Progress */}
						<div className="bg-white shadow-sm rounded-lg p-6">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold text-gray-900">Task Completion by Step</h3>
									<p className="text-sm text-gray-500 mt-1">Top performing working steps</p>
								</div>
								<div className="p-2 bg-emerald-100 rounded-lg">
									<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
							{analytics.taskCompletionByStep && analytics.taskCompletionByStep.length > 0 ? (
								<div className="grid grid-cols-2 gap-4">
									{analytics.taskCompletionByStep.slice(0, 6).map((step, index) => {
										const radius = 35;
										const circumference = 2 * Math.PI * radius;
										const offset = circumference - (step.completion_rate / 100) * circumference;
										const colors = [
											{ stroke: '#10b981', bg: 'from-emerald-400 to-emerald-500' },
											{ stroke: '#34d399', bg: 'from-emerald-300 to-emerald-500' },
											{ stroke: '#059669', bg: 'from-emerald-500 to-emerald-600' },
											{ stroke: '#6ee7b7', bg: 'from-emerald-200 to-emerald-400' },
											{ stroke: '#047857', bg: 'from-emerald-600 to-emerald-700' },
											{ stroke: '#10b981', bg: 'from-emerald-400 to-emerald-600' }
										];
										const color = colors[index % colors.length];
										
										return (
											<div key={index} className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all group">
												{/* Radial Progress */}
												<div className="relative mb-3">
													<svg className="w-24 h-24 transform -rotate-90">
														{/* Background circle */}
														<circle
															cx="48"
															cy="48"
															r={radius}
															stroke="#e5e7eb"
															strokeWidth="6"
															fill="none"
														/>
														{/* Progress circle */}
														<circle
															cx="48"
															cy="48"
															r={radius}
															stroke={color.stroke}
															strokeWidth="6"
															fill="none"
															strokeDasharray={circumference}
															strokeDashoffset={offset}
															strokeLinecap="round"
															className="transition-all duration-1000 ease-out"
															style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.1))' }}
														/>
													</svg>
													{/* Center percentage */}
													<div className="absolute inset-0 flex items-center justify-center">
														<div className="text-center">
															<div className={`text-2xl font-bold bg-gradient-to-r ${color.bg} bg-clip-text text-transparent`}>
																{step.completion_rate}%
															</div>
														</div>
													</div>
												</div>
												
												{/* Step info */}
												<div className="text-center">
													<p className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 h-8">{step.step_name}</p>
													<div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
														<span className="font-medium">{step.completed_tasks}/{step.total_tasks}</span>
														<span className="text-gray-300">•</span>
														<span>tasks</span>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-8 text-gray-400">
									<p className="text-sm">No task completion data</p>
								</div>
							)}
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
