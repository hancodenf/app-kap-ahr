import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Role {
	id: number;
	name: string;
	display_name: string;
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
	created_at: string;
	updated_at: string;
}

interface Props {
	user: User;
}

export default function Show({ user }: Props) {
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
						href={route('admin.users.index')}
						className="text-gray-500 hover:text-gray-700"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</Link>
					<h2 className="text-xl font-semibold leading-tight text-gray-800">
						User Details
					</h2>
				</div>
			}
		>
			<Head title={`User: ${user.name}`} />
			
			<div className="py-6">
				<div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
					<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
						<div className="p-6">
							{/* Header with Actions */}
							<div className="flex justify-between items-start mb-6 pb-6 border-b">
								<div className="flex items-center gap-4">
									{user.profile_photo ? (
										<img 
											src={`/storage/${user.profile_photo}`} 
											alt={user.name}
											className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
										/>
									) : (
										<div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
											<span className="text-2xl font-semibold text-primary-700">
												{user.name.charAt(0).toUpperCase()}
											</span>
										</div>
									)}
									<div>
										<h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
										<p className="text-sm text-gray-500">{user.email}</p>
									</div>
								</div>
								<Link
									href={route('admin.users.edit', user.id)}
									className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									Edit User
								</Link>
							</div>

							{/* User Information */}
							<div className="space-y-6">
								{/* Account Information */}
								<div>
									<h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
										Account Information
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Full Name
											</label>
											<p className="text-base text-gray-900">{user.name}</p>
										</div>
										
										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Email Address
											</label>
											<p className="text-base text-gray-900">{user.email}</p>
										</div>

										{user.position && (
											<div>
												<label className="block text-sm font-medium text-gray-500 mb-1">
													Position
												</label>
												<p className="text-base text-gray-900">{user.position}</p>
											</div>
										)}

										{user.user_type && (
											<div>
												<label className="block text-sm font-medium text-gray-500 mb-1">
													User Type
												</label>
												<span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
													{user.user_type}
												</span>
											</div>
										)}

										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Role
											</label>
											<span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-primary-100 text-primary-800">
												{user.role?.display_name || 'No Role'}
											</span>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Email Verified
											</label>
											{user.email_verified_at ? (
												<div className="flex items-center gap-2">
													<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<span className="text-sm text-green-700">Verified</span>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<span className="text-sm text-gray-500">Not Verified</span>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Timeline Information */}
								<div>
									<h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
										Timeline
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Created At
											</label>
											<p className="text-base text-gray-900">{formatDate(user.created_at)}</p>
										</div>
										
										<div>
											<label className="block text-sm font-medium text-gray-500 mb-1">
												Last Updated
											</label>
											<p className="text-base text-gray-900">{formatDate(user.updated_at)}</p>
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="mt-8 pt-6 border-t flex justify-between">
								<Link
									href={route('admin.users.index')}
									className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
									</svg>
									Back to List
								</Link>
								<Link
									href={route('admin.users.edit', user.id)}
									className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									Edit User
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
