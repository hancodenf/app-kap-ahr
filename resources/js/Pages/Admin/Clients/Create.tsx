import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Create() {
	const { data, setData, post, processing, errors } = useForm({
		name: '',
		alamat: '',
		kementrian: '',
		kode_satker: '',
		type: '',
		logo: null as File | null,
	});

	const kementrianOptions = [
		'Kementerian Kesehatan',
		'Kementerian Perhubungan',
		'Kementerian Agama',
		'Kementerian Pendidikan',
		'Kementerian Pertanian',
		'Kementerian Keuangan'
	];

	const typeOptions = ['BLU', 'BLUD', 'PTNBH'];

	const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setData('logo', file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		post(route('admin.clients.store'));
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
						Add New Client
					</h2>
				</div>
			}
		>
			<Head title="Add Client" />
			
			<div className="py-6">
				<div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Client Information Section */}
								<div>
									<h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
										Client Information
									</h3>
									<div className="space-y-4">
										<div>
											<InputLabel htmlFor="name" value="Client Name *" />
											<TextInput
												id="name"
												type="text"
												value={data.name}
												onChange={e => setData('name', e.target.value)}
												className="mt-1 block w-full"
												placeholder="e.g., PT. ABC Indonesia"
												required
											/>
											<InputError message={errors.name} className="mt-2" />
										</div>

						<div>
							<InputLabel htmlFor="kementrian" value="Kementrian/Lembaga *" />
							<select
								id="kementrian"
								value={data.kementrian}
								onChange={e => setData('kementrian', e.target.value)}
								className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
								required
							>
								<option value="">Pilih Kementrian/Lembaga</option>
								{kementrianOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
							<InputError message={errors.kementrian} className="mt-2" />
						</div>

						<div>
							<InputLabel htmlFor="type" value="Type *" />
							<select
								id="type"
								value={data.type}
								onChange={e => setData('type', e.target.value)}
								className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
								required
							>
								<option value="">Pilih Type</option>
								{typeOptions.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
							<InputError message={errors.type} className="mt-2" />
						</div>

						<div>
							<InputLabel htmlFor="kode_satker" value="Kode Satker *" />
							<TextInput
								id="kode_satker"
								type="text"
								value={data.kode_satker}
								onChange={e => setData('kode_satker', e.target.value)}
								className="mt-1 block w-full"
								placeholder="e.g., 123456"
								required
							/>
							<InputError message={errors.kode_satker} className="mt-2" />
						</div>

						<div>
							<InputLabel htmlFor="logo" value="Logo Client" />
							<div className="mt-1 flex items-center gap-4">
								{logoPreview ? (
									<img 
										src={logoPreview} 
										alt="Logo preview" 
										className="w-20 h-20 object-contain border-2 border-gray-300 rounded-lg p-2 bg-white"
									/>
								) : (
									<div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
										<svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
									</div>
								)}
								<div className="flex-1">
									<input
										id="logo"
										type="file"
										accept="image/*"
										onChange={handleLogoChange}
										className="hidden"
									/>
									<label
										htmlFor="logo"
										className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
									>
										Pilih Logo
									</label>
									<p className="mt-2 text-xs text-gray-500">
										JPG, PNG, GIF, SVG (MAX. 2MB)
									</p>
								</div>
							</div>
							<InputError message={errors.logo} className="mt-2" />
						</div>

						<div>
							<InputLabel htmlFor="alamat" value="Address *" />
							<textarea
								id="alamat"
								value={data.alamat}
								onChange={e => setData('alamat', e.target.value)}
								className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								rows={3}
								placeholder="Full address of the client"
								required
							/>
							<InputError message={errors.alamat} className="mt-2" />
						</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center justify-end gap-3 pt-4 border-t">
									<Link href={route('admin.clients.index')}>
										<SecondaryButton type="button">
											Cancel
										</SecondaryButton>
									</Link>
									<PrimaryButton disabled={processing}>
										{processing ? (
											<span className="flex items-center gap-2">
												<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												Creating...
											</span>
										) : (
											'Create Client'
										)}
									</PrimaryButton>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
