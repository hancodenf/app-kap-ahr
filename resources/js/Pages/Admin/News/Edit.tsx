import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useEffect, useRef } from 'react';

// Import Summernote CSS
import 'summernote/dist/summernote-lite.css';

interface News {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string | null;
    status: 'draft' | 'published';
}

export default function Edit({ auth, news }: PageProps<{ news: News }>) {
    const { data, setData, post, processing, errors, transform } = useForm({
        title: news.title,
        excerpt: news.excerpt || '',
        content: news.content,
        featured_image: null as File | null,
        status: news.status,
        _method: 'PUT',
    });

    const editorRef = useRef<HTMLTextAreaElement>(null);

    // Transform data before sending - only include featured_image if it's not null
    transform((data) => {
        const formData: any = {
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            status: data.status,
            _method: 'PUT',
        };
            
        // Only include featured_image if a new file was selected
        if (data.featured_image) {
            formData.featured_image = data.featured_image;
        }
        
        return formData;
    });

    useEffect(() => {
        // Dynamically import Summernote
        const loadSummernote = async () => {
            // Import jQuery first
            const $ = (await import('jquery')).default;
            (window as any).jQuery = $;
            (window as any).$ = $;

            // Import Summernote
            await import('summernote/dist/summernote-lite.js');

            if (editorRef.current) {
                $(editorRef.current).summernote({
                    height: 400,
                    placeholder: 'Write your news content here...',
                    toolbar: [
                        ['style', ['style']],
                        ['font', ['bold', 'italic', 'underline', 'clear']],
                        ['fontname', ['fontname']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['table', ['table']],
                        ['insert', ['link', 'picture', 'video']],
                        ['view', ['fullscreen', 'codeview', 'help']],
                    ],
                    callbacks: {
                        onChange: function (contents: string) {
                            setData('content', contents);
                        },
                    },
                });

                // Set initial content
                $(editorRef.current).summernote('code', news.content);
            }
        };

        loadSummernote();

        return () => {
            if (editorRef.current && (window as any).$) {
                (window as any).$(editorRef.current).summernote('destroy');
            }
        };
    }, []);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.news.update', news.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Edit News</h2>
                    <Link
                        href={route('admin.news.index')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Back to News
                    </Link>
                </div>
            }
        >
            <Head title="Edit News" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            {/* Current Featured Image */}
                            {news.featured_image && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Featured Image</label>
                                    <img
                                        src={`/storage/${news.featured_image}`}
                                        alt={news.title}
                                        className="w-64 h-auto rounded-lg border border-gray-300"
                                    />
                                </div>
                            )}

                            {/* Featured Image */}
                            <div>
                                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-2">
                                    {news.featured_image ? 'Replace Featured Image' : 'Featured Image'}
                                </label>
                                <input
                                    type="file"
                                    id="featured_image"
                                    accept="image/*"
                                    onChange={(e) => setData('featured_image', e.target.files?.[0] || null)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {errors.featured_image && <p className="mt-1 text-sm text-red-600">{errors.featured_image}</p>}
                                <p className="mt-1 text-xs text-gray-500">Recommended size: 1200x630px (JPG, PNG, GIF, max 2MB)</p>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                                    Excerpt
                                </label>
                                <textarea
                                    id="excerpt"
                                    value={data.excerpt}
                                    onChange={(e) => setData('excerpt', e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Brief summary of the news (optional, will be auto-generated if left empty)"
                                />
                                {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>}
                            </div>

                            {/* Content - Summernote Editor */}
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                                    Content *
                                </label>
                                <textarea ref={editorRef} id="content" style={{ display: 'none' }} />
                                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="draft"
                                            checked={data.status === 'draft'}
                                            onChange={(e) => setData('status', e.target.value as 'draft' | 'published')}
                                            className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Draft</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="published"
                                            checked={data.status === 'published'}
                                            onChange={(e) => setData('status', e.target.value as 'draft' | 'published')}
                                            className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Published</span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Link
                                    href={route('admin.news.index')}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update News'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
