<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get user's notifications
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::forUser($user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
            
        $unreadCount = Notification::forUser($user->id)
            ->unread()
            ->count();
            
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
            
        $notification->markAsRead();
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        Notification::forUser($request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);
            
        return response()->json(['success' => true]);
    }
    
    /**
     * Get unread count only
     */
    public function unreadCount(Request $request)
    {
        $count = Notification::forUser($request->user()->id)
            ->unread()
            ->count();
            
        return response()->json(['count' => $count]);
    }
    
    /**
     * Auto mark notifications as read by context
     */
    public function autoMarkByContext(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'project_id' => 'nullable|string',
            'task_id' => 'nullable|string',
        ]);
        
        $context = $request->only(['type', 'project_id', 'task_id']);
        $count = Notification::autoMarkAsReadByContext($request->user()->id, $context);
        
        return response()->json([
            'success' => true,
            'marked_count' => $count
        ]);
    }
}
