import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image?: string | null;
    status: string;
    published_at: string;
    created_at: string;
    creator: {
        name: string;
    };
}

interface NewsDetailProps extends PageProps {
    news: NewsItem;
}

export default function NewsDetail({ news }: NewsDetailProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        if (status === 'published') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Published
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Draft
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">News & Updates</h2> 
                </div>
            }
        >
            <Head title={news.title} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Article Header */}
                    <article className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                                <svg className="w-24 h-24 text-white opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                        )}

                        {/* Article Meta & Title */}
                        <div className="px-4 sm:px-6 md:px-8 py-6 border-b border-gray-100">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {getStatusBadge(news.status)}
                                <span className="text-sm text-gray-500">
                                    {formatDate(news.published_at || news.created_at)}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">{news.title}</h1>
                            {news.excerpt && (
                                <p className="text-base sm:text-lg text-gray-600 leading-relaxed border-l-4 border-green-500 pl-4 py-2">{news.excerpt}</p>
                            )}
                        </div>

                        {/* Author Info */}
                        <div className="px-4 sm:px-6 md:px-8 py-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold text-sm">
                                            {news.creator.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {news.creator.name}
                                        </p>
                                        <p className="text-xs text-gray-500">Author</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        Published
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(news.published_at || news.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-10">
                            <div 
                                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md prose-img:w-full"
                                dangerouslySetInnerHTML={{ __html: news.content }}
                            />
                        </div>

                        {/* Article Footer */}
                        <div className="px-4 sm:px-6 md:px-8 py-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between"> 
                                <Link
                                    href={route('news.index')}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to News
                                </Link>
                            </div>
                        </div>
                    </article> 
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
