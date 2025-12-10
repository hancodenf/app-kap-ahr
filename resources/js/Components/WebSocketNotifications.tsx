import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'approval' | 'assignment' | 'activity';
    created_at: string;
}

const WebSocketNotifications: React.FC<{ className?: string }> = ({ className = "" }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Initialize Echo (WebSocket connection)
        const initializeEcho = async () => {
            if (window.Echo) {
                console.log('Echo initialized, listening for notifications...');
                
                // Listen to private channel for current user
                window.Echo.private(`user.${window.Laravel.user.id}`)
                    .listen('NewApprovalNotification', (data: any) => {
                        console.log('New approval notification:', data);
                        
                        const newNotification: Notification = {
                            id: Date.now().toString(),
                            title: 'New Approval Required',
                            message: data.message || 'You have a new task that requires approval',
                            type: 'approval',
                            created_at: new Date().toISOString()
                        };
                        
                        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
                        setUnreadCount(prev => prev + 1);
                        
                        // Show browser notification if permitted
                        if (Notification.permission === 'granted') {
                            new Notification(newNotification.title, {
                                body: newNotification.message,
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
                console.warn('Echo not available, falling back to polling');
            }
        };

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        initializeEcho();

        // Cleanup on unmount
        return () => {
            if (window.Echo) {
                window.Echo.leave(`user.${window.Laravel.user.id}`);
            }
        };
    }, []);

    const markAsRead = () => {
        setUnreadCount(0);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            markAsRead();
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
                                <div key={notification.id} className="p-4 border-b hover:bg-gray-50">
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                            notification.type === 'approval' ? 'bg-orange-500' :
                                            notification.type === 'assignment' ? 'bg-blue-500' : 'bg-green-500'
                                        }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="p-3 border-t bg-gray-50">
                            <button 
                                onClick={() => setNotifications([])}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Clear all notifications
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
