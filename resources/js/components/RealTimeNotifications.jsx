import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, X, Eye } from 'lucide-react';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';

const RealTimeNotifications = ({ className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('approvals');

    const { updates, markAsSeen, isPolling } = useRealTimeUpdates({
        pollingInterval: 5000,
        enableNotifications: true,
        enableSound: false
    });

    const getTotalCount = () => {
        return updates.counts.pending_approvals + 
               updates.counts.new_assignments + 
               updates.counts.recent_activities;
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUrgencyBadge = (urgency) => {
        const badges = {
            'overdue': 'bg-red-100 text-red-800 border-red-200',
            'urgent': 'bg-orange-100 text-orange-800 border-orange-200',
            'high': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'normal': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return badges[urgency] || badges.normal;
    };

    const renderApprovals = () => (
        <div className="space-y-3">
            {updates.approvals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8" />
                    <p>Tidak ada approval yang pending</p>
                </div>
            ) : (
                updates.approvals.map((approval) => (
                    <div key={approval.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{approval.name}</h4>
                                <p className="text-sm text-gray-600">{approval.project_name}</p>
                                <p className="text-sm text-gray-500">{approval.client_name}</p>
                                
                                <div className="flex items-center mt-2 space-x-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {approval.current_status}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded border ${getUrgencyBadge(approval.urgency)}`}>
                                        {approval.urgency === 'overdue' ? 'Terlambat' : 
                                         approval.urgency === 'urgent' ? 'Mendesak' :
                                         approval.urgency === 'high' ? 'Prioritas Tinggi' : 'Normal'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <p className="text-xs text-gray-500">{formatTime(approval.updated_at)}</p>
                                {approval.due_date && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Due: {new Date(approval.due_date).toLocaleDateString('id-ID')}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-3 flex space-x-2">
                            <button
                                onClick={() => window.location.href = `/company/tasks/${approval.id}`}
                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                            >
                                Review
                            </button>
                            <button
                                onClick={() => window.location.href = `/company/projects/${approval.project_id || ''}`}
                                className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                            >
                                Lihat Project
                            </button>
                        </div>
                    </div>
                ))
            )}
            
            {updates.approvals.length > 0 && (
                <button
                    onClick={() => markAsSeen('approvals')}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center py-2"
                >
                    <Eye className="h-4 w-4 mr-1" />
                    Tandai semua sudah dilihat
                </button>
            )}
        </div>
    );

    const renderAssignments = () => (
        <div className="space-y-3">
            {updates.assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto mb-2 h-8 w-8" />
                    <p>Tidak ada assignment baru</p>
                </div>
            ) : (
                updates.assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{assignment.name}</h4>
                                <p className="text-sm text-gray-600">{assignment.project_name}</p>
                                
                                <div className="flex items-center mt-2 space-x-2">
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {assignment.role_in_task}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <p className="text-xs text-gray-500">{formatTime(assignment.assigned_at)}</p>
                            </div>
                        </div>
                        
                        <div className="mt-3">
                            <button
                                onClick={() => window.location.href = `/company/tasks/${assignment.id}`}
                                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                            >
                                Mulai Kerja
                            </button>
                        </div>
                    </div>
                ))
            )}
            
            {updates.assignments.length > 0 && (
                <button
                    onClick={() => markAsSeen('assignments')}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center py-2"
                >
                    <Eye className="h-4 w-4 mr-1" />
                    Tandai semua sudah dilihat
                </button>
            )}
        </div>
    );

    const renderActivities = () => (
        <div className="space-y-3">
            {updates.activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
                    <p>Tidak ada aktivitas terbaru</p>
                </div>
            ) : (
                updates.activities.map((activity) => (
                    <div key={activity.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">{activity.description}</p>
                                <div className="flex items-center mt-1 space-x-2">
                                    <span className="text-xs text-gray-500">{activity.user_name}</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">{activity.user_role}</span>
                                    {activity.is_important && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            Penting
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <p className="text-xs text-gray-500">{formatTime(activity.created_at)}</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
            
            {updates.activities.length > 0 && (
                <button
                    onClick={() => markAsSeen('activities')}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center py-2"
                >
                    <Eye className="h-4 w-4 mr-1" />
                    Tandai semua sudah dilihat
                </button>
            )}
        </div>
    );

    return (
        <div className={`relative ${className}`}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Bell className={`h-6 w-6 ${isPolling ? 'animate-pulse text-blue-500' : 'text-gray-600'}`} />
                
                {/* Badge for total count */}
                {getTotalCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getTotalCount() > 9 ? '9+' : getTotalCount()}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notifikasi Real-time</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('approvals')}
                            className={`flex-1 px-4 py-2 text-sm font-medium ${
                                activeTab === 'approvals'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Approvals
                            {updates.counts.pending_approvals > 0 && (
                                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-2">
                                    {updates.counts.pending_approvals}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`flex-1 px-4 py-2 text-sm font-medium ${
                                activeTab === 'assignments'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Tasks
                            {updates.counts.new_assignments > 0 && (
                                <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-2">
                                    {updates.counts.new_assignments}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('activities')}
                            className={`flex-1 px-4 py-2 text-sm font-medium ${
                                activeTab === 'activities'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Aktivitas
                            {updates.counts.recent_activities > 0 && (
                                <span className="ml-1 bg-gray-500 text-white text-xs rounded-full px-2">
                                    {updates.counts.recent_activities}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto p-4">
                        {activeTab === 'approvals' && renderApprovals()}
                        {activeTab === 'assignments' && renderAssignments()}
                        {activeTab === 'activities' && renderActivities()}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-500">
                            {updates.lastUpdated 
                                ? `Terakhir update: ${formatTime(updates.lastUpdated)}` 
                                : 'Memuat updates...'
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimeNotifications;
