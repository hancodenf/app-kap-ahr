import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Notification {
    id: string;
    title: string;
    message: string;
    url?: string;
    type: 'client_task' | 'assignment' | 'activity';
    created_at: string;
    read_at?: string | null;
}

const ClientWebSocketNotifications: React.FC<{ className?: string }> = ({ className = "" }) => {
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
        if (!notification.read_at) {
            try {
                await fetch(`/api/notifications/${notification.id}/mark-read`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                });
                
                // Update local state
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === notification.id 
                            ? { ...n, read_at: new Date().toISOString() }
                            : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                
                // Notify other components
                window.dispatchEvent(new CustomEvent('notification-updated'));
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        // Close dropdown
        setIsOpen(false);
        
        // Navigate to URL if provided
        if (notification.url) {
            router.visit(notification.url);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                // Update all notifications to read
                setNotifications(prev => 
                    prev.map(notification => ({
                        ...notification,
                        read_at: notification.read_at || new Date().toISOString()
                    }))
                );
                setUnreadCount(0);
                
                // Notify other components
                window.dispatchEvent(new CustomEvent('notification-updated'));
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // WebSocket integration for real-time notifications
    useEffect(() => {
        console.log('🔍 Client WebSocket useEffect triggered with:', {
            hasEcho: !!window.Echo,
            userId: auth.user.id,
            userRole: auth.user.role
        });
        
        // Only setup WebSocket for client users
        if (auth.user.role === 'client' && window.Echo) {
            console.log('✅ Setting up WebSocket listener for client task notifications...');
            console.log('👤 Current client user ID:', auth.user.id);
            
            const echo = window.Echo;
            
            // Listen to private channel for client task notifications
            const channelName = `user.${auth.user.id}`;
            console.log('🔊 Subscribing to client channel:', channelName);
            const channel = echo.private(channelName);
            
            // Test connection
            channel.subscribed(() => {
                console.log('🎯 Successfully subscribed to client channel:', channelName);
            });
            
            // Listen for client task notifications
            channel.listen('.NewClientTaskNotification', (event: any) => {
                console.log('🔔 New client task notification received:', event);
                
                // Show toast notification
                if (typeof window !== 'undefined' && (window as any).toast) {
                    (window as any).toast.success(
                        `📋 ${event.message}`,
                        {
                            position: "top-right",
                            duration: 8000,
                        }
                    );
                } else {
                    console.log('📋 New task notification:', event.message);
                }
                
                // Refresh notifications to update UI
                setTimeout(() => {
                    fetchNotifications();
                }, 500); // Small delay to ensure database is updated
            });

            // Listen for project document request notifications
            channel.listen('.NewProjectDocumentRequest', (event: any) => {
                console.log('📄 New project document request received:', event);
                
                // Show toast notification
                if (typeof window !== 'undefined' && (window as any).toast) {
                    (window as any).toast.info(
                        `📄 ${event.message}`,
                        {
                            position: "top-right",
                            duration: 8000,
                        }
                    );
                } else {
                    console.log('📄 New document request:', event.message);
                }
                
                // Refresh notifications to update UI
                setTimeout(() => {
                    fetchNotifications();
                }, 500); // Small delay to ensure database is updated
            });
            
            // ALSO listen to ANY event for debugging
            channel.listen('.', (event: any) => {
                console.log('🎧 RECEIVED ANY CLIENT EVENT:', event);
            });
            
            // Add error handling for channel
            channel.error((error: any) => {
                console.error('💥 Client WebSocket channel error:', error);
            });
            
            console.log('🎉 Client WebSocket listener setup complete');
            
            // Cleanup on unmount
            return () => {
                console.log('🧹 Cleaning up client WebSocket listener...');
                channel.stopListening('.NewClientTaskNotification');
                channel.stopListening('.NewProjectDocumentRequest');
            };
        } else {
            if (auth.user.role !== 'client') {
                console.log('⚠️ Not a client user, WebSocket listener not set up');
            } else if (!window.Echo) {
                console.log('⚠️ Echo not available, client WebSocket listener not set up');
            }
        }
    }, [auth.user.id, auth.user.role]);

    return (
        <div className={`relative ${className}`}>
            {/* Notification Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
                        {/* Header */}
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-900">
                                📋 Task Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    📭 No notifications yet
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            !notification.read_at ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.read_at ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {!notification.read_at && (
                                                <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.visit('/client/notifications'); // Navigate to notifications page if exists
                                    }}
                                    className="w-full text-center text-xs text-gray-600 hover:text-gray-800 font-medium"
                                >
                                    📋 View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientWebSocketNotifications;
