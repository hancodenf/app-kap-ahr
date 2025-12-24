import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState } from 'react';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    published_at: string;
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
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    news: PaginatedNews;
    filters?: {
        search?: string;
    };
}

export default function PublicNewsIndex({ news, filters = {} }: Props) {
    const [scrollY, setScrollY] = useState(0);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title="News & Updates - AURA" />
            <div className="bg-white min-h-screen">
                {/* Header */}
                <header className="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-600 shadow-lg sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <Link href="/" className="flex items-center space-x-3 group">
                                <ApplicationLogo className="h-10 w-10 text-white transform group-hover:scale-110 transition-all duration-300" />
                                <div>
                                    <h1 className="text-xl font-black text-white">AURA</h1>
                                    <p className="text-xs text-white/90">Audit Management System</p>
                                </div>
                            </Link>
                            
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/"
                                    className="text-white/90 hover:text-white font-medium transition-colors"
                                >
                                    Beranda
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="bg-white text-primary-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-block bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full px-5 py-2 mb-6">
                                <span className="text-sm font-bold text-primary-600">📰 BERITA TERBARU</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                                News & <span className="bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">Updates</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Tetap update dengan berita terbaru, pengumuman, dan informasi penting
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Search */}
                    <div className="mb-8">
                        <form method="get" action="/berita" className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={filters.search || ''}
                                    placeholder="Cari berita..."
                                    className="w-full px-6 py-4 pl-12 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>
                    </div>

                    {/* News Grid */}
                    {news.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {news.data.map((newsItem) => (
                                    <Link
                                        key={newsItem.id}
                                        href={`/berita/${newsItem.slug}`}
                                        className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                    >
                                        {/* Featured Image */}
                                        <div className="relative h-48 bg-gradient-to-br from-primary-100 to-emerald-100 overflow-hidden">
                                            {newsItem.featured_image ? (
                                                <img 
                                                    src={`/storage/${newsItem.featured_image}`}
                                                    alt={newsItem.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-20 h-20 text-primary-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="p-6">
                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {formatDate(newsItem.published_at)}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {newsItem.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                                                {newsItem.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                                                        {newsItem.creator.name.charAt(0)}
                                                    </div>
                                                    {newsItem.creator.name}
                                                </div>
                                                <span className="inline-flex items-center text-primary-600 font-semibold text-sm group-hover:text-primary-700 transition-colors">
                                                    Baca Selengkapnya
                                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {news.last_page > 1 && (
                                <div className="flex justify-center">
                                    <div className="flex gap-2">
                                        {news.links.map((link, index) => {
                                            if (!link.url) return null;
                                            
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                                        link.active
                                                            ? 'bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-lg'
                                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Berita</h3>
                            <p className="text-gray-500">
                                Belum ada berita yang dipublikasikan. Silakan cek kembali nanti.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 mt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <Link href="/" className="inline-flex items-center space-x-3 mb-4">
                                <ApplicationLogo className="h-10 w-10 text-white" />
                                <span className="text-xl font-black">AURA</span>
                            </Link>
                            <p className="text-gray-400 mb-4">
                                Professional Audit Management System
                            </p>
                            <div className="flex justify-center space-x-6 text-sm">
                                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                                    Beranda
                                </Link>
                                <Link href="/berita" className="text-gray-400 hover:text-white transition-colors">
                                    Berita
                                </Link>
                                <Link href={route('login')} className="text-gray-400 hover:text-white transition-colors">
                                    Login
                                </Link>
                            </div>
                            <p className="text-gray-500 text-sm mt-6">
                                &copy; 2025 KAP Abdul Hamid dan Rekan. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
