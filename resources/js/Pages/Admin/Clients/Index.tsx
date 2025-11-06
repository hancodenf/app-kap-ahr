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
	const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

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
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-semibold leading-tight text-gray-800">
						Client Management
					</h2>
					<Link
						href={route('admin.clients.create')}
						className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Add Client
					</Link>
				</div>
			}
		>
			<Head title="Client Management" />

			<div className="py-6">
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					{/* Flash Messages */}
					{flash?.success && (
						<div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
							<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{flash.success}
						</div>
					)}
					{flash?.error && (
						<div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
							<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{flash.error}
						</div>
					)}

					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6">
							{/* Search Bar */}
							<div className="mb-6 flex gap-2">
								<div className="relative flex-1">
									<input
										type="text"
										placeholder="Cari nama, email, alamat, kementrian, atau kode satker..."
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
										className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									/>
									<svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</div>
								<button
									onClick={handleSearch}
									className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md transition-colors font-medium"
								>
									Search
								</button>
								{filters.search && (
									<button
										onClick={handleReset}
										className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors font-medium"
									>
										Reset
									</button>
								)}
							</div>

							{/* Clients Table */}
							<div className="overflow-x-auto">
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
														<span className="text-gray-400 text-xs">akun</span>
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
															className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
															title="Delete"
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

							{/* Empty State */}
							{clients.data.length === 0 && (
								<div className="text-center py-12">
									<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<h3 className="mt-2 text-sm font-medium text-gray-900">
										{filters.search ? 'No clients found' : 'No clients yet'}
									</h3>
									<p className="mt-1 text-sm text-gray-500">
										{filters.search ? 'Try adjusting your search terms.' : 'Get started by adding a new client.'}
									</p>
									{!filters.search && (
										<div className="mt-6">
											<Link
												href={route('admin.clients.create')}
												className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
											>
												<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
												</svg>
												Add Client
											</Link>
										</div>
									)}
								</div>
							)}

							{/* Pagination */}
							{clients.last_page > 1 && (
								<div className="mt-6 flex justify-between items-center">
									<div className="text-sm text-gray-700">
										Showing <span className="font-medium">{clients.data.length}</span> of <span className="font-medium">{clients.total}</span> clients
									</div>
									<div className="flex space-x-1">
										{clients.links.map((link, index) => (
											<button
												key={index}
												onClick={() => link.url && router.get(link.url)}
												disabled={!link.url}
												className={`px-3 py-2 text-sm rounded-md transition-colors ${link.active
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
				title="Delete Client"
				message={`Are you sure you want to delete ${clientToDelete?.name}? This action cannot be undone and will also delete the associated user account.`}
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleDeleteConfirm}
				onClose={() => {
					setShowDeleteDialog(false);
					setClientToDelete(null);
				}}
				type="danger"
			/>
		</AuthenticatedLayout>
	);
}
