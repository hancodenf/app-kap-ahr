import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface User {
	id: number;
	name: string;
	email: string;
}

interface Client {
	id: number;
	name: string;
	alamat: string;
	kementrian: string;
	kode_satker: string;
	user: User;
}

interface Props {
	clients: Client[];
}

export default function Index(props: Props) {
	const { clients } = props;

	return (
		<AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Client Management</h2>}>
			<Head title="Clients" />
			<div className="py-12">
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6 text-gray-900">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-2xl font-bold">Clients</h3>
								<Link href={route('admin.clients.create')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Add Client</Link>
							</div>
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kementrian</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Satker</th>
											<th className="px-6 py-3"></th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{clients && clients.length > 0 ? (
											clients.map((client) => (
												<tr key={client.id}>
													<td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{client.name}</td>
													<td className="px-6 py-4 whitespace-nowrap text-gray-700">{client.user?.email}</td>
													<td className="px-6 py-4 whitespace-nowrap text-gray-700">{client.alamat}</td>
													<td className="px-6 py-4 whitespace-nowrap text-gray-700">{client.kementrian}</td>
													<td className="px-6 py-4 whitespace-nowrap text-gray-700">{client.kode_satker}</td>
													<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
														<Link href={route('admin.clients.show', client.id)} className="text-blue-600 hover:text-blue-900 mr-3">Detail</Link>
														<Link href={route('admin.clients.edit', client.id)} className="text-yellow-600 hover:text-yellow-900 mr-3">Edit</Link>
														<Link as="button" method="delete" href={route('admin.clients.destroy', client.id)} className="text-red-600 hover:text-red-900" onClick={e => {if(!confirm('Yakin hapus client ini?')) e.preventDefault();}}>Delete</Link>
													</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan={6} className="px-6 py-4 text-center text-gray-500">No clients found.</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
