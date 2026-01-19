import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { getFreshCsrfToken } from '@/utils/csrf';

interface UseAutoMarkNotificationsProps {
    type: 'project_approval' | 'task_approval' | 'project_document_request';
    project_id?: string;
    task_id?: string;
    relatedId?: string; // Generic ID for flexible matching
    enabled?: boolean;
}

export const useAutoMarkNotifications = ({
    type,
    project_id,
    task_id,
    relatedId,
    enabled = true
}: UseAutoMarkNotificationsProps) => {
    const { auth } = usePage().props as any;

        type,
        project_id,
        task_id,
        relatedId,
        enabled,
        hasUser: !!auth.user
    });

    useEffect(() => {
        
        if (!enabled || !auth.user) {
            return;
        }

        const autoMarkNotifications = async () => {
            
            try {
                // Get fresh CSRF token from server
                const csrfToken = await getFreshCsrfToken();

                const response = await fetch('/api/notifications/auto-mark', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        type,
                        project_id: project_id || relatedId, // Use relatedId as fallback for project_id
                        task_id,
                    }),
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.marked_count > 0) {
                        
                        // Trigger a refresh of notification count in other components
                        window.dispatchEvent(new CustomEvent('notification-updated'));
                    }
                } else if (response.status === 419) {
                    // Session expired - silently skip, will work after page reload
                    console.debug('🔔 Auto-mark skipped: Session not ready. Will work after page reload.');
                } else {
                    console.warn('🔔 Auto-mark failed with status:', response.status);
                }
            } catch (error) {
                // Silently catch network errors on first load
                console.debug('🔔 Auto-mark network error (expected on first load):', error);
            }
        };

        // Auto mark after a short delay to ensure page is fully loaded
        const timer = setTimeout(autoMarkNotifications, 1000);

        return () => clearTimeout(timer);
    }, [type, project_id, task_id, relatedId, enabled, auth.user]);
};
