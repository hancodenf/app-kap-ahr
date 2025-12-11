import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Notification {
    id: string;
    title: string;
    message: string;
    url?: string;
    type: 'approval' | 'assignment' | 'activity';
    created_at: string;
    read_at?: string | null;
}

const WebSocketNotifications: React.FC<{ className?: string }> = ({ className = "" }) => {
    const { auth } = usePage<PageProps>().props;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications from database on mount
    useEffect(() => {
        fetchNotifications();
        
        // Listen for notification updates from other components
        const handleNotificationUpdate = () => {
            fetchNotifications();
        };
        
        window.addEventListener('notification-updated', handleNotificationUpdate);
        
        return () => {
            window.removeEventListener('notification-updated', handleNotificationUpdate);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read first
        await markAsRead(notification.id);
        
        // Navigate to the URL if available
        if (notification.url) {
            router.visit(notification.url);
        }
        
        // Close dropdown
        setIsOpen(false);
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev => 
                prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    useEffect(() => {
        // Initialize Echo (WebSocket connection) with retry mechanism
        const initializeEcho = async () => {
            let retryCount = 0;
            const maxRetries = 5;
            
            const tryInitialize = () => {
                console.log('Trying to initialize Echo...', {
                    'window.Echo exists': !!window.Echo,
                    'auth.user exists': !!auth.user,
                    'auth.user.id': auth.user?.id
                });
                
                if (window.Echo && auth.user?.id) {
                    console.log('Echo initialized, listening for notifications...');
                    
                    // Listen to private channel for current user (using new format)
                    window.Echo.private(`user.${auth.user.id}`)
                        .listen('.NewApprovalNotification', (data: any) => {
                        console.log('🔔 Bell notification - New approval notification:', data);
                        
                        // Refresh notifications from database to get the persistent version
                        fetchNotifications();
                        
                        // Show browser notification if permitted
                        if (Notification.permission === 'granted') {
                            new Notification('New Approval Required', {
                                body: data.message || 'You have a new task that requires approval',
                                icon: '/favicon.ico'
                            });
                        }
                    })
                    .listen('TaskAssigned', (data: any) => {
                        console.log('Task assigned:', data);
                        
                        const newNotification: Notification = {
                            id: Date.now().toString(),
                            title: 'New Task Assigned',
                            message: data.message || 'You have been assigned a new task',
                            type: 'assignment',
                            created_at: new Date().toISOString()
                        };
                        
                        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
                        setUnreadCount(prev => prev + 1);
                    });
                } else {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`Echo not ready, retrying... (${retryCount}/${maxRetries})`);
                        setTimeout(tryInitialize, 1000);
                    } else {
                        console.warn('Echo not available after retries, falling back to polling');
                    }
                }
            };
            
            tryInitialize();
        };

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        initializeEcho();

        // Cleanup on unmount
        return () => {
            if (window.Echo && auth.user?.id) {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            }
        };
    }, []);

    const resetUnreadCount = () => {
        setUnreadCount(0);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            resetUnreadCount();
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Bell Icon */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                        !notification.read_at ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                            notification.type === 'approval' ? 'bg-orange-500' :
                                            notification.type === 'assignment' ? 'bg-blue-500' : 'bg-green-500'
                                        }`} />
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${!notification.read_at ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title}
                                            </p>
                                            <p className={`text-sm mt-1 ${!notification.read_at ? 'text-gray-700' : 'text-gray-500'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read_at && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="p-3 border-t bg-gray-50">
                            <button 
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Overlay to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default WebSocketNotifications;
