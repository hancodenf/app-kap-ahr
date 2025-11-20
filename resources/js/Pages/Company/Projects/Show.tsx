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
    is_approved: boolean;
    created_at: string;
    documents: Document[];
    client_documents?: ClientDocument[];
}

interface Task {
    id: number;
    name: string;
    slug: string;
    order: number;
    is_required: boolean;
    completion_status: 'pending' | 'in_progress' | 'completed';
    status: string;
    client_interact: 'read only' | 'comment' | 'upload';
    multiple_files: boolean;
    is_assigned_to_me: boolean;
    my_assignment_id: number | null;
    can_edit: boolean;
    latest_assignment: TaskAssignment | null;
    assignments: TaskAssignment[];
}

interface RequiredProgress {
    total: number;
    completed: number;
    percentage: number;
}

interface WorkingStep {
    id: number;
    name: string;
    slug: string;
    order: number;
    is_locked: boolean;
    can_access: boolean;
    required_progress: RequiredProgress | null;
    tasks: Task[];
}

interface Project {
    id: number;
    name: string;
    client_name: string;
    status: string;
}

interface Props extends PageProps {
    project: Project;
    workingSteps: WorkingStep[];
    myRole: string;
}

interface ApprovalTask {
    id: number;
    name: string;
    slug: string;
    status: string;
    completion_status: string;
    working_step: {
        id: number;
        name: string;
    } | null;
    latest_assignment: {
        id: number;
        time: string;
        notes: string;
        created_at: string;
        documents: Array<{
            id: number;
            name: string;
            file: string;
        }>;
        client_documents: Array<{
            id: number;
            name: string;
            description: string;
        }>;
    } | null;
}

