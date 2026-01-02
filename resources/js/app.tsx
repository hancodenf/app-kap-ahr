import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeCsrfToken, refreshCsrfToken } from './utils/csrf';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize CSRF token on app load
initializeCsrfToken();

// Refresh CSRF token before every Inertia request
router.on('before', () => {
    refreshCsrfToken();
});

// Prevent browser back to cached pages
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
