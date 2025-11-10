import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Role {
	id: number;
	name: string;
	display_name: string;
}

interface ProjectTeam {
	id: number;
	project_id: number | null;
	project_name: string;
	project_client_name: string;
	role: string;
	user_position: string | null;
	created_at: string;
}

interface ActivityLog {
	id: number;
	action_type: string;
	action: string;
	target_name: string | null;
	description: string | null;
	created_at: string;
}

interface RegisteredAp {
	id: number;
	ap_number: string;
	registration_date: string;
	expiry_date: string | null;
	status: string;
	created_at: string;
}

interface User {
	id: number;
	name: string;
	email: string;
	profile_photo?: string | null;
	email_verified_at: string | null;
	role: Role | null;
	position?: string;
	user_type?: string;
	client_id?: number | null;
	client_name?: string | null;
	created_at: string;
	updated_at: string;
	project_teams?: ProjectTeam[];
	activity_logs?: ActivityLog[];
	registered_ap?: RegisteredAp | null;
	project_teams_count?: number;
	activity_logs_count?: number;
}

interface Props {
	user: User;
}

export default function Show({ user }: Props) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const formatShortDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
			inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
			expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
		return (
			<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
				{config.label}
			</span>
		);
	};

	const getRoleBadge = (role: string) => {
		const roleConfig = {
			partner: { bg: 'bg-purple-100', text: 'text-purple-800' },
			manager: { bg: 'bg-blue-100', text: 'text-blue-800' },
			supervisor: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
			'team leader': { bg: 'bg-green-100', text: 'text-green-800' },
			member: { bg: 'bg-gray-100', text: 'text-gray-800' },
		};
		const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
		return (
			<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
				{role.charAt(0).toUpperCase() + role.slice(1)}
			</span>
		);
	};

	const getActionIcon = (actionType: string) => {
		const icons = {
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
			document: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
			),
			user: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			),
		};
		return icons[actionType as keyof typeof icons] || icons.project;
	};

	return (
		<AuthenticatedLayout
			header={
				<div className="flex items-center gap-4">
					<Link 
						href={route('admin.users.index')}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</Link>
					<h2 className="text-xl font-semibold leading-tight text-gray-800">
						User Details
					</h2>
				</div>
			}
		>
			<Head title={`User: ${user.name}`} />
			
			<div className="py-6">
				<div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6">
							{/* Header with Actions */}
							<div className="flex justify-between items-start mb-6 pb-6 border-b">
								<div className="flex items-center gap-4">
									{user.profile_photo ? (
										<img 
											src={`/storage/${user.profile_photo}`} 
											alt={user.name}
											className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
										/>
									) : (
										<div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
											<span className="text-2xl font-semibold text-primary-700">
												{user.name.charAt(0).toUpperCase()}
											</span>
										</div>
									)}
									<div>
										<h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
										<p className="text-sm text-gray-500">{user.email}</p>
									</div>
								</div> 
							</div>

							{/* User Information */}
							<div className="space-y-6">
								{/* Account Information */}
								<div>
									<h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
										Account Information
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Full Name
											</label>
											<p className="text-base text-gray-900">{user.name}</p>
										</div>
										
										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Email Address
											</label>
											<p className="text-base text-gray-900">{user.email}</p>
										</div>

										{user.client_name && (
											<div>
												<label className="block text-sm font-medium text-gray-500 mb-1">
													Client
												</label>
												<p className="text-base text-gray-900">{user.client_name}</p>
											</div>
										)}

										{user.position && (
											<div>
												<label className="block text-sm font-medium text-gray-500 mb-1">
													Position
												</label>
												<p className="text-base text-gray-900">{user.position}</p>
											</div>
										)}

										{user.user_type && (
											<div>
												<label className="block text-sm font-medium text-gray-500 mb-1">
													User Type
												</label>
												<span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
													{user.user_type}
												</span>
											</div>
										)}

										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Role
											</label>
											<span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-primary-100 text-primary-800">
												{user.role?.display_name || 'No Role'}
											</span>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Email Verified
											</label>
											{user.email_verified_at ? (
												<div className="flex items-center gap-2">
													<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<span className="text-sm text-green-700">Verified</span>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<span className="text-sm text-gray-500">Not Verified</span>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Timeline Information */}
								<div>
									<h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
										Timeline
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Created At
											</label>
											<p className="text-base text-gray-900">{formatDate(user.created_at)}</p>
										</div>
										
										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Last Updated
											</label>
											<p className="text-base text-gray-900">{formatDate(user.updated_at)}</p>
										</div>
									</div>
								</div>

								{/* Registered AP Information */}
								{user.registered_ap && (
									<div>
										<h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
											<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
											</svg>
											Registered AP (Akuntan Publik)
										</h4>
										<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<label className="block text-xs font-medium text-purple-700 mb-1">
														AP Number
													</label>
													<p className="text-sm font-semibold text-purple-900">{user.registered_ap.ap_number}</p>
												</div>
												<div>
													<label className="block text-xs font-medium text-purple-700 mb-1">
														Status
													</label>
													{getStatusBadge(user.registered_ap.status)}
												</div>
												<div>
													<label className="block text-xs font-medium text-purple-700 mb-1">
														Registration Date
													</label>
													<p className="text-sm text-purple-900">{formatShortDate(user.registered_ap.registration_date)}</p>
												</div>
												{user.registered_ap.expiry_date && (
													<div>
														<label className="block text-xs font-medium text-purple-700 mb-1">
															Expiry Date
														</label>
														<p className="text-sm text-purple-900">{formatShortDate(user.registered_ap.expiry_date)}</p>
													</div>
												)}
											</div>
										</div>
									</div>
								)}

								{/* Project Teams */}
								{user.project_teams && user.project_teams.length > 0 && (
									<div>
										<h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center justify-between">
											<div className="flex items-center gap-2">
												<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
												</svg>
												Project Teams
											</div>
											<span className="text-sm font-medium text-gray-500">
												{user.project_teams_count} {user.project_teams_count === 1 ? 'team' : 'teams'}
											</span>
										</h4>
										<div className="space-y-3">
											{user.project_teams.map((team, index) => (
												<div key={team.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
													<div className="flex items-start gap-3">
														{/* Number */}
														<div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
															{index + 1}
														</div>
														
														{/* Content */}
														<div className="flex-1 min-w-0">
															<div className="flex items-start justify-between mb-2">
																<div className="flex-1">
																	{team.project_id ? (
																		<Link 
																			href={route('admin.projects.bundles.show', team.project_id)}
																			className="font-semibold text-blue-700 hover:text-blue-900 hover:underline mb-1 inline-block"
																		>
																			{team.project_name}
																		</Link>
																	) : (
																		<h5 className="font-semibold text-gray-900 mb-1">{team.project_name}</h5>
																	)}
																	<p className="text-sm text-gray-600">{team.project_client_name}</p>
																</div>
																{getRoleBadge(team.role)}
															</div>
															<div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
																{team.user_position && (
																	<div className="flex items-center gap-1">
																		<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
																		</svg>
																		<span>{team.user_position}</span>
																	</div>
																)}
																<div className="flex items-center gap-1">
																	<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
																	</svg>
																	<span>Joined {formatShortDate(team.created_at)}</span>
																</div>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Activity Logs */}
								{user.activity_logs && user.activity_logs.length > 0 && (
									<div>
										<h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center justify-between">
											<div className="flex items-center gap-2">
												<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
												Recent Activity Logs
											</div>
											<span className="text-sm font-medium text-gray-500">
												{user.activity_logs_count} {user.activity_logs_count === 1 ? 'log' : 'logs'}
											</span>
										</h4>
										<div className="space-y-2 max-h-96 overflow-y-auto">
											{user.activity_logs.map((log) => (
												<div key={log.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
													<div className="flex items-start gap-3">
														<div className="mt-0.5 text-gray-400">
															{getActionIcon(log.action_type)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<span className="text-xs font-semibold text-gray-600 uppercase">
																	{log.action_type}
																</span>
																<span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
																	{log.action}
																</span>
															</div>
															{log.target_name && (
																<p className="text-sm font-medium text-gray-900 mb-1">{log.target_name}</p>
															)}
															{log.description && (
																<p className="text-xs text-gray-600 line-clamp-2">{log.description}</p>
															)}
															<p className="text-xs text-gray-400 mt-1">{formatDate(log.created_at)}</p>
														</div>
													</div>
												</div>
											))}
										</div>
										{user.activity_logs_count && user.activity_logs_count > 20 && (
											<p className="text-xs text-gray-500 mt-2 text-center italic">
												Showing latest 20 of {user.activity_logs_count} activity logs
											</p>
										)}
									</div>
								)}

								{/* Empty State for Relations */}
								{(!user.project_teams || user.project_teams.length === 0) && 
								 (!user.activity_logs || user.activity_logs.length === 0) && 
								 !user.registered_ap && (
									<div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
										<svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
										</svg>
										<p className="text-gray-500 text-sm">No related data found</p>
										<p className="text-gray-400 text-xs mt-1">This user has no project teams, activity logs, or registered AP yet</p>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="mt-8 pt-6 border-t flex justify-between">
								<Link
									href={route('admin.users.index')}
									className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
									</svg>
									Back to List
								</Link>
								<Link
									href={route('admin.users.edit', user.id)}
									className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									Edit User
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
