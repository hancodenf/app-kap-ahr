import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, FormEventHandler } from 'react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    status: string;
    published_at: string;
    created_at: string;
    creator: {
        name: string;
    };
}

interface PaginatedNews {
    data: NewsItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    search?: string;
}

export default function Index({ auth, news, filters }: PageProps<{ news: PaginatedNews; filters: Filters }>) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('news.index'), {
            search: search || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('news.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(route('news.index', { 
            page,
            search: search || undefined,
        }), {}, { 
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Berita & Pembaruan
                    </h2>
                </div>
            }
        >
            <Head title="Berita & Pembaruan" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Hero Section - Clean & Minimal */}
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 mb-6 border border-green-100">
                        <div className="max-w-3xl">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Berita & Pembaruan Terbaru</h1>
                            <p className="text-gray-600">Tetap update dengan berita terbaru, pengumuman, dan informasi penting dari sistem kami.</p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari berita..."
                                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-green-400 focus:ring-green-400 text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Cari
                            </button>
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-all"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reset
                                </button>
                            )}
                        </form>
                        {search && (
                            <p className="mt-3 text-sm text-gray-600">
                                Menampilkan <span className="font-semibold text-gray-900">{news.total}</span> hasil untuk "<span className="font-semibold text-gray-900">{search}</span>"
                            </p>
                        )}
                    </div>

                    {/* News Grid */}
                    {news.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {news.data.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={route('news.show', item.slug)}
                                        className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300"
                                    >
                                        {/* Featured Image */}
                                        <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-100 overflow-hidden">
                                            {item.featured_image ? (
                                                <img
                                                    src={`/storage/${item.featured_image}`}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-20 h-20 text-green-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* Meta */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{formatDate(item.published_at)}</span>
                                                </div>
                                                <span className="text-gray-300">•</span>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>{item.creator.name}</span>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                                                {item.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                                {item.excerpt}
                                            </p>

                                            {/* Read More */}
                                            <div className="flex items-center text-green-600 font-medium text-sm group-hover:text-green-700">
                                                <span>Baca Selengkapnya</span>
                                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {news.last_page > 1 && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-600">
                                            Menampilkan <span className="font-semibold text-gray-900">{(news.current_page - 1) * news.per_page + 1}</span> sampai{' '}
                                            <span className="font-semibold text-gray-900">
                                                {Math.min(news.current_page * news.per_page, news.total)}
                                            </span>{' '}
                                            dari <span className="font-semibold text-gray-900">{news.total}</span> berita
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePageChange(news.current_page - 1)}
                                                disabled={news.current_page === 1}
                                                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                ← Sebelumnya
                                            </button>
                                            
                                            <div className="hidden sm:flex gap-1">
                                                {Array.from({ length: Math.min(news.last_page, 5) }, (_, i) => {
                                                    let page;
                                                    if (news.last_page <= 5) {
                                                        page = i + 1;
                                                    } else if (news.current_page <= 3) {
                                                        page = i + 1;
                                                    } else if (news.current_page >= news.last_page - 2) {
                                                        page = news.last_page - 4 + i;
                                                    } else {
                                                        page = news.current_page - 2 + i;
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                                                page === news.current_page
                                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm'
                                                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(news.current_page + 1)}
                                                disabled={news.current_page === news.last_page}
                                                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Berikutnya →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Berita</h3>
                            <p className="text-gray-500">
                                {search ? `Tidak ada berita yang cocok dengan pencarian "${search}"` : 'Belum ada berita yang dipublikasikan.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
