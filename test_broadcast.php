<?php

require_once 'vendor/autoload.php';

// Minimal Laravel bootstrap for testing
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Http\Kernel::class);

echo "Testing direct broadcast...\n";

// Test simple broadcast
try {
    $userId = '019b0afd-6547-7013-91f5-0807fb43b319';
    
    $data = [
        'message' => 'Test notification from PHP script',
        'timestamp' => now()->toISOString(),
        'test' => true,
    ];
    
    // Direct broadcast using Laravel's broadcast helper
    broadcast(new class($data, $userId) implements \Illuminate\Contracts\Broadcasting\ShouldBroadcastNow {
        public $data;
        public $userId;
        
        public function __construct($data, $userId) {
            $this->data = $data;
            $this->userId = $userId;
        }
        
        public function broadcastOn() {
            return new \Illuminate\Broadcasting\PrivateChannel("user.{$this->userId}");
        }
        
        public function broadcastAs() {
            return 'test.notification';
        }
        
        public function broadcastWith() {
            return $this->data;
        }
    });
    
    echo "✅ Direct broadcast sent successfully\n";
    echo "Channel: user.{$userId}\n";
    echo "Event: test.notification\n";
    echo "Data sent: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
