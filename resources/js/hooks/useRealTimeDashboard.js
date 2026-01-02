import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Hook untuk dashboard summary dengan real-time updates
export const useRealTimeDashboard = (pollingInterval = 10000) => { // 10 detik untuk dashboard
    const [dashboardData, setDashboardData] = useState({
        summary: {
            total_projects: 0,
            pending_approvals: 0,
            ongoing_tasks: 0,
            completed_this_week: 0,
            urgent_tasks: 0,
            overdue_tasks: 0
        },
        isLoading: true,
        lastUpdated: null,
        error: null
    });

    const [isPolling, setIsPolling] = useState(true);

    // Function untuk fetch dashboard summary
    const fetchDashboardSummary = useCallback(async () => {
        try {
            const response = await fetch('/api/realtime/dashboard-summary', {
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

            setDashboardData(prev => ({
                ...prev,
                summary: data.summary || {},
                isLoading: false,
                lastUpdated: new Date(),
                error: null
            }));

        } catch (error) {
            console.error('Failed to fetch dashboard summary:', error);
            setDashboardData(prev => ({
                ...prev,
                isLoading: false,
                error: error.message
            }));

            // Show error toast
            if (document.visibilityState === 'visible') {
                toast.error('Gagal memuat ringkasan dashboard');
            }
        }
    }, []);

    // Setup polling effect
    useEffect(() => {
        if (!isPolling) return;

        // Initial fetch
        fetchDashboardSummary();

        // Setup interval
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchDashboardSummary();
            }
        }, pollingInterval);

        return () => clearInterval(interval);
    }, [fetchDashboardSummary, pollingInterval, isPolling]);

    // Pause/resume polling
    const pausePolling = () => setIsPolling(false);
    const resumePolling = () => setIsPolling(true);

    // Manual refresh
    const refreshDashboard = () => {
        fetchDashboardSummary();
    };

    // Check if there are urgent items
    const hasUrgentItems = dashboardData.summary.urgent_tasks > 0 || 
                          dashboardData.summary.overdue_tasks > 0 || 
                          dashboardData.summary.pending_approvals > 5;

    return {
        dashboardData,
        isPolling,
        hasUrgentItems,
        pausePolling,
        resumePolling,
        refreshDashboard,
        fetchDashboardSummary
    };
};

export default useRealTimeDashboard;
