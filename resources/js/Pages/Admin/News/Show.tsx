import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface News {     
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string | null;
    status: 'draft' | 'published';
    published_at: string | null;
    created_at: string;
    creator: {
        name: string;
        email: string;
    };
}

export default function Show({ auth, news }: PageProps<{ news: News }>) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">News Details</h2>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <Link
                            href={route('admin.news.edit', news.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                        >
                            Edit
                        </Link>
                        <Link
                            href={route('admin.news.index')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                        >
                            Back to News
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={news.title} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <article className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        {/* Header Info */}
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            By <span className="font-medium text-gray-900">{news.creator.name}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(news.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {news.status === 'published' ? (
                                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Published
                                        </span>
                                    ) : (
                                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-4 sm:px-6 py-6 sm:py-8">
                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{news.title}</h1>

                            {/* Excerpt */}
                            {news.excerpt && (
                                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 italic border-l-4 border-primary-500 pl-3 sm:pl-4 py-2">{news.excerpt}</p>
                            )}

                            {/* Featured Image */}
                            {news.featured_image && (
                                <div className="mb-6 sm:mb-8 -mx-4 sm:mx-0">
                                    <img
                                        src={`/storage/${news.featured_image}`}
                                        alt={news.title}
                                        className="w-full h-auto sm:rounded-lg shadow-md"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div
                                className="prose prose-sm sm:prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary-600"
                                dangerouslySetInnerHTML={{ __html: news.content }}
                            />
                        </div>

                        {/* Footer Info */}
                        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600">
                                <div>
                                    <strong>Published:</strong>{' '}
                                    {news.published_at
                                        ? new Date(news.published_at).toLocaleDateString('id-ID', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : 'Not published yet'}
                                </div>
                                <div className="break-all sm:break-normal">
                                    <strong>Slug:</strong> <code className="px-2 py-1 bg-gray-200 rounded text-xs">{news.slug}</code>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
