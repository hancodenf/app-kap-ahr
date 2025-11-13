import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
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
    client_interact: boolean;
    multiple_files: boolean;
    is_required: boolean;
    completion_status?: 'pending' | 'in_progress' | 'completed';
    task_workers?: TaskWorker[];
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
    year: number;
    status: 'open' | 'closed';
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
}

interface Props extends PageProps {
    bundle: ProjectBundle;
    workingSteps: WorkingStep[];
    teamMembers: TeamMember[];
    availableUsers: AvailableUser[];
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
                    
                    {(!!task.is_required || !!task.client_interact || !!task.multiple_files || (task.task_workers && task.task_workers.length > 0)) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {!!task.is_required && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Required
                                </span>
                            )}
                            {!!task.client_interact && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Client Interact
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

export default function Show({ auth, bundle, workingSteps, teamMembers, availableUsers, clients }: Props) {
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
        status: 'closed' as 'open' | 'closed',
    });

    const { data: editTaskData, setData: setEditTaskData, put: putTask, reset: resetEditTask } = useForm({
        name: '',
        client_interact: false,
        multiple_files: false,
        is_required: false,
        worker_ids: [] as number[],
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
        
        setEditTaskData({
            name: task.name,
            client_interact: task.client_interact,
            multiple_files: task.multiple_files,
            is_required: task.is_required || false,
            worker_ids: validWorkerIds,
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
            year: bundle.year || new Date().getFullYear(),
            status: bundle.status || 'closed',
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
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
                                                {bundle.status === 'open' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Project Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
                                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        Project Closed
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
                                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors ml-4"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            member.role === 'partner' ? 'bg-purple-100 text-purple-800' :
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
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            Edit Role
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTeamMember(member)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
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
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
                                                    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Task
                                                </button>
                                                <button 
                                                    onClick={() => handleEditStep(step)}
                                                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit Step
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteStep(step)}
                                                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
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
                                
                                <div className="mb-4">
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

                                <div className="mb-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={taskData.is_required}
                                            onChange={(e) => setTaskData('is_required', e.target.checked)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Required to unlock next step
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">
                                        This task must be completed before the next step can be accessed
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3">
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
                                <select
                                    value={editTemplateData.year}
                                    onChange={(e) => setEditTemplateData('year', parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {editTemplateErrors.year && (
                                    <p className="mt-1 text-sm text-red-600">{editTemplateErrors.year}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Project Status
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditTemplateData('status', editTemplateData.status === 'open' ? 'closed' : 'open')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                            editTemplateData.status === 'open' ? 'bg-green-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                editTemplateData.status === 'open' ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <span className={`text-sm font-medium ${editTemplateData.status === 'open' ? 'text-green-700' : 'text-gray-700'}`}>
                                        {editTemplateData.status === 'open' ? (
                                            <span className="flex items-center">
                                                <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Open - Project is active
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                Closed - Project is inactive
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    {editTemplateData.status === 'open' 
                                        ? 'Open projects are accessible to assigned team members' 
                                        : 'Closed projects are archived and read-only'}
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

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={editTaskData.client_interact}
                                                    onChange={(e) => setEditTaskData('client_interact', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Client Interact</span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={editTaskData.multiple_files}
                                                    onChange={(e) => setEditTaskData('multiple_files', e.target.checked)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Multiple Files</span>
                                            </label>
                                        </div>

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
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddTeamMemberModal(false)}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            <form onSubmit={handleAddTeamMember} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            Select User
                                        </label>
                                        <select
                                            id="user_id"
                                            value={teamMemberData.user_id}
                                            onChange={(e) => setTeamMemberData('user_id', parseInt(e.target.value))}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        >
                                            <option value={0}>Select a user...</option>
                                            {availableUsers.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                            Role in Project
                                        </label>
                                        <select
                                            id="role"
                                            value={teamMemberData.role}
                                            onChange={(e) => setTeamMemberData('role', e.target.value as any)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        >
                                            <option value="member">Member</option>
                                            <option value="team leader">Team Leader</option>
                                            <option value="supervisor">Supervisor</option>
                                            <option value="manager">Manager</option>
                                            <option value="partner">Partner</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddTeamMemberModal(false)}
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
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowEditTeamMemberModal(false)}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            <form onSubmit={handleUpdateTeamMember} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Team Member Role</h3>
                                
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-4">
                                        <strong>Member:</strong> {editingTeamMember.user_name}
                                    </p>
                                    
                                    <label htmlFor="edit_role" className="block text-sm font-medium text-gray-700 mb-2">
                                        Role in Project
                                    </label>
                                    <select
                                        id="edit_role"
                                        value={editTeamMemberData.role}
                                        onChange={(e) => setEditTeamMemberData('role', e.target.value as any)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="member">Member</option>
                                        <option value="team leader">Team Leader</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="manager">Manager</option>
                                        <option value="partner">Partner</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditTeamMemberModal(false)}
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
