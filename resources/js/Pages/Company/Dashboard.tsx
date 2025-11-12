import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface ProjectStats {
	total: number;
	active: number;
	closed: number;
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

interface ActiveTask {
	id: number;
	name: string;
	project_id: number;
	project_name: string;
	working_step_name: string;
	completion_status: string;
	status: string;
	is_required: boolean;
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
	myActiveTasks: ActiveTask[];
	taskTrend: TaskTrendItem[];
	upcomingDeadlines: UpcomingDeadline[];
}

export default function CompanyDashboard({
	user,
	statistics,
	recentProjects,
	myActiveTasks,
	taskTrend,
	upcomingDeadlines,
}: CompanyDashboardProps) {
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

	// Calculate percentages
	const taskCompletionRate =
		statistics.tasks.total > 0
			? Math.round((statistics.tasks.completed / statistics.tasks.total) * 100)
			: 0;

	const projectActiveRate =
		statistics.projects.total > 0
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
                    <div className="overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 shadow-xl rounded-xl">
						<div className="p-6 text-white">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h3>
									<p className="text-primary-100 text-sm">{user.position} • {user.role.description}</p>
								</div>
								<div className="hidden md:flex gap-4">
									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
										<div className="text-center">
											<p className="text-3xl font-bold">{statistics.projects.active}</p>
											<p className="text-xs text-primary-100 mt-1">Active Projects</p>
										</div>
									</div>
									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
										<div className="text-center">
											<p className="text-3xl font-bold">{statistics.tasks.pending + statistics.tasks.in_progress}</p>
											<p className="text-xs text-primary-100 mt-1">Pending Tasks</p>
										</div>
									</div>
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
								<span className="text-xs text-green-600 font-medium">{projectActiveRate}% active</span>
							</div>
							<h4 className="text-2xl font-bold text-gray-900">{statistics.projects.total}</h4>
							<p className="text-sm text-gray-600 mt-1">My Projects</p>
							<div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
								<span className="text-green-600 font-medium">Active: {statistics.projects.active}</span>
								<span className="text-gray-500">Closed: {statistics.projects.closed}</span>
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

					{/* Two Column Layout */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

						{/* My Active Tasks */}
						<div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-gray-900">My Active Tasks</h3>
								<span className="text-sm text-gray-500">{myActiveTasks.length} tasks</span>
							</div>
							<div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
								{myActiveTasks.length > 0 ? (
									myActiveTasks.map((task: any) => (
										<Link
											key={task.id}
											href={route('company.projects.show', task.project_id)}
											className="block p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-300 transition-colors cursor-pointer"
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<h4 className="text-sm font-medium text-gray-900">{task.name}</h4>
													<p className="text-xs text-gray-600 mt-1">{task.project_name}</p>
													<p className="text-xs text-gray-500 mt-0.5">{task.working_step_name}</p>
												</div>
												{task.is_required && (
													<span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
														Required
													</span>
												)}
											</div>
											<div className="flex items-center gap-2">
												{getStatusBadge(task.completion_status)}
												{getStatusBadge(task.status)}
											</div>
										</Link>
									))
								) : (
									<p className="text-sm text-gray-500 text-center py-8">No active tasks</p>
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

                    {/* Quick Actions */}
                    <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <Link href={route('company.projects.index')} className="flex flex-col items-center p-4 bg-primary-50 rounded-lg border-2 border-primary-100 hover:border-primary-600 hover:bg-primary-100 transition-all group">
                                <div className="p-3 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors mb-2">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-primary-900">My Projects</span>
                            </Link>

                            <Link href={route('company.projects.index')} className="flex flex-col items-center p-4 bg-primary-50 rounded-lg border-2 border-primary-100 hover:border-primary-600 hover:bg-primary-100 transition-all group">
                                <div className="p-3 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors mb-2">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-primary-900">View Tasks</span>
                            </Link>

                            <Link href={route('company.projects.index')} className="flex flex-col items-center p-4 bg-green-50 rounded-lg border-2 border-green-100 hover:border-green-600 hover:bg-green-100 transition-all group">
                                <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors mb-2">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-green-900">Completed</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}