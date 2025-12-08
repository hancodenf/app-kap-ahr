import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import axios from 'axios';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WorkingStep {
    id: number;
    name: string;
    slug: string;
    order: number;
    project_id: number;
    tasks?: Task[];
}

interface Task {
    id: number;
    name: string;
    slug: string;
    order: number;
    working_step_id: number;
    project_id: number;
    time?: string;
    comment?: string;
    client_comment?: string;
    client_interact: 'read only' | 'restricted' | 'upload' | 'approval';
    approval_type: 'Once' | 'All Attempts';
    can_upload_files: boolean;
    multiple_files: boolean;
    is_required: boolean;
    completion_status?: 'pending' | 'in_progress' | 'completed';
    task_workers?: TaskWorker[];
    task_approvals?: Array<{ id: number; role: 'partner' | 'manager' | 'supervisor' | 'team leader'; order: number }>;
}

interface TaskWorker {
    id: number;
    task_id: number;
    project_team_id: number;
    worker_name: string;
    worker_email: string;
    worker_role: string;
}

interface ProjectBundle {
    id: number;
    name: string;
    year: string | number;
    status: 'Draft' | 'In Progress' | 'Completed' | 'Suspended' | 'Canceled';
    is_archived: boolean;
    client_id: number | null;
    client_name: string | null;
    client_alamat: string | null;
    client_kementrian: string | null;
    client_kode_satker: string | null;
    created_at: string;
    updated_at: string;
}

interface TeamMember {
    id: number;
    project_id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    user_position: string | null;
    role: 'partner' | 'manager' | 'supervisor' | 'team leader' | 'member';
    user?: {
        id: number;
        name: string;
        email: string;
        position?: string;
    };
}

interface AvailableUser {
    id: number;
    name: string;
    email: string;
    position: string | null;
}

interface Client {
    id: number;
    name: string;
    alamat: string;
    kementrian: string;
    kode_satker: string;
    used_years?: number[];
}

interface Props extends PageProps {
    bundle: ProjectBundle;
    workingSteps: WorkingStep[];
    teamMembers: TeamMember[];
    availableUsers: AvailableUser[];
    registeredApUserIds: number[];
    clients: Client[];
}

// Draggable Step Component
function DraggableStep({ step, children, isCollapsed, onToggleCollapse }: {
    step: WorkingStep;
    children: React.ReactNode;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `step-${step.id}` }); // Add prefix to differentiate

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white shadow-sm sm:rounded-lg">
            {/* Header Section dengan Responsive Layout */}
            <div className="p-6 pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
                    <div className="flex items-center">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing mr-3 p-1 hover:bg-gray-100 rounded"
                            style={{ touchAction: 'none' }}
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-primary-700 mb-2 flex items-center">
                                🔹 {step.name}
                                <button
                                    onClick={onToggleCollapse}
                                    className="ml-3 p-1 hover:bg-gray-200 rounded transition-colors"
                                    title={isCollapsed ? 'Expand substeps' : 'Collapse substeps'}
                                >
                                    <svg
                                        className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </h3>
                            <div className="h-1 w-20 bg-primary-600 rounded"></div>
                        </div>
                    </div>
                    <div className="ml-8 md:ml-0">
                        {children}
                    </div>
                </div>
            </div>

            {/* Content Section - TIDAK ada flex, full width */}
        </div>
    );
}

