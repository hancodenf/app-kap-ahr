<?php

namespace App\Observers;

use App\Models\Client;
use Illuminate\Support\Facades\File;

class ClientObserver
{
    /**
     * Handle the Client "created" event.
     */
    public function created(Client $client): void
    {
        // Create directory for this client
        $directory = $client->getFullStoragePath();
        
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }
    }

    /**
     * Handle the Client "deleted" event.
     */
    public function deleted(Client $client): void
    {
        // Optionally delete client directory when client is deleted
        // Uncomment if you want to auto-delete directories
        // $directory = $client->getFullStoragePath();
        // 
        // if (File::exists($directory)) {
        //     File::deleteDirectory($directory);
        // }
    }
}
