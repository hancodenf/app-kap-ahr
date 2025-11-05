import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface User {
	id: number;
	name: string;
	email: string;
	position?: string;
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
	client: Client;
}

export default function Show(props: Props) {
	const { client } = props;
	return (
		<AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Client Detail</h2>}>
			<Head title="Client Detail" />
			<div className="py-12">
				<div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6 text-gray-900">
							<div className="mb-6">
								<h3 className="text-2xl font-bold mb-2">{client.name}</h3>
								<p className="text-gray-600">Email: <span className="font-medium">{client.user?.email}</span></p>
								<p className="text-gray-600">Alamat: <span className="font-medium">{client.alamat}</span></p>
								<p className="text-gray-600">Kementrian: <span className="font-medium">{client.kementrian}</span></p>
								<p className="text-gray-600">Kode Satker: <span className="font-medium">{client.kode_satker}</span></p>
								{client.user?.position && <p className="text-gray-600">Position: <span className="font-medium">{client.user.position}</span></p>}
							</div>
							<div className="flex gap-3">
								<Link href={route('admin.clients.edit', client.id)} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</Link>
								<Link href={route('admin.clients.index')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Back</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
