<?php

namespace App\Events;

use App\Models\ProjectDocumentRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewProjectDocumentRequest implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $documentRequest;
    public $clientUserIds;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(ProjectDocumentRequest $documentRequest, array $clientUserIds, string $message = null)
    {
        $this->documentRequest = $documentRequest;
        $this->clientUserIds = $clientUserIds;
        $this->message = $message ?? "New document request: {$documentRequest->document_name}";
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        
        // Broadcast to all client users
        foreach ($this->clientUserIds as $userId) {
            $channels[] = new PrivateChannel('user.' . $userId);
        }
        
        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'NewProjectDocumentRequest';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'document_request' => [
                'id' => $this->documentRequest->id,
                'document_name' => $this->documentRequest->document_name,
                'description' => $this->documentRequest->description,
                'requested_by_name' => $this->documentRequest->requested_by_name,
                'requested_by_role' => $this->documentRequest->requested_by_role,
                'status' => $this->documentRequest->status,
                'created_at' => $this->documentRequest->created_at?->toISOString(),
            ],
            'project' => [
                'id' => $this->documentRequest->project_id,
                'name' => $this->documentRequest->project->name ?? null,
            ],
            'message' => $this->message,
            'type' => 'project_document_request',
        ];
    }
}
