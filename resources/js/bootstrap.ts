import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

try {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
    
    // Debug: Log all WebSocket events
    if (window.Echo.connector && window.Echo.connector.pusher && window.Echo.connector.pusher.connection) {
        const connection = window.Echo.connector.pusher.connection;
        
        connection.bind_global((event: string, data: any) => {
            // WebSocket event received
        });
        
        connection.bind('connected', () => {
            // WebSocket connected
        });
        
        connection.bind('disconnected', () => {
            // WebSocket disconnected
        });
        
        connection.bind('error', (error: any) => {
            console.error('WebSocket error:', error);
        });
        
        connection.bind('message', (message: any) => {
            // WebSocket message received
        });
    }
    
} catch (error) {
    console.error('Failed to initialize Echo:', error);
}
