<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return $user->id === $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    Log::info('🔐 Channel authentication attempt', [
        'channel' => "user.{$id}",
        'user_id' => $user->id,
        'expected_id' => $id,
        'match' => $user->id === $id
    ]);
    return $user->id === $id;
});
