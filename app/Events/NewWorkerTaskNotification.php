<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NewWorkerTaskNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $project;
    public $workerUserIds;
    public $message;
    public $actionType;

    /**
     * Create a new event instance.
     */
    public function __construct($task, $project, $workerUserIds, $actionType, $message = null)
    {
        Log::info('🔥 NewWorkerTaskNotification constructor called', [
            'task_id' => $task->id ?? 'N/A',
            'task_name' => $task->name ?? 'N/A',
            'project_id' => $project->id ?? 'N/A',
            'project_name' => $project->name ?? 'N/A',
            'worker_user_ids' => $workerUserIds,
            'action_type' => $actionType,
            'message' => $message
        ]);
        
        $this->task = $task;
        $this->project = $project;
        $this->workerUserIds = $workerUserIds;
        $this->actionType = $actionType;
        $this->message = $message ?? $this->generateDefaultMessage($actionType);
        
        // Save notifications to database for persistence
        $this->saveNotificationsToDatabase();
    }
    
    /**
     * Generate default message based on action type
     */
    private function generateDefaultMessage($actionType)
    {
        switch ($actionType) {
            case 'client_approved':
                return "Client approved your task '{$this->task->name}' in project '{$this->project->name}'";
            case 'client_uploaded':
                return "Client uploaded documents for your task '{$this->task->name}' in project '{$this->project->name}'";
            case 'client_replied':
                return "Client replied to your task '{$this->task->name}' in project '{$this->project->name}'";
            case 'client_returned':
                return "Client requested revision for your task '{$this->task->name}' in project '{$this->project->name}'";
            case 'company_approved':
                return "Your task '{$this->task->name}' has been approved and forwarded to the next level";
            case 'company_rejected':
                return "Your task '{$this->task->name}' has been rejected and needs revision";
            case 'task_completed':
                return "Your task '{$this->task->name}' has been fully approved and completed";
            default:
                return "There has been an update on your task '{$this->task->name}' in project '{$this->project->name}'";
        }
    }
    
    /**
     * Save notifications to database for each worker user
     */
    private function saveNotificationsToDatabase()
    {
        foreach ($this->workerUserIds as $userId) {
            \App\Models\Notification::createWorkerTaskNotification(
                $userId,
                $this->task->name,
                $this->project->name,
                $this->task->id,
                $this->project->id,
                $this->actionType,
                $this->message
            );
            
            Log::info('💾 Saved worker notification to database', [
                'user_id' => $userId,
                'task_id' => $this->task->id,
                'project_id' => $this->project->id,
                'action_type' => $this->actionType
            ]);
        }
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        
        Log::info('🎯 Worker notification broadcastOn called - creating channels for users', [
            'worker_user_ids' => $this->workerUserIds
        ]);
        
        // Broadcast to each worker user's private channel
        foreach ($this->workerUserIds as $userId) {
            $channelName = "user.{$userId}";
            $channels[] = new PrivateChannel($channelName);
            Log::info('📡 Created private channel for worker', ['channel' => $channelName]);
        }
        
        Log::info('🎉 Worker notification broadcastOn returning channels', ['channel_count' => count($channels)]);
        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'NewWorkerTaskNotification';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $broadcastData = [
            'message' => $this->message,
            'action_type' => $this->actionType,
            'task' => [
                'id' => $this->task->id,
                'name' => $this->task->name,
                'project' => [
                    'id' => $this->project->id,
                    'name' => $this->project->name,
                ]
            ],
            'timestamp' => now()->toISOString(),
        ];
        
        Log::info('📤 Worker notification broadcastWith called - preparing broadcast data', $broadcastData);
        
        return $broadcastData;
    }
}