export default function ShowProject({ auth, project, workingSteps, myRole }: Props) {
    const [activeTab, setActiveTab] = useState<'my-tasks' | 'approval-requests'>('my-tasks');
    const [approvalTasks, setApprovalTasks] = useState<ApprovalTask[]>([]);
    const [loadingApprovals, setLoadingApprovals] = useState(false);
    const [selectedApprovalTask, setSelectedApprovalTask] = useState<ApprovalTask | null>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
    const [rejectComment, setRejectComment] = useState('');
    const [processingApproval, setProcessingApproval] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [expandedSubmissions, setExpandedSubmissions] = useState<number[]>([]);
    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [reuploadComment, setReuploadComment] = useState('');
    const [fileInputs, setFileInputs] = useState<Array<{ 
        id: number; 
        label: string; 
        file: File | null; 
        existingDocId?: number; 
        existingFilePath?: string;
    }>>([{ id: 0, label: '', file: null }]);
    const [clientDocInputs, setClientDocInputs] = useState<Array<{ id: number; name: string; description: string }>>([{ id: 0, name: '', description: '' }]);
    const [nextFileId, setNextFileId] = useState(1);
    const [nextClientDocId, setNextClientDocId] = useState(1);
    
    // Check if user role needs approval tab (not Member)
    // Use lowercase comparison to handle case-insensitive role names
    const roleLower = myRole.toLowerCase();
    const needsApprovalTab = ['team leader', 'manager', 'supervisor', 'partner'].includes(roleLower);

    // Fetch approval requests when switching to approval tab
    // AND reset modal/form state when switching tabs
    useEffect(() => {
        if (activeTab === 'approval-requests' && needsApprovalTab) {
            fetchApprovalRequests();
        }
        
        // Reset all modal and form states when switching tabs
        setShowTaskModal(false);
        setSelectedTask(null);
        setShowForm(false);
        setFileInputs([{ id: 0, label: '', file: null }]);
        setClientDocInputs([{ id: 0, name: '', description: '' }]);
        setNextFileId(1);
        setNextClientDocId(1);
        setShowApprovalModal(false);
        setSelectedApprovalTask(null);
        setRejectComment('');
        setShowReuploadModal(false);
        setReuploadComment('');
        reset();
    }, [activeTab]);

    const fetchApprovalRequests = async () => {
        setLoadingApprovals(true);
        try {
            const response = await fetch(route('company.projects.approval-requests', project.id));
            const data = await response.json();
            setApprovalTasks(data.tasks || []);
        } catch (error) {
            console.error('Error fetching approval requests:', error);
        } finally {
            setLoadingApprovals(false);
        }
    };

    const handleApprove = (task: ApprovalTask) => {
        setSelectedApprovalTask(task);
        setApprovalAction('approve');
        setRejectComment('');
        setShowApprovalModal(true);
    };

    const handleReject = (task: ApprovalTask) => {
        setSelectedApprovalTask(task);
        setApprovalAction('reject');
        setRejectComment('');
        setShowApprovalModal(true);
    };

    const submitApproval = async () => {
        if (!selectedApprovalTask) return;

        if (approvalAction === 'reject' && !rejectComment.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }

        setProcessingApproval(true);
        try {
            const url = approvalAction === 'approve' 
                ? route('company.tasks.approve', selectedApprovalTask.id)
                : route('company.tasks.reject', selectedApprovalTask.id);

            const response = await fetch(url, {
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

            if (data.success) {
                setShowApprovalModal(false);
                setSelectedApprovalTask(null);
                setRejectComment('');
                // Refresh approval requests
                fetchApprovalRequests();
                // Show success message
                alert(data.message);
            } else {
                alert(data.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error processing approval:', error);
            alert('An error occurred');
        } finally {
            setProcessingApproval(false);
        }
    };


    // Disable body scroll when modal is open
    useEffect(() => {
        if (showTaskModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showTaskModal]);

    const { data, setData, post, put, processing, errors, reset } = useForm<{
        notes: string;
        files: File[];
        file_labels: string[];
        upload_mode: 'upload' | 'request';
        client_documents: Array<{ name: string; description: string }>;
        existing_document_labels: Array<{ doc_id: number; label: string }>; // For updating labels without uploading new files
        _method?: string;
    }>({
        notes: '',
        files: [],
        file_labels: [],
        upload_mode: 'upload',
        client_documents: [],
        existing_document_labels: [],
        _method: 'PUT',
    });

    const toggleStep = (stepId: number) => {
        setExpandedSteps(prev =>
            prev.includes(stepId)
                ? prev.filter(id => id !== stepId)
                : [...prev, stepId]
        );
    };

    const handleTaskClick = (task: Task, step: WorkingStep) => {
        if (!step.can_access) {
            return; // Can't interact with tasks in locked steps
        }
        
        if (!task.is_assigned_to_me) {
            return; // Can't interact with tasks not assigned to me
        }

        // Redirect to task detail page
        router.visit(route('company.tasks.detail', task.id));
    };
    
    const toggleSubmission = (submissionId: number) => {
        setExpandedSubmissions(prev =>
            prev.includes(submissionId)
                ? prev.filter(id => id !== submissionId)
                : [...prev, submissionId]
        );
    };

    const handleLabelChange = (id: number, label: string) => {
        const updatedInputs = fileInputs.map(input => 
            input.id === id ? { ...input, label } : input
        );
        setFileInputs(updatedInputs);
        
        // Update form data with labels (sync with files that have been uploaded)
        const allLabels = updatedInputs.filter(input => input.file !== null).map(input => input.label || '');
        setData('file_labels', allLabels);
    };

    const handleFileChange = (id: number, file: File) => {
        const updatedInputs = fileInputs.map(input => 
            input.id === id ? { ...input, file } : input
        );
        setFileInputs(updatedInputs);
        
        // Update form data with all files and labels
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
        if (selectedTask && !selectedTask.multiple_files && fileInputs.length >= 1) {
            // Don't add more inputs for single file mode
            return;
        }
        setFileInputs([...fileInputs, { id: nextFileId, label: '', file: null }]);
        setNextFileId(nextFileId + 1);
    };

    const removeFileInput = (id: number) => {
        if (fileInputs.length === 1) {
            // Always keep at least one input
            const newInputs = [{ id: nextFileId, label: '', file: null }];
            setFileInputs(newInputs);
            setNextFileId(nextFileId + 1);
            setData('files', []);
            setData('file_labels', []);
        } else {
            const updatedInputs = fileInputs.filter(input => input.id !== id);
            setFileInputs(updatedInputs);
            
            // Update form data
            const allFiles = updatedInputs.filter(input => input.file !== null).map(input => input.file!);
            const allLabels = updatedInputs.filter(input => input.file !== null).map(input => input.label || '');
            setData('files', allFiles);
            setData('file_labels', allLabels);
        }
    };

    // Client Document handlers
    const handleClientDocNameChange = (id: number, name: string) => {
        const updatedInputs = clientDocInputs.map(input => 
            input.id === id ? { ...input, name } : input
        );
        setClientDocInputs(updatedInputs);
        
        // Update form data
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
        
        // Update form data
        const allClientDocs = updatedInputs.filter(input => input.name.trim() !== '').map(input => ({
            name: input.name,
            description: input.description
        }));
        setData('client_documents', allClientDocs);
    };

    const addClientDocInput = () => {
        if (selectedTask && !selectedTask.multiple_files && clientDocInputs.length >= 1) {
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
            
            // Update form data
            const allClientDocs = updatedInputs.filter(input => input.name.trim() !== '').map(input => ({
                name: input.name,
                description: input.description
            }));
            setData('client_documents', allClientDocs);
        }
    };

    const handleSubmitTaskUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedTask) return;

        // Validate: at least one of files or client_documents must be provided
        // UNLESS there are existing files (editing mode)
        const hasNewFiles = data.files && data.files.length > 0;
        const hasClientDocs = data.client_documents && data.client_documents.length > 0;
        const hasExistingFiles = fileInputs.some(input => input.existingFilePath);
        const hasExistingClientDocs = clientDocInputs.some(input => input.name.trim() !== '');
        
        if (!hasNewFiles && !hasClientDocs && !hasExistingFiles && !hasExistingClientDocs) {
            alert('Please upload at least one file or request at least one document from client.');
            return;
        }

        // Collect existing document labels (for updating without uploading new files)
        const existingDocLabels = fileInputs
            .filter(input => input.existingDocId && !input.file) // Has existing doc and no new file uploaded
            .map(input => ({
                doc_id: input.existingDocId!,
                label: input.label
            }));
        
        data.existing_document_labels = existingDocLabels;
        data._method = 'PUT';

        // Use post with _method spoofing for PUT with file uploads
        post(route('company.tasks.update-status', selectedTask.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowTaskModal(false);
                setSelectedTask(null);
                setShowForm(false);
                setFileInputs([{ id: 0, label: '', file: null }]);
                setClientDocInputs([{ id: 0, name: '', description: '' }]);
                setNextFileId(1);
                setNextClientDocId(1);
                reset();
                
                // Reload page data to show updated assignments
                router.reload({ only: ['workingSteps'] });
            },
        });
    };

    const handleAcceptClientDocuments = async () => {
        if (!selectedTask) return;

        if (!confirm('Accept all client documents and mark task as completed?')) {
            return;
        }

        router.post(route('company.tasks.accept-client-documents', selectedTask.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Client documents accepted! Task marked as completed.');
                setShowTaskModal(false);
                setSelectedTask(null);
                setShowForm(false);
            },
            onError: (errors) => {
                console.error('Server errors:', errors);
                const errorMessage = errors.error || Object.values(errors).join(', ') || 'Failed to accept client documents';
                alert(`Error: ${errorMessage}`);
            }
        });
    };

    const handleRequestReupload = async () => {
        if (!selectedTask || !reuploadComment.trim()) {
            alert('Please provide a reason for requesting re-upload');
            return;
        }

        router.post(route('company.tasks.request-reupload', selectedTask.id), {
            comment: reuploadComment,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Re-upload request sent to client!');
                setShowReuploadModal(false);
                setReuploadComment('');
                setShowTaskModal(false);
                setSelectedTask(null);
                setShowForm(false);
            },
            onError: (errors) => {
                console.error('Server errors:', errors);
                const errorMessage = errors.error || Object.values(errors).join(', ') || 'Failed to request re-upload';
                alert(`Error: ${errorMessage}`);
            }
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTaskStatusBadgeClass = (status: string) => {
        // For approval workflow status
        if (status.includes('Approved')) {
            return 'bg-green-100 text-green-800 border border-green-200';
        } else if (status.includes('Under Review')) {
            return 'bg-blue-100 text-blue-800 border border-blue-200';
        } else if (status.includes('Returned')) {
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'in_progress':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('company.projects.index')}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block"
                        >
                            ← Back to Projects
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {project.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Client: {project.client_name} • Role: {myRole}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {project.status}
                    </span>
                </div>
            }
        >
            <Head title={project.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Tab Navigation - Only for Team Leader, Manager, Supervisor, Partner */}
                    {needsApprovalTab && (
                        <div className="mb-6">
                            <div className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
                                <nav className="-mb-px flex" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('my-tasks')}
                                        className={`${
                                            activeTab === 'my-tasks'
                                                ? 'border-primary-500 text-primary-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        📋 My Tasks
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('approval-requests')}
                                        className={`${
                                            activeTab === 'approval-requests'
                                                ? 'border-primary-500 text-primary-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        ✅ Approval Requests
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}
                    
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* My Tasks Tab */}
                            {activeTab === 'my-tasks' && (
                            <>
                            {workingSteps.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No working steps in this project yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {workingSteps.map((step, stepIndex) => (
                                        <div
                                            key={step.id}
                                            className={`border rounded-lg ${
                                                step.is_locked && !step.can_access
                                                    ? 'border-gray-300 bg-gray-50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            {/* Step Header */}
                                            <div
                                                className={`p-4 flex items-center justify-between cursor-pointer ${
                                                    step.is_locked && !step.can_access ? 'opacity-60' : ''
                                                }`}
                                                onClick={() => toggleStep(step.id)}
                                            >
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                                                        {stepIndex + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                            {step.name}
                                                            {step.is_locked && !step.can_access && (
                                                                <svg
                                                                    className="w-5 h-5 text-red-500"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            )}
                                                            {!step.is_locked && (
                                                                <svg
                                                                    className="w-5 h-5 text-green-500"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                                                </svg>
                                                            )}
                                                        </h3>
                                                        {step.is_locked && !step.can_access && step.required_progress && (
                                                            <div className="mt-1">
                                                                <p className="text-sm text-red-600 font-medium">
                                                                    🔒 Locked - Complete required tasks in previous step
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-red-500 h-2 rounded-full transition-all"
                                                                            style={{
                                                                                width: `${step.required_progress.percentage}%`,
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-xs text-gray-600 min-w-[60px]">
                                                                        {step.required_progress.completed}/{step.required_progress.total} tasks
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <svg
                                                    className={`w-5 h-5 text-gray-500 transition-transform ${
                                                        expandedSteps.includes(step.id) ? 'transform rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>

                                            {/* Tasks List */}
                                            {expandedSteps.includes(step.id) && (
                                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                                    {step.tasks.length === 0 ? (
                                                        <p className="text-sm text-gray-500">No tasks in this step.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {step.tasks.map((task) => (
                                                                <div
                                                                    key={task.id}
                                                                    onClick={() => handleTaskClick(task, step)}
                                                                    className={`p-4 rounded-lg border ${
                                                                        task.is_assigned_to_me && step.can_access
                                                                            ? 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm cursor-pointer'
                                                                            : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                                                                    } transition-all`}
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                {getStatusIcon(task.completion_status)}
                                                                                <h4 className="font-medium text-gray-900">
                                                                                    {task.name}
                                                                                </h4>
                                                                                {task.is_required && (
                                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                                                        <svg
                                                                                            className="w-3 h-3 mr-1"
                                                                                            fill="currentColor"
                                                                                            viewBox="0 0 20 20"
                                                                                        >
                                                                                            <path
                                                                                                fillRule="evenodd"
                                                                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                                                clipRule="evenodd"
                                                                                            />
                                                                                        </svg>
                                                                                        Required
                                                                                    </span>
                                                                                )}
                                                                                {!task.is_assigned_to_me && (
                                                                                    <span className="text-xs text-gray-500 italic">
                                                                                        (Not assigned to you)
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {task.latest_assignment?.comment && (
                                                                                <p className="text-sm text-gray-600 mt-1">
                                                                                    💬 {task.latest_assignment.comment}
                                                                                </p>
                                                                            )}
                                                                            {task.latest_assignment?.time && (
                                                                                <p className="text-sm text-gray-500 mt-1">
                                                                                    ⏱️ {new Date(task.latest_assignment.time).toLocaleDateString('id-ID')}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <span
                                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                                                                task.completion_status
                                                                            )}`}
                                                                        >
                                                                            {task.completion_status.replace('_', ' ')}
                                                                        </span>
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
                            )}
                            </>
                            )}

                            {/* Approval Requests Tab */}
                            {needsApprovalTab && activeTab === 'approval-requests' && (
                                <>
                                {loadingApprovals ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        <p className="text-gray-500 mt-2">Loading approval requests...</p>
                                    </div>
                                ) : approvalTasks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-gray-500 mt-4">No tasks awaiting your approval</p>
                                        <p className="text-sm text-gray-400 mt-2">Tasks will appear here when team members submit work for review</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Tasks Awaiting Approval ({approvalTasks.length})
                                            </h3>
                                            <button
                                                onClick={fetchApprovalRequests}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Refresh
                                            </button>
                                        </div>
                                        
                                        {approvalTasks.map((task) => (
                                            <div 
                                                key={task.id} 
                                                onClick={() => router.visit(route('company.tasks.approval-detail', task.id))}
                                                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                                {task.name}
                                                            </h4>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTaskStatusBadgeClass(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            {task.working_step && (
                                                                <span className="flex items-center">
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                                    </svg>
                                                                    {task.working_step.name}
                                                                </span>
                                                            )}
                                                            {task.latest_assignment?.created_at && (
                                                                <span className="flex items-center">
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {new Date(task.latest_assignment.created_at).toLocaleDateString('id-ID', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {task.latest_assignment?.documents && task.latest_assignment.documents.length > 0 && (
                                                            <div className="mt-2 flex items-center text-xs text-gray-500">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                {task.latest_assignment.documents.length} file(s)
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && selectedApprovalTask && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {approvalAction === 'approve' ? '✅ Approve Task' : '❌ Reject Task'}
                        </h3>
                        
                        <p className="text-sm text-gray-700 mb-4">
                            Task: <span className="font-semibold">{selectedApprovalTask.name}</span>
                        </p>

                        {approvalAction === 'approve' ? (
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to approve this task? It will move to the next stage in the approval workflow.
                            </p>
                        ) : (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    value={rejectComment}
                                    onChange={(e) => setRejectComment(e.target.value)}
                                    rows={4}
                                    placeholder="Please explain why you're rejecting this task..."
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApprovalModal(false);
                                    setSelectedApprovalTask(null);
                                    setRejectComment('');
                                }}
                                disabled={processingApproval}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitApproval}
                                disabled={processingApproval || (approvalAction === 'reject' && !rejectComment.trim())}
                                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                                    approvalAction === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {processingApproval ? 'Processing...' : approvalAction === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}            {/* Task Update Modal */}
            {showTaskModal && selectedTask && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between sticky top-0 bg-white pt-6 pb-4 border-b border-gray-200 px-6 z-10">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Update Task: {selectedTask.name}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTaskModal(false);
                                        setSelectedTask(null);
                                        setShowForm(false);
                                        setFileInputs([{ id: 0, label: '', file: null }]);
                                        setClientDocInputs([{ id: 0, name: '', description: '' }]);
                                        setNextFileId(1);
                                        setNextClientDocId(1);
                                        reset();
                                    }}
                                    className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="px-6 pb-6">
                            
                            {/* Show form if no assignments OR if showForm is true */}
                            {showForm ? (
                            <form onSubmit={handleSubmitTaskUpdate}>
                                <div className="space-y-4">
                                    {/* Task Status Badge (Read-only) */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Task Status:</span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTaskStatusBadgeClass(selectedTask.status)}`}>
                                                {selectedTask.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                            <span className="ml-2 text-xs text-gray-500">(Your submission notes)</span>
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={3}
                                            placeholder="Add your notes here..."
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        />
                                        {errors.notes && (
                                            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                        )}
                                    </div>

                                    {/* Previous Assignments History - Only show if more than 1 submission OR status is not editable */}
                                    {selectedTask.assignments && selectedTask.assignments.length > 0 && (
                                        selectedTask.assignments.length > 1 || 
                                        (selectedTask.status !== 'Draft' && selectedTask.status !== 'Submitted' && selectedTask.status !== 'Submitted to Client')
                                    ) && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Submission History ({selectedTask.assignments.length} submission{selectedTask.assignments.length > 1 ? 's' : ''})
                                            </label>
                                            <div className="space-y-3">
                                                {selectedTask.assignments.map((assignment, index) => (
                                                    <div key={assignment.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                        {/* Submission Header - Always Visible */}
                                                        <div 
                                                            className="p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                                            onClick={() => toggleSubmission(assignment.id)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-semibold text-gray-900">
                                                                            Submission #{selectedTask.assignments.length - index}
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
                                                        
                                                        {/* Submission Details - Collapsible */}
                                                        {expandedSubmissions.includes(assignment.id) && (
                                                        <div className="p-3 border-t border-gray-200 bg-white space-y-3">
                                                        {assignment.notes && (
                                                            <div className="mb-3">
                                                                <p className="text-xs font-medium text-gray-700">📝 Notes:</p>
                                                                <p className="text-sm text-gray-600 mt-1" style={{ whiteSpace: 'pre-line' }}>{assignment.notes}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {assignment.comment && (
                                                            <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-400 rounded">
                                                                <p className="text-xs font-medium text-red-800">❌ Rejection Reason:</p>
                                                                <p className="text-sm text-red-900 mt-1">{assignment.comment}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {assignment.client_comment && (
                                                            <div className="mb-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
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
                                                            <div className="space-y-2 mt-3">
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
                                                                                    {clientDoc.file && clientDoc.uploaded_at && (
                                                                                        <p className="text-xs text-green-600 mt-1">
                                                                                            ✅ Uploaded by client on {new Date(clientDoc.uploaded_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                                        </p>
                                                                                    )}
                                                                                    {!clientDoc.file && (
                                                                                        <p className="text-xs text-orange-600 mt-1">
                                                                                            ⏳ Waiting for client upload
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {clientDoc.file && (
                                                                                <a
                                                                                    href={`/storage/${clientDoc.file}`}
                                                                                    download
                                                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 ml-2"
                                                                                >
                                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                    </svg>
                                                                                    Download
                                                                                </a>
                                                                            )}
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

                                    {/* Client Document Review Actions - Show when status is "Client Reply" */}
                                    {(selectedTask.status === 'Client Reply' && selectedTask.completion_status === 'in_progress' && selectedTask.is_assigned_to_me) && (
                                        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                                            <div className="flex items-start space-x-3 mb-4">
                                                <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                                                        Client has uploaded documents
                                                    </h4>
                                                    <p className="text-sm text-yellow-800">
                                                        Please review the documents uploaded by the client. You can accept them to complete the task or request re-upload if they need corrections.
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleAcceptClientDocuments}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Accept & Mark Complete
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowReuploadModal(true)}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Request Re-upload
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Upload Section - Email Attachment Style */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                📎 Attach Files
                                                {selectedTask.multiple_files ? (
                                                    <span className="ml-2 text-xs text-gray-500">(You can upload multiple files)</span>
                                                ) : (
                                                    <span className="ml-2 text-xs text-gray-500">(Single file only)</span>
                                                )}
                                            </label>
                                            
                                            {/* Add File Button - Only show if multiple files allowed */}
                                            {selectedTask.multiple_files && (
                                                <button
                                                    type="button"
                                                    onClick={addFileInput}
                                                    className="mb-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Another File
                                                </button>
                                            )}
                                            
                                            <div className="space-y-4">
                                                {fileInputs.map((input, index) => (
                                                    <div key={input.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                        <div className="flex items-start gap-3">
                                                            {/* File Name Input */}
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    File Label {!selectedTask.multiple_files && '*'}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={input.label}
                                                                    onChange={(e) => handleLabelChange(input.id, e.target.value)}
                                                                    placeholder="e.g., Laporan Keuangan, KTP, etc."
                                                                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                                />
                                                            </div>

                                                            {/* Remove Button - Only show if multiple files */}
                                                            {selectedTask.multiple_files && fileInputs.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFileInput(input.id)}
                                                                    className="mt-6 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                                                                    title="Remove file"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Show existing file link if available */}
                                                        {input.existingFilePath && !input.file && (
                                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-blue-900">📎 Current file</p>
                                                                            <p className="text-xs text-blue-700">{input.label || 'Uploaded file'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        href={`/storage/${input.existingFilePath}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                        View File
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Drag & Drop File Upload */}
                                                        <div className="mt-3">
                                                            <div
                                                                onDrop={(e) => handleFileDrop(input.id, e)}
                                                                onDragOver={(e) => e.preventDefault()}
                                                                onDragEnter={(e) => e.preventDefault()}
                                                                className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 hover:bg-white transition-colors cursor-pointer"
                                                            >
                                                                {!input.file ? (
                                                                    <div>
                                                                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                        </svg>
                                                                        <p className="mt-1 text-sm text-gray-600">
                                                                            <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max. 10MB)
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center space-x-2 text-green-600">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <div className="text-left">
                                                                            <p className="text-sm font-medium text-gray-900">{input.file.name}</p>
                                                                            <p className="text-xs text-gray-500">{(input.file.size / 1024).toFixed(2)} KB</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    onChange={(e) => handleFileSelect(input.id, e)}
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            
                                            {errors.files && (
                                                <p className="mt-1 text-sm text-red-600">{errors.files}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Request Documents from Client - Only for 'upload' permission */}
                                    {selectedTask.client_interact === 'upload' && (
                                        <div className="border-t border-gray-200 pt-6 mt-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    📋 Request Documents from Client
                                                    <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                                                </label>
                                                {selectedTask.multiple_files && (
                                                    <button
                                                        type="button"
                                                        onClick={addClientDocInput}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Add Document Request
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {clientDocInputs.map((input, index) => (
                                                    <div key={input.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-1 space-y-3">
                                                                {/* Document Name */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                        Document Name *
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={input.name}
                                                                        onChange={(e) => handleClientDocNameChange(input.id, e.target.value)}
                                                                        placeholder="e.g., Financial Report 2024"
                                                                        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                                                    />
                                                                </div>

                                                                {/* Document Description */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                        Description
                                                                    </label>
                                                                    <textarea
                                                                        value={input.description}
                                                                        onChange={(e) => handleClientDocDescriptionChange(input.id, e.target.value)}
                                                                        rows={2}
                                                                        placeholder="Add details about what document is needed..."
                                                                        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Remove Button */}
                                                            {selectedTask.multiple_files && clientDocInputs.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeClientDocInput(input.id)}
                                                                    className="mt-6 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                                                                    title="Remove document request"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <p className="mt-2 text-xs text-gray-500">
                                                💡 Specify which documents you need from the client. They will receive a notification to upload these files.
                                            </p>
                                            
                                            {errors.client_documents && (
                                                <p className="mt-1 text-sm text-red-600">{errors.client_documents}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTaskModal(false);
                                            setSelectedTask(null);
                                            setShowForm(false);
                                            setFileInputs([{ id: 0, label: '', file: null }]);
                                            setClientDocInputs([{ id: 0, name: '', description: '' }]);
                                            setNextFileId(1);
                                            setNextClientDocId(1);
                                            reset();
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                            ) : (
                            /* Show assignment list if task has assignments */
                            <div className="space-y-4">
                                {/* Assignment History */}
                                {selectedTask.assignments && selectedTask.assignments.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">
                                            Submission History ({selectedTask.assignments.length} submission{selectedTask.assignments.length > 1 ? 's' : ''})
                                        </h4>
                                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                            {selectedTask.assignments.map((assignment, index) => (
                                                <div key={assignment.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                    {/* Submission Header - Always Visible */}
                                                    <div 
                                                        className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                                        onClick={() => toggleSubmission(assignment.id)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        Submission #{selectedTask.assignments.length - index}
                                                                    </p>
                                                                    {index === 0 && (
                                                                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Latest</span>
                                                                    )}
                                                                    {assignment.is_approved && (
                                                                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">✓ Approved</span>
                                                                    )}
                                                                    {assignment.comment && !assignment.is_approved && (
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
                                                    
                                                    {/* Submission Details - Collapsible */}
                                                    {expandedSubmissions.includes(assignment.id) && (
                                                    <div className="p-4 border-t border-gray-200 bg-white space-y-3">
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
                                                                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
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
                                                                                    {clientDoc.file && clientDoc.uploaded_at && (
                                                                                        <p className="text-xs text-green-600 mt-1">
                                                                                            ✅ Uploaded by client on {new Date(clientDoc.uploaded_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                                        </p>
                                                                                    )}
                                                                                    {!clientDoc.file && (
                                                                                        <p className="text-xs text-orange-600 mt-1">
                                                                                            ⏳ Waiting for client upload
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {clientDoc.file && (
                                                                                <a
                                                                                    href={`/storage/${clientDoc.file}`}
                                                                                    download
                                                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 ml-2"
                                                                                >
                                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                    </svg>
                                                                                    Download
                                                                                </a>
                                                                            )}
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

                                        {/* Client Document Review Actions - Show when status is "Client Reply" (in view-only mode) */}
                                        {selectedTask.status === 'Client Reply' && selectedTask.completion_status === 'in_progress' && selectedTask.is_assigned_to_me && (
                                            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                                                <div className="flex items-start space-x-3 mb-4">
                                                    <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                                                            Client has uploaded documents
                                                        </h4>
                                                        <p className="text-sm text-yellow-800">
                                                            Please review the documents uploaded by the client. You can accept them to complete the task or request re-upload if they need corrections.
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={handleAcceptClientDocuments}
                                                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Accept & Mark Complete
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowReuploadModal(true)}
                                                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Request Re-upload
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Add New Submission button - only show if can_edit (pending at lowest approval) */}
                                        {selectedTask.can_edit && selectedTask.assignments.length > 0 && (
                                            <div className="mt-6 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowForm(true)}
                                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add New Submission
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            )}
                            </div>
                        </div>
                    </div>
            )}

            {/* Re-upload Request Modal */}
            {showReuploadModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowReuploadModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Request Re-upload from Client
                                    </h3>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 mb-3">
                                            The previous submission will be kept in history. Please provide a reason for requesting re-upload:
                                        </p>
                                        <textarea
                                            value={reuploadComment}
                                            onChange={(e) => setReuploadComment(e.target.value)}
                                            rows={4}
                                            placeholder="Example: The documents need to be in PDF format, not images..."
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleRequestReupload}
                                    disabled={!reuploadComment.trim()}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send Request
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReuploadModal(false);
                                        setReuploadComment('');
                                    }}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
