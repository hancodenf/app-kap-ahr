<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewApprovalNotification implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $approverUserIds;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct($task, $approverUserIds, $message = null)
    {
        $this->task = $task;
        $this->approverUserIds = $approverUserIds;
        $this->message = $message ?? "New task '{$task->name}' requires your approval";
        
        // Save notifications to database for persistence
        $this->saveNotificationsToDatabase();
    }
    
    /**
     * Save notifications to database for each approver
     */
    private function saveNotificationsToDatabase()
    {
        foreach ($this->approverUserIds as $userId) {
            \App\Models\Notification::createApprovalNotification(
                $userId,
                $this->task->name,
                $this->task->project->name,
                $this->task->id,
                $this->task->project->id
            );
            
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
        
        // Broadcast to each approver's private channel
        foreach ($this->approverUserIds as $userId) {
            $channelName = "user.{$userId}";
            $channels[] = new PrivateChannel($channelName);
        }
        
        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'NewApprovalNotification';
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
                    'id' => $this->task->project->id,
                    'name' => $this->task->project->name,
                ]
            ],
            'timestamp' => now()->toISOString(),
        ];
        
        
        return $broadcastData;
    }
}
