import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

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
    // Get URL parameters for back navigation
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] || '');
    const from_page = params.get('from_page') || '1';
    const search = params.get('search') || '';
    const status = params.get('status') || '';
    const author = params.get('author') || '';
    
    // Build back URL with preserved state
    const backUrl = `${route('admin.news.index')}?page=${from_page}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&author=${encodeURIComponent(author)}`;
    
    const { data, setData, post, processing, errors, transform } = useForm({
        title: news.title,
        excerpt: news.excerpt || '',
        content: news.content,
        featured_image: null as File | null,
        status: news.status,
        _method: 'PUT',
    });

    const editorRef = useRef<HTMLTextAreaElement>(null);
    const [showCopyToast, setShowCopyToast] = useState(false);

    const copyPromptToClipboard = async () => {
        const prompt = `Saya ingin Anda membantu mengkonversi artikel berikut menjadi format HTML yang clean, profesional, kreatif, dan mudah dibaca menggunakan Tailwind CSS classes.

Persyaratan:
1. Jangan sertakan tag <html>, <head>, atau <body>
2. Langsung mulai dengan konten artikel (misal: <article> atau <div>)
3. Gunakan Tailwind CSS classes untuk styling dengan prinsip:
   - Typography yang readable (text-base, text-lg, leading-relaxed)
   - Heading hierarchy yang jelas (text-2xl, text-xl, font-bold)
   - Spacing yang konsisten (space-y-4, space-y-6, mb-4, mt-6)
   - Warna profesional dengan accent hijau (#primary-600)

4. Format khusus dengan desain kreatif:

   📝 Paragraf:
   class="text-gray-700 leading-relaxed mb-4 text-justify"

   📌 Heading H1:
   class="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-4 border-primary-600"

   📌 Heading H2:
   class="text-2xl font-bold text-primary-600 mt-8 mb-4 flex items-center"
   (tambahkan icon/emoji di awal jika relevan)

   📌 Heading H3:
   class="text-xl font-semibold text-gray-800 mt-6 mb-3 pl-4 border-l-4 border-primary-600"

   🔹 Unordered List (Poin):
   <ul class="space-y-3 my-6">
     <li class="flex items-start">
       <svg class="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
         <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
       </svg>
       <span class="text-gray-700 leading-relaxed">[ISI POIN]</span>
     </li>
   </ul>

   🔢 Ordered List (Numbering):
   <ol class="space-y-3 my-6">
     <li class="flex items-start">
       <span class="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</span>
       <span class="text-gray-700 leading-relaxed pt-1">[ISI POIN]</span>
     </li>
   </ol>

   💬 Blockquote:
   <blockquote class="border-l-4 border-primary-600 bg-gray-50 pl-6 pr-4 py-4 my-6 italic">
     <p class="text-gray-700 leading-relaxed mb-2">[QUOTE TEXT]</p>
     <footer class="text-sm text-gray-600">— [AUTHOR]</footer>
   </blockquote>

   🖼️ Images:
   <figure class="my-8">
     <img src="[URL]" alt="[ALT]" class="w-full rounded-xl shadow-lg" />
     <figcaption class="text-sm text-gray-600 text-center mt-3 italic">[CAPTION]</figcaption>
   </figure>

   📊 Tabel:
   <div class="overflow-x-auto my-8">
     <table class="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg overflow-hidden">
       <thead class="bg-primary-600">
         <tr>
           <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Header 1</th>
           <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Header 2</th>
         </tr>
       </thead>
       <tbody class="bg-white divide-y divide-gray-200">
         <tr class="hover:bg-gray-50 transition-colors">
           <td class="px-6 py-4 text-sm text-gray-700">Data 1</td>
           <td class="px-6 py-4 text-sm text-gray-700">Data 2</td>
         </tr>
       </tbody>
     </table>
   </div>

   📦 Box/Card Highlight:
   <div class="bg-primary-50 border-l-4 border-primary-600 p-6 my-6 rounded-r-lg">
     <h4 class="font-bold text-primary-600 mb-2 text-lg">💡 [JUDUL]</h4>
     <p class="text-gray-700 leading-relaxed">[KONTEN]</p>
   </div>

   ⚠️ Warning/Alert Box:
   <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-6 rounded-r-lg">
     <h4 class="font-bold text-yellow-700 mb-2 text-lg">⚠️ [JUDUL]</h4>
     <p class="text-gray-700 leading-relaxed">[KONTEN]</p>
   </div>

5. Desain harus:
   - Clean dan modern dengan sedikit kreativitas
   - Mudah dibaca untuk artikel panjang
   - Responsif untuk semua device
   - Fokus pada readability dengan visual enhancement
   - Gunakan icon SVG atau emoji untuk mempercantik
   - Warna accent: primary-600 (hijau)

Silakan konversi artikel di bawah ini:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PASTE ARTIKEL ANDA DI SINI]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Berikan output dalam format kode HTML yang siap digunakan, tanpa penjelasan tambahan. Pastikan menggunakan elemen yang sesuai dengan jenis konten (heading, list, tabel, dll).`;

        try {
            await navigator.clipboard.writeText(prompt);
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 3000);
        } catch (err) {
            alert('Gagal menyalin prompt. Silakan coba lagi.');
        }
    };

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
                        href={backUrl}
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
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                        Content *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={copyPromptToClipboard}
                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy Prompt AI
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    💡 <strong>Tip:</strong> Klik "Copy Prompt AI" → Paste ke ChatGPT/Claude → Paste artikel mentah Anda → Copy hasil HTML → Paste di Summernote (mode Code View)
                                </p>
                                <textarea ref={editorRef} id="content" style={{ display: 'none' }} />
                                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                            </div>

                            {/* Toast Notification */}
                            {showCopyToast && (
                                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in-up z-50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-medium">Prompt berhasil disalin! Paste ke AI platform Anda.</span>
                                </div>
                            )}

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
                                    href={backUrl}
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
