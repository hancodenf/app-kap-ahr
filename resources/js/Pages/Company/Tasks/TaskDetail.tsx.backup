import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState, useEffect } from 'react';

interface Document {
    id: number;
    name: string;
    file: string;
    uploaded_at: string;
}

interface ClientDocument {
    id: number;
    name: string;
    description: string;
    file: string | null;
    uploaded_at: string | null;
}

interface TaskAssignment {
    id: number;
    time: string;
    notes: string | null;
    comment: string | null;
    client_comment: string | null;
    status: string;
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
    client_interact: 'read only' | 'comment' | 'upload';
    multiple_files: boolean;
    can_edit: boolean;
    working_step: {
        id: number;
        name: string;
    };
    latest_assignment: TaskAssignment | null;
    assignments: TaskAssignment[];
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

export default function TaskDetail({ auth, task, project }: Props) {
    const [expandedSubmissions, setExpandedSubmissions] = useState<number[]>(
        task.assignments.length > 0 ? [task.assignments[0].id] : []
    );
    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [reuploadComment, setReuploadComment] = useState('');
    
    const [fileInputs, setFileInputs] = useState<Array<{ 
        id: number; 
        label: string; 
        file: File | null; 
        existingDocId?: number; 
        existingFilePath?: string;
    }>>([{ id: 0, label: '', file: null }]);
    
    const [clientDocInputs, setClientDocInputs] = useState<Array<{ 
        id: number; 
        name: string; 
        description: string;
    }>>([{ id: 0, name: '', description: '' }]);
    
    const [nextFileId, setNextFileId] = useState(1);
    const [nextClientDocId, setNextClientDocId] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm<{
        notes: string;
        files: File[];
        file_labels: string[];
        client_documents: Array<{ name: string; description: string }>;
        existing_document_labels: Array<{ doc_id: number; label: string }>;
        _method?: string;
    }>({
        notes: task.latest_assignment?.notes || '',
        files: [],
        file_labels: [],
        client_documents: [],
        existing_document_labels: [],
        _method: 'PUT',
    });

    const toggleSubmission = (submissionId: number) => {
        setExpandedSubmissions(prev =>
            prev.includes(submissionId)
                ? prev.filter(id => id !== submissionId)
                : [...prev, submissionId]
        );
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Validate: at least one of files or client_documents must be provided
        const hasNewFiles = data.files && data.files.length > 0;
        const hasClientDocs = data.client_documents && data.client_documents.length > 0;
        const hasExistingFiles = fileInputs.some(input => input.existingFilePath);
        
        if (!hasNewFiles && !hasClientDocs && !hasExistingFiles) {
            alert('Please upload at least one file or request at least one document from client.');
            return;
        }

        // Collect existing document labels
        const existingDocLabels = fileInputs
            .filter(input => input.existingDocId && !input.file)
            .map(input => ({
                doc_id: input.existingDocId!,
                label: input.label
            }));
        
        data.existing_document_labels = existingDocLabels;
        data._method = 'PUT';

        post(route('company.tasks.update-status', task.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                alert('Task updated successfully!');
                router.visit(route('company.projects.show', project.id));
            },
        });
    };

    const handleAcceptClientDocuments = async () => {
        if (!confirm('Accept all client documents and mark task as completed?')) {
            return;
        }

        router.post(route('company.tasks.accept-client-documents', task.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Client documents accepted! Task marked as completed.');
                router.visit(route('company.projects.show', project.id));
            },
        });
    };

    const handleRequestReupload = async () => {
        if (!reuploadComment.trim()) {
            alert('Please provide a reason for requesting re-upload');
            return;
        }

        router.post(route('company.tasks.request-reupload', task.id), {
            comment: reuploadComment,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Re-upload request sent to client!');
                setShowReuploadModal(false);
                setReuploadComment('');
                router.visit(route('company.projects.show', project.id));
            },
        });
    };

    const getTaskStatusBadgeClass = (status: string) => {
        if (status.includes('Approved')) {
            return 'bg-green-100 text-green-800 border border-green-200';
        } else if (status.includes('Pending') || status.includes('Waiting')) {
            return 'bg-blue-100 text-blue-800 border border-blue-200';
        } else if (status.includes('Returned') || status.includes('Rejected')) {
            return 'bg-red-100 text-red-800 border border-red-200';
        } else if (status === 'Submitted to Client' || status === 'Client Reply') {
            return 'bg-purple-100 text-purple-800 border border-purple-200';
        } else if (status === 'Submitted') {
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        } else if (status === 'Draft') {
            return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('company.projects.show', project.id)}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block"
                        >
                            ← Back to {project.name}
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {task.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Step: {task.working_step.name}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTaskStatusBadgeClass(task.status)}`}>
                        {task.status}
                    </span>
                </div>
            }
        >
            <Head title={`${task.name} - ${project.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Show form if can_edit, otherwise show history */}
                            {task.can_edit ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {task.assignments.length > 0 ? 'Edit Submission' : 'New Submission'}
                                        </h3>
                                        
                                        {/* Form content here - simplified version */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notes
                                            </label>
                                            <textarea
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                rows={3}
                                                placeholder="Add your notes here..."
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <Link
                                                href={route('company.projects.show', project.id)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Submission History ({task.assignments.length} submission{task.assignments.length > 1 ? 's' : ''})
                                    </h3>
                                    
                                    {/* Submission history display */}
                                    <div className="space-y-3">
                                        {task.assignments.map((assignment, index) => (
                                            <div key={assignment.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                <div 
                                                    className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                                    onClick={() => toggleSubmission(assignment.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    Submission #{task.assignments.length - index}
                                                                </p>
                                                                {index === 0 && (
                                                                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Latest</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(assignment.created_at).toLocaleDateString('id-ID', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <svg 
                                                            className={`w-5 h-5 text-gray-500 transition-transform ${
                                                                expandedSubmissions.includes(assignment.id) ? 'transform rotate-180' : ''
                                                            }`}
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                
                                                {expandedSubmissions.includes(assignment.id) && (
                                                    <div className="p-4 border-t border-gray-200">
                                                        {assignment.notes && (
                                                            <div className="mb-3">
                                                                <p className="text-xs font-medium text-gray-700">📝 Notes:</p>
                                                                <p className="text-sm text-gray-600 mt-1">{assignment.notes}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {assignment.comment && (
                                                            <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-400 rounded">
                                                                <p className="text-xs font-medium text-red-800">❌ Rejection Reason:</p>
                                                                <p className="text-sm text-red-900 mt-1">{assignment.comment}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
