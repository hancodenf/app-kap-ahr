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
                    <Link
                        href={window.history.length > 1 ? 'javascript:history.back()' : '/'}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        ← Back
                    </Link>
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
                            <div className="relative h-96 overflow-hidden">
                                <img
                                    src={`/storage/${news.featured_image}`}
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                    <div className="flex items-center space-x-3 mb-4">
                                        {getStatusBadge(news.status)}
                                        <span className="text-sm opacity-90">
                                            {formatDate(news.published_at || news.created_at)}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl font-bold mb-3 leading-tight">{news.title}</h1>
                                    {news.excerpt && (
                                        <p className="text-lg opacity-90 max-w-3xl">{news.excerpt}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="relative h-64 bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                                <div className="text-center text-white p-8">
                                    <div className="flex items-center justify-center space-x-3 mb-4">
                                        {getStatusBadge(news.status)}
                                        <span className="text-sm opacity-90">
                                            {formatDate(news.published_at || news.created_at)}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl font-bold mb-3 leading-tight">{news.title}</h1>
                                    {news.excerpt && (
                                        <p className="text-lg opacity-90 max-w-3xl mx-auto">{news.excerpt}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Article Meta */}
                        <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
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
                                </div>
                                <div className="text-right">
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
                        <div className="px-8 py-10">
                            <div 
                                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md"
                                dangerouslySetInnerHTML={{ __html: news.content }}
                            />
                        </div>

                        {/* Article Footer */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Slug:</span>{' '}
                                    <code className="bg-gray-200 px-2 py-1 rounded text-xs">{news.slug}</code>
                                </div>
                                <Link
                                    href={window.history.length > 1 ? 'javascript:history.back()' : '/'}
                                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to News
                                </Link>
                            </div>
                        </div>
                    </article>

                    {/* Related or Additional Info */}
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About this Article</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Published Date</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(news.published_at || news.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Author</p>
                                    <p className="text-xs text-gray-500 mt-1">{news.creator.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Status</p>
                                    <p className="text-xs text-gray-500 mt-1 capitalize">{news.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
