<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'type',
        'user_id', 
        'title',
        'message',
        'url',
        'data',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    public static function createApprovalNotification(
        $userId,
        $taskName,
        $projectName,
        $taskId,
        $projectId
    ) {
        return static::create([
            'type' => 'approval',
            'user_id' => $userId,
            'title' => 'New Approval Required',
            'message' => "Task '{$taskName}' in project '{$projectName}' requires your approval",
            'url' => "/company/tasks/{$taskId}/approval-detail",
            'data' => [
                'task_id' => $taskId,
                'project_id' => $projectId,
                'task_name' => $taskName,
                'project_name' => $projectName,
            ]
        ]);
    }

    public static function createClientTaskNotification(
        $userId,
        $taskName,
        $projectName,
        $taskId,
        $projectId
    ) {
        return static::create([
            'type' => 'client_task',
            'user_id' => $userId,
            'title' => 'New Task Submitted',
            'message' => "Task '{$taskName}' in project '{$projectName}' has been submitted for your review",
            'url' => "/klien/tasks/{$taskId}",
            'data' => [
                'task_id' => $taskId,
                'project_id' => $projectId,
                'task_name' => $taskName,
                'project_name' => $projectName,
            ]
        ]);
    }

    public static function createWorkerTaskNotification(
        $userId,
        $taskName,
        $projectName,
        $taskId,
        $projectId,
        $actionType,
        $message
    ) {
        $title = match($actionType) {
            'client_approved' => 'Task Approved by Client',
            'client_uploaded' => 'Client Uploaded Documents',
            'client_replied' => 'Client Replied to Task',
            'client_returned' => 'Task Returned by Client',
            default => 'Client Task Update'
        };

        return static::create([
            'type' => 'worker_task',
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'url' => "/company/tasks/{$taskId}/detail",
            'data' => [
                'task_id' => $taskId,
                'project_id' => $projectId,
                'task_name' => $taskName,
                'project_name' => $projectName,
                'action_type' => $actionType,
            ]
        ]);
    }

    /**
     * Auto mark notifications as read based on context
     */
    public static function autoMarkAsReadByContext($userId, $context)
    {
        \Log::info('🔍 Auto-mark query building', [
            'user_id' => $userId,
            'context' => $context
        ]);
        
        $query = static::forUser($userId)->unread();
        
        switch ($context['type']) {
            case 'project_approval':
                $query->where('type', 'approval')
                     ->where('data->project_id', $context['project_id']);
                break;
                
            case 'task_approval':
                $query->where('type', 'approval')
                     ->where('data->task_id', $context['task_id']);
                break;
                
            case 'client_task':
                $query->where('type', 'client_task')
                     ->where('data->task_id', $context['task_id']);
                break;
                
            case 'client_project':
                $query->where('type', 'client_task')
                     ->where('data->project_id', $context['project_id']);
                break;
                
            case 'worker_task':
                $query->where('type', 'worker_task')
                     ->where('data->task_id', $context['task_id']);
                break;
                
            case 'worker_project':
                $query->where('type', 'worker_task')
                     ->where('data->project_id', $context['project_id']);
                break;
                
            case 'project_document_request':
                \Log::info('📄 Matching project document request notifications');
                $query->where('type', 'App\\Notifications\\ProjectDocumentRequestNotification')
                     ->where('data->project_id', $context['project_id']);
                break;
        }
        
        $notifications = $query->get();
        
        \Log::info('🔍 Found notifications to mark', [
            'count' => $notifications->count(),
            'notification_ids' => $notifications->pluck('id')->toArray()
        ]);
        
        foreach ($notifications as $notification) {
            $notification->markAsRead();
        }
        
        return $notifications->count();
    }
}
