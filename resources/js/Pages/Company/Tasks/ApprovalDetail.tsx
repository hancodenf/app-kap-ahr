import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, FormEventHandler } from 'react';

interface Document {
    id: number;
    name: string;
    file: string;
}

interface ClientDocument {
    id: number;
    name: string;
    description: string | null;
}

interface TaskAssignment {
    id: number;
    time: string | null;
    notes: string | null;
    created_at: string;
    documents: Document[];
    client_documents: ClientDocument[];
}

interface Task {
    id: number;
    name: string;
    slug: string;
    status: string;
    completion_status: string;
    working_step: {
        id: number;
        name: string;
    };
    latest_assignment: TaskAssignment | null;
}

interface Project {
    id: number;
    name: string;
    slug: string;
}

interface Props extends PageProps {
    task: Task;
    project: Project;
}

export default function ApprovalDetail({ auth, task, project }: Props) {
    const [processing, setProcessing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectComment, setRejectComment] = useState('');

    const handleApprove = async () => {
        if (!confirm('Approve this task?')) {
            return;
        }

        setProcessing(true);

        try {
            const response = await fetch(route('company.tasks.approve', task.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Task approved successfully!');
                router.visit(route('company.projects.show', project.id));
            } else {
                alert(data.error || 'Failed to approve task');
            }
        } catch (error) {
            console.error('Error approving task:', error);
            alert('An error occurred while approving the task');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject: FormEventHandler = async (e) => {
        e.preventDefault();

        if (!rejectComment.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setProcessing(true);

        try {
            const response = await fetch(route('company.tasks.reject', task.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    comment: rejectComment,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Task rejected successfully!');
                router.visit(route('company.projects.show', project.id));
            } else {
                alert(data.error || 'Failed to reject task');
            }
        } catch (error) {
            console.error('Error rejecting task:', error);
            alert('An error occurred while rejecting the task');
        } finally {
            setProcessing(false);
            setShowRejectModal(false);
            setRejectComment('');
        }
    };

    const getTaskStatusBadgeClass = (status: string) => {
        if (status.includes('Approved') || status === 'Completed') {
            return 'bg-green-100 text-green-800 border border-green-200';
        } else if (status.includes('Pending') || status.includes('Review')) {
            return 'bg-blue-100 text-blue-800 border border-blue-200';
        } else if (status.includes('Returned') || status.includes('Rejected')) {
            return 'bg-red-100 text-red-800 border border-red-200';
        }
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Approval Request - {task.name}
                    </h2>
                    <button
                        onClick={() => router.visit(route('company.projects.show', project.id))}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Project
                    </button>
                </div>
            }
        >
            <Head title={`Approval - ${task.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Task Header */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <h1 className="text-2xl font-bold text-gray-900 mb-3">{task.name}</h1>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTaskStatusBadgeClass(task.status)}`}>
                                        {task.status}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        {task.working_step.name}
                                    </span>
                                    {task.latest_assignment?.created_at && (
                                        <span className="text-sm text-gray-600">
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {new Date(task.latest_assignment.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Assignment Details */}
                            {task.latest_assignment && (
                                <div className="space-y-6">
                                    {/* Notes */}
                                    {task.latest_assignment.notes && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">📝 Notes from Team Member:</h3>
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-sm text-gray-900 whitespace-pre-line">{task.latest_assignment.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Uploaded Documents */}
                                    {task.latest_assignment.documents.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                                📁 Uploaded Documents ({task.latest_assignment.documents.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {task.latest_assignment.documents.map((doc) => (
                                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                                        <div className="flex items-center space-x-3">
                                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                                                        </div>
                                                        <a
                                                            href={`/storage/${doc.file}`}
                                                            download
                                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-md transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                            Download
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Requested Client Documents */}
                                    {task.latest_assignment.client_documents.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-700 mb-3">
                                                📋 Requested Documents from Client ({task.latest_assignment.client_documents.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {task.latest_assignment.client_documents.map((clientDoc) => (
                                                    <div key={clientDoc.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                        <p className="text-sm font-medium text-gray-900">{clientDoc.name}</p>
                                                        {clientDoc.description && (
                                                            <p className="text-xs text-gray-600 mt-1">{clientDoc.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                                <button
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {processing ? 'Processing...' : 'Approve Task'}
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={processing}
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {processing ? 'Processing...' : 'Reject Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Task</h3>
                        <form onSubmit={handleReject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    value={rejectComment}
                                    onChange={(e) => setRejectComment(e.target.value)}
                                    rows={4}
                                    required
                                    placeholder="Please provide a detailed reason..."
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectComment('');
                                    }}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processing ? 'Rejecting...' : 'Confirm Reject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
