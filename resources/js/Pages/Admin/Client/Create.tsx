import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler } from 'react';

export default function Create({ }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        client_name: '',
        alamat: '',
        kementrian: '',
        kode_satker: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('admin.clients.store'), {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Tambah Klien Baru
                    </h2>
                    <Link
                        href={route('admin.project.index')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title="Tambah Klien Baru" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* User Account Information */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Informasi Akun User
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Nama User
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                                Konfirmasi Password
                                            </label>
                                            <input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Client Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Informasi Klien
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">
                                                Nama Klien/Instansi
                                            </label>
                                            <input
                                                id="client_name"
                                                name="client_name"
                                                type="text"
                                                value={data.client_name}
                                                onChange={(e) => setData('client_name', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.client_name && <p className="mt-1 text-sm text-red-600">{errors.client_name}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="kementrian" className="block text-sm font-medium text-gray-700">
                                                Kementrian/Lembaga
                                            </label>
                                            <input
                                                id="kementrian"
                                                name="kementrian"
                                                type="text"
                                                value={data.kementrian}
                                                onChange={(e) => setData('kementrian', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.kementrian && <p className="mt-1 text-sm text-red-600">{errors.kementrian}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="kode_satker" className="block text-sm font-medium text-gray-700">
                                                Kode Satker
                                            </label>
                                            <input
                                                id="kode_satker"
                                                name="kode_satker"
                                                type="text"
                                                value={data.kode_satker}
                                                onChange={(e) => setData('kode_satker', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.kode_satker && <p className="mt-1 text-sm text-red-600">{errors.kode_satker}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                                                Alamat
                                            </label>
                                            <textarea
                                                id="alamat"
                                                name="alamat"
                                                rows={3}
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.alamat && <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('admin.project.index')}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
