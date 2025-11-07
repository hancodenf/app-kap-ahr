import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ClientUser {
	id: number;
	name: string;
	email: string;
	created_at: string;
}

interface Project {
	id: number;
	name: string;
	description: string | null;
	status: 'open' | 'closed';
	working_steps_count: number;
	tasks_count: number;
	created_at: string;
}

interface Client {
	id: number;
	name: string;
	alamat: string;
	kementrian: string;
	kode_satker: string;
	client_users: ClientUser[];
	projects: Project[];
	created_at: string;
	updated_at: string;
}

interface Props {
	client: Client;
}

export default function Show(props: Props) {
	const { client } = props;

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<AuthenticatedLayout 
			header={
				<div className="flex items-center gap-4">
					<Link 
						href={route('admin.clients.index')}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</Link>
					<h2 className="text-xl font-semibold leading-tight text-gray-800">
						Client Details
					</h2>
				</div>
			}
		>
			<Head title={`Client: ${client.name}`} />
			
			<div className="py-6">
				<div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
					{/* Client Header Card */}
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-2xl font-bold text-gray-900">{client.name}</h3>
									<p className="mt-1 text-sm text-gray-500">Client ID: #{client.id}</p>
								</div>
								<div className="flex gap-2">
									<Link
										href={route('admin.clients.edit', client.id)}
										className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors gap-2"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										Edit
									</Link>
								</div>
							</div>
						</div>
					</div>

					{/* Client Information */}
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6">
							<h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
								Client Information
							</h4>
							<dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
								<div>
									<dt className="text-sm font-medium text-gray-500">Kementrian/Lembaga</dt>
									<dd className="mt-1 text-sm text-gray-900">{client.kementrian}</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">Kode Satker</dt>
									<dd className="mt-1">
										<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
											{client.kode_satker}
										</span>
									</dd>
								</div>
								<div className="md:col-span-2">
									<dt className="text-sm font-medium text-gray-500">Address</dt>
									<dd className="mt-1 text-sm text-gray-900">{client.alamat}</dd>
								</div>
							</dl>
						</div>
					</div>

					{/* Related User Accounts */}
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6">
							<div className="flex items-center justify-between mb-4 pb-2 border-b">
								<h4 className="text-lg font-semibold text-gray-900">
									Akun Terkait
								</h4>
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									{client.client_users?.length || 0} akun
								</span>
							</div>
							
							{client.client_users && client.client_users.length > 0 ? (
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibuat</th>
												<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{client.client_users.map((user, index) => (
												<tr key={user.id} className="hover:bg-gray-50">
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created_at)}</td>
													<td className="px-4 py-3 whitespace-nowrap text-right text-sm">
														<Link
															href={route('admin.users.show', user.id)}
															className="text-blue-600 hover:text-blue-900 font-medium"
														>
															Lihat Detail →
														</Link>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className="text-center py-8">
									<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
									</svg>
									<p className="mt-2 text-sm text-gray-500">Belum ada akun yang terkait dengan client ini</p>
									<Link
										href={route('admin.users.create')}
										className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors gap-2"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
										Tambah Akun Baru
									</Link>
								</div>
							)}
						</div>
					</div>

					{/* Related Projects */}
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6">
							<div className="flex items-center justify-between mb-4 pb-2 border-b">
								<h4 className="text-lg font-semibold text-gray-900">
									Projects Terkait
								</h4>
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
									{client.projects?.length || 0} projects
								</span>
							</div>
							
							{client.projects && client.projects.length > 0 ? (
								<div className="space-y-4">
									{client.projects.map((project, index) => (
										<div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<h5 className="text-base font-semibold text-gray-900">{project.name}</h5>
														<span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
															project.status === 'open' 
																? 'bg-green-100 text-green-800' 
																: 'bg-gray-100 text-gray-800'
														}`}>
															{project.status === 'open' ? 'Open' : 'Closed'}
														</span>
													</div>
													{project.description && (
														<p className="text-sm text-gray-600 mb-3">{project.description}</p>
													)}
												</div>
											</div>
											
											<div className="grid grid-cols-3 gap-3 mb-3">
												<div className="bg-blue-50 rounded-lg p-2">
													<div className="flex items-center gap-1 mb-1">
														<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
														</svg>
														<span className="text-[10px] text-blue-900 font-medium">Steps</span>
													</div>
													<div className="text-lg font-bold text-blue-700">
														{project.working_steps_count}
													</div>
												</div>
												
												<div className="bg-purple-50 rounded-lg p-2">
													<div className="flex items-center gap-1 mb-1">
														<svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
														</svg>
														<span className="text-[10px] text-purple-900 font-medium">Tasks</span>
													</div>
													<div className="text-lg font-bold text-purple-700">
														{project.tasks_count}
													</div>
												</div>
												
												<div className="bg-gray-50 rounded-lg p-2">
													<div className="flex items-center gap-1 mb-1">
														<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														<span className="text-[10px] text-gray-700 font-medium">Created</span>
													</div>
													<div className="text-xs font-medium text-gray-700">
														{new Date(project.created_at).toLocaleDateString('id-ID', {
															day: 'numeric',
															month: 'short',
															year: 'numeric'
														})}
													</div>
												</div>
											</div>
											
											<div className="flex justify-end">
												<Link
													href={route('admin.projects.bundles.show', project.id)}
													className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
												>
													<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
													</svg>
													View Project
												</Link>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<p className="mt-2 text-sm text-gray-500">Belum ada project yang terkait dengan client ini</p>
									<Link
										href={route('admin.projects.bundles.create')}
										className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors gap-2"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
										Tambah Project Baru
									</Link>
								</div>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-between items-center">
						<Link
							href={route('admin.clients.index')}
							className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors gap-2"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							Back to List
						</Link>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
