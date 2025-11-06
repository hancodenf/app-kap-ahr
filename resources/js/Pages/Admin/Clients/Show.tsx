import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ClientUser {
	id: number;
	name: string;
	email: string;
	created_at: string;
}

interface Client {
	id: number;
	name: string;
	alamat: string;
	kementrian: string;
	kode_satker: string;
	client_users: ClientUser[];
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
