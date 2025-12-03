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
	project_status: string;
	role: string;
	user_position: string | null;
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
	whatsapp?: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	project_teams_count?: number;
}

interface PaginationLink {
	url: string | null;
	label: string;
	active: boolean;
}

interface PaginatedProjectTeams {
	data: ProjectTeam[];
	current_page: number;
	first_page_url: string;
	from: number;
	last_page: number;
	last_page_url: string;
	links: PaginationLink[];
	next_page_url: string | null;
	path: string;
	per_page: number;
	prev_page_url: string | null;
	to: number;
	total: number;
}

interface Props {
	user: User;
	projectTeams: PaginatedProjectTeams;
}

export default function Show({ user, projectTeams }: Props) {
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
		const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
			'Draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
			'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
			'Completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
			'Suspended': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Suspended' },
			'Canceled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Canceled' },
		};
		const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
		return (
			<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
				{config.label}
			</span>
		);
	};

	const getRoleBadge = (role: string) => {
		const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
			partner: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Partner' },
			manager: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Manager' },
			supervisor: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Supervisor' },
			'team leader': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Team Leader' },
			member: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Member' },
		};
		const config = roleConfig[role.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: role };
		return (
			<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
				{config.label}
			</span>
		);
	};

	return (
		<AuthenticatedLayout
			header={
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold leading-tight text-gray-800">
						Team Member Details
					</h2>
					<Link
						href={route('company.teams.index')}
						className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
					>
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Back to Teams
					</Link>
				</div>
			}
		>
			<Head title={`${user.name} - Team Details`} />

			<div className="py-6">
				<div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
					{/* User Info Card */}
					<div className="bg-white shadow-lg rounded-xl overflow-hidden">
						<div className="p-6 sm:p-8">
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
								{/* Profile Photo */}
								{user.profile_photo ? (
									<img
										src={`/storage/${user.profile_photo}`}
										alt={user.name}
										className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
									/>
								) : (
									<div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
										<span className="text-3xl font-bold text-primary-600">
											{user.name.charAt(0).toUpperCase()}
										</span>
									</div>
								)}

								{/* User Info */}
								<div className="flex-1">
									<div className="flex items-start justify-between flex-wrap gap-4">
										<div>
											<h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
											<p className="text-gray-600 mt-1">{user.email}</p>
											{user.whatsapp && (
												<a 
													href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center text-sm text-green-600 hover:text-green-700 mt-2"
												>
													<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
														<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
													</svg>
													{user.whatsapp}
												</a>
											)}
										</div>
										<div className="flex flex-col gap-2 items-end">
											<span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
												user.is_active 
													? 'bg-green-100 text-green-800' 
													: 'bg-red-100 text-red-800'
											}`}>
												{user.is_active ? 'Active' : 'Inactive'}
											</span>
											{user.role && (
												<span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
													{user.role.display_name}
												</span>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
										<div>
											<label className="text-sm font-medium text-gray-500">Position</label>
											<p className="text-gray-900 font-medium mt-1">{user.position || 'N/A'}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">User Type</label>
											<p className="text-gray-900 font-medium mt-1">{user.user_type || 'N/A'}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">Email Verified</label>
											<p className="text-gray-900 font-medium mt-1">
												{user.email_verified_at ? (
													<span className="text-green-600">✓ Verified</span>
												) : (
													<span className="text-red-600">✗ Not Verified</span>
												)}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-500">Joined</label>
											<p className="text-gray-900 font-medium mt-1">{formatShortDate(user.created_at)}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Projects Section */}
					<div className="bg-white shadow-lg rounded-xl overflow-hidden">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-gray-900">
									Projects ({user.project_teams_count || 0})
								</h3>
							</div>
						</div>
						
						<div className="overflow-x-auto">
							{projectTeams.data && projectTeams.data.length > 0 ? (
								<>
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Project Name
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Client
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Role in Project
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Status
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Joined Project
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{projectTeams.data.map((projectTeam) => (
												<tr key={projectTeam.id} className="hover:bg-gray-50 transition-colors">
													<td className="px-6 py-4">
														<div className="text-sm font-medium text-gray-900">
															{projectTeam.project_name}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-gray-900">
															{projectTeam.project_client_name}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														{getRoleBadge(projectTeam.role)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														{getStatusBadge(projectTeam.project_status)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{formatShortDate(projectTeam.created_at)}
													</td>
												</tr>
											))}
										</tbody>    
									</table>

									{/* Pagination */}
									{projectTeams.last_page > 1 && (
										<div className="px-6 py-4 border-t border-gray-200">
											<div className="flex items-center justify-between">
												<div className="text-sm text-gray-700">
													Showing{' '}
													<span className="font-medium">{projectTeams.from}</span>
													{' '}to{' '}
													<span className="font-medium">{projectTeams.to}</span>
													{' '}of{' '}
													<span className="font-medium">{projectTeams.total}</span>
													{' '}results
												</div>
												<div className="flex gap-1">
													{projectTeams.links.map((link, index) => (
														<Link
															key={index}
															href={link.url || '#'}
															preserveState
															preserveScroll
															className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
																link.active
																	? 'bg-primary-600 text-white'
																	: link.url
																	? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
																	: 'bg-gray-100 text-gray-400 cursor-not-allowed'
															}`}
															disabled={!link.url}
															dangerouslySetInnerHTML={{ __html: link.label }}
														/>
													))}
												</div>
											</div>
										</div>
									)}
								</>
							) : (
								<div className="p-12 text-center">
									<svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<p className="text-gray-500 text-lg font-medium">No projects assigned</p>
									<p className="text-gray-400 text-sm mt-1">This team member is not currently assigned to any projects</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
