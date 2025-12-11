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

console.log('Bootstrap.ts loading...');
console.log('Environment variables:', {
    VITE_REVERB_APP_KEY: import.meta.env.VITE_REVERB_APP_KEY,
    VITE_REVERB_HOST: import.meta.env.VITE_REVERB_HOST,
    VITE_REVERB_PORT: import.meta.env.VITE_REVERB_PORT,
    VITE_REVERB_SCHEME: import.meta.env.VITE_REVERB_SCHEME,
});

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
    
    console.log('Echo initialized successfully:', window.Echo);
    
    // Debug: Log all WebSocket events
    if (window.Echo.connector && window.Echo.connector.pusher && window.Echo.connector.pusher.connection) {
        console.log('🔌 Adding WebSocket debug listeners...');
        
        const connection = window.Echo.connector.pusher.connection;
        
        connection.bind_global((event: string, data: any) => {
            console.log('🔍 RAW WEBSOCKET EVENT:', event, data);
        });
        
        connection.bind('connected', () => {
            console.log('✅ WebSocket connected successfully');
        });
        
        connection.bind('disconnected', () => {
            console.log('❌ WebSocket disconnected');
        });
        
        connection.bind('error', (error: any) => {
            console.log('🚨 WebSocket error:', error);
        });
        
        connection.bind('message', (message: any) => {
            console.log('📨 WebSocket raw message:', message);
        });
    }
    
} catch (error) {
    console.error('Failed to initialize Echo:', error);
}
