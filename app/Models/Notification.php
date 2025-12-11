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

    /**
     * Auto mark notifications as read based on context
     */
    public static function autoMarkAsReadByContext($userId, $context)
    {
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
        }
        
        $notifications = $query->get();
        foreach ($notifications as $notification) {
            $notification->markAsRead();
        }
        
        return $notifications->count();
    }
}
