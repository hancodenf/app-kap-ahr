import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image?: string | null;
    published_at: string;
    creator: {
        name: string;
    };
}

interface Props {
    news: NewsItem;
}

export default function PublicNewsShow({ news }: Props) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <Head title={`${news.title} - AURA`} />
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
                                    href="/berita"
                                    className="text-white/90 hover:text-white font-medium transition-colors"
                                >
                                    Berita
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

                {/* Article */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link
                            href="/berita"
                            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Berita
                        </Link>
                    </div>

                    {/* Article Card */}
                    <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Featured Image */}
                        {news.featured_image ? (
                            <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                                <img
                                    src={`/storage/${news.featured_image}`}
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary-500 to-emerald-700 flex items-center justify-center">
                                <svg className="w-24 h-24 text-white opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                        )}

                        {/* Article Header */}
                        <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                                {news.title}
                            </h1>
                            {news.excerpt && (
                                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed border-l-4 border-primary-500 pl-4 py-2">
                                    {news.excerpt}
                                </p>
                            )}
                        </div>

                        {/* Article Meta */}
                        <div className="px-6 sm:px-8 py-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-lg">
                                            {news.creator.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {news.creator.name}
                                        </p>
                                        <p className="text-sm text-gray-500">Author</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="font-medium text-gray-900">
                                        Dipublikasikan
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(news.published_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="px-6 sm:px-8 py-10">
                            <div 
                                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md"
                                dangerouslySetInnerHTML={{ __html: news.content }}
                            />
                        </div>

                        {/* Article Footer */}
                        <div className="px-6 sm:px-8 py-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <Link
                                    href="/berita"
                                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Kembali ke Berita
                                </Link>
                                
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500">Bagikan:</span>
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: news.title,
                                                    text: news.excerpt,
                                                    url: window.location.href,
                                                });
                                            }
                                        }}
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        title="Bagikan"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* CTA Section */}
                    <div className="mt-12 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl p-8 text-center border border-primary-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Tertarik dengan AURA?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Login untuk mengakses fitur lengkap sistem manajemen audit profesional
                        </p>
                        <Link
                            href={route('login')}
                            className="inline-flex items-center bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Login Sekarang
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
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
