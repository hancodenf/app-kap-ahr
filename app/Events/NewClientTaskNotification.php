<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NewClientTaskNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $project;
    public $clientUserIds;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct($task, $project, $clientUserIds, $message = null)
    {
        Log::info('🔥 NewClientTaskNotification constructor called', [
            'task_id' => $task->id ?? 'N/A',
            'task_name' => $task->name ?? 'N/A',
            'project_id' => $project->id ?? 'N/A',
            'project_name' => $project->name ?? 'N/A',
            'client_user_ids' => $clientUserIds,
            'message' => $message
        ]);
        
        $this->task = $task;
        $this->project = $project;
        $this->clientUserIds = $clientUserIds;
        $this->message = $message ?? "New task '{$task->name}' has been submitted for your review";
        
        // Save notifications to database for persistence
        $this->saveNotificationsToDatabase();
    }
    
    /**
     * Save notifications to database for each client user
     */
    private function saveNotificationsToDatabase()
    {
        foreach ($this->clientUserIds as $userId) {
            \App\Models\Notification::createClientTaskNotification(
                $userId,
                $this->task->name,
                $this->project->name,
                $this->task->id,
                $this->project->id
            );
            
            Log::info('💾 Saved client notification to database', [
                'user_id' => $userId,
                'task_id' => $this->task->id,
                'project_id' => $this->project->id
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
        
        Log::info('🎯 Client notification broadcastOn called - creating channels for users', [
            'client_user_ids' => $this->clientUserIds
        ]);
        
        // Broadcast to each client user's private channel
        foreach ($this->clientUserIds as $userId) {
            $channelName = "user.{$userId}";
            $channels[] = new PrivateChannel($channelName);
            Log::info('📡 Created private channel for client', ['channel' => $channelName]);
        }
        
        Log::info('🎉 Client notification broadcastOn returning channels', ['channel_count' => count($channels)]);
        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'NewClientTaskNotification';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $broadcastData = [
            'message' => $this->message,
            'task' => [
                'id' => $this->task->id,
                'name' => $this->task->name,
                'project' => [
                    'id' => $this->project->id,
                    'name' => $this->project->name,
                ]
            ],
            'url' => "/klien/tasks/{$this->task->id}",
            'timestamp' => now()->toISOString(),
        ];
        
        Log::info('📤 Client notification broadcastWith called - preparing broadcast data', $broadcastData);
        
        return $broadcastData;
    }
}
