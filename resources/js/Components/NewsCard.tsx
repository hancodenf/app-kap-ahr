import { Link } from '@inertiajs/react';

interface NewsCardProps {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image?: string | null;
    published_at: string;
    creator: {
        name: string;
    };
}

export default function NewsCard({ id, title, slug, excerpt, featured_image, published_at, creator }: NewsCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Link href={`/news/${slug}`} className="block">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Featured Image */}
                {featured_image ? (
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img
                            src={`/storage/${featured_image}`}
                            alt={title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                ) : (
                    <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-primary-600 transition-colors">
                    {title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                                {creator.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-900">{creator.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(published_at)}</p>
                        </div>
                    </div>

                    {/* Read More Badge */}
                    <div className="flex items-center text-primary-600 text-sm font-medium hover:text-primary-700">
                        <span>Read</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
            </div>
        </Link>
    );
}
