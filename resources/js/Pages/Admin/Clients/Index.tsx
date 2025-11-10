import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';

interface Client {
	id: number;
	name: string;
	alamat: string;
	kementrian: string;
	kode_satker: string;
	created_at: string;
	client_users_count?: number;
	projects_count?: number;
}

interface ClientsPageProps extends PageProps {
	clients: {
		data: Client[];
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
		links: Array<{
			url: string | null;
			label: string;
			active: boolean;
		}>;
	};
	filters: {
		search?: string;
	};
}

export default function Index({ clients, filters }: ClientsPageProps) {
	const { flash } = usePage().props as any;
	const [search, setSearch] = useState(filters.search || '');
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showRelationDialog, setShowRelationDialog] = useState(false);
	const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
	const [relationMessage, setRelationMessage] = useState('');

	const handleSearch = () => {
		router.get(route('admin.clients.index'), { search }, {
			preserveState: true,
			replace: true,
		});
	};

	const handleReset = () => {
		setSearch('');
		router.get(route('admin.clients.index'), {}, {
			preserveState: true,
			replace: true,
		});
	};

	const handleDeleteClick = (client: Client) => {
		// Check if client has related data
		const hasRelations = (client.client_users_count || 0) > 0 || (client.projects_count || 0) > 0;
		
		if (hasRelations) {
			// Show relation dialog instead of delete dialog
			const messages = [];
			if ((client.client_users_count || 0) > 0) {
				messages.push(`${client.client_users_count} akun user`);
			}
			if ((client.projects_count || 0) > 0) {
				messages.push(`${client.projects_count} project`);
			}
			
			setClientToDelete(client);
			setRelationMessage(`Client "${client.name}" tidak dapat dihapus karena masih memiliki ${messages.join(' dan ')} yang terkait.\n\nSilakan hapus atau pindahkan data terkait terlebih dahulu.`);
			setShowRelationDialog(true);
			return;
		}
		
		setClientToDelete(client);
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = () => {
		if (clientToDelete) {
			router.delete(route('admin.clients.destroy', clientToDelete.id), {
				onSuccess: () => {
					setShowDeleteDialog(false);
					setClientToDelete(null);
				},
			});
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<AuthenticatedLayout
			header={
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
					<h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
						Client Management
					</h2>
					<Link
						href={route('admin.clients.create')}
						className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
					>
						+ Add Client
					</Link>
				</div>
			}
		>
			<Head title="Client Management" />

			<div className="py-4 sm:py-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Flash Messages */}
					{flash?.success && (
						<div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
							{flash.success}
						</div>
					)}
					{flash?.error && (
						<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
							{flash.error}
						</div>
					)}

					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-4 sm:p-6">
							{/* Search Bar */}
							<div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
								<input
									type="text"
									placeholder="Cari nama, alamat, kementrian, atau kode satker..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
									className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
								/>
								<div className="flex gap-2">
									<button
										onClick={handleSearch}
										className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
									>
										Cari
									</button>
									{filters.search && (
										<button
											onClick={handleReset}
											className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
										>
											Reset
										</button>
									)}
								</div>
							</div>

							{/* Clients Table - Desktop */}
							<div className="hidden lg:block overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												No
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Client
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Kementrian
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Kode Satker
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Jumlah Akun
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Projects
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Bergabung
											</th>
											<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{clients.data.map((client, index) => (
											<tr key={client.id} className="hover:bg-gray-50 transition-colors">
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{(clients.current_page - 1) * clients.per_page + index + 1}
												</td>
												<td className="px-6 py-4">
													<div>
														<div className="text-sm font-medium text-gray-900">
															{client.name}
														</div>
														<div className="text-xs text-gray-400 mt-1">
															{client.alamat}
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">{client.kementrian}</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
														{client.kode_satker}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center gap-1 text-sm text-gray-600">
														<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
														</svg>
														<span className="font-medium">{client.client_users_count || 0}</span> 
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="flex items-center gap-1 text-sm text-gray-600">
														<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
														</svg>
														<span className="font-medium">{client.projects_count || 0}</span> 
													</div> 
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatDate(client.created_at)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<div className="flex justify-end gap-2">
														<Link
															href={route('admin.clients.show', client.id)}
															className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
															title="View Details"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
															</svg>
														</Link>
														<Link
															href={route('admin.clients.edit', client.id)}
															className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors"
															title="Edit"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
															</svg>
														</Link>
												<button
															onClick={() => handleDeleteClick(client)}
															className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
																(client.client_users_count || 0) > 0 || (client.projects_count || 0) > 0
																	? 'bg-gray-100 text-gray-400 cursor-not-allowed'
																	: 'bg-red-50 text-red-700 hover:bg-red-100'
															}`}
															title={
																(client.client_users_count || 0) > 0 || (client.projects_count || 0) > 0
																	? 'Tidak dapat dihapus karena memiliki data terkait'
																	: 'Delete'
															}
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
															</svg>
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Clients Cards - Mobile/Tablet */}
							<div className="lg:hidden space-y-4">
								{clients.data.map((client, index) => (
									<div key={client.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
										<div className="flex items-start gap-3 mb-3">
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
												{client.name.charAt(0).toUpperCase()}
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-xs text-gray-500 mb-1">
													#{(clients.current_page - 1) * clients.per_page + index + 1}
												</div>
												<h3 className="text-base font-medium text-gray-900 truncate">
													{client.name}
												</h3>
												<p className="text-xs text-gray-500 mt-1">{client.alamat}</p>
											</div>
										</div>

										{/* Client Info Grid */}
										<div className="grid grid-cols-2 gap-2 mb-3">
											<div className="bg-gray-50 rounded-lg p-2">
												<div className="text-[10px] text-gray-500 mb-0.5">Kementrian</div>
												<div className="text-sm font-medium text-gray-900 truncate">{client.kementrian}</div>
											</div>
											<div className="bg-gray-50 rounded-lg p-2">
												<div className="text-[10px] text-gray-500 mb-0.5">Kode Satker</div>
												<div className="text-sm">
													<span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														{client.kode_satker}
													</span>
												</div>
											</div>
											<div className="bg-gray-50 rounded-lg p-2">
												<div className="text-[10px] text-gray-500 mb-0.5">Jumlah Akun</div>
												<div className="text-sm font-medium text-gray-900">{client.client_users_count || 0} users</div>
											</div>
											<div className="bg-gray-50 rounded-lg p-2">
												<div className="text-[10px] text-gray-500 mb-0.5">Projects</div>
												<div className="text-sm font-medium text-gray-900">{client.projects_count || 0} projects</div>
											</div>
										</div>

										<div className="text-xs text-gray-500 mb-3">
											<span className="font-medium">Bergabung:</span> {formatDate(client.created_at)}
										</div>

										<div className="flex gap-2">
											<Link
												href={route('admin.clients.show', client.id)}
												className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
											>
												<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
												View
											</Link>
											<Link
												href={route('admin.clients.edit', client.id)}
												className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors text-sm font-medium"
											>
												<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
												Edit
											</Link>
											<button
												onClick={() => handleDeleteClick(client)}
												className={`inline-flex items-center justify-center px-3 py-2 rounded-md transition-colors ${
													(client.client_users_count || 0) > 0 || (client.projects_count || 0) > 0
														? 'bg-gray-100 text-gray-400 cursor-not-allowed'
														: 'bg-red-50 text-red-700 hover:bg-red-100'
												}`}
												title={
													(client.client_users_count || 0) > 0 || (client.projects_count || 0) > 0
														? 'Tidak dapat dihapus karena memiliki data terkait'
														: 'Delete'
												}
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									</div>
								))}
							</div>

							{/* Empty State */}
							{clients.data.length === 0 && (
								<div className="text-center py-8">
									<div className="text-gray-500">
										{filters.search ? 'Tidak ada client yang ditemukan.' : 'Belum ada client.'}
									</div>
								</div>
							)}

							{/* Pagination */}
							{clients.last_page > 1 && (
								<div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
									<div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
										Showing <span className="font-medium">{(clients.current_page - 1) * clients.per_page + 1}</span> to{' '}
										<span className="font-medium">{Math.min(clients.current_page * clients.per_page, clients.total)}</span> of{' '}
										<span className="font-medium">{clients.total}</span> clients
									</div>
									<div className="flex flex-wrap justify-center gap-1">
										{clients.links.map((link, index) => (
											<button
												key={index}
												onClick={() => link.url && router.get(link.url)}
												disabled={!link.url}
												className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors ${
													link.active
														? 'bg-primary-600 text-white'
														: link.url
														? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
														: 'bg-gray-100 text-gray-400 cursor-not-allowed'
												}`}
												dangerouslySetInnerHTML={{ __html: link.label }}
											/>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				show={showDeleteDialog}
				title="Hapus Client"
				message={`Apakah Anda yakin ingin menghapus client "${clientToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
				confirmText="Hapus"
				cancelText="Batal"
				onConfirm={handleDeleteConfirm}
				onClose={() => {
					setShowDeleteDialog(false);
					setClientToDelete(null);
				}}
				type="danger"
			/>

			{/* Relation Warning Dialog */}
			<ConfirmDialog
				show={showRelationDialog}
				title="Tidak Dapat Menghapus Client"
				message={relationMessage}
				confirmText="Mengerti"
				cancelText=""
				onConfirm={() => {
					setShowRelationDialog(false);
					setClientToDelete(null);
					setRelationMessage('');
				}}
				onClose={() => {
					setShowRelationDialog(false);
					setClientToDelete(null);
					setRelationMessage('');
				}}
				type="warning"
			/>
		</AuthenticatedLayout>
	);
}
