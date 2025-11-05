import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
	const { data, setData, post, processing, errors, reset } = useForm({
		name: '',
		email: '',
		password: '',
		password_confirmation: '',
		alamat: '',
		kementrian: '',
		kode_satker: '',
		position: '',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post(route('admin.clients.store'));
	};

	return (
		<AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add Client</h2>}>
			<Head title="Add Client" />
			<div className="py-12">
				<div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6 text-gray-900">
							<form onSubmit={handleSubmit} className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-gray-700">Name</label>
									<input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
									{errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Email</label>
									<input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
									{errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
								</div>
								<div className="flex gap-4">
									<div className="flex-1">
										<label className="block text-sm font-medium text-gray-700">Password</label>
										<input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
										{errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
									</div>
									<div className="flex-1">
										<label className="block text-sm font-medium text-gray-700">Confirm Password</label>
										<input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Alamat</label>
									<input type="text" value={data.alamat} onChange={e => setData('alamat', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
									{errors.alamat && <div className="text-red-600 text-sm mt-1">{errors.alamat}</div>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Kementrian</label>
									<input type="text" value={data.kementrian} onChange={e => setData('kementrian', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
									{errors.kementrian && <div className="text-red-600 text-sm mt-1">{errors.kementrian}</div>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Kode Satker</label>
									<input type="text" value={data.kode_satker} onChange={e => setData('kode_satker', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
									{errors.kode_satker && <div className="text-red-600 text-sm mt-1">{errors.kode_satker}</div>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Position (optional)</label>
									<input type="text" value={data.position} onChange={e => setData('position', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
									{errors.position && <div className="text-red-600 text-sm mt-1">{errors.position}</div>}
								</div>
								<div className="flex justify-end gap-3">
									<Link href={route('admin.clients.index')} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</Link>
									<button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{processing ? 'Saving...' : 'Save'}</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
