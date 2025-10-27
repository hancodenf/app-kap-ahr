import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Client {
    id: number;
    user_id: number;
    name: string;
    alamat: string;
    kementrian: string;
    kode_satker: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        email_verified_at: string | null;
        created_at: string;
    };
}

interface ProjectIndexPageProps extends PageProps {
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

export default function Index({ clients, filters }: ProjectIndexPageProps) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(route('admin.project.index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('admin.project.index'), {}, {
            preserveState: true,
            replace: true,
        });
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
                        Project Management - Pilih Klien
                    </h2>
                    <Link
                        href={route('admin.clients.create')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Klien Baru
                    </Link>
                </div>
            }
        >
            <Head title="Project Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-600 mb-4">
                                    Pilih klien untuk melihat dan mengelola data project mereka.
                                </p>
                                
                                {/* Search Bar */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Cari nama klien, email, atau kementrian..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
                                    >
                                        Cari
                                    </button>
                                    {filters.search && (
                                        <button
                                            onClick={handleReset}
                                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Clients Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {clients.data.map((client) => (
                                    <div key={client.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                                                <span className="text-lg font-medium text-primary-600">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                                                <p className="text-sm text-gray-500">{client.user.email}</p>
                                                <p className="text-xs text-gray-400">{client.kementrian}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4"> 
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Kode Satker:</span>
                                                <span className="text-gray-700">{client.kode_satker}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-1">
                                                <span className="text-gray-500">Alamat:</span>
                                                <span className="text-gray-700 text-right text-xs">{client.alamat}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-2">
                                                <span className="text-gray-500">Bergabung:</span>
                                                <span className="text-gray-700">{formatDate(client.created_at)}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={route('admin.project.show', client.id)}
                                            className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Lihat Data Project
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {clients.data.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        {filters.search ? 'Tidak ada klien yang ditemukan' : 'Belum ada klien'}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {filters.search ? 'Coba ubah kata kunci pencarian Anda.' : 'Klien akan muncul di sini setelah terdaftar.'}
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {clients.last_page > 1 && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Menampilkan {clients.data.length} dari {clients.total} klien
                                    </div>
                                    <div className="flex space-x-1">
                                        {clients.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-2 text-sm rounded-md ${
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
        </AuthenticatedLayout>
    );
}