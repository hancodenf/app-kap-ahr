<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewApprovalNotification implements ShouldBroadcast
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
            $channels[] = new PrivateChannel("user.{$userId}");
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
        return [
            'message' => $this->message,
            'task_id' => $this->task->id,
            'task_name' => $this->task->name,
            'project_name' => $this->task->project_name,
            'timestamp' => now()->toISOString(),
        ];
    }
}
