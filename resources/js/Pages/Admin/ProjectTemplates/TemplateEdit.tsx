import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
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

interface TemplateWorkingStep {
    id: number;
    name: string;
    slug: string;
    order: number;
    project_template_id: number;
    template_tasks?: TemplateTask[];
}

interface TemplateTask {
    id: number;
    name: string;
    slug: string;
    order: number;
    template_working_step_id: number;
    project_template_id: number;
    time?: string;
    comment?: string;
    client_comment?: string;
    client_interact: 'read only' | 'comment' | 'upload';
    multiple_files: boolean;
    is_required: boolean;
}

interface TemplateBundle {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    project_templates?: any[]; // Keep for backward compatibility
}

interface Props extends PageProps {
    bundle: TemplateBundle;
    workingSteps: TemplateWorkingStep[];
}

// Draggable Step Component
function DraggableStep({ step, children, isCollapsed, onToggleCollapse }: { 
    step: TemplateWorkingStep; 
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
                                    title={isCollapsed ? 'Expand tasks' : 'Collapse tasks'}
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
    task: TemplateTask; 
    onEdit: (task: TemplateTask) => void;
    onDelete: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `task-${task.id}` }); // Add prefix to differentiate

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
                    
                    {(task.is_required || task.client_interact !== 'read only' || task.multiple_files) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {task.is_required && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Required
                                </span>
                            )}
                            {task.client_interact !== 'read only' && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    {task.client_interact === 'comment' ? '💬 Client Comment' : '📤 Client Upload'}
                                </span>
                            )}
                            {task.multiple_files && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    Multiple Files
                                </span>
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

export default function Show({ auth, bundle, workingSteps }: Props) {
    const [steps, setSteps] = useState(workingSteps || []);
    const [activeStep, setActiveStep] = useState<TemplateWorkingStep | null>(null);
    const [activeTask, setActiveTask] = useState<TemplateTask | null>(null);
    const [showAddStepModal, setShowAddStepModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showEditStepModal, setShowEditStepModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
    const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
    const [editingStep, setEditingStep] = useState<{ id: number; name: string } | null>(null);
    const [editingTask, setEditingTask] = useState<TemplateTask | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [collapsedSteps, setCollapsedSteps] = useState<Set<number>>(new Set());
    const [dragHoverStepId, setDragHoverStepId] = useState<number | null>(null);
    
    // Confirm dialog states
    const [showDeleteStepConfirm, setShowDeleteStepConfirm] = useState(false);
    const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
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
        template_working_step_id: 0,
        client_interact: 'read only' as 'read only' | 'comment' | 'upload',
        multiple_files: false,
        is_required: false,
    });

    const { data: editStepData, setData: setEditStepData, put: putStep, processing: editStepProcessing, errors: editStepErrors, reset: resetEditStep } = useForm({
        name: '',
    });

    // Edit Template Form
    const { data: editTemplateData, setData: setEditTemplateData, put: putTemplate, processing: editTemplateProcessing, errors: editTemplateErrors, reset: resetEditTemplate } = useForm({
        name: '',
    });

    const { data: editTaskData, setData: setEditTaskData, put: putTask, reset: resetEditTask } = useForm({
        name: '',
        client_interact: 'read only' as 'read only' | 'comment' | 'upload',
        multiple_files: false,
        is_required: false,
    });

    const handleAddStep = (e: React.FormEvent) => {
        e.preventDefault();
        postStep(route('admin.project-templates.template-working-steps.store'), {
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
        postTask(route('admin.project-templates.template-tasks.store'), {
            onSuccess: (response) => {
                setShowAddTaskModal(false);
                resetTask();
                setSelectedStepId(null);
                // Reset form data manually
                setTaskData({
                    name: '',
                    template_working_step_id: 0,
                });
                router.reload(); // Refresh to get updated data
            },
            onError: (errors) => {
                console.error('Error adding task:', errors);
            }
        });
    };

    const handleDeleteStep = (step: TemplateWorkingStep) => {
        setItemToDelete({ id: step.id, name: step.name });
        setShowDeleteStepConfirm(true);
    };

    const confirmDeleteStep = () => {
        if (itemToDelete) {
            router.delete(route('admin.project-templates.template-working-steps.destroy', itemToDelete.id));
        }
    };

    const handleDeleteTask = (task: TemplateTask) => {
        setItemToDelete({ id: task.id, name: task.name });
        setShowDeleteTaskConfirm(true);
    };

    const confirmDeleteTask = () => {
        if (itemToDelete) {
            router.delete(route('admin.project-templates.template-tasks.destroy', itemToDelete.id));
        }
    };

    const handleEditTask = (task: TemplateTask) => {
        setEditingTask(task);
        setEditTaskData({
            name: task.name,
            client_interact: task.client_interact,
            multiple_files: task.multiple_files,
            is_required: task.is_required || false,
        });
        setShowEditTaskModal(true);
    };

    const handleEditStep = (step: TemplateWorkingStep) => {
        setEditingStep({ id: step.id, name: step.name });
        setEditStepData({
            name: step.name,
        });
        setShowEditStepModal(true);
    };

    const handleUpdateStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStep) return;
        
        putStep(route('admin.project-templates.template-working-steps.update', editingStep.id), {
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
        });
        setShowEditTemplateModal(true);
    };

    const handleUpdateTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        
        putTemplate(route('admin.project-templates.template-bundles.update', bundle.id), {
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
        
        putTask(route('admin.project-templates.template-tasks.update', editingTask.id), {
            onSuccess: () => {
                setShowEditTaskModal(false);
                setEditingTask(null);
                resetEditTask();
                // Refresh page to get updated data
                router.reload();
            },
        });
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

    // Auto-expand when dragging task hovers over collapsed step
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
        
        // Check if dragging a task first (prefix with 'task-')
        if (String(active.id).startsWith('task-')) {
            const taskId = Number(String(active.id).replace('task-', ''));
            for (const step of steps) {
                const task = step.template_tasks?.find(ss => ss.id === taskId);
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

                axios.post(route('admin.project-templates.template-working-steps.reorder'), { steps: stepData })
                    .then(response => {
                        // Success - no reload needed, state already updated
                    })
                    .catch(error => {
                        console.error('Error reordering steps:', error);
                        alert('Failed to save step order. Please try again.');
                        router.reload();
                    });
            }
            return;
        }

        // Handle sub step reordering/moving
        if (String(active.id).startsWith('task-')) {
            const activeTaskId = Number(String(active.id).replace('task-', ''));
            
            // Find the active task and its current step
            let sourceStepId = 0;
            let activeTaskObj = null;
            for (const step of steps) {
                const task = step.template_tasks?.find(ss => ss.id === activeTaskId);
                if (task) {
                    activeTaskObj = task;
                    sourceStepId = step.id;
                    break;
                }
            }

            if (!activeTaskObj) return;

            let targetStepId = sourceStepId;
            let targetTaskId: number | null = null;

            // Determine target step and task
            if (String(over.id).startsWith('step-')) {
                // Dropped on a step
                targetStepId = Number(String(over.id).replace('step-', ''));
            } else if (String(over.id).startsWith('task-')) {
                // Dropped on another task - find its parent step
                targetTaskId = Number(String(over.id).replace('task-', ''));
                for (const step of steps) {
                    if (step.template_tasks?.some(ss => ss.id === targetTaskId)) {
                        targetStepId = step.id;
                        break;
                    }
                }
            }

            const newSteps = [...steps];

            // Case 1: Reordering within the same step
            if (sourceStepId === targetStepId && targetTaskId) {
                const sourceStep = newSteps.find(s => s.id === sourceStepId);
                if (sourceStep?.template_tasks) {
                    const oldIndex = sourceStep.template_tasks.findIndex(ss => ss.id === activeTaskId);
                    const newIndex = sourceStep.template_tasks.findIndex(ss => ss.id === targetTaskId);
                    
                    if (oldIndex !== newIndex && oldIndex > -1 && newIndex > -1) {
                        // Use arrayMove for proper reordering
                        sourceStep.template_tasks = arrayMove(
                            sourceStep.template_tasks, 
                            oldIndex, 
                            newIndex
                        );
                        
                        // Update order numbers
                        sourceStep.template_tasks = sourceStep.template_tasks.map((ss, index) => ({
                            ...ss,
                            order: index + 1
                        }));
                    }
                }
            }
            // Case 2: Moving to a different step
            else if (sourceStepId !== targetStepId) {
                const sourceStep = newSteps.find(s => s.id === sourceStepId);
                if (sourceStep?.template_tasks) {
                    const taskIndex = sourceStep.template_tasks.findIndex(ss => ss.id === activeTaskId);
                    if (taskIndex > -1) {
                        const [movedTask] = sourceStep.template_tasks.splice(taskIndex, 1);
                        
                        // Add to target step
                        const targetStepObj = newSteps.find(s => s.id === targetStepId);
                        if (targetStepObj) {
                            if (!targetStepObj.template_tasks) {
                                targetStepObj.template_tasks = [];
                            }
                            
                            // Update task's step reference
                            movedTask.template_working_step_id = targetStepId;
                            
                            // Insert at correct position if dropped on another task
                            if (targetTaskId) {
                                const targetIndex = targetStepObj.template_tasks.findIndex(ss => ss.id === targetTaskId);
                                if (targetIndex > -1) {
                                    targetStepObj.template_tasks.splice(targetIndex, 0, movedTask);
                                } else {
                                    targetStepObj.template_tasks.push(movedTask);
                                }
                            } else {
                                targetStepObj.template_tasks.push(movedTask);
                            }

                            // Reorder tasks in target step
                            targetStepObj.template_tasks = targetStepObj.template_tasks.map((ss, index) => ({
                                ...ss,
                                order: index + 1
                            }));

                            // Reorder remaining tasks in source step
                            sourceStep.template_tasks = sourceStep.template_tasks.map((ss, index) => ({
                                ...ss,
                                order: index + 1
                            }));
                        }
                    }
                }
            }

            setSteps(newSteps);

            // Send all affected tasks to backend
            const allTasks: any[] = [];
            newSteps.forEach(step => {
                if (step.template_tasks) {
                    step.template_tasks.forEach(ss => {
                        allTasks.push({
                            id: ss.id,
                            order: ss.order,
                            template_working_step_id: ss.template_working_step_id
                        });
                    });
                }
            });

            axios.post(route('admin.project-templates.template-tasks.reorder'), { tasks: allTasks })
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
        
        // Only handle task dragging over steps
        if (String(active.id).startsWith('task-') && over && String(over.id).startsWith('step-')) {
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
                            {bundle.name} - Template Steps
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {steps?.length || 0} working steps
                        </p>
                    </div>
                    <Link
                        href={route('admin.project-templates.template-bundles.index')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Back to Templates
                    </Link>
                </div>
            }
        >
            <Head title={`${bundle.name} - Template Steps`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Project Template Name Header */}
                    <div className="mb-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Project Template Name</h3>
                                    <p className="text-xl font-semibold text-gray-800">{bundle.name}</p>
                                </div>
                                <button
                                    onClick={handleEditTemplate}
                                    className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Template Name
                                </button>
                            </div>
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
                                                        setTaskData('template_working_step_id', step.id);
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
                                                        items={(step.template_tasks || []).map(ss => `task-${ss.id}`)} 
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        {(step.template_tasks || []).map((task) => (
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
                                                    {step.template_tasks ? step.template_tasks.length : 0} task{(step.template_tasks ? step.template_tasks.length : 0) !== 1 ? 's' : ''} hidden • Click to expand
                                                </p>
                                            </div>
                                        )}

                                        {/* Empty Tasks State - only show when expanded */}
                                        {!collapsedSteps.has(step.id) && (!step.template_tasks || step.template_tasks.length === 0) && (
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
                                            onChange={(e) => setTaskData('client_interact', e.target.value as 'read only' | 'comment' | 'upload')}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="read only">👁️ Read Only - Client can only view</option>
                                            {/* <option value="comment">💬 Comment - Client can view and comment</option> */}
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
                                            checked={taskData.multiple_files}
                                            onChange={(e) => setTaskData('multiple_files', e.target.checked)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Multiple Files</span>
                                    </label>

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
                        <h3 className="text-lg font-semibold mb-4">Edit Project Template Name</h3>
                        <form onSubmit={handleUpdateTemplate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Template Name
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
                                    {editTemplateProcessing ? 'Updating...' : 'Update Template'}
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
                                                onChange={(e) => setEditTaskData('client_interact', e.target.value as 'read only' | 'comment' | 'upload')}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="read only">👁️ Read Only - Client can only view</option>
                                                {/* <option value="comment">💬 Comment - Client can view and comment</option> */}
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
                                                checked={editTaskData.multiple_files}
                                                onChange={(e) => setEditTaskData('multiple_files', e.target.checked)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Multiple Files</span>
                                        </label>

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

            {/* Delete Step Confirmation */}
            <ConfirmDialog
                show={showDeleteStepConfirm}
                onClose={() => setShowDeleteStepConfirm(false)}
                onConfirm={confirmDeleteStep}
                title="Delete Template Working Step"
                message={`Are you sure you want to delete "${itemToDelete?.name}" and all its tasks? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            {/* Delete Task Confirmation */}
            <ConfirmDialog
                show={showDeleteTaskConfirm}
                onClose={() => setShowDeleteTaskConfirm(false)}
                onConfirm={confirmDeleteTask}
                title="Delete Template Task"
                message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
