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
}

interface TaskAssignment {
    id: number;
    time: string;
    notes: string | null;
    comment: string | null;
    client_comment: string | null;
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
    client_interact: boolean;
    multiple_files: boolean;
    is_assigned_to_me: boolean;
    my_assignment_id: number | null;
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

export default function ShowProject({ auth, project, workingSteps, myRole }: Props) {
    const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [expandedSubmissions, setExpandedSubmissions] = useState<number[]>([]);
    const [uploadMode, setUploadMode] = useState<'upload' | 'request'>('upload');
    const [fileInputs, setFileInputs] = useState<Array<{ id: number; label: string; file: File | null }>>([{ id: 0, label: '', file: null }]);
    const [clientDocInputs, setClientDocInputs] = useState<Array<{ id: number; name: string; description: string }>>([{ id: 0, name: '', description: '' }]);
    const [nextFileId, setNextFileId] = useState(1);
    const [nextClientDocId, setNextClientDocId] = useState(1);

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
        client_documents: Array<{ name: string; description: string }>;
        upload_mode: 'upload' | 'request';
    }>({
        notes: '',
        files: [],
        client_documents: [],
        upload_mode: 'upload',
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

        setSelectedTask(task);
        
        // If task has no assignments, show form directly
        // If task has assignments, show list first (form hidden)
        const hasNoAssignments = !task.assignments || task.assignments.length === 0;
        setShowForm(hasNoAssignments);
        
        // Expand latest submission by default
        if (task.assignments && task.assignments.length > 0) {
            setExpandedSubmissions([task.assignments[0].id]);
        } else {
            setExpandedSubmissions([]);
        }
        
        setUploadMode('upload');
        setFileInputs([{ id: 0, label: '', file: null }]);
        setClientDocInputs([{ id: 0, name: '', description: '' }]);
        setNextFileId(1);
        setNextClientDocId(1);
        setData({
            notes: task.latest_assignment?.notes || '',
            files: [],
            client_documents: [],
            upload_mode: 'upload',
        });
        setShowTaskModal(true);
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
    };

    const handleFileChange = (id: number, file: File) => {
        const updatedInputs = fileInputs.map(input => 
            input.id === id ? { ...input, file } : input
        );
        setFileInputs(updatedInputs);
        
        // Update form data with all files
        const allFiles = updatedInputs.filter(input => input.file !== null).map(input => input.file!);
        setData('files', allFiles);
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
        } else {
            const updatedInputs = fileInputs.filter(input => input.id !== id);
            setFileInputs(updatedInputs);
            
            // Update form data
            const allFiles = updatedInputs.filter(input => input.file !== null).map(input => input.file!);
            setData('files', allFiles);
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

        // Set upload_mode to current active tab
        const currentMode = uploadMode;
        setData('upload_mode', currentMode);
        
        // Clear data from inactive tab before submission
        if (currentMode === 'upload') {
            setData('client_documents', []);
        } else {
            setData('files', []);
        }

        // Use setTimeout to ensure state update before put
        setTimeout(() => {
            put(route('company.tasks.update-status', selectedTask.id), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    setShowTaskModal(false);
                    setSelectedTask(null);
                    setShowForm(false);
                    setUploadMode('upload');
                    setFileInputs([{ id: 0, label: '', file: null }]);
                    setClientDocInputs([{ id: 0, name: '', description: '' }]);
                    setNextFileId(1);
                    setNextClientDocId(1);
                    reset();
                    
                    // Reload page data to show updated assignments
                    router.reload({ only: ['workingSteps'] });
                },
            });
        }, 0);
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
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Update Modal */}
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
                                        setUploadMode('upload');
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

                                    {/* Previous Assignments History */}
                                    {selectedTask.assignments && selectedTask.assignments.length > 0 && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Submission History ({selectedTask.assignments.length} submission{selectedTask.assignments.length > 1 ? 's' : ''})
                                            </label>
                                            <div className="space-y-4">
                                                {selectedTask.assignments.map((assignment, index) => (
                                                    <div key={assignment.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    Submission #{selectedTask.assignments.length - index}
                                                                    {index === 0 && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Latest</span>}
                                                                    {assignment.is_approved && <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Approved</span>}
                                                                </p>
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
                                                        </div>
                                                        
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
                                                                        <div className="flex items-start space-x-2">
                                                                            <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-gray-900">{clientDoc.name}</p>
                                                                                {clientDoc.description && (
                                                                                    <p className="text-xs text-gray-600 mt-1">{clientDoc.description}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab System - Only show for client_interact tasks */}
                                    {selectedTask.client_interact && (
                                        <div className="mb-6">
                                            <div className="border-b border-gray-200">
                                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUploadMode('upload');
                                                            // Reset client document inputs when switching to upload
                                                            setClientDocInputs([{ id: nextClientDocId, name: '', description: '' }]);
                                                            setNextClientDocId(nextClientDocId + 1);
                                                            setData('client_documents', []);
                                                            setData('upload_mode', 'upload');
                                                        }}
                                                        className={`${
                                                            uploadMode === 'upload'
                                                                ? 'border-primary-500 text-primary-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                                    >
                                                        📁 Upload Files
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUploadMode('request');
                                                            // Reset file inputs when switching to request
                                                            setFileInputs([{ id: nextFileId, label: '', file: null }]);
                                                            setNextFileId(nextFileId + 1);
                                                            setData('files', []);
                                                            setData('upload_mode', 'request');
                                                        }}
                                                        className={`${
                                                            uploadMode === 'request'
                                                                ? 'border-primary-500 text-primary-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                                    >
                                                        📋 Request from Client
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Upload Section - Form Repeater Style */}
                                    {(!selectedTask.client_interact || uploadMode === 'upload') && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Upload Files
                                                {selectedTask.multiple_files ? (
                                                    <span className="ml-2 text-xs text-gray-500">(Multiple files allowed)</span>
                                                ) : (
                                                    <span className="ml-2 text-xs text-gray-500">(Single file only)</span>
                                                )}
                                            </label>
                                            {selectedTask.multiple_files && (
                                                <button
                                                    type="button"
                                                    onClick={addFileInput}
                                                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add File
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {fileInputs.map((input, index) => (
                                                <div key={input.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                    <div className="flex items-start gap-3">
                                                        {/* Label Input */}
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                File Label / Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={input.label}
                                                                onChange={(e) => handleLabelChange(input.id, e.target.value)}
                                                                placeholder="e.g., Laporan Keuangan, KTP, etc."
                                                                className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                            />
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFileInput(input.id)}
                                                            className="mt-6 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                                                            title="Remove file input"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Drag & Drop File Upload Area */}
                                                    <div className="mt-3">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            File Upload
                                                        </label>
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
                                        
                                        <p className="mt-2 text-xs text-gray-500">
                                            Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Max. 10MB per file)
                                        </p>
                                        
                                        {errors.files && (
                                            <p className="mt-1 text-sm text-red-600">{errors.files}</p>
                                        )}
                                    </div>
                                    )}

                                    {/* Client Document Request Section */}
                                    {selectedTask.client_interact && uploadMode === 'request' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Request Documents from Client
                                                {selectedTask.multiple_files ? (
                                                    <span className="ml-2 text-xs text-gray-500">(Multiple documents allowed)</span>
                                                ) : (
                                                    <span className="ml-2 text-xs text-gray-500">(Single document only)</span>
                                                )}
                                            </label>
                                            {selectedTask.multiple_files && (
                                                <button
                                                    type="button"
                                                    onClick={addClientDocInput}
                                                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Document
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {clientDocInputs.map((input, index) => (
                                                <div key={input.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
                                                                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                                    required
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
                                                                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Remove Button */}
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
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <p className="mt-2 text-xs text-gray-500">
                                            Specify which documents you need from the client
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
                                            setUploadMode('upload');
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
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
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
                                                                <p className="text-sm text-gray-600 mt-1">{assignment.notes}</p>
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
                                                                        <div className="flex items-start space-x-2">
                                                                            <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-gray-900">{clientDoc.name}</p>
                                                                                {clientDoc.description && (
                                                                                    <p className="text-xs text-gray-600 mt-1">{clientDoc.description}</p>
                                                                                )}
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

                                        {/* Add New Submission button - only show if latest assignment is rejected */}
                                        {selectedTask.assignments.length > 0 && selectedTask.assignments[0].comment && !selectedTask.assignments[0].is_approved && (
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
        </AuthenticatedLayout>
    );
}
