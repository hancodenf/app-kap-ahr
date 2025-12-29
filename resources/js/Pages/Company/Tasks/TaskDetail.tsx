import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchWithCsrf } from '@/utils/csrf';

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

interface TaskWorker {
    id: number;
    worker_name: string;
    worker_email: string;
    worker_role: string;
}

interface Task {
    id: number;
    name: string;
    slug: string;
    status: string;
    completion_status: string;
    client_interact: 'read only' | 'restricted' | 'upload' | 'approval';
    multiple_files: boolean;
    can_edit: boolean;
    can_upload_files: boolean;
    working_step: {
        id: number;
        name: string;
    };
    latest_assignment: TaskAssignment | null;
    assignments: TaskAssignment[];
    task_workers: TaskWorker[];
}

interface Project {
    id: number;
    name: string;
    slug: string;
    status: string;
}

interface Props extends PageProps {
    task: Task;
    project: Project;
}

export default function TaskDetail({ auth, task, project }: Props) {
    // Check if project is active (only allow actions for In Progress projects)
    const isProjectActive = project.status === 'In Progress';
    
    // State for selected submission
    const [selectedSubmission, setSelectedSubmission] = useState<TaskAssignment | null>(
        task.assignments.length > 0 ? task.assignments[0] : null
    );
    
    // State for modal
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // States for file uploads
    const [fileInputs, setFileInputs] = useState<Array<{ 
        id: number; 
        label: string; 
        file: File | null; 
        existingDocId?: number; 
        existingFilePath?: string;
    }>>([{ id: 0, label: '', file: null }]);
    
    const [nextFileId, setNextFileId] = useState(1);
    
    // States for client documents
    const [clientDocInputs, setClientDocInputs] = useState<Array<{ 
        id: number; 
        name: string; 
        description: string;
    }>>([{ id: 0, name: '', description: '' }]);
    
    const [nextClientDocId, setNextClientDocId] = useState(1);
    
    // States for client document actions
    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [reuploadComment, setReuploadComment] = useState('');
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    
    // States for Excel bulk upload
    const [isUploadingExcel, setIsUploadingExcel] = useState(false);
    const [excelError, setExcelError] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        notes: string;
        files: File[];
        file_labels: string[];
        client_documents: Array<{ name: string; description: string }>;
        existing_document_labels: Array<{ doc_id: number; label: string }>;
        _method?: string;
    }>({
        notes: '',
        files: [],
        file_labels: [],
        client_documents: [],
        existing_document_labels: [],
        _method: 'PUT',
    });

    // Open Add New Modal
    const openAddModal = () => {
        setIsEditMode(false);
        setShowModal(true);
        
        // Reset form
        if (task.can_upload_files) {
            setFileInputs([{ id: 0, label: '', file: null }]);
            setNextFileId(1);
        } else {
            setFileInputs([]);
            setNextFileId(0);
        }
        setClientDocInputs([{ id: 0, name: '', description: '' }]);
        setNextClientDocId(1);
        setData({
            notes: '',
            files: [],
            file_labels: [],
            client_documents: [],
            existing_document_labels: [],
            _method: 'PUT',
        });
    };

    // Open Edit Modal
    const openEditModal = () => {
        setIsEditMode(true);
        setShowModal(true);
        
        // Initialize with latest assignment data
        if (task.latest_assignment) {
            // Initialize file inputs only if file uploads are allowed
            if (task.can_upload_files) {
                if (task.latest_assignment.documents.length > 0) {
                    const existingDocs = task.latest_assignment.documents.map((doc, index) => ({
                        id: index,
                        label: doc.name,
                        file: null,
                        existingDocId: doc.id,
                        existingFilePath: doc.file,
                    }));
                    setFileInputs(existingDocs);
                    setNextFileId(existingDocs.length);
                } else {
                    setFileInputs([{ id: 0, label: '', file: null }]);
                    setNextFileId(1);
                }
            } else {
                setFileInputs([]);
                setNextFileId(0);
            }
            
            // Initialize client doc inputs
            if (task.latest_assignment.client_documents.length > 0) {
                const existingClientDocs = task.latest_assignment.client_documents.map((doc, index) => ({
                    id: index,
                    name: doc.name,
                    description: doc.description || '',
                }));
                setClientDocInputs(existingClientDocs);
                setNextClientDocId(existingClientDocs.length);
            } else {
                setClientDocInputs([{ id: 0, name: '', description: '' }]);
                setNextClientDocId(1);
            }
            
            // Set form data
            setData({
                notes: task.latest_assignment.notes || '',
                files: [],
                file_labels: [],
                client_documents: task.latest_assignment.client_documents
                    .filter(doc => doc.name.trim() !== '')
                    .map(doc => ({ name: doc.name, description: doc.description || '' })),
                existing_document_labels: [],
                _method: 'PUT',
            });
        }
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

    const handleFileChange = (id: number, file: File | null) => {
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
        if (!task.can_upload_files) {
            return;
        }
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
        
        // Sync clientDocInputs to form data before submission
        const clientDocs = clientDocInputs
            .filter(doc => doc.name.trim() !== '')
            .map(doc => ({ name: doc.name, description: doc.description || '' }));
        
        // Validate
        const hasNewFiles = data.files && data.files.length > 0;
        const hasClientDocs = clientDocs.length > 0;
        const hasExistingFiles = fileInputs.some(input => input.existingFilePath);
        
        // Special validation for tasks with client_interact = 'upload'
        // Worker MUST request at least 1 document from client
        if (task.client_interact === 'upload' && !hasClientDocs) {
            toast.error('You must request at least one document from the client for this task.');
            return;
        }
        
        // If file uploads are enabled, require at least one file or client document
        if (task.can_upload_files && !hasNewFiles && !hasClientDocs && !hasExistingFiles) {
            toast.error('Please upload at least one file or request at least one document from client.');
            return;
        }
        
        // If file uploads are disabled, allow submission with just notes (no strict requirements)
        // This allows flexibility for tasks that might only need notes/comments

        // Collect existing document labels
        const existingDocLabels = fileInputs
            .filter(input => input.existingDocId && !input.file)
            .map(input => ({
                doc_id: input.existingDocId!,
                label: input.label
            }));

        // Create FormData manually to ensure client_documents is included
        const formData = new FormData();
        
        // Add notes
        formData.append('notes', data.notes || '');
        
        // Add files
        if (data.files) {
            data.files.forEach((file) => {
                formData.append('files[]', file);
            });
        }
        
        // Add file labels
        if (data.file_labels) {
            data.file_labels.forEach((label) => {
                formData.append('file_labels[]', label);
            });
        }
        
        // Add client documents
        clientDocs.forEach((doc, index) => {
            formData.append(`client_documents[${index}][name]`, doc.name);
            formData.append(`client_documents[${index}][description]`, doc.description);
        });
        
        // Add existing document labels
        existingDocLabels.forEach((item, index) => {
            formData.append(`existing_document_labels[${index}][doc_id]`, item.doc_id.toString());
            formData.append(`existing_document_labels[${index}][label]`, item.label);
        });
        
        formData.append('_method', 'PUT');

        // Submit using router.post with FormData
        router.post(route('company.tasks.update-status', task.id), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowModal(false);
                window.location.reload();
            },
        });
    };

    const handleAcceptClientDocuments = () => {
        setShowAcceptModal(true);
    };

    const confirmAcceptDocuments = () => {
        router.post(route('company.tasks.accept-client-documents', task.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAcceptModal(false);
                window.location.reload();
            },
        });
    };

    const handleRequestReupload = () => {
        if (!reuploadComment.trim()) {
            toast.error('Please provide a reason for requesting re-upload');
            return;
        }

        router.post(route('company.tasks.request-reupload', task.id), {
            comment: reuploadComment,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReuploadModal(false);
                setReuploadComment('');
                window.location.reload();
            },
        });
    };

    // Handler for downloading Excel template
    const handleDownloadTemplate = () => {
        window.location.href = route('company.client-documents.template');
    };

    // Handler for uploading Excel file
    const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/)) {
            setExcelError('Please upload a valid CSV or Excel file');
            event.target.value = '';
            return;
        }

        setIsUploadingExcel(true);
        setExcelError(null);

        const formData = new FormData();
        formData.append('excel_file', file);

        try {
            // Use fetchWithCsrf helper with auto-retry
            const response = await fetchWithCsrf(route('company.client-documents.parse-excel'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 419) {
                    throw new Error('Session expired. Please refresh the page and try again.');
                }
                const errorText = await response.text();
                console.error('Parse excel error:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.documents) {
                // Add all documents from Excel to clientDocInputs
                const newDocs = result.documents.map((doc: { name: string; description: string }, index: number) => ({
                    id: nextClientDocId + index,
                    name: doc.name,
                    description: doc.description || '',
                }));

                // Filter out empty rows (where both name and description are empty) before adding new docs
                setClientDocInputs(prev => {
                    const nonEmptyRows = prev.filter(doc => doc.name.trim() !== '' || doc.description.trim() !== '');
                    return [...nonEmptyRows, ...newDocs];
                });
                setNextClientDocId(prev => prev + result.documents.length);

                toast.success(`Successfully imported ${result.count} document requests!`);
            } else {
                setExcelError(result.message || 'Failed to parse Excel file');
                toast.error(result.message || 'Failed to parse Excel file');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading the file';
            setExcelError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUploadingExcel(false);
            event.target.value = ''; // Reset file input
        }
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
    // Only show if status is "Client Reply" (not Completed)
    const showClientDocActions = 
        task.latest_assignment?.status === 'Client Reply' &&
        task.latest_assignment?.client_documents?.some(doc => doc.file && doc.uploaded_at);

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
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Assigned Team Members */}
                    {task.task_workers && task.task_workers.length > 0 && (
                        <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Assigned Team Members ({task.task_workers.length})
                                </h3>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {task.task_workers.map((worker) => (
                                        <div key={worker.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {worker.worker_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {worker.worker_name}
                                                </p>
                                                <p className="text-xs text-gray-600 truncate">
                                                    {worker.worker_email}
                                                </p>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 mt-1">
                                                    {worker.worker_role}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Add New Submission Button (show if no submissions or rejected/returned) */}
                    {(task.assignments.length === 0 || task.latest_assignment?.comment || task.latest_assignment?.status === 'Returned for Revision (by Client)') && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-4">
                            {isProjectActive ? (
                                <button
                                    onClick={openAddModal}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Submission
                                </button>
                            ) : (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Read Only:</strong> This project is {project.status}. Submissions are only available for projects In Progress.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Layout: 2 Columns (30% - 70%) */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* LEFT COLUMN: Submission List (30%) */}
                        <div className="col-span-12 lg:col-span-4">
                            <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Submissions ({task.assignments.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {task.assignments.length > 0 ? (
                                        task.assignments.map((assignment, index) => (
                                            <div
                                                key={assignment.id}
                                                onClick={() => setSelectedSubmission(assignment)}
                                                className={`p-4 cursor-pointer transition-colors ${
                                                    selectedSubmission?.id === assignment.id
                                                        ? 'bg-blue-50 border-l-4 border-blue-600'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        Submission #{task.assignments.length - index}
                                                    </p>
                                                    {index === 0 && (
                                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                            Latest
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {new Date(assignment.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTaskStatusBadgeClass(assignment.status)}`}>
                                                {assignment.status}
                                            </span>
                                        </div>
                                    ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm">No submissions yet</p>
                                            <p className="text-xs mt-1">Click "Add New Submission" to get started</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Submission Detail (70%) */}
                        <div className="col-span-12 lg:col-span-8">
                            <div className="bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    {selectedSubmission ? (
                                        <div className="space-y-4">
                                            {/* Header with Edit Button */}
                                            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Submission Details
                                                </h3>
                                                {task.can_edit && selectedSubmission.id === task.latest_assignment?.id && isProjectActive && (
                                                    <button
                                                        onClick={openEditModal}
                                                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                )}
                                                {!isProjectActive && (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                                        Read Only - Project {project.status}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {selectedSubmission.notes && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">📝 Notes:</p>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-600" style={{ whiteSpace: 'pre-line' }}>
                                                            {selectedSubmission.notes}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rejection Reason */}
                                            {selectedSubmission.comment && (
                                                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                                                    <p className="text-sm font-medium text-red-800 mb-1">❌ Rejection Reason:</p>
                                                    <p className="text-sm text-red-900">{selectedSubmission.comment}</p>
                                                </div>
                                            )}

                                            {/* Client Comment */}
                                            {selectedSubmission.client_comment && (
                                                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                                    <p className="text-sm font-medium text-yellow-800 mb-1">💬 Client Reply:</p>
                                                    <p className="text-sm text-yellow-900">{selectedSubmission.client_comment}</p>
                                                </div>
                                            )}

                                            {/* Uploaded Documents */}
                                            {selectedSubmission.documents && selectedSubmission.documents.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                                        📁 Uploaded Documents ({selectedSubmission.documents.length})
                                                    </p>
                                                    <div className="space-y-2">
                                                        {selectedSubmission.documents.map((doc) => (
                                                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                                <div className="flex items-center space-x-2">
                                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    <span className="text-sm text-gray-900">{doc.name}</span>
                                                                </div>
                                                                <a
                                                                    href={`/storage/${doc.file}`}
                                                                    download
                                                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
                                                                >
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                    Download
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Client Documents */}
                                            {selectedSubmission.client_documents && selectedSubmission.client_documents.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                                        📋 Requested Documents ({selectedSubmission.client_documents.length})
                                                    </p>
                                                    <div className="space-y-2">
                                                        {selectedSubmission.client_documents.map((clientDoc) => (
                                                            <div key={clientDoc.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                                <div className="flex items-start space-x-2">
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
                                                                                    ✅ Uploaded on {new Date(clientDoc.uploaded_at).toLocaleDateString('id-ID')}
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
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Client Document Actions */}
                                            {showClientDocActions && selectedSubmission.id === task.latest_assignment?.id && (
                                                <div className="pt-4 border-t border-gray-200">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={handleAcceptClientDocuments}
                                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                                        >
                                                            ✓ Accept Documents
                                                        </button>
                                                        <button
                                                            onClick={() => setShowReuploadModal(true)}
                                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                                                        >
                                                            ↻ Request Re-upload
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p>Select a submission to view details</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit/Add Submission Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg max-w-4xl w-full my-8">
                        <div className="p-6 max-h-[85vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {isEditMode ? 'Edit Submission' : 'New Submission'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={4}
                                            placeholder="Add your notes here..."
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* File Uploads */}
                                    {task.can_upload_files && (
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
                                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                />
                                                                
                                                                {input.existingFilePath && !input.file ? (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                                                                            <div className="flex items-center space-x-2">
                                                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                                <span className="text-sm text-gray-900">Current file</span>
                                                                            </div>
                                                                            <a
                                                                                href={`/storage/${input.existingFilePath}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-xs text-blue-600 hover:text-blue-800"
                                                                            >
                                                                                View
                                                                            </a>
                                                                        </div>
                                                                        <div
                                                                            onDrop={(e) => handleFileDrop(input.id, e)}
                                                                            onDragOver={(e) => e.preventDefault()}
                                                                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                                                        >
                                                                            <input
                                                                                type="file"
                                                                                id={`file-${input.id}`}
                                                                                onChange={(e) => handleFileSelect(input.id, e)}
                                                                                className="hidden"
                                                                            />
                                                                            <label htmlFor={`file-${input.id}`} className="cursor-pointer">
                                                                                <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                                </svg>
                                                                                <p className="mt-1 text-xs text-gray-600">
                                                                                    Click to replace file
                                                                                </p>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                ) : input.file ? (
                                                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                                                                        <span className="text-sm text-gray-900">{input.file.name}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleFileChange(input.id, null)}
                                                                            className="text-xs text-red-600 hover:text-red-800"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        onDrop={(e) => handleFileDrop(input.id, e)}
                                                                        onDragOver={(e) => e.preventDefault()}
                                                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
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
                                                                            <p className="mt-1 text-xs text-gray-500">
                                                                                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max: 10MB)
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
                                    )}

                                    {/* Client Document Requests */}
                                    {(task.client_interact !== 'read only' && task.client_interact === 'upload') && (
                                        <div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Request Documents from Client
                                                </label>
                                                
                                                {/* Bulk Upload Section */}
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <h4 className="text-sm font-semibold text-blue-900">Bulk Upload via Excel</h4>
                                                    </div>
                                                    <p className="text-xs text-blue-700 mb-3">
                                                        Need to request many documents? Download the template, fill it out, and upload it here.
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleDownloadTemplate}
                                                            className="inline-flex items-center px-3 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Download Template
                                                        </button>
                                                        <label className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            {isUploadingExcel ? 'Uploading...' : 'Upload Excel'}
                                                            <input
                                                                type="file"
                                                                accept=".csv,.xls,.xlsx"
                                                                onChange={handleExcelUpload}
                                                                disabled={isUploadingExcel}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                    {excelError && (
                                                        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            {excelError}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Manual Input Section */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-600">or add manually:</span>
                                                    <button
                                                        type="button"
                                                        onClick={addClientDocInput}
                                                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                                                    >
                                                        + Add Document Request
                                                    </button>
                                                </div>
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
                                    <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : isEditMode ? 'Save Changes' : 'Submit'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Re-upload Request Modal */}
            {showReuploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Re-upload from Client</h3>
                        <textarea
                            value={reuploadComment}
                            onChange={(e) => setReuploadComment(e.target.value)}
                            rows={4}
                            placeholder="Explain why you need the client to re-upload the documents..."
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 mb-4"
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

            {/* Accept Documents Confirmation Modal */}
            {showAcceptModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-900">Accept Client Documents</h3>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to accept all client documents and mark this task as completed? 
                                This action cannot be undone.
                            </p>
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowAcceptModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAcceptDocuments}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Accept Documents
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

