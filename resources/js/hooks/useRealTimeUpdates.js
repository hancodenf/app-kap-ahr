import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Hook untuk real-time updates menggunakan smart polling
export const useRealTimeUpdates = (options = {}) => {
    const {
        pollingInterval = 30000, // 30 seconds default - reduced frequency
        enableNotifications = false, // Default disabled
        enableSound = false,
        onUpdate = null
    } = options;

    const [updates, setUpdates] = useState({
        approvals: [],
        assignments: [],
        activities: [],
        counts: {
            pending_approvals: 0,
            new_assignments: 0,
            recent_activities: 0
        },
        lastUpdated: null,
        isPolling: false
    });

    const [lastCheck, setLastCheck] = useState(Math.floor(Date.now() / 1000));
    const [isVisible, setIsVisible] = useState(true);

    // Handle page visibility untuk pause polling ketika tab tidak aktif
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Function untuk fetch updates dari server
    const fetchUpdates = useCallback(async () => {
        if (!isVisible) return; // Don't poll when tab is not active

        try {
            setUpdates(prev => ({ ...prev, isPolling: true }));

            const response = await fetch(`/api/realtime/updates?since=${lastCheck}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.hasUpdates) {
                const newUpdates = {
                    approvals: data.approvals || [],
                    assignments: data.assignments || [],
                    activities: data.activities || [],
                    counts: data.counts || {},
                    lastUpdated: new Date(),
                    isPolling: false
                };

                setUpdates(prev => ({
                    ...newUpdates,
                    // Merge dengan data sebelumnya untuk keep history
                    approvals: [...(data.approvals || []), ...prev.approvals.slice(0, 20)],
                    assignments: [...(data.assignments || []), ...prev.assignments.slice(0, 10)],
                    activities: [...(data.activities || []), ...prev.activities.slice(0, 15)]
                }));

                // Show notifications (only if explicitly enabled and new data)
                if (enableNotifications && data.hasUpdates && data.counts) {
                    const totalNewItems = (data.counts.pending_approvals || 0) + 
                                         (data.counts.new_assignments || 0) + 
                                         (data.counts.recent_activities || 0);
                    
                    if (totalNewItems > 0) {
                        showNotifications(data);
                    }
                }

                // Play notification sound
                if (enableSound) {
                    playNotificationSound();
                }

                // Call custom update handler
                if (onUpdate) {
                    onUpdate(data);
                }

                setLastCheck(data.timestamp);
            } else {
                setUpdates(prev => ({ ...prev, isPolling: false }));
            }

        } catch (error) {
            console.error('Failed to fetch real-time updates:', error);
            setUpdates(prev => ({ ...prev, isPolling: false }));
            
            // Show error toast only if it's not a network error during page visibility change
            // if (isVisible) {
            //     toast.error('Gagal memuat update terbaru');
            // }
        }
    }, [lastCheck, isVisible, enableNotifications, enableSound, onUpdate]);

    // Show different types of notifications
    const showNotifications = (data) => {
        const { approvals, assignments, activities, counts } = data;

        // Approval notifications
        if (counts.pending_approvals > 0) {
            toast(
                `🔔 ${counts.pending_approvals} approval baru menunggu persetujuan Anda`,
                {
                    icon: '⚠️',
                    duration: 8000,
                    style: {
                        borderLeft: '4px solid #f59e0b'
                    },
                    position: 'top-right',
                }
            );
        }

        // Assignment notifications
        if (counts.new_assignments > 0) {
            toast.success(
                `✅ ${counts.new_assignments} task baru telah di-assign ke Anda`,
                {
                    duration: 6000,
                    position: 'top-right',
                }
            );
        }

        // Important activity notifications
        const importantActivities = activities.filter(activity => activity.is_important);
        if (importantActivities.length > 0) {
            importantActivities.forEach(activity => {
                const message = `${getActivityIcon(activity.action_type)} ${activity.description}`;
                toast(message, {
                    icon: 'ℹ️',
                    duration: 5000,
                    position: 'top-right',
                });
            });
        }
    };

    // Get icon for different activity types
    const getActivityIcon = (actionType) => {
        const icons = {
            'Task Approved': '✅',
            'Task Rejected': '❌',
            'Task Completed': '🎉',
            'Task Assigned': '📋',
            'Project Updated': '📝',
            'Client Upload': '📁'
        };
        return icons[actionType] || '📌';
    };

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/notification.mp3'); // You'll need to add this sound file
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Sound play failed:', e));
        } catch (error) {
            console.log('Notification sound not available');
        }
    };

    // Mark updates as seen
    const markAsSeen = useCallback(async (type) => {
        try {
            await fetch('/api/realtime/mark-seen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({ type }),
                credentials: 'same-origin'
            });

            // Clear the specific type from updates
            setUpdates(prev => ({
                ...prev,
                [type]: [],
                counts: {
                    ...prev.counts,
                    [`${type === 'approvals' ? 'pending_approvals' : type === 'assignments' ? 'new_assignments' : 'recent_activities'}`]: 0
                }
            }));

        } catch (error) {
            console.error('Failed to mark updates as seen:', error);
        }
    }, []);

    // Start polling
    useEffect(() => {
        if (!isVisible) return;

        // Initial fetch
        fetchUpdates();

        // Set up polling interval
        const interval = setInterval(fetchUpdates, pollingInterval);

        return () => {
            clearInterval(interval);
        };
    }, [fetchUpdates, pollingInterval, isVisible]);

    // Refresh updates manually
    const refreshUpdates = useCallback(() => {
        setLastCheck(Math.floor(Date.now() / 1000) - 300); // Get last 5 minutes
        fetchUpdates();
    }, [fetchUpdates]);

    return {
        updates,
        refreshUpdates,
        markAsSeen,
        isPolling: updates.isPolling
    };
};

// Hook untuk dashboard summary
export const useRealTimeDashboard = (pollingInterval = 10000) => {
    const [summary, setSummary] = useState({
        pending_approvals: 0,
        active_assignments: 0,
        completed_today: 0,
        overdue_tasks: 0,
        recent_activities: 0,
        projects_count: 0,
        last_updated: null,
        isLoading: true
    });

    const fetchSummary = useCallback(async () => {
        try {
            const response = await fetch('/api/realtime/dashboard-summary', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                setSummary(prev => ({
                    ...data,
                    isLoading: false
                }));
            }
        } catch (error) {
            console.error('Failed to fetch dashboard summary:', error);
            setSummary(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        fetchSummary();
        const interval = setInterval(fetchSummary, pollingInterval);

        return () => {
            clearInterval(interval);
        };
    }, [fetchSummary, pollingInterval]);

    return {
        summary,
        refreshSummary: fetchSummary
    };
};

// Hook for urgency badge colors
export const useUrgencyColor = (urgency) => {
    const colors = {
        'overdue': 'bg-red-500 text-white',
        'urgent': 'bg-orange-500 text-white',
        'high': 'bg-yellow-500 text-black',
        'normal': 'bg-gray-200 text-gray-800'
    };
    return colors[urgency] || colors.normal;
};
