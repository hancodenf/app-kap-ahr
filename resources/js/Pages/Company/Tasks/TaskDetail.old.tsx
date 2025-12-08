// This is a comprehensive task detail page - will replace TaskDetail.tsx
// Copy complete modal logic from Show.tsx to dedicated page

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';

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
    client_interact: 'read only' | 'restricted' | 'upload';
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
    // States for submission history
    const [expandedSubmissions, setExpandedSubmissions] = useState<number[]>(
        task.assignments.length > 0 ? [task.assignments[0].id] : []
    );
    
    // States for file uploads
    const [fileInputs, setFileInputs] = useState<Array<{ 
        id: number; 
        label: string; 
        file: File | null; 
        existingDocId?: number; 
        existingFilePath?: string;
    }>>(() => {
        // Initialize from latest assignment if editing
        if (task.can_edit && task.latest_assignment && task.latest_assignment.documents.length > 0) {
            return task.latest_assignment.documents.map((doc, index) => ({
                id: index,
                label: doc.name,
                file: null,
                existingDocId: doc.id,
                existingFilePath: doc.file,
            }));
        }
        return [{ id: 0, label: '', file: null }];
    });
    
    const [nextFileId, setNextFileId] = useState(() => {
        if (task.can_edit && task.latest_assignment) {
            return task.latest_assignment.documents.length;
        }
        return 1;
    });
    
    // States for client documents
    const [clientDocInputs, setClientDocInputs] = useState<Array<{ 
        id: number; 
        name: string; 
        description: string;
    }>>(() => {
        // Initialize from latest assignment if editing
        if (task.can_edit && task.latest_assignment && task.latest_assignment.client_documents.length > 0) {
            return task.latest_assignment.client_documents.map((doc, index) => ({
                id: index,
                name: doc.name,
                description: doc.description || '',
            }));
        }
        return [{ id: 0, name: '', description: '' }];
    });
    
    const [nextClientDocId, setNextClientDocId] = useState(() => {
        if (task.can_edit && task.latest_assignment) {
            return task.latest_assignment.client_documents.length;
        }
        return 1;
    });
    
    // States for client document actions
    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [reuploadComment, setReuploadComment] = useState('');

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
        client_documents: task.can_edit && task.latest_assignment 
            ? task.latest_assignment.client_documents
                .filter(doc => doc.name.trim() !== '')
                .map(doc => ({ name: doc.name, description: doc.description || '' }))
            : [],
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

    // File input handlers
    const handleLabelChange = (id: number, label: string) => {
        const updatedInputs = fileInputs.map(input => 
            input.id === id ? { ...input, label } : input
        );
        setFileInputs(updatedInputs);
        
        const allLabels = updatedInputs.filter(input => input.file !== null).map(input => input.label || '');
        setData('file_labels', allLabels);
    };

    const handleFileChange = (id: number, file: File) => {
        const updatedInputs = fileInputs.map(input => 
            input.id === id ? { ...input, file } : input
        );
        setFileInputs(updatedInputs);
        
        const allFiles = updatedInputs.filter(input => input.file !== null).map(input => input.file!);
        const allLabels = updatedInputs.filter(input => input.file !== null).map(input => input.label || '');
        setData('files', allFiles);
        setData('file_labels', allLabels);
    };

    const handleFileDrop = (id: number, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileChange(id, file);
        }
    };

    const handleFileSelect = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileChange(id, file);
        }
    };

    const addFileInput = () => {
        if (!task.multiple_files && fileInputs.length >= 1) {
            return;
        }
        setFileInputs([...fileInputs, { id: nextFileId, label: '', file: null }]);
        setNextFileId(nextFileId + 1);
    };

    const removeFileInput = (id: number) => {
        if (fileInputs.length === 1) {
            const newInputs = [{ id: nextFileId, label: '', file: null }];
            setFileInputs(newInputs);
            setNextFileId(nextFileId + 1);
            setData('files', []);
            setData('file_labels', []);
        } else {
            const updatedInputs = fileInputs.filter(input => input.id !== id);
            setFileInputs(updatedInputs);
            
            const allFiles = updatedInputs.filter(input => input.file !== null).map(input => input.file!);
            const allLabels = updatedInputs.filter(input => input.file !== null).map(input => input.label || '');
            setData('files', allFiles);
            setData('file_labels', allLabels);
        }
    };

    // Client document handlers
    const handleClientDocNameChange = (id: number, name: string) => {
        const updatedInputs = clientDocInputs.map(input => 
            input.id === id ? { ...input, name } : input
        );
        setClientDocInputs(updatedInputs);
        
        const allClientDocs = updatedInputs.filter(input => input.name.trim() !== '').map(input => ({
            name: input.name,
            description: input.description
        }));
        setData('client_documents', allClientDocs);
    };

    const handleClientDocDescriptionChange = (id: number, description: string) => {
        const updatedInputs = clientDocInputs.map(input => 
            input.id === id ? { ...input, description } : input
        );
        setClientDocInputs(updatedInputs);
        
        const allClientDocs = updatedInputs.filter(input => input.name.trim() !== '').map(input => ({
            name: input.name,
            description: input.description
        }));
        setData('client_documents', allClientDocs);
    };

    const addClientDocInput = () => {
        if (task.client_interact === 'read only') {
            return;
        }
        setClientDocInputs([...clientDocInputs, { id: nextClientDocId, name: '', description: '' }]);
        setNextClientDocId(nextClientDocId + 1);
    };

    const removeClientDocInput = (id: number) => {
        if (clientDocInputs.length === 1) {
            const newInputs = [{ id: nextClientDocId, name: '', description: '' }];
            setClientDocInputs(newInputs);
            setNextClientDocId(nextClientDocId + 1);
            setData('client_documents', []);
        } else {
            const updatedInputs = clientDocInputs.filter(input => input.id !== id);
            setClientDocInputs(updatedInputs);
            
            const allClientDocs = updatedInputs.filter(input => input.name.trim() !== '').map(input => ({
                name: input.name,
                description: input.description
            }));
            setData('client_documents', allClientDocs);
        }
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

    const handleAcceptClientDocuments = () => {
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

    const handleRequestReupload = () => {
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
        } else if (status.includes('Pending') || status.includes('Under Review')) {
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

    // Check if we should show client document validation actions
    const showClientDocActions = task.latest_assignment?.client_documents?.some(doc => doc.file && doc.uploaded_at);

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
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Main Content Card */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {task.can_edit ? (
                                // Edit/Create Form
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {task.assignments.length > 0 ? 'Edit Submission' : 'New Submission'}
                                        </h3>
                                        
                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notes
                                            </label>
                                            <textarea
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                rows={4}
                                                placeholder="Add your notes here..."
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        </div>

                                        {/* File Uploads */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Upload Documents
                                                </label>
                                                {task.multiple_files && (
                                                    <button
                                                        type="button"
                                                        onClick={addFileInput}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        + Add Another File
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {fileInputs.map((input) => (
                                                    <div key={input.id} className="border border-gray-300 rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-1 space-y-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Document label/name"
                                                                    value={input.label}
                                                                    onChange={(e) => handleLabelChange(input.id, e.target.value)}
                                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                                />
                                                                
                                                                {input.existingFilePath && !input.file ? (
                                                                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                                                                        <div className="flex items-center space-x-2">
                                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                            <span className="text-sm text-gray-900">Existing file</span>
                                                                        </div>
                                                                        <a
                                                                            href={`/storage/${input.existingFilePath}`}
                                                                            download
                                                                            className="text-xs text-blue-600 hover:text-blue-800"
                                                                        >
                                                                            View
                                                                        </a>
                                                                    </div>
                                                                ) : input.file ? (
                                                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                                                                        <span className="text-sm text-gray-900">{input.file.name}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleFileChange(input.id, null as any)}
                                                                            className="text-xs text-red-600 hover:text-red-800"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        onDrop={(e) => handleFileDrop(input.id, e)}
                                                                        onDragOver={(e) => e.preventDefault()}
                                                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                                                                    >
                                                                        <input
                                                                            type="file"
                                                                            id={`file-${input.id}`}
                                                                            onChange={(e) => handleFileSelect(input.id, e)}
                                                                            className="hidden"
                                                                        />
                                                                        <label htmlFor={`file-${input.id}`} className="cursor-pointer">
                                                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                            </svg>
                                                                            <p className="mt-2 text-sm text-gray-600">
                                                                                Click to upload or drag and drop
                                                                            </p>
                                                                        </label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {fileInputs.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFileInput(input.id)}
                                                                    className="text-red-600 hover:text-red-800 mt-2"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Client Document Requests */}
                                        {task.client_interact !== 'read only' && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Request Documents from Client
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={addClientDocInput}
                                                        className="text-sm text-purple-600 hover:text-purple-800"
                                                    >
                                                        + Add Document Request
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {clientDocInputs.map((input) => (
                                                        <div key={input.id} className="border border-purple-300 rounded-lg p-4 bg-purple-50">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-1 space-y-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Document name"
                                                                        value={input.name}
                                                                        onChange={(e) => handleClientDocNameChange(input.id, e.target.value)}
                                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                                                    />
                                                                    <textarea
                                                                        placeholder="Description (optional)"
                                                                        value={input.description}
                                                                        onChange={(e) => handleClientDocDescriptionChange(input.id, e.target.value)}
                                                                        rows={2}
                                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                                                    />
                                                                </div>
                                                                
                                                                {clientDocInputs.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeClientDocInput(input.id)}
                                                                        className="text-red-600 hover:text-red-800 mt-1"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Form Actions */}
                                        <div className="flex gap-3 pt-4 border-t">
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
                                                {processing ? 'Saving...' : task.assignments.length > 0 ? 'Save Changes' : 'Submit'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                // View Only - Show Submission History
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Submission History ({task.assignments.length} submission{task.assignments.length > 1 ? 's' : ''})
                                        </h3>
                                        
                                        {showClientDocActions && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAcceptClientDocuments}
                                                    className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                                >
                                                    ✓ Accept Documents
                                                </button>
                                                <button
                                                    onClick={() => setShowReuploadModal(true)}
                                                    className="px-3 py-1.5 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                                                >
                                                    ↻ Request Re-upload
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Submission list */}
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
                                                                {assignment.comment && (
                                                                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">✗ Rejected</span>
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
                                                    <div className="p-4 border-t border-gray-200 space-y-3">
                                                        {assignment.notes && (
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-700">📝 Notes:</p>
                                                                <p className="text-sm text-gray-600 mt-1" style={{ whiteSpace: 'pre-line' }}>{assignment.notes}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {assignment.comment && (
                                                            <div className="p-2 bg-red-50 border-l-4 border-red-400 rounded">
                                                                <p className="text-xs font-medium text-red-800">❌ Rejection Reason:</p>
                                                                <p className="text-sm text-red-900 mt-1">{assignment.comment}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {assignment.client_comment && (
                                                            <div className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                                                <p className="text-xs font-medium text-yellow-800">💬 Client Reply:</p>
                                                                <p className="text-sm text-yellow-900 mt-1">{assignment.client_comment}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {assignment.documents && assignment.documents.length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-xs font-medium text-gray-700">📁 Uploaded Documents ({assignment.documents.length}):</p>
                                                                {assignment.documents.map((doc) => (
                                                                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded">
                                                                        <div className="flex items-center space-x-2">
                                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                            <span className="text-sm text-gray-900">{doc.name}</span>
                                                                        </div>
                                                                        <a
                                                                            href={`/storage/${doc.file}`}
                                                                            download
                                                                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                                                        >
                                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                            </svg>
                                                                            Download
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {assignment.client_documents && assignment.client_documents.length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-xs font-medium text-gray-700">📋 Requested Documents ({assignment.client_documents.length}):</p>
                                                                {assignment.client_documents.map((clientDoc) => (
                                                                    <div key={clientDoc.id} className="p-2 bg-purple-50 border border-purple-200 rounded">
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex items-start space-x-2 flex-1">
                                                                                <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                                <div className="flex-1">
                                                                                    <p className="text-sm font-medium text-gray-900">{clientDoc.name}</p>
                                                                                    {clientDoc.description && (
                                                                                        <p className="text-xs text-gray-600 mt-1">{clientDoc.description}</p>
                                                                                    )}
                                                                                    {clientDoc.file && clientDoc.uploaded_at ? (
                                                                                        <div className="mt-2">
                                                                                            <p className="text-xs text-green-600 mb-1">
                                                                                                ✅ Uploaded by client on {new Date(clientDoc.uploaded_at).toLocaleDateString('id-ID')}
                                                                                            </p>
                                                                                            <a
                                                                                                href={`/storage/${clientDoc.file}`}
                                                                                                download
                                                                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-white border border-purple-300 rounded hover:bg-purple-50"
                                                                                            >
                                                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                                </svg>
                                                                                                Download
                                                                                            </a>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <p className="text-xs text-orange-600 mt-1">⏳ Waiting for client upload</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
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
                    
                    {/* Add New Submission Button (show if rejected/returned) */}
                    {!task.can_edit && task.assignments.length > 0 && task.latest_assignment?.comment && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <Link
                                href={route('company.tasks.detail', task.id)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                            >
                                + Add New Submission
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Re-upload Request Modal */}
            {showReuploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Re-upload from Client</h3>
                        <textarea
                            value={reuploadComment}
                            onChange={(e) => setReuploadComment(e.target.value)}
                            rows={4}
                            placeholder="Explain why you need the client to re-upload the documents..."
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowReuploadModal(false);
                                    setReuploadComment('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestReupload}
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                            >
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
