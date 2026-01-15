import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchWithCsrf } from '@/utils/csrf';
import axios from 'axios';

interface Document {
    id: number;
    name: string;
    file: string;
    uploaded_at: string;
    status: 'pending' | 'approved' | 'rejected';
    comment: string | null;
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
    // Admin has full access regardless of project status
    
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
        isApproved?: boolean;
    }>>([{ id: 0, label: '', file: null }]);
    
    const [nextFileId, setNextFileId] = useState(1);
    
    // States for client documents
    const [clientDocInputs, setClientDocInputs] = useState<Array<{ 
        id: number; 
        name: string; 
        description: string;
    }>>([{ id: 0, name: '', description: '' }]);
    
    const [nextClientDocId, setNextClientDocId] = useState(1);
    
    // States for Excel bulk upload
    const [isUploadingExcel, setIsUploadingExcel] = useState(false);
    const [excelError, setExcelError] = useState<string | null>(null);

    // Helper functions for document status display
    const getDocumentStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getDocumentStatusText = (status: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'approved':
                return '✓ Approved';
            case 'rejected':
                return '✗ Rejected';
            case 'pending':
            default:
                return '⏳ Pending Review';
        }
    };

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
        
        // Auto-include approved documents from latest assignment
        if (task.can_upload_files && task.latest_assignment) {
            const approvedDocs = task.latest_assignment.documents.filter(doc => doc.status === 'approved');
            
            if (approvedDocs.length > 0) {
                // Initialize with approved documents
                const approvedDocInputs = approvedDocs.map((doc, index) => ({
                    id: index,
                    label: doc.name,
                    file: null,
                    existingDocId: doc.id,
                    existingFilePath: doc.file,
                    isApproved: true,
                }));
                
                // Add one empty input for new file
                approvedDocInputs.push({
                    id: approvedDocs.length,
                    label: '',
                    file: null,
                    isApproved: false,
                } as any);
                
                setFileInputs(approvedDocInputs);
                setNextFileId(approvedDocs.length + 1);
            } else {
                setFileInputs([{ id: 0, label: '', file: null }]);
                setNextFileId(1);
            }
        } else if (task.can_upload_files) {
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

    // Handler for downloading Excel template
    const handleDownloadTemplate = () => {
        window.location.href = route('admin.client-documents.template');
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
            const response = await axios.post(route('admin.client-documents.parse-excel'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = response.data;

            if (result.documents) {
                // Add all documents from Excel to clientDocInputs
                const newDocs = result.documents.map((doc: { name: string; description: string }, index: number) => ({
                    id: nextClientDocId + index,
                    name: doc.name,
                    description: doc.description || '',
                }));

                // Filter out empty rows before adding new docs
                setClientDocInputs(prev => {
                    const nonEmptyRows = prev.filter(doc => doc.name.trim() !== '' || doc.description.trim() !== '');
                    return [...nonEmptyRows, ...newDocs];
                });
                setNextClientDocId(prev => prev + result.documents.length);

                toast.success(`Successfully imported ${result.count || result.documents.length} document requests!`);
            } else {
                setExcelError('Failed to parse Excel file');
                toast.error('Failed to parse Excel file');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred while uploading the file';
            setExcelError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUploadingExcel(false);
            event.target.value = ''; // Reset file input
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
        if (task.client_interact === 'upload' && !hasClientDocs) {
            toast.error('You must request at least one document from the client for this task.');
            return;
        }
        
        // If file uploads are enabled, require at least one file or client document
        if (task.can_upload_files && !hasNewFiles && !hasClientDocs && !hasExistingFiles) {
            toast.error('Please upload at least one file or request at least one document from client.');
            return;
        }

        // Collect existing document labels
        const existingDocLabels = fileInputs
            .filter(input => input.existingDocId && !input.file)
            .map(input => ({
                doc_id: input.existingDocId!,
                label: input.label
            }));

        // Create FormData manually
        const formData = new FormData();
        formData.append('notes', data.notes || '');
        
        if (data.files) {
            data.files.forEach((file) => {
                formData.append('files[]', file);
            });
        }
        
        if (data.file_labels) {
            data.file_labels.forEach((label) => {
                formData.append('file_labels[]', label);
            });
        }
        
        clientDocs.forEach((doc, index) => {
            formData.append(`client_documents[${index}][name]`, doc.name);
            formData.append(`client_documents[${index}][description]`, doc.description);
        });
        
        existingDocLabels.forEach((item, index) => {
            formData.append(`existing_document_labels[${index}][doc_id]`, item.doc_id.toString());
            formData.append(`existing_document_labels[${index}][label]`, item.label);
        });
        
        formData.append('_method', 'PUT');

        // Submit using router.post with FormData
        router.post(route('admin.tasks.update-status', task.id), formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowModal(false);
                window.location.reload();
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('admin.projects.bundles.show', project.id)}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block"
                        >
                            ← Back to {project.name}
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {task.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Step: {task.working_step.name} • Role: Admin (Full Access)
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
                    
                    {/* Add New Submission Button */}
                    {(task.assignments.length === 0 || task.latest_assignment?.comment || task.latest_assignment?.status === 'Returned for Revision (by Client)') && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-4">
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add New Submission
                            </button>
                        </div>
                    )}

                    {/* Main Layout: 2 Columns */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* LEFT: Submission List */}
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Submission Detail */}
                        <div className="col-span-12 lg:col-span-8">
                            <div className="bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    {selectedSubmission ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Submission Details
                                                </h3>
                                                {task.can_edit && selectedSubmission.id === task.latest_assignment?.id && (
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
                                                            <div key={doc.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-center space-x-2 flex-1">
                                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                Uploaded: {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-2 py-1 text-xs rounded-full border ${getDocumentStatusBadge(doc.status)}`}>
                                                                            {getDocumentStatusText(doc.status)}
                                                                        </span>
                                                                        <a
                                                                            href={`/storage/${doc.file}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                                                        >
                                                                            View
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                                {doc.comment && (
                                                                    <div className="mt-2 p-2 bg-white border border-gray-200 rounded">
                                                                        <p className="text-xs font-medium text-gray-700">Review Comment:</p>
                                                                        <p className="text-xs text-gray-600 mt-1" style={{ whiteSpace: 'pre-line' }}>{doc.comment}</p>
                                                                    </div>
                                                                )}
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
                                                                        {clientDoc.file ? (
                                                                            <div className="mt-2 flex items-center gap-2">
                                                                                <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">✓ Uploaded by Client</span>
                                                                                <a
                                                                                    href={`/storage/${clientDoc.file}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                                                >
                                                                                    View File
                                                                                </a>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-purple-700 mt-2 italic">⏳ Waiting for client upload...</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
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

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isEditMode ? 'Edit Submission' : 'Add New Submission'}
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

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Add any notes about this submission..."
                                />
                            </div>

                            {/* File Uploads Section */}
                            {task.can_upload_files && (
                                <div className="border-t pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            📎 Upload Files {!task.multiple_files && '(Maximum 1 file)'}
                                        </label>
                                        {(task.multiple_files || fileInputs.length === 0) && (
                                            <button
                                                type="button"
                                                onClick={addFileInput}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add File
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {fileInputs.map((input) => (
                                            <div key={input.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <div className="space-y-3">
                                                    {/* Label Input */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Document Label
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={input.label}
                                                            onChange={(e) => handleLabelChange(input.id, e.target.value)}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                            placeholder="e.g., Financial Statement Q1"
                                                            disabled={input.isApproved}
                                                        />
                                                        {input.isApproved && (
                                                            <p className="text-xs text-green-600 mt-1">✓ This document was approved in previous submission</p>
                                                        )}
                                                    </div>

                                                    {/* File Input or Existing File Display */}
                                                    {input.existingFilePath && !input.file ? (
                                                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                            <div className="flex items-center space-x-2">
                                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span className="text-sm text-gray-700">Existing file</span>
                                                            </div>
                                                            <a
                                                                href={`/storage/${input.existingFilePath}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                View
                                                            </a>
                                                        </div>
                                                    ) : input.file ? (
                                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                                                            <div className="flex items-center space-x-2">
                                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span className="text-sm text-gray-700">{input.file.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFileChange(input.id, null)}
                                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onDrop={(e) => handleFileDrop(input.id, e)}
                                                            onDragOver={(e) => e.preventDefault()}
                                                            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                                        >
                                                            <input
                                                                type="file"
                                                                id={`file-${input.id}`}
                                                                onChange={(e) => handleFileSelect(input.id, e)}
                                                                className="hidden"
                                                            />
                                                            <label htmlFor={`file-${input.id}`} className="cursor-pointer">
                                                                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                </svg>
                                                                <p className="text-sm text-gray-600">
                                                                    Drop file here or <span className="text-blue-600">browse</span>
                                                                </p>
                                                            </label>
                                                        </div>
                                                    )}

                                                    {/* Remove Button */}
                                                    {!input.isApproved && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFileInput(input.id)}
                                                            className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Client Document Requests Section */}
                            {task.client_interact !== 'read only' && (
                                <div className="border-t pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            📋 Request Documents from Client
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleDownloadTemplate}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Template
                                            </button>
                                            <label className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Upload Excel
                                                <input
                                                    type="file"
                                                    accept=".csv,.xls,.xlsx"
                                                    onChange={handleExcelUpload}
                                                    className="hidden"
                                                    disabled={isUploadingExcel}
                                                />
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addClientDocInput}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Document
                                            </button>
                                        </div>
                                    </div>

                                    {excelError && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">{excelError}</p>
                                        </div>
                                    )}

                                    {isUploadingExcel && (
                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">Uploading and parsing Excel file...</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {clientDocInputs.map((input) => (
                                            <div key={input.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Document Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={input.name}
                                                            onChange={(e) => handleClientDocNameChange(input.id, e.target.value)}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                                            placeholder="e.g., Bank Statement"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Description (Optional)
                                                        </label>
                                                        <textarea
                                                            value={input.description}
                                                            onChange={(e) => handleClientDocDescriptionChange(input.id, e.target.value)}
                                                            rows={2}
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                                            placeholder="Additional details or instructions..."
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeClientDocInput(input.id)}
                                                        className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-800"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error Messages */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
                                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Submitting...' : (isEditMode ? 'Update' : 'Submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
