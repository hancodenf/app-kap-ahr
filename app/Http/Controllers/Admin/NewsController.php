<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = News::with('creator');

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by author
        if ($request->filled('author')) {
            $query->where('created_by', $request->author);
        }

        $news = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Get all authors for filter dropdown
        $authors = \App\Models\User::whereHas('news')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/News/Index', [
            'news' => $news,
            'authors' => $authors,
            'filters' => $request->only(['search', 'status', 'author']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/News/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:draft,published',
        ]);

        $validated['created_by'] = Auth::id();
        
        if ($request->status === 'published') {
            $validated['published_at'] = now();
        }

        // Handle image upload
        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('news', 'public');
        }

        // Generate excerpt if not provided
        if (empty($validated['excerpt'])) {
            $validated['excerpt'] = Str::limit(strip_tags($validated['content']), 200);
        }

        News::create($validated);

        return redirect()->route('admin.news.index')->with('success', 'News created successfully.');
    }

    public function show(News $news)
    {
        $news->load('creator');
        
        return Inertia::render('Admin/News/Show', [
            'news' => $news,
        ]);
    }

    public function edit(News $news)
    {
        return Inertia::render('Admin/News/Edit', [
            'news' => $news,
        ]);
    }

    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:draft,published',
        ]);

        // Remove featured_image from validated data if no new file uploaded
        // This prevents overwriting existing image with null
        if (!$request->hasFile('featured_image')) {
            unset($validated['featured_image']);
        }

        if ($request->status === 'published' && $news->status === 'draft') {
            $validated['published_at'] = now();
        }

        // Handle image upload only if new file exists
        if ($request->hasFile('featured_image')) {
            // Delete old image
            if ($news->featured_image) {
                Storage::disk('public')->delete($news->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')->store('news', 'public');
        }

        // Generate excerpt if not provided
        if (empty($validated['excerpt'])) {
            $validated['excerpt'] = Str::limit(strip_tags($validated['content']), 200);
        }

        $news->update($validated);

        return redirect()->route('admin.news.index')->with('success', 'News updated successfully.');
    }

    public function destroy(News $news)
    {
        // Delete image if exists
        if ($news->featured_image) {
            Storage::disk('public')->delete($news->featured_image);
        }

        $news->delete();

        return redirect()->route('admin.news.index')->with('success', 'News deleted successfully.');
    }

    // Public view for all authenticated users
    public function showPublic(News $news)
    {
        // Only show published news to non-admin users
        if ($news->status !== 'published' && Auth::user()->role !== 'admin') {
            abort(404);
        }

        return Inertia::render('News/Detail', [
            'news' => [
                'id' => $news->id,
                'title' => $news->title,
                'slug' => $news->slug,
                'excerpt' => $news->excerpt,
                'content' => $news->content,
                'featured_image' => $news->featured_image,
                'status' => $news->status,
                'published_at' => $news->published_at,
                'created_at' => $news->created_at,
                'creator' => [
                    'name' => $news->creator->name,
                ],
            ],
        ]);
    }

    public function indexPublic(Request $request)
    {
        $query = News::with('creator')->published();

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $news = $query->orderBy('published_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('News/Index', [
            'news' => $news,
            'filters' => $request->only(['search']),
        ]);
    }

    // Public news index (no authentication required)
    public function publicIndex(Request $request)
    {
        $query = News::with('creator')->published();

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $news = $query->orderBy('published_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Frontend/News/Index', [
            'news' => $news,
            'filters' => $request->only(['search']),
        ]);
    }

    // Public news detail (no authentication required)
    public function publicShow(News $news)
    {
        // Only show published news
        if ($news->status !== 'published') {
            abort(404);
        }

        $news->load('creator');

        return Inertia::render('Frontend/News/Show', [
            'news' => [
                'id' => $news->id,
                'title' => $news->title,
                'slug' => $news->slug,
                'excerpt' => $news->excerpt,
                'content' => $news->content,
                'featured_image' => $news->featured_image,
                'published_at' => $news->published_at,
                'creator' => [
                    'name' => $news->creator->name,
                ],
            ],
        ]);
    }
}
