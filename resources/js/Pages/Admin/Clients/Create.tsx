import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Create() {
	const { data, setData, post, processing, errors } = useForm({
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
											<TextInput
												id="kementrian"
												type="text"
												value={data.kementrian}
												onChange={e => setData('kementrian', e.target.value)}
												className="mt-1 block w-full"
												placeholder="e.g., Kementerian Keuangan"
												required
											/>
											<InputError message={errors.kementrian} className="mt-2" />
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

								{/* Account Information Section */}
								<div>
									<h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
										Account Information
									</h3>
									<div className="space-y-4">
										<div>
											<InputLabel htmlFor="email" value="Email Address *" />
											<TextInput
												id="email"
												type="email"
												value={data.email}
												onChange={e => setData('email', e.target.value)}
												className="mt-1 block w-full"
												placeholder="client@example.com"
												required
											/>
											<InputError message={errors.email} className="mt-2" />
											<p className="mt-1 text-sm text-gray-500">
												This will be used for login credentials
											</p>
										</div>

										<div>
											<InputLabel htmlFor="position" value="Position (Optional)" />
											<TextInput
												id="position"
												type="text"
												value={data.position}
												onChange={e => setData('position', e.target.value)}
												className="mt-1 block w-full"
												placeholder="e.g., Project Manager"
											/>
											<InputError message={errors.position} className="mt-2" />
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<InputLabel htmlFor="password" value="Password *" />
												<TextInput
													id="password"
													type="password"
													value={data.password}
													onChange={e => setData('password', e.target.value)}
													className="mt-1 block w-full"
													placeholder="Minimum 8 characters"
													required
												/>
												<InputError message={errors.password} className="mt-2" />
											</div>

											<div>
												<InputLabel htmlFor="password_confirmation" value="Confirm Password *" />
												<TextInput
													id="password_confirmation"
													type="password"
													value={data.password_confirmation}
													onChange={e => setData('password_confirmation', e.target.value)}
													className="mt-1 block w-full"
													placeholder="Re-type password"
													required
												/>
											</div>
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
