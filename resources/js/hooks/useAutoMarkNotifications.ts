import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface UseAutoMarkNotificationsProps {
    type: 'project_approval' | 'task_approval';
    project_id?: string;
    task_id?: string;
    enabled?: boolean;
}

export const useAutoMarkNotifications = ({
    type,
    project_id,
    task_id,
    enabled = true
}: UseAutoMarkNotificationsProps) => {
    const { auth } = usePage().props as any;

    useEffect(() => {
        if (!enabled || !auth.user) return;

        const autoMarkNotifications = async () => {
            console.log('🔔 Auto-mark notifications called with:', { type, project_id, task_id });
            
            try {
                const response = await fetch('/api/notifications/auto-mark', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify({
                        type,
                        project_id,
                        task_id,
                    }),
                });

                console.log('🔔 Auto-mark response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('🔔 Auto-mark response data:', data);
                    if (data.marked_count > 0) {
                        console.log(`🔔 Auto-marked ${data.marked_count} notifications as read`);
                        
                        // Trigger a refresh of notification count in other components
                        window.dispatchEvent(new CustomEvent('notification-updated'));
                    } else {
                        console.log('🔔 No notifications were marked as read');
                    }
                } else {
                    console.error('🔔 Auto-mark failed with status:', response.status);
                    const errorText = await response.text();
                    console.error('🔔 Auto-mark error response:', errorText);
                }
            } catch (error) {
                console.error('🔔 Failed to auto-mark notifications:', error);
            }
        };

        // Auto mark after a short delay to ensure page is fully loaded
        const timer = setTimeout(autoMarkNotifications, 1000);

        return () => clearTimeout(timer);
    }, [type, project_id, task_id, enabled, auth.user]);
};