// Draggable Task Component
function DraggableTask({ task, onEdit, onDelete }: {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `substep-${task.id}` }); // Add prefix to differentiate

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="w-full bg-gray-50 border-b border-gray-200 last:border-b-0">
            <div className="px-6 py-4 flex items-center hover:bg-gray-100 transition-colors">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-200 rounded mr-4 flex-shrink-0"
                    style={{ touchAction: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base truncate">
                        {task.name}
                    </h4>

                    {(!!task.is_required || task.client_interact !== 'read only' || !!task.multiple_files || (task.task_workers && task.task_workers.length > 0)) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {!!task.is_required && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Required
                                </span>
                            )}
                            {task.client_interact !== 'read only' && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    {task.client_interact === 'upload' ? '📤 Client Upload' : '✅ Client Approval'}
                                </span>
                            )}
                            {!!task.multiple_files && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    Multiple Files
                                </span>
                            )}
                            {task.task_workers && task.task_workers.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {task.task_workers.map((worker, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
                                            title={`${worker.worker_email} - ${worker.worker_role}`}
                                        >
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            {worker.worker_name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Show({ auth, bundle, workingSteps, teamMembers, availableUsers, registeredApUserIds, clients }: Props) {
    const [steps, setSteps] = useState(workingSteps || []);
    const [activeStep, setActiveStep] = useState<WorkingStep | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [showAddStepModal, setShowAddStepModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showEditStepModal, setShowEditStepModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
    const [showAddTeamMemberModal, setShowAddTeamMemberModal] = useState(false);
    const [showEditTeamMemberModal, setShowEditTeamMemberModal] = useState(false);
    const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
    const [editingStep, setEditingStep] = useState<{ id: number; name: string } | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [collapsedSteps, setCollapsedSteps] = useState<Set<number>>(new Set());
    const [dragHoverStepId, setDragHoverStepId] = useState<number | null>(null);

    // Confirm dialog states
    const [showDeleteStepConfirm, setShowDeleteStepConfirm] = useState(false);
    const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
    const [showRemoveTeamMemberConfirm, setShowRemoveTeamMemberConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px of movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Auto-scroll functionality for touch devices
    useEffect(() => {
        let autoScrollInterval: NodeJS.Timeout;

        const handleAutoScroll = (clientY: number) => {
            const scrollThreshold = 100; // Distance from edge to trigger scroll
            const scrollSpeed = 10; // Pixels to scroll per interval

            const viewportHeight = window.innerHeight;
            const distanceFromTop = clientY;
            const distanceFromBottom = viewportHeight - clientY;

            if (distanceFromTop < scrollThreshold) {
                // Scroll up
                window.scrollBy(0, -scrollSpeed);
            } else if (distanceFromBottom < scrollThreshold) {
                // Scroll down
                window.scrollBy(0, scrollSpeed);
            }
        };

        const handleDragMove = (event: PointerEvent) => {
            if (!isDragging) return;

            // Clear existing interval
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
            }

            // Start auto-scroll if near edges
            const scrollThreshold = 100;
            const distanceFromTop = event.clientY;
            const distanceFromBottom = window.innerHeight - event.clientY;

            if (distanceFromTop < scrollThreshold || distanceFromBottom < scrollThreshold) {
                autoScrollInterval = setInterval(() => {
                    handleAutoScroll(event.clientY);
                }, 16); // ~60fps
            }
        };

        const handleDragEnd = () => {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
            }
        };

        if (isDragging) {
            document.addEventListener('pointermove', handleDragMove);
            document.addEventListener('pointerup', handleDragEnd);
        }

        return () => {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
            }
            document.removeEventListener('pointermove', handleDragMove);
            document.removeEventListener('pointerup', handleDragEnd);
        };
    }, [isDragging]);

    // Sync steps state with workingSteps props when it changes
    useEffect(() => {
        setSteps(workingSteps || []);
    }, [workingSteps]);

    const { data: stepData, setData: setStepData, post: postStep, reset: resetStep } = useForm({
        name: '',
        bundle_id: bundle.id, // Send as bundle_id as expected by controller
    });

    const { data: taskData, setData: setTaskData, post: postTask, reset: resetTask } = useForm({
        name: '',
        working_step_id: 0,
        client_interact: 'read only' as 'read only' | 'restricted' | 'upload' | 'approval',
        approval_type: 'Once' as 'Once' | 'All Attempts',
        can_upload_files: false,
        multiple_files: false,
        is_required: false,
    });

    const { data: editStepData, setData: setEditStepData, put: putStep, processing: editStepProcessing, errors: editStepErrors, reset: resetEditStep } = useForm({
        name: '',
    });

    // Edit Template Form
    const { data: editTemplateData, setData: setEditTemplateData, put: putTemplate, processing: editTemplateProcessing, errors: editTemplateErrors, reset: resetEditTemplate } = useForm({
        name: '',
        client_id: 0,
        year: new Date().getFullYear(),
        status: 'Draft' as 'Draft' | 'In Progress' | 'Completed' | 'Suspended' | 'Canceled',
        is_archived: false,
    });

    // Get year options with disabled status for used years
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const selectedClient = clients.find(c => c.id === editTemplateData.client_id);
        const usedYears = (selectedClient?.used_years || []).map(y => Number(y)); // Convert to numbers

        // Generate years from 7 years ago to 1 year in the future
        const startYear = currentYear - 7; // 7 tahun ke belakang
        const endYear = currentYear + 1;   // 1 tahun ke depan
        const yearCount = endYear - startYear + 1;

        return Array.from({ length: yearCount }, (_, i) => {
            const year = endYear - i; // Start from future year and go backwards for descending order
            return {
                value: year,
                label: year.toString(),
                isDisabled: usedYears.includes(year)
            };
        });
    }, [editTemplateData.client_id, clients]);

    const { data: editTaskData, setData: setEditTaskData, put: putTask, reset: resetEditTask } = useForm({
        name: '',
        client_interact: 'read only' as 'read only' | 'restricted' | 'upload' | 'approval',
        approval_type: 'Once' as 'Once' | 'All Attempts',
        can_upload_files: false,
        multiple_files: false,
        is_required: false,
        worker_ids: [] as number[],
        approval_roles: [] as Array<'partner' | 'manager' | 'supervisor' | 'team leader'>,
    });

    // Team Member Forms
    const { data: teamMemberData, setData: setTeamMemberData, post: postTeamMember, reset: resetTeamMember } = useForm({
        project_id: bundle.id,
        user_id: 0,
        role: 'member' as 'partner' | 'manager' | 'supervisor' | 'team leader' | 'member',
    });

    const { data: editTeamMemberData, setData: setEditTeamMemberData, put: putTeamMember, reset: resetEditTeamMember } = useForm({
        role: 'member' as 'partner' | 'manager' | 'supervisor' | 'team leader' | 'member',
    });

    // Helper function to check if user is registered AP
    const isUserRegisteredAp = (userId: number): boolean => {
        return registeredApUserIds.includes(userId);
    };

    // Helper function to check if partner option should be disabled
    const isPartnerOptionDisabled = (userId: number | null): boolean => {
        // If no user selected yet, allow partner to be selected (don't disable)
        if (!userId || userId === 0) return false;
        // If user is selected, check if they're registered AP
        return !isUserRegisteredAp(userId);
    };

    // Filtered users based on selected role (for Add Member modal)
    const filteredAvailableUsers = useMemo(() => {
        if (teamMemberData.role === 'partner') {
            // If role is partner, only show registered APs
            return availableUsers.filter(user => isUserRegisteredAp(user.id));
        }
        // Otherwise show all users
        return availableUsers;
    }, [teamMemberData.role, availableUsers, registeredApUserIds]);

    // Handle close Add Team Member modal with reset
    const handleCloseAddTeamMemberModal = () => {
        setShowAddTeamMemberModal(false);
        resetTeamMember();
    };

    // Handle close Edit Team Member modal with reset
    const handleCloseEditTeamMemberModal = () => {
        setShowEditTeamMemberModal(false);
        setEditingTeamMember(null);
        resetEditTeamMember();
    };

    const handleAddStep = (e: React.FormEvent) => {
        e.preventDefault();
        postStep(route('admin.projects.working-steps.store'), {
            onSuccess: () => {
                setShowAddStepModal(false);
                resetStep();
                setStepData('name', '');
                router.reload(); // Refresh to get updated data
            },
        });
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        postTask(route('admin.projects.tasks.store'), {
            onSuccess: (response) => {
                setShowAddTaskModal(false);
                resetTask();
                setSelectedStepId(null);
                // Reset form data manually
                setTaskData({
                    name: '',
                    working_step_id: 0,
                });
                router.reload(); // Refresh to get updated data
            },
            onError: (errors) => {
                console.error('Error adding task:', errors);
            }
        });
    };

    const handleDeleteStep = (step: WorkingStep) => {
        setItemToDelete({ id: step.id, name: step.name });
        setShowDeleteStepConfirm(true);
    };

    const confirmDeleteStep = () => {
        if (itemToDelete) {
            router.delete(route('admin.projects.working-steps.destroy', itemToDelete.id));
        }
    };

    const handleDeleteTask = (task: Task) => {
        setItemToDelete({ id: task.id, name: task.name });
        setShowDeleteTaskConfirm(true);
    };

    const confirmDeleteTask = () => {
        if (itemToDelete) {
            router.delete(route('admin.projects.tasks.destroy', itemToDelete.id));
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);

        // Filter worker_ids to only include team members that still exist
        const validWorkerIds = (task.task_workers?.map(w => w.project_team_id) || [])
            .filter(workerId => teamMembers.some(member => member.id === workerId));

        const approvalRoles = (task.task_approvals || [])
            .sort((a, b) => a.order - b.order)
            .map(approval => approval.role);

        setEditTaskData({
            name: task.name,
            client_interact: task.client_interact,
            can_upload_files: task.can_upload_files || false,
            multiple_files: task.multiple_files,
            is_required: task.is_required || false,
            approval_type: task.approval_type || 'All Attempts',
            worker_ids: validWorkerIds,
            approval_roles: approvalRoles,
        });
        setShowEditTaskModal(true);
    };

    const handleEditStep = (step: WorkingStep) => {
        setEditingStep({ id: step.id, name: step.name });
        setEditStepData({
            name: step.name,
        });
        setShowEditStepModal(true);
    };

    const handleUpdateStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStep) return;

        putStep(route('admin.projects.working-steps.update', editingStep.id), {
            onSuccess: () => {
                setShowEditStepModal(false);
                setEditingStep(null);
                resetEditStep();
                // Refresh page to get updated data
                router.reload();
            },
        });
    };

    const handleEditTemplate = () => {
        setEditTemplateData({
            name: bundle.name,
            client_id: bundle.client_id || 0,
            year: Number(bundle.year) || new Date().getFullYear(),
            status: bundle.status || 'Draft',
            is_archived: bundle.is_archived || false,
        });
        setShowEditTemplateModal(true);
    };

    const handleUpdateTemplate = (e: React.FormEvent) => {
        e.preventDefault();

        putTemplate(route('admin.projects.bundles.update', bundle.id), {
            onSuccess: () => {
                setShowEditTemplateModal(false);
                resetEditTemplate();
                // Refresh page to get updated data
                router.reload();
            },
        });
    };

    const handleUpdateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;

        putTask(route('admin.projects.tasks.update', editingTask.id), {
            onSuccess: () => {
                setShowEditTaskModal(false);
                setEditingTask(null);
                resetEditTask();
                // Refresh page to get updated data
                router.reload();
            },
        });
    };

    // Team Member Handlers
    const handleAddTeamMember = (e: React.FormEvent) => {
        e.preventDefault();
        postTeamMember(route('admin.projects.team-members.store'), {
            onSuccess: () => {
                setShowAddTeamMemberModal(false);
                resetTeamMember();
                setTeamMemberData({
                    project_id: bundle.id,
                    user_id: 0,
                    role: 'member',
                });
                router.reload();
            },
        });
    };

    const handleEditTeamMember = (member: TeamMember) => {
        setEditingTeamMember(member);
        setEditTeamMemberData({
            role: member.role,
        });
        setShowEditTeamMemberModal(true);
    };

    const handleUpdateTeamMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeamMember) return;

        putTeamMember(route('admin.projects.team-members.update', editingTeamMember.id), {
            onSuccess: () => {
                setShowEditTeamMemberModal(false);
                setEditingTeamMember(null);
                resetEditTeamMember();
                router.reload();
            },
        });
    };

    const handleDeleteTeamMember = (member: TeamMember) => {
        setItemToDelete({ id: member.id, name: member.user_name });
        setShowRemoveTeamMemberConfirm(true);
    };

    const confirmDeleteTeamMember = () => {
        if (itemToDelete) {
            router.delete(route('admin.projects.team-members.destroy', itemToDelete.id));
        }
    };

    // Toggle collapse state for a step
    const toggleStepCollapse = (stepId: number) => {
        setCollapsedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(stepId)) {
                newSet.delete(stepId);
            } else {
                newSet.add(stepId);
            }
            return newSet;
        });
    };

    // Auto-expand when dragging substep hovers over collapsed step
    useEffect(() => {
        if (dragHoverStepId && collapsedSteps.has(dragHoverStepId)) {
            const timer = setTimeout(() => {
                setCollapsedSteps(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(dragHoverStepId);
                    return newSet;
                });
            }, 800); // Auto-expand after 800ms of hovering

            return () => clearTimeout(timer);
        }
    }, [dragHoverStepId, collapsedSteps]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setIsDragging(true);

        // Check if dragging a task first (prefix with 'substep-')
        if (String(active.id).startsWith('substep-')) {
            const taskId = Number(String(active.id).replace('substep-', ''));
            for (const step of steps) {
                const task = step.tasks?.find(ss => ss.id === taskId);
                if (task) {
                    setActiveTask(task);
                    return;
                }
            }
        }

        // Check if dragging a step (prefix with 'step-')
        if (String(active.id).startsWith('step-')) {
            const stepId = Number(String(active.id).replace('step-', ''));
            const step = steps.find(s => s.id === stepId);
            if (step) {
                setActiveStep(step);
                return;
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveStep(null);
        setActiveTask(null);
        setIsDragging(false);
        setDragHoverStepId(null);

        if (!over) return;

        // Handle step reordering
        if (String(active.id).startsWith('step-')) {
            const activeStepId = Number(String(active.id).replace('step-', ''));
            const overStepId = Number(String(over.id).replace('step-', ''));

            const oldIndex = steps.findIndex(s => s.id === activeStepId);
            const newIndex = steps.findIndex(s => s.id === overStepId);

            if (oldIndex !== newIndex) {
                const newSteps = arrayMove(steps, oldIndex, newIndex);
                // Update order numbers
                const stepsWithOrder = newSteps.map((step, index) => ({
                    ...step,
                    order: index + 1
                }));

                setSteps(stepsWithOrder);

                // Send to backend
                const stepData = stepsWithOrder.map(step => ({
                    id: step.id,
                    order: step.order
                }));

                axios.post(route('admin.projects.working-steps.reorder'), { steps: stepData })
                    .then(response => {
                        // Success - no reload needed, state already updated
                    })
                    .catch(error => {
                        console.error('Error reordering steps:', error);
                        alert('Failed to save step order. Please try again.');
                        // Reload to get correct state from server
                        router.reload();
                    });
            }
            return;
        }

        // Handle task reordering/moving
        if (String(active.id).startsWith('substep-')) {
            const activeTaskId = Number(String(active.id).replace('substep-', ''));

            // Find the active substep and its current step
            let sourceStepId = 0;
            let activeTaskObj = null;
            for (const step of steps) {
                const task = step.tasks?.find(ss => ss.id === activeTaskId);
                if (task) {
                    activeTaskObj = task;
                    sourceStepId = step.id;
                    break;
                }
            }

            if (!activeTaskObj) return;

            let targetStepId = sourceStepId;
            let targetTaskId: number | null = null;

            // Determine target step and substep
            if (String(over.id).startsWith('step-')) {
                // Dropped on a step
                targetStepId = Number(String(over.id).replace('step-', ''));
            } else if (String(over.id).startsWith('substep-')) {
                // Dropped on another substep - find its parent step
                targetTaskId = Number(String(over.id).replace('substep-', ''));
                for (const step of steps) {
                    if (step.tasks?.some(ss => ss.id === targetTaskId)) {
                        targetStepId = step.id;
                        break;
                    }
                }
            }

            const newSteps = [...steps];

            // Case 1: Reordering within the same step
            if (sourceStepId === targetStepId && targetTaskId) {
                const sourceStep = newSteps.find(s => s.id === sourceStepId);
                if (sourceStep?.tasks) {
                    const oldIndex = sourceStep.tasks.findIndex(ss => ss.id === activeTaskId);
                    const newIndex = sourceStep.tasks.findIndex(ss => ss.id === targetTaskId);

                    if (oldIndex !== newIndex && oldIndex > -1 && newIndex > -1) {
                        // Use arrayMove for proper reordering
                        sourceStep.tasks = arrayMove(
                            sourceStep.tasks,
                            oldIndex,
                            newIndex
                        );

                        // Update order numbers
                        sourceStep.tasks = sourceStep.tasks.map((ss, index) => ({
                            ...ss,
                            order: index + 1
                        }));
                    }
                }
            }
            // Case 2: Moving to a different step
            else if (sourceStepId !== targetStepId) {
                const sourceStep = newSteps.find(s => s.id === sourceStepId);
                if (sourceStep?.tasks) {
                    const taskIndex = sourceStep.tasks.findIndex(ss => ss.id === activeTaskId);
                    if (taskIndex > -1) {
                        const [movedTask] = sourceStep.tasks.splice(taskIndex, 1);

                        // Add to target step
                        const targetStepObj = newSteps.find(s => s.id === targetStepId);
                        if (targetStepObj) {
                            if (!targetStepObj.tasks) {
                                targetStepObj.tasks = [];
                            }

                            // Update substep's step reference
                            movedTask.working_step_id = targetStepId;

                            // Insert at correct position if dropped on another substep
                            if (targetTaskId) {
                                const targetIndex = targetStepObj.tasks.findIndex(ss => ss.id === targetTaskId);
                                if (targetIndex > -1) {
                                    targetStepObj.tasks.splice(targetIndex, 0, movedTask);
                                } else {
                                    targetStepObj.tasks.push(movedTask);
                                }
                            } else {
                                targetStepObj.tasks.push(movedTask);
                            }

                            // Reorder substeps in target step
                            targetStepObj.tasks = targetStepObj.tasks.map((ss, index) => ({
                                ...ss,
                                order: index + 1
                            }));

                            // Reorder remaining substeps in source step
                            sourceStep.tasks = sourceStep.tasks.map((ss, index) => ({
                                ...ss,
                                order: index + 1
                            }));
                        }
                    }
                }
            }

            setSteps(newSteps);

            // Send all affected substeps to backend
            const allTasks: any[] = [];
            newSteps.forEach(step => {
                if (step.tasks) {
                    step.tasks.forEach(ss => {
                        allTasks.push({
                            id: ss.id,
                            order: ss.order,
                            working_step_id: ss.working_step_id
                        });
                    });
                }
            });

            axios.post(route('admin.projects.tasks.reorder'), { tasks: allTasks })
                .then(response => {
                    // Success - no reload needed, state already updated
                })
                .catch(error => {
                    console.error('Error reordering tasks:', error);
                    alert('Failed to save task order. Please try again.');
                    // Reload to get correct state from server
                    router.reload();
                });
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        // Only handle substep dragging over steps
        if (String(active.id).startsWith('substep-') && over && String(over.id).startsWith('step-')) {
            const stepId = Number(String(over.id).replace('step-', ''));
            setDragHoverStepId(stepId);
        } else {
            setDragHoverStepId(null);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {bundle.name} - Project Steps
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {steps?.length || 0} working steps
                        </p>
                    </div>
                    <Link
                        href={route('admin.projects.bundles.index')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm"
                    >
                        Back to Projects
                    </Link>
                </div>
            }
        >
            <Head title={`${bundle.name} - Project Steps`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Project Name Header */}
                    <div className="mb-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-medium text-gray-900">Project Name</h3>
                                            {/* Status Badge */}
                                            <div className="flex items-center">
                                                {bundle.status === 'In Progress' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                        In Progress
                                                    </span>
                                                ) : bundle.status === 'Completed' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Completed
                                                    </span>
                                                ) : bundle.status === 'Draft' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                        Draft
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xl font-semibold text-gray-800">{bundle.name}</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Client Information</h3>
                                        {bundle.client_name ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Client Name</p>
                                                    <p className="text-base text-gray-900">{bundle.client_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Kementrian</p>
                                                    <p className="text-base text-gray-900">{bundle.client_kementrian}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Alamat</p>
                                                    <p className="text-base text-gray-900">{bundle.client_alamat}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Kode Satker</p>
                                                    <p className="text-base text-gray-900">{bundle.client_kode_satker}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-8 text-gray-500">
                                                <div className="text-center">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <p className="mt-2 text-sm">No client assigned yet</p>
                                                    <p className="text-xs text-gray-400">Click "Edit Project" to assign a client</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleEditTemplate}
                                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ml-4 hover:shadow-sm"
                                >
                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Project
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Team Members Section */}
                    <div className="mb-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                                    <p className="text-sm text-gray-600">Manage team members and their roles in this project</p>
                                </div>
                                <button
                                    onClick={() => setShowAddTeamMemberModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 inline-flex items-center hover:shadow-sm"
                                >
                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Team Member
                                </button>
                            </div>

                            {teamMembers && teamMembers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {teamMembers.map((member) => (
                                                <tr key={member.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.user_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.user_email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.user_position || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.role === 'partner' ? 'bg-purple-100 text-purple-800' :
                                                                member.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                                    member.role === 'supervisor' ? 'bg-indigo-100 text-indigo-800' :
                                                                        member.role === 'team leader' ? 'bg-green-100 text-green-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEditTeamMember(member)}
                                                            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 mr-2 hover:shadow-sm"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit Role
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTeamMember(member)}
                                                            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by adding team members to this project.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Working Step Button */}
                    <div className="mb-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Working Steps Management</h3>
                                    <p className="text-sm text-gray-600">Manage working steps and tasks for this project template</p>
                                </div>
                                <button
                                    onClick={() => setShowAddStepModal(true)}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm"
                                >
                                    Add New Working Step
                                </button>
                            </div>
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="space-y-6">
                            <SortableContext items={(steps || []).map(s => `step-${s.id}`)} strategy={verticalListSortingStrategy}>
                                {(steps || []).map((step) => (
                                    <div key={step.id} className="bg-white shadow-sm sm:rounded-lg">
                                        {/* Header Step dengan Tombol - Menggunakan DraggableStep */}
                                        <DraggableStep
                                            step={step}
                                            isCollapsed={collapsedSteps.has(step.id)}
                                            onToggleCollapse={() => toggleStepCollapse(step.id)}
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStepId(step.id);
                                                        setTaskData('working_step_id', step.id);
                                                        setShowAddTaskModal(true);
                                                    }}
                                                    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Task
                                                </button>
                                                <button
                                                    onClick={() => handleEditStep(step)}
                                                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit Step
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStep(step)}
                                                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Step
                                                </button>
                                            </div>
                                        </DraggableStep>

                                        {/* Tasks List - SEPENUHNYA TERPISAH dari flex - Conditional Rendering */}
                                        {!collapsedSteps.has(step.id) && (
                                            <div className="px-4 pb-4">
                                                <div className="px-2 pb-2 pt-5">
                                                    <h5 className="text-sm font-medium text-gray-600 mb-3">Tasks:</h5>
                                                </div>
                                                <div className="space-y-1">
                                                    <SortableContext
                                                        items={(step.tasks || []).map(ss => `substep-${ss.id}`)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        {(step.tasks || []).map((task) => (
                                                            <DraggableTask
                                                                key={task.id}
                                                                task={task}
                                                                onEdit={handleEditTask}
                                                                onDelete={(id) => handleDeleteTask(task)}
                                                            />
                                                        ))}
                                                    </SortableContext>
                                                </div>
                                            </div>
                                        )}

                                        {/* Show collapsed indicator when section is collapsed */}
                                        {collapsedSteps.has(step.id) && (
                                            <div className="px-6 py-3 bg-gray-50 border-t cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => toggleStepCollapse(step.id)}>
                                                <p className="text-sm text-gray-500 text-center">
                                                    {step.tasks ? step.tasks.length : 0} task{(step.tasks ? step.tasks.length : 0) !== 1 ? 's' : ''} hidden • Click to expand
                                                </p>
                                            </div>
                                        )}

                                        {/* Empty Tasks State - only show when expanded */}
                                        {!collapsedSteps.has(step.id) && (!step.tasks || step.tasks.length === 0) && (
                                            <div className="px-4 pb-4">
                                                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg mx-2">
                                                    <p>No tasks yet. Click "Add Task" to get started.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </SortableContext>

                            {(!steps || steps.length === 0) && (
                                <div className="bg-white shadow-sm sm:rounded-lg">
                                    <div className="p-12 text-center">
                                        <div className="text-gray-500">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No working steps</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Get started by creating your first working step.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DragOverlay>
                            {activeStep ? (
                                <div className="bg-white shadow-lg rounded-lg p-4 opacity-90">
                                    <h3 className="text-lg font-semibold text-primary-700">
                                        🔹 {activeStep.name}
                                    </h3>
                                </div>
                            ) : activeTask ? (
                                <div className="bg-white shadow-lg rounded-lg p-4 opacity-90">
                                    <h4 className="font-medium text-gray-900">
                                        {activeTask.name}
                                    </h4>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* Add Working Step Modal */}
            {showAddStepModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => {
                            setShowAddStepModal(false);
                            resetStep();
                            setStepData('name', '');
                        }}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            <form onSubmit={handleAddStep} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Working Step</h3>

                                <div className="mb-6">
                                    <label htmlFor="step_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Working Step Name
                                    </label>
                                    <input
                                        type="text"
                                        id="step_name"
                                        value={stepData.name}
                                        onChange={(e) => setStepData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g., Perikatan, Perencanaan, Pelaksanaan"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Note: You can add tasks after creating the working step
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddStepModal(false);
                                            resetStep();
                                            setStepData('name', '');
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-all duration-200 hover:shadow-sm"
                                    >
                                        Create Working Step
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Task Modal */}
            {showAddTaskModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddTaskModal(false)}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            <form onSubmit={handleAddTask} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="task_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Task Name
                                        </label>
                                        <input
                                            type="text"
                                            id="task_name"
                                            value={taskData.name}
                                            onChange={(e) => setTaskData('name', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="e.g., Penetapan KAP"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="add_task_client_interact" className="block text-sm font-medium text-gray-700 mb-2">
                                            Client Interaction Level
                                        </label>
                                        <select
                                            id="add_task_client_interact"
                                            value={taskData.client_interact}
                                            onChange={(e) => setTaskData('client_interact', e.target.value as 'read only' | 'restricted' | 'upload' | 'approval')}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="read only">👁️ Read Only - Client can only view</option>
                                            <option value="restricted">� Restricted - Client has limited access</option>
                                            <option value="upload">📤 Upload - Client can upload files</option>
                                            <option value="approval">✅ Approval - Client can approve or reject</option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Set how clients can interact with this task
                                        </p>
                                    </div>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={taskData.can_upload_files}
                                            onChange={(e) => {
                                                setTaskData('can_upload_files', e.target.checked);
                                                // Reset multiple_files when can_upload_files is disabled
                                                if (!e.target.checked) {
                                                    setTaskData('multiple_files', false);
                                                }
                                            }}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Can Upload Files</span>
                                    </label>

                                    {taskData.can_upload_files && (
                                        <label className="flex items-center ml-6">
                                            <input
                                                type="checkbox"
                                                checked={taskData.multiple_files}
                                                onChange={(e) => setTaskData('multiple_files', e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Multiple Files</span>
                                        </label>
                                    )}

                                    <label className="flex items-start space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={taskData.is_required}
                                            onChange={(e) => setTaskData('is_required', e.target.checked)}
                                            className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">
                                                Required to unlock next step
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                Must be completed before next step can be accessed
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddTaskModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                                    >
                                        Add Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Template Modal */}
            {showEditTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
                        <form onSubmit={handleUpdateTemplate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={editTemplateData.name}
                                    onChange={(e) => setEditTemplateData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                {editTemplateErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{editTemplateErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Client
                                </label>
                                <SearchableSelect
                                    options={clients.map((client) => ({
                                        value: client.id,
                                        label: client.name,
                                        subtitle: `${client.kementrian} - ${client.alamat}`,
                                    }))}
                                    value={editTemplateData.client_id}
                                    onChange={(value) => setEditTemplateData('client_id', value as number)}
                                    placeholder="Select Client"
                                />
                                {editTemplateErrors.client_id && (
                                    <p className="mt-1 text-sm text-red-600">{editTemplateErrors.client_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Project Year
                                </label>
                                <SearchableSelect
                                    options={yearOptions}
                                    value={editTemplateData.year}
                                    onChange={(value) => setEditTemplateData('year', value as number)}
                                    placeholder="Select project year..."
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Available years: {new Date().getFullYear() - 7} - {new Date().getFullYear() + 1}
                                </p>
                                {editTemplateErrors.year && (
                                    <p className="mt-1 text-sm text-red-600">{editTemplateErrors.year}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Status
                                </label>
                                <select
                                    value={editTemplateData.status}
                                    onChange={(e) => setEditTemplateData('status', e.target.value as 'Draft' | 'In Progress' | 'Completed' | 'Suspended' | 'Canceled')}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="Draft">📝 Draft - Project is being prepared</option>
                                    <option value="In Progress">🔄 In Progress - Project is active</option>
                                    <option value="Completed">✅ Completed - Project is finished</option>
                                    <option value="Suspended">⏸️ Suspended - Project is temporarily halted</option>
                                    <option value="Canceled">❌ Canceled - Project is permanently stopped</option>
                                </select>
                                <p className="mt-2 text-xs text-gray-500">
                                    {editTemplateData.status === 'Draft' && 'Draft projects are being prepared and not yet started'}
                                    {editTemplateData.status === 'In Progress' && 'In Progress projects are accessible to assigned team members'}
                                    {editTemplateData.status === 'Completed' && 'Completed projects are finished and read-only'}
                                    {editTemplateData.status === 'Suspended' && 'Suspended projects are temporarily halted but can be resumed'}
                                    {editTemplateData.status === 'Canceled' && 'Canceled projects are permanently stopped and cannot be resumed'}
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={editTemplateData.is_archived}
                                        onChange={(e) => setEditTemplateData('is_archived', e.target.checked)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        📦 Archive Project
                                    </span>
                                </label>
                                <p className="mt-1 text-xs text-gray-500">
                                    {editTemplateData.is_archived
                                        ? 'This project will be archived and hidden from regular views'
                                        : 'Check this to archive the project for storage purposes'
                                    }
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditTemplateModal(false);
                                        resetEditTemplate();
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editTemplateProcessing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {editTemplateProcessing ? 'Updating...' : 'Update Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Step Modal */}
            {showEditStepModal && editingStep && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Edit Step</h3>
                        <form onSubmit={handleUpdateStep} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Step Name
                                </label>
                                <input
                                    type="text"
                                    value={editStepData.name}
                                    onChange={(e) => setEditStepData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                {editStepErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{editStepErrors.name}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditStepModal(false);
                                        setEditingStep(null);
                                        resetEditStep();
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editStepProcessing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {editStepProcessing ? 'Updating...' : 'Update Step'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {showEditTaskModal && editingTask && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowEditTaskModal(false)}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            <form onSubmit={handleUpdateTask} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="edit_task_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Task Name
                                        </label>
                                        <input
                                            type="text"
                                            id="edit_task_name"
                                            value={editTaskData.name}
                                            onChange={(e) => setEditTaskData('name', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="client_interact" className="block text-sm font-medium text-gray-700 mb-2">
                                                Client Interaction Level
                                            </label>
                                            <select
                                                id="client_interact"
                                                value={editTaskData.client_interact}
                                                onChange={(e) => setEditTaskData('client_interact', e.target.value as 'read only' | 'restricted' | 'upload' | 'approval')}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="read only">👁️ Read Only - Client can only view</option>
                                                <option value="restricted">� Restricted - Client has limited access</option>
                                                <option value="upload">📤 Upload - Client can upload files</option>
                                                <option value="approval">✅ Approval - Client can approve or reject</option>
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Set how clients can interact with this task
                                            </p>
                                        </div>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={editTaskData.can_upload_files}
                                                onChange={(e) => {
                                                    setEditTaskData('can_upload_files', e.target.checked);
                                                    // Reset multiple_files when can_upload_files is disabled
                                                    if (!e.target.checked) {
                                                        setEditTaskData('multiple_files', false);
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can Upload Files</span>
                                        </label>

                                        {editTaskData.can_upload_files && (
                                            <label className="flex items-center ml-6">
                                                <input
                                                    type="checkbox"
                                                    checked={editTaskData.multiple_files}
                                                    onChange={(e) => setEditTaskData('multiple_files', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Multiple Files</span>
                                            </label>
                                        )}

                                        <label className="flex items-start space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={editTaskData.is_required}
                                                onChange={(e) => setEditTaskData('is_required', e.target.checked)}
                                                className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    Required to unlock next step
                                                </span>
                                                <p className="text-xs text-gray-500">
                                                    Must be completed before next step can be accessed
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label htmlFor="workers" className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign Team Members
                                        </label>
                                        <SearchableSelect
                                            multiple={true}
                                            options={teamMembers.map(member => ({
                                                value: member.id,
                                                label: member.user_name,
                                                subtitle: `${member.user_email} - ${member.role}`,
                                            }))}
                                            value={editTaskData.worker_ids}
                                            onChange={(value) => setEditTaskData('worker_ids', value as number[])}
                                            placeholder="Select team members..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ✅ Approval Required From
                                        </label>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Select roles that need to approve this task. Will be automatically ordered by priority.
                                        </p>
                                        <div className="space-y-2">
                                            {(['team leader', 'supervisor', 'manager', 'partner'] as const).map((role) => {
                                                // Define role priority for sorting
                                                const rolePriority: { [key: string]: number } = {
                                                    'team leader': 1,
                                                    'supervisor': 2,
                                                    'manager': 3,
                                                    'partner': 4,
                                                };

                                                // Sort approval roles by priority
                                                const sortedRoles = [...editTaskData.approval_roles].sort((a, b) =>
                                                    rolePriority[a] - rolePriority[b]
                                                );

                                                const orderNumber = sortedRoles.indexOf(role) + 1;

                                                return (
                                                    <label key={role} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={editTaskData.approval_roles.includes(role)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setEditTaskData('approval_roles', [...editTaskData.approval_roles, role]);
                                                                } else {
                                                                    setEditTaskData('approval_roles', editTaskData.approval_roles.filter(r => r !== role));
                                                                }
                                                            }}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1 flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700 capitalize">
                                                                {role}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                Priority: {rolePriority[role]}
                                                            </span>
                                                        </div>
                                                        {editTaskData.approval_roles.includes(role) && (
                                                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                                Order: {orderNumber}
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {editTaskData.approval_roles.length > 0 && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-xs font-medium text-blue-800 mb-1">✓ Approval Flow (Auto-sorted by priority):</p>
                                                <p className="text-sm text-blue-700 font-medium">
                                                    {(() => {
                                                        const rolePriority: { [key: string]: number } = {
                                                            'team leader': 1,
                                                            'supervisor': 2,
                                                            'manager': 3,
                                                            'partner': 4,
                                                        };
                                                        return [...editTaskData.approval_roles]
                                                            .sort((a, b) => rolePriority[a] - rolePriority[b])
                                                            .map((role, idx) => (
                                                                <span key={role}>
                                                                    {idx > 0 && ' → '}
                                                                    <span className="capitalize">{idx + 1}. {role}</span>
                                                                </span>
                                                            ));
                                                    })()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="approval_type" className="block text-sm font-medium text-gray-700 mb-2">
                                            Approval Workflow Type
                                        </label>
                                        <select
                                            id="approval_type"
                                            value={editTaskData.approval_type}
                                            onChange={(e) => setEditTaskData('approval_type', e.target.value as 'Once' | 'All Attempts')}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="All Attempts">All Attempts</option>
                                            <option value="Once">Once</option>
                                        </select>
                                        <p className="mt-3 text-xs text-gray-500">
                                            Once - Once submission approval status is approved by highest role on this task, no need to start approval workflow from beginning when it rejected by client or need to ask client for re-upload files
                                        </p>
                                        <p className="mt-3 text-xs text-gray-500">
                                            All Attempts - All rejections by client or request for re-upload files will require a new approval workflow
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditTaskModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                                    >
                                        Update Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Team Member Modal */}
            {showAddTeamMemberModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCloseAddTeamMemberModal}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={handleCloseAddTeamMemberModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <form onSubmit={handleAddTeamMember} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            Select User
                                        </label>
                                        <SearchableSelect
                                            options={filteredAvailableUsers.map((user) => ({
                                                value: user.id,
                                                label: user.name,
                                                subtitle: user.email,
                                            }))}
                                            value={teamMemberData.user_id}
                                            onChange={(value) => setTeamMemberData('user_id', value as number)}
                                            placeholder="Search and select user..."
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                            Role in Project
                                        </label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'member', label: 'Member' },
                                                { value: 'team leader', label: 'Team Leader' },
                                                { value: 'supervisor', label: 'Supervisor' },
                                                { value: 'manager', label: 'Manager' },
                                                {
                                                    value: 'partner',
                                                    label: teamMemberData.user_id > 0 && isPartnerOptionDisabled(teamMemberData.user_id)
                                                        ? 'Partner (Registered AP Only)'
                                                        : 'Partner',
                                                    isDisabled: isPartnerOptionDisabled(teamMemberData.user_id)
                                                },
                                            ]}
                                            value={teamMemberData.role}
                                            onChange={(value) => setTeamMemberData('role', value as any)}
                                            placeholder="Select role..."
                                        />
                                        {teamMemberData.user_id > 0 && isPartnerOptionDisabled(teamMemberData.user_id) && (
                                            <p className="mt-1 text-xs text-amber-600">
                                                ⚠️ Selected user is not a registered AP and cannot be assigned as Partner
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseAddTeamMemberModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Team Member Modal */}
            {showEditTeamMemberModal && editingTeamMember && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleCloseEditTeamMemberModal}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            {/* Close button */}
                            <button
                                type="button"
                                onClick={handleCloseEditTeamMemberModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <form onSubmit={handleUpdateTeamMember} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Team Member Role</h3>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-4">
                                        <strong>Member:</strong> {editingTeamMember.user_name}
                                    </p>

                                    <label htmlFor="edit_role" className="block text-sm font-medium text-gray-700 mb-2">
                                        Role in Project
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'member', label: 'Member' },
                                            { value: 'team leader', label: 'Team Leader' },
                                            { value: 'supervisor', label: 'Supervisor' },
                                            { value: 'manager', label: 'Manager' },
                                            {
                                                value: 'partner',
                                                label: isPartnerOptionDisabled(editingTeamMember.user_id)
                                                    ? 'Partner (Registered AP Only)'
                                                    : 'Partner',
                                                isDisabled: isPartnerOptionDisabled(editingTeamMember.user_id)
                                            },
                                        ]}
                                        value={editTeamMemberData.role}
                                        onChange={(value) => setEditTeamMemberData('role', value as any)}
                                        placeholder="Select role..."
                                    />
                                    {isPartnerOptionDisabled(editingTeamMember.user_id) && (
                                        <p className="mt-1 text-xs text-amber-600">
                                            ⚠️ This user is not a registered AP and cannot be assigned as Partner
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditTeamMemberModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                    >
                                        Update Role
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Step Confirmation */}
            <ConfirmDialog
                show={showDeleteStepConfirm}
                onClose={() => setShowDeleteStepConfirm(false)}
                onConfirm={confirmDeleteStep}
                title="Delete Working Step"
                message={`Are you sure you want to delete "${itemToDelete?.name}" and all its tasks? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Delete Sub-Step Confirmation */}
            <ConfirmDialog
                show={showDeleteTaskConfirm}
                onClose={() => setShowDeleteTaskConfirm(false)}
                onConfirm={confirmDeleteTask}
                title="Delete Sub-Step"
                message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Remove Team Member Confirmation */}
            <ConfirmDialog
                show={showRemoveTeamMemberConfirm}
                onClose={() => setShowRemoveTeamMemberConfirm(false)}
                onConfirm={confirmDeleteTeamMember}
                title="Remove Team Member"
                message={`Are you sure you want to remove "${itemToDelete?.name}" from this project team?`}
                confirmText="Remove"
                cancelText="Cancel"
                type="warning"
            />
        </AuthenticatedLayout>
    );
}