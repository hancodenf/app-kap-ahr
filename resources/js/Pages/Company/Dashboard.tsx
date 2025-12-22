import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import NewsCard from '@/Components/NewsCard';
import { useState, useEffect } from 'react';

interface ProjectStats {
	total: number;
	active: number;
	closed: number;
	draft: number;
	in_progress: number;
	completed: number;
	suspended: number;
	canceled: number;
	archived: number;
	by_role: Record<string, number>;
}

interface TaskStats {
	total: number;
	completed: number;
	in_progress: number;
	pending: number;
}

interface RecentProject {
	id: number;
	name: string;
	client_name: string;
	status: string;
	my_role: string;
	created_at: string;
}

interface AssignedTask {
	id: string;
	name: string;
	project_id: string;
	project_name: string;
	working_step_name: string;
	completion_status: string;
	status: string;
	is_required: boolean;
	created_at: string;
}

interface PendingApprovalTask {
	id: string;
	approval_id: string;
	name: string;
	project_id: string;
	project_name: string;
	working_step_name: string;
	completion_status: string;
	status: string;
	approval_role: string;
	is_required: boolean;
	updated_at: string;
}

interface TaskTrendItem {
	date: string;
	count: number;
}

interface UpcomingDeadline {
	task_id: number;
	task_name: string;
	project_name: string;
	deadline: string;
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

interface CompanyDashboardProps extends PageProps {
	user: {
		id: number;
		name: string;
		email: string;
		role: {
			name: string;
			display_name: string;
			description: string;
		};
		position: string;
	};
	statistics: {
		projects: ProjectStats;
		tasks: TaskStats;
		projects_by_status: Record<string, number>;
	};
	recentProjects: RecentProject[];
	myAssignedTasks: AssignedTask[];
	tasksPendingApproval: PendingApprovalTask[];
	taskTrend: TaskTrendItem[];
	upcomingDeadlines: UpcomingDeadline[];
	latestNews: NewsItem[];
}

export default function CompanyDashboard({
	user,
	statistics,
	recentProjects,
	myAssignedTasks,
	tasksPendingApproval: initialTasksPendingApproval,
	taskTrend,
	upcomingDeadlines,
	latestNews,
}: CompanyDashboardProps) {
	const { auth } = usePage<PageProps>().props;
	
	// State untuk pending approval tasks (biar bisa real-time update)
	const [tasksPendingApproval, setTasksPendingApproval] = useState<PendingApprovalTask[]>(initialTasksPendingApproval);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Note: Auto-mark disabled on dashboard since there's no specific project context
	// Notifications will be marked when user enters specific project pages
	
	// Fetch latest pending approval tasks
	const fetchPendingApprovals = async () => {
		try {
			setIsRefreshing(true);
			const response = await fetch('/company/dashboard/pending-approvals');
			const data = await response.json();
			setTasksPendingApproval(data.tasksPendingApproval || []);
			console.log('🔄 Dashboard pending approvals refreshed:', data.tasksPendingApproval?.length || 0);
		} catch (error) {
			console.error('Failed to fetch pending approvals:', error);
		} finally {
			setIsRefreshing(false);
		}
	};

	// WebSocket listener untuk real-time updates
	useEffect(() => {
		if (!window.Echo || !auth.user?.id) return;

		console.log('🔊 Setting up dashboard WebSocket listeners...');

		// Listen for approval notifications
		const channel = window.Echo.private(`user.${auth.user.id}`);
		
		channel.listen('.NewApprovalNotification', (event: any) => {
			console.log('🔔 Dashboard received approval notification:', event);
			
			// Refresh pending approvals list
			setTimeout(() => {
				fetchPendingApprovals();
			}, 1000); // Small delay to ensure database is updated
			
			// Show toast
			// toast.success('New task requires your approval!');
		});

		return () => {
			if (window.Echo) {
				window.Echo.leave(`user.${auth.user.id}`);
			}
		};
	}, [auth.user?.id]);

	// Initial load of pending approvals
	useEffect(() => {
		fetchPendingApprovals();
	}, []);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getStatusBadge = (status: string) => {
		const config = {
			open: { bg: 'bg-green-100', text: 'text-green-800', label: 'Open' },
			closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Closed' },
			pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
			in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
			completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
			Draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
			Submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
		};
		const statusConfig = config[status as keyof typeof config] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
		return (
			<span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
				{statusConfig.label}
			</span>
		);
	};

	const getRoleBadge = (role: string) => {
		const config = {
			partner: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Partner' },
			manager: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Manager' },
			supervisor: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Supervisor' },
			'team leader': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Team Leader' },
			member: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Member' },
		};
		const roleConfig = config[role as keyof typeof config] || { bg: 'bg-gray-100', text: 'text-gray-800', label: role };
		return (
			<span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${roleConfig.bg} ${roleConfig.text}`}>
				{roleConfig.label}
			</span>
		);
	};

	// Calculate percentages with safety checks
	const taskCompletionRate =
		statistics.tasks.total > 0
			? Math.round((statistics.tasks.completed / statistics.tasks.total) * 100)
			: 0;

	const projectActiveRate =
		statistics.projects && statistics.projects.total > 0
			? Math.round((statistics.projects.active / statistics.projects.total) * 100)
			: 0;

	// Max value for chart scaling
	const maxTrendValue = Math.max(...taskTrend.map(t => t.count), 1);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>
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
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Welcome Section */}
                    <div className="overflow-hidden shadow-xl rounded-xl relative">
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: 'url(/AHR-horizontal.jpg)' }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/20"></div>
						<div className="relative p-6 text-white">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-2xl font-bold mb-2 drop-shadow-lg">Welcome back, {user.name}! 👋</h3>
									<p className="text-white/90 text-sm drop-shadow">{user.position} • {user.role.description}</p>
								</div> 
							</div>
						</div>
					</div>

                    {/* Main Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Projects Card */}
						<div className="bg-white rounded-xl shadow-lg border-l-4 border-primary-600 p-5 hover:shadow-xl transition-shadow">
							<div className="flex items-center justify-between mb-3">
								<div className="p-2 bg-primary-100 rounded-lg">
									<svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								{(statistics.projects?.total || 0) > 0 && (
									<span className="text-xs text-green-600 font-medium">{projectActiveRate}% active</span>
								)}
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.projects?.total || 0}</h4>
							<p className="text-sm text-gray-600 mt-1">My Projects</p>
							<div className="mt-3 pt-3 border-t border-gray-100">
								{/* Simple horizontal stacked bar chart */}
								<div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
									{(statistics.projects?.draft || 0) > 0 && (
										<div 
											className="bg-gray-400 hover:opacity-80 transition-opacity" 
											style={{ width: `${((statistics.projects?.draft || 0) / (statistics.projects?.total || 1)) * 100}%` }}
											title={`Draft: ${statistics.projects?.draft || 0}`}
										></div>
									)}
									{(statistics.projects?.in_progress || 0) > 0 && (
										<div 
											className="bg-blue-500 hover:opacity-80 transition-opacity" 
											style={{ width: `${((statistics.projects?.in_progress || 0) / (statistics.projects?.total || 1)) * 100}%` }}
											title={`Progress: ${statistics.projects?.in_progress || 0}`}
										></div>
									)}
									{(statistics.projects?.completed || 0) > 0 && (
										<div 
											className="bg-green-500 hover:opacity-80 transition-opacity" 
											style={{ width: `${((statistics.projects?.completed || 0) / (statistics.projects?.total || 1)) * 100}%` }}
											title={`Done: ${statistics.projects?.completed || 0}`}
										></div>
									)}
									{(statistics.projects?.suspended || 0) > 0 && (
										<div 
											className="bg-yellow-500 hover:opacity-80 transition-opacity" 
											style={{ width: `${((statistics.projects?.suspended || 0) / (statistics.projects?.total || 1)) * 100}%` }}
											title={`Suspended: ${statistics.projects?.suspended || 0}`}
										></div>
									)}
									{(statistics.projects?.canceled || 0) > 0 && (
										<div 
											className="bg-red-500 hover:opacity-80 transition-opacity" 
											style={{ width: `${((statistics.projects?.canceled || 0) / (statistics.projects?.total || 1)) * 100}%` }}
											title={`Canceled: ${statistics.projects?.canceled || 0}`}
										></div>
									)}
								</div>
								{/* Legend */}
								<div className="grid grid-cols-3 gap-x-3 gap-y-1.5 mt-3 text-[10px]">
									<div className="flex items-center gap-1">
										<div className="w-2 h-2 rounded-full bg-gray-400"></div>
										<span className="text-gray-600">Draft {statistics.projects?.draft || 0}</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-2 h-2 rounded-full bg-blue-500"></div>
										<span className="text-gray-600">Progress {statistics.projects?.in_progress || 0}</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-2 h-2 rounded-full bg-green-500"></div>
										<span className="text-gray-600">Done {statistics.projects?.completed || 0}</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-2 h-2 rounded-full bg-yellow-500"></div>
										<span className="text-gray-600">Suspended {statistics.projects?.suspended || 0}</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-2 h-2 rounded-full bg-red-500"></div>
										<span className="text-gray-600">Canceled {statistics.projects?.canceled || 0}</span>
									</div>
									{(statistics.projects?.archived || 0) > 0 && (
										<div className="flex items-center gap-1 text-orange-600">
											<svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
												<path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
												<path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
											</svg>
											<span>Archived {statistics.projects?.archived || 0}</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Total Tasks Card */}
						<div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-5 hover:shadow-xl transition-shadow">
							<div className="flex items-center justify-between mb-3">
								<div className="p-2 bg-blue-100 rounded-lg">
									<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

						{/* Completed Tasks Card */}
						<div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-5 hover:shadow-xl transition-shadow">
							<div className="flex items-center justify-between mb-3">
								<div className="p-2 bg-green-100 rounded-lg">
									<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<span className="text-xs text-gray-500">Completed</span>
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.tasks.completed}</h4>
							<p className="text-sm text-gray-600 mt-1">Completed Tasks</p>
							<div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
								<span>{statistics.tasks.in_progress} in progress</span>
							</div>
						</div>

						{/* Pending Tasks Card */}
						<div className="bg-white rounded-xl shadow-lg border-l-4 border-orange-500 p-5 hover:shadow-xl transition-shadow">
							<div className="flex items-center justify-between mb-3">
								<div className="p-2 bg-orange-100 rounded-lg">
									<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<span className="text-xs text-gray-500">To Do</span>
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.tasks.pending}</h4>
							<p className="text-sm text-gray-600 mt-1">Pending Tasks</p>
							<div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
								<span>Awaiting action</span>
							</div>
						</div>
					</div>

					{/* Task Completion Trend Chart */}
					<div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Trend (Last 7 Days)</h3>
						<div className="flex items-end justify-between h-48 gap-2">
							{taskTrend.map((item, index) => (
								<div key={index} className="flex-1 flex flex-col items-center">
									<div className="w-full flex items-end justify-center h-40 mb-2">
										<div
											className="w-full bg-gradient-to-t from-primary-600 to-primary-400 hover:from-primary-700 hover:to-primary-500 rounded-t transition-all relative group"
											style={{
												height: `${maxTrendValue > 0 ? (item.count / maxTrendValue) * 100 : 0}%`,
												minHeight: item.count > 0 ? '8px' : '0px',
											}}
										>
											<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
												{item.count} tasks
											</div>
										</div>
									</div>
									<span className="text-xs text-gray-600">{formatDate(item.date).split(' ').slice(0, 2).join(' ')}</span>
								</div>
							))}
						</div>
					</div>

					{/* Three Column Layout */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Recent Projects */}
						<div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
								<Link href={route('company.projects.index')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
									View all →
								</Link>
							</div>
							<div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
								{recentProjects.length > 0 ? (
									recentProjects.map((project) => (
										<Link 
											key={project.id} 
											href={route('company.projects.show', project.id)}
											className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-300 transition-colors cursor-pointer"
										>
											<div className="flex justify-between items-start mb-2">
												<div className="flex-1">
													<h4 className="font-medium text-gray-900">{project.name}</h4>
													<p className="text-sm text-gray-600 mt-1">{project.client_name}</p>
												</div>
												{getStatusBadge(project.status)}
											</div>
											<div className="flex items-center justify-between text-xs mt-2">
												{getRoleBadge(project.my_role)}
												<span className="text-gray-500">{formatDate(project.created_at)}</span>
											</div>
										</Link>
									))
								) : (
									<p className="text-sm text-gray-500 text-center py-8">No recent projects</p>
								)}
							</div>
						</div>

						{/* My Assigned Tasks */}
						<div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow border-t-4 border-blue-500">
							<div className="flex justify-between items-center mb-4">
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									<h3 className="text-lg font-semibold text-gray-900">My Assigned Tasks</h3>
								</div>
								<span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{myAssignedTasks.length}</span>
							</div>
							<div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
								{myAssignedTasks.length > 0 ? (
									myAssignedTasks.map((task) => (
										<Link
											key={task.id}
											href={route('company.tasks.detail', task.id)}
											className="block p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
														{task.name}
														{task.is_required && (
															<span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700">
																REQUIRED
															</span>
														)}
													</h4>
													<p className="text-xs text-gray-600 mt-1">{task.project_name}</p>
													<p className="text-xs text-gray-500 mt-0.5">{task.working_step_name}</p>
												</div>
											</div>
											<div className="flex items-center justify-between gap-2 mt-2">
												<div className="flex items-center gap-2">
													{getStatusBadge(task.completion_status)}
													{getStatusBadge(task.status)}
												</div>
												<span className="text-[10px] text-gray-400">{formatDate(task.created_at)}</span>
											</div>
										</Link>
									))
								) : (
									<div className="text-center py-8">
										<svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
										</svg>
										<p className="text-sm text-gray-500">No assigned tasks</p>
									</div>
								)}
							</div>
						</div>

						{/* Tasks Pending My Approval */}
						<div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow border-t-4 border-orange-500">
							<div className="flex justify-between items-center mb-4">
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<h3 className="text-lg font-semibold text-gray-900">Pending Approval</h3>
								</div>
								<span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">{tasksPendingApproval.length}</span>
							</div>
							<div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
								{tasksPendingApproval.length > 0 ? (
									tasksPendingApproval.map((task) => (
										<Link
											key={task.id}
											href={route('company.tasks.approval-detail', task.id)}
											className="block p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-200 hover:from-orange-100 hover:to-orange-50 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
														{task.name}
														{task.is_required && (
															<span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700">
																REQUIRED
															</span>
														)}
													</h4>
													<p className="text-xs text-gray-600 mt-1">{task.project_name}</p>
													<p className="text-xs text-gray-500 mt-0.5">{task.working_step_name}</p>
													<div className="mt-1">
														<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700">
															Approve as {task.approval_role}
														</span>
													</div>
												</div>
											</div>
											<div className="flex items-center justify-between gap-2 mt-2">
												<div className="flex items-center gap-2">
													{getStatusBadge(task.completion_status)}
													{getStatusBadge(task.status)}
												</div>
												<span className="text-[10px] text-gray-400">{formatDateTime(task.updated_at)}</span>
											</div>
										</Link>
									))
								) : (
									<div className="text-center py-8">
										<svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<p className="text-sm text-gray-500">No tasks pending approval</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Upcoming Deadlines */}
					{upcomingDeadlines.length > 0 && (
						<div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
							<div className="space-y-3">
								{upcomingDeadlines.map((deadline) => (
									<div key={deadline.task_id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:shadow-md transition-shadow">
										<div className="flex-1">
											<h4 className="font-medium text-gray-900">{deadline.task_name}</h4>
											<p className="text-sm text-gray-600 mt-1">{deadline.project_name}</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium text-orange-700">{formatDateTime(deadline.deadline)}</p>
											{getStatusBadge(deadline.status)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
 
					{/* Latest News Section */}
					{latestNews && latestNews.length > 0 && (
						<div className="mt-8">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
								<Link href={route('news.index')} className="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
									<span className="text-sm font-medium">View All</span>
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