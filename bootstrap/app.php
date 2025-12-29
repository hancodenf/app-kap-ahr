<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'security.unlock' => \App\Http\Middleware\SecurityUnlockMiddleware::class,
            'no.cache' => \App\Http\Middleware\NoCacheMiddleware::class,
            'can.manage.task.assignments' => \App\Http\Middleware\CanManageTaskAssignments::class,
        ]);

        // Exclude these routes from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'company/client-documents/parse-excel',
            'api/notifications/auto-mark',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
