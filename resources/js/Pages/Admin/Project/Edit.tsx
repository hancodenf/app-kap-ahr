import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
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
    working_sub_steps?: WorkingSubStep[];
}

interface WorkingSubStep {
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
    sub_step_workers?: SubStepWorker[];
}

interface SubStepWorker {
    id: number;
    working_sub_step_id: number;
    project_team_id: number;
    worker_name: string;
    worker_email: string;
    worker_role: string;
}

interface ProjectBundle {
    id: number;
    name: string;
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

// Draggable SubStep Component
function DraggableSubStep({ subStep, onEdit, onDelete }: { 
    subStep: WorkingSubStep; 
    onEdit: (subStep: WorkingSubStep) => void;
    onDelete: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `substep-${subStep.id}` }); // Add prefix to differentiate

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
                        {subStep.name}
                    </h4>
                    
                    {(!!subStep.client_interact || !!subStep.multiple_files || (subStep.sub_step_workers && subStep.sub_step_workers.length > 0)) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {!!subStep.client_interact && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Client Interact
                                </span>
                            )}
                            {!!subStep.multiple_files && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    Multiple Files
                                </span>
                            )}
                            {subStep.sub_step_workers && subStep.sub_step_workers.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {subStep.sub_step_workers.map((worker, index) => (
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
                            onEdit(subStep);
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
                            onDelete(subStep.id);
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
    const [activeSubStep, setActiveSubStep] = useState<WorkingSubStep | null>(null);
    const [showAddStepModal, setShowAddStepModal] = useState(false);
    const [showAddSubStepModal, setShowAddSubStepModal] = useState(false);
    const [showEditStepModal, setShowEditStepModal] = useState(false);
    const [showEditSubStepModal, setShowEditSubStepModal] = useState(false);
    const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
    const [showAddTeamMemberModal, setShowAddTeamMemberModal] = useState(false);
    const [showEditTeamMemberModal, setShowEditTeamMemberModal] = useState(false);
    const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
    const [editingStep, setEditingStep] = useState<{ id: number; name: string } | null>(null);
    const [editingSubStep, setEditingSubStep] = useState<WorkingSubStep | null>(null);
    const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [collapsedSteps, setCollapsedSteps] = useState<Set<number>>(new Set());
    const [dragHoverStepId, setDragHoverStepId] = useState<number | null>(null);

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

    const { data: subStepData, setData: setSubStepData, post: postSubStep, reset: resetSubStep } = useForm({
        name: '',
        working_step_id: 0,
    });

    const { data: editStepData, setData: setEditStepData, put: putStep, processing: editStepProcessing, errors: editStepErrors, reset: resetEditStep } = useForm({
        name: '',
    });

    // Edit Template Form
    const { data: editTemplateData, setData: setEditTemplateData, put: putTemplate, processing: editTemplateProcessing, errors: editTemplateErrors, reset: resetEditTemplate } = useForm({
        name: '',
        client_id: 0,
    });

    const { data: editSubStepData, setData: setEditSubStepData, put: putSubStep, reset: resetEditSubStep } = useForm({
        name: '',
        client_interact: false,
        multiple_files: false,
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

    const handleAddSubStep = (e: React.FormEvent) => {
        e.preventDefault();
        postSubStep(route('admin.projects.working-sub-steps.store'), {
            onSuccess: (response) => {
                setShowAddSubStepModal(false);
                resetSubStep();
                setSelectedStepId(null);
                // Reset form data manually
                setSubStepData({
                    name: '',
                    working_step_id: 0,
                });
                router.reload(); // Refresh to get updated data
            },
            onError: (errors) => {
                console.error('Error adding substep:', errors);
            }
        });
    };

    const handleDeleteStep = (stepId: number) => {
        if (confirm('Are you sure you want to delete this working step and all its sub-steps?')) {
            router.delete(route('admin.projects.working-steps.destroy', stepId));
        }
    };

    const handleDeleteSubStep = (subStepId: number) => {
        if (confirm('Are you sure you want to delete this sub-step?')) {
            router.delete(route('admin.projects.working-sub-steps.destroy', subStepId));
        }
    };

    const handleEditSubStep = (subStep: WorkingSubStep) => {
        setEditingSubStep(subStep);
        
        // Filter worker_ids to only include team members that still exist
        const validWorkerIds = (subStep.sub_step_workers?.map(w => w.project_team_id) || [])
            .filter(workerId => teamMembers.some(member => member.id === workerId));
        
        setEditSubStepData({
            name: subStep.name,
            client_interact: subStep.client_interact,
            multiple_files: subStep.multiple_files,
            worker_ids: validWorkerIds,
        });
        setShowEditSubStepModal(true);
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

    const handleUpdateSubStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubStep) return;
        
        putSubStep(route('admin.projects.working-sub-steps.update', editingSubStep.id), {
            onSuccess: () => {
                setShowEditSubStepModal(false);
                setEditingSubStep(null);
                resetEditSubStep();
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

    const handleDeleteTeamMember = (memberId: number) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            router.delete(route('admin.projects.team-members.destroy', memberId));
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
        
        // Check if dragging a sub step first (prefix with 'substep-')
        if (String(active.id).startsWith('substep-')) {
            const subStepId = Number(String(active.id).replace('substep-', ''));
            for (const step of steps) {
                const subStep = step.working_sub_steps?.find(ss => ss.id === subStepId);
                if (subStep) {
                    setActiveSubStep(subStep);
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
        setActiveSubStep(null);
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

                fetch(route('admin.projects.working-steps.reorder'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ steps: stepData }),
                    credentials: 'same-origin',
                }).then(response => response.json())
                  .then(data => {
                      // Success - no reload needed, state already updated
                  })
                  .catch(error => {
                      console.error('Error reordering steps:', error);
                  });
            }
            return;
        }

        // Handle sub step reordering/moving
        if (String(active.id).startsWith('substep-')) {
            const activeSubStepId = Number(String(active.id).replace('substep-', ''));
            
            // Find the active substep and its current step
            let sourceStepId = 0;
            let activeSubStepObj = null;
            for (const step of steps) {
                const subStep = step.working_sub_steps?.find(ss => ss.id === activeSubStepId);
                if (subStep) {
                    activeSubStepObj = subStep;
                    sourceStepId = step.id;
                    break;
                }
            }

            if (!activeSubStepObj) return;

            let targetStepId = sourceStepId;
            let targetSubStepId: number | null = null;

            // Determine target step and substep
            if (String(over.id).startsWith('step-')) {
                // Dropped on a step
                targetStepId = Number(String(over.id).replace('step-', ''));
            } else if (String(over.id).startsWith('substep-')) {
                // Dropped on another substep - find its parent step
                targetSubStepId = Number(String(over.id).replace('substep-', ''));
                for (const step of steps) {
                    if (step.working_sub_steps?.some(ss => ss.id === targetSubStepId)) {
                        targetStepId = step.id;
                        break;
                    }
                }
            }

            const newSteps = [...steps];

            // Case 1: Reordering within the same step
            if (sourceStepId === targetStepId && targetSubStepId) {
                const sourceStep = newSteps.find(s => s.id === sourceStepId);
                if (sourceStep?.working_sub_steps) {
                    const oldIndex = sourceStep.working_sub_steps.findIndex(ss => ss.id === activeSubStepId);
                    const newIndex = sourceStep.working_sub_steps.findIndex(ss => ss.id === targetSubStepId);
                    
                    if (oldIndex !== newIndex && oldIndex > -1 && newIndex > -1) {
                        // Use arrayMove for proper reordering
                        sourceStep.working_sub_steps = arrayMove(
                            sourceStep.working_sub_steps, 
                            oldIndex, 
                            newIndex
                        );
                        
                        // Update order numbers
                        sourceStep.working_sub_steps = sourceStep.working_sub_steps.map((ss, index) => ({
                            ...ss,
                            order: index + 1
                        }));
                    }
                }
            }
            // Case 2: Moving to a different step
            else if (sourceStepId !== targetStepId) {
                const sourceStep = newSteps.find(s => s.id === sourceStepId);
                if (sourceStep?.working_sub_steps) {
                    const subStepIndex = sourceStep.working_sub_steps.findIndex(ss => ss.id === activeSubStepId);
                    if (subStepIndex > -1) {
                        const [movedSubStep] = sourceStep.working_sub_steps.splice(subStepIndex, 1);
                        
                        // Add to target step
                        const targetStepObj = newSteps.find(s => s.id === targetStepId);
                        if (targetStepObj) {
                            if (!targetStepObj.working_sub_steps) {
                                targetStepObj.working_sub_steps = [];
                            }
                            
                            // Update substep's step reference
                            movedSubStep.working_step_id = targetStepId;
                            
                            // Insert at correct position if dropped on another substep
                            if (targetSubStepId) {
                                const targetIndex = targetStepObj.working_sub_steps.findIndex(ss => ss.id === targetSubStepId);
                                if (targetIndex > -1) {
                                    targetStepObj.working_sub_steps.splice(targetIndex, 0, movedSubStep);
                                } else {
                                    targetStepObj.working_sub_steps.push(movedSubStep);
                                }
                            } else {
                                targetStepObj.working_sub_steps.push(movedSubStep);
                            }

                            // Reorder substeps in target step
                            targetStepObj.working_sub_steps = targetStepObj.working_sub_steps.map((ss, index) => ({
                                ...ss,
                                order: index + 1
                            }));

                            // Reorder remaining substeps in source step
                            sourceStep.working_sub_steps = sourceStep.working_sub_steps.map((ss, index) => ({
                                ...ss,
                                order: index + 1
                            }));
                        }
                    }
                }
            }

            setSteps(newSteps);

            // Send all affected substeps to backend
            const allSubSteps: any[] = [];
            newSteps.forEach(step => {
                if (step.working_sub_steps) {
                    step.working_sub_steps.forEach(ss => {
                        allSubSteps.push({
                            id: ss.id,
                            order: ss.order,
                            working_step_id: ss.working_step_id
                        });
                    });
                }
            });

            fetch(route('admin.projects.working-sub-steps.reorder'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ sub_steps: allSubSteps }),
                credentials: 'same-origin',
            }).then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Failed to reorder substeps');
                    });
                }
                return response.json();
            })
              .then(data => {
                  // Success - no reload needed, state already updated
              })
              .catch(error => {
                  console.error('Error reordering substeps:', error);
                  alert('Failed to save substep order. Please try again.');
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
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Project Name</h3>
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
                                                            onClick={() => handleDeleteTeamMember(member.id)}
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
                                    <p className="text-sm text-gray-600">Manage working steps and sub-steps for this project template</p>
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
                                                        setSubStepData('working_step_id', step.id);
                                                        setShowAddSubStepModal(true);
                                                    }}
                                                    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Sub Step
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
                                                    onClick={() => handleDeleteStep(step.id)}
                                                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Step
                                                </button>
                                            </div>
                                        </DraggableStep>

                                        {/* Sub Steps List - SEPENUHNYA TERPISAH dari flex - Conditional Rendering */}
                                        {!collapsedSteps.has(step.id) && (
                                            <div className="px-4 pb-4">
                                                <div className="px-2 pb-2 pt-5">
                                                    <h5 className="text-sm font-medium text-gray-600 mb-3">Sub Steps:</h5>
                                                </div>
                                                <div className="space-y-1">
                                                    <SortableContext 
                                                        items={(step.working_sub_steps || []).map(ss => `substep-${ss.id}`)} 
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        {(step.working_sub_steps || []).map((subStep) => (
                                                            <DraggableSubStep
                                                                key={subStep.id}
                                                                subStep={subStep}
                                                                onEdit={handleEditSubStep}
                                                                onDelete={handleDeleteSubStep}
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
                                                    {step.working_sub_steps ? step.working_sub_steps.length : 0} sub-step{(step.working_sub_steps ? step.working_sub_steps.length : 0) !== 1 ? 's' : ''} hidden • Click to expand
                                                </p>
                                            </div>
                                        )}

                                        {/* Empty Sub Steps State - only show when expanded */}
                                        {!collapsedSteps.has(step.id) && (!step.working_sub_steps || step.working_sub_steps.length === 0) && (
                                            <div className="px-4 pb-4">
                                                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg mx-2">
                                                    <p>No sub steps yet. Click "Add Sub Step" to get started.</p>
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
                            ) : activeSubStep ? (
                                <div className="bg-white shadow-lg rounded-lg p-4 opacity-90">
                                    <h4 className="font-medium text-gray-900">
                                        {activeSubStep.name}
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
                                        Note: You can add sub-steps after creating the working step
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

            {/* Add Sub Step Modal */}
            {showAddSubStepModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddSubStepModal(false)}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            <form onSubmit={handleAddSubStep} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Sub Step</h3>
                                
                                <div className="mb-4">
                                    <label htmlFor="sub_step_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Sub Step Name
                                    </label>
                                    <input
                                        type="text"
                                        id="sub_step_name"
                                        value={subStepData.name}
                                        onChange={(e) => setSubStepData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g., Penetapan KAP"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSubStepModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                                    >
                                        Add Sub Step
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

            {/* Edit Sub Step Modal */}
            {showEditSubStepModal && editingSubStep && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowEditSubStepModal(false)}></div>
                        <div className="relative bg-white rounded-lg max-w-md w-full">
                            <form onSubmit={handleUpdateSubStep} className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Sub Step</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="edit_sub_step_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Sub Step Name
                                        </label>
                                        <input
                                            type="text"
                                            id="edit_sub_step_name"
                                            value={editSubStepData.name}
                                            onChange={(e) => setEditSubStepData('name', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={editSubStepData.client_interact}
                                                onChange={(e) => setEditSubStepData('client_interact', e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Client Interact</span>
                                        </label>

                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={editSubStepData.multiple_files}
                                                onChange={(e) => setEditSubStepData('multiple_files', e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Multiple Files</span>
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
                                            value={editSubStepData.worker_ids}
                                            onChange={(value) => setEditSubStepData('worker_ids', value as number[])}
                                            placeholder="Select team members..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditSubStepModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                                    >
                                        Update Sub Step
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
        </AuthenticatedLayout>
    );
}
