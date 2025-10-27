import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
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

interface Client {
    id: number;
    name: string;
    user: {
        email: string;
    };
}

interface Project {
    id: number;
    name: string;
    client_id: number;
    client: Client;
}

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
    status?: string;
}

interface Props extends PageProps {
    project: Project;
    workingSteps: WorkingStep[];
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
    } = useSortable({ id: `step-${step.id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white shadow-sm sm:rounded-lg">
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
        </div>
    );
}

// Draggable SubStep Component
function DraggableSubStep({ subStep, onEdit }: { 
    subStep: WorkingSubStep; 
    onEdit: (subStep: WorkingSubStep) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `substep-${subStep.id}` });

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
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                        {subStep.status && (
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                subStep.status === 'Approved by Partner' ? 'bg-green-100 text-green-800' : 
                                subStep.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {subStep.status}
                            </span>
                        )}
                        {subStep.client_interact && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Client Interact
                            </span>
                        )}
                        {subStep.multiple_files && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                Multiple Files
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(subStep);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProjectManage({ auth, project, workingSteps }: Props) {
    const [steps, setSteps] = useState(workingSteps || []);
    const [activeStep, setActiveStep] = useState<WorkingStep | null>(null);
    const [activeSubStep, setActiveSubStep] = useState<WorkingSubStep | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [collapsedSteps, setCollapsedSteps] = useState<Set<number>>(new Set());
    const [dragHoverStepId, setDragHoverStepId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setSteps(workingSteps || []);
    }, [workingSteps]);

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

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setIsDragging(true);
        
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

                fetch(route('admin.project.working-steps.reorder'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ steps: stepData }),
                    credentials: 'same-origin',
                }).catch(error => {
                    console.error('Error reordering steps:', error);
                    router.reload();
                });
            }
            return;
        }

        // Handle sub step reordering/moving
        if (String(active.id).startsWith('substep-')) {
            const activeSubStepId = Number(String(active.id).replace('substep-', ''));
            
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

            if (String(over.id).startsWith('step-')) {
                targetStepId = Number(String(over.id).replace('step-', ''));
            } else if (String(over.id).startsWith('substep-')) {
                targetSubStepId = Number(String(over.id).replace('substep-', ''));
                for (const step of steps) {
                    if (step.working_sub_steps?.some(ss => ss.id === targetSubStepId)) {
                        targetStepId = step.id;
                        break;
                    }
                }
            }

            const newSteps = [...steps];

            if (sourceStepId === targetStepId && targetSubStepId) {
                const sourceStep = newSteps.find(s => s.id === sourceStepId);
                if (sourceStep?.working_sub_steps) {
                    const oldIndex = sourceStep.working_sub_steps.findIndex(ss => ss.id === activeSubStepId);
                    const newIndex = sourceStep.working_sub_steps.findIndex(ss => ss.id === targetSubStepId);
                    
                    if (oldIndex !== newIndex && oldIndex > -1 && newIndex > -1) {
                        sourceStep.working_sub_steps = arrayMove(
                            sourceStep.working_sub_steps, 
                            oldIndex, 
                            newIndex
                        );
                        
                        sourceStep.working_sub_steps = sourceStep.working_sub_steps.map((ss, index) => ({
                            ...ss,
                            order: index + 1
                        }));
                    }
                }
            } else if (sourceStepId !== targetStepId) {
                const sourceStep = newSteps.find(s => s.id === sourceStepId);
                if (sourceStep?.working_sub_steps) {
                    const subStepIndex = sourceStep.working_sub_steps.findIndex(ss => ss.id === activeSubStepId);
                    if (subStepIndex > -1) {
                        const [movedSubStep] = sourceStep.working_sub_steps.splice(subStepIndex, 1);
                        
                        const targetStepObj = newSteps.find(s => s.id === targetStepId);
                        if (targetStepObj) {
                            if (!targetStepObj.working_sub_steps) {
                                targetStepObj.working_sub_steps = [];
                            }
                            
                            movedSubStep.working_step_id = targetStepId;
                            
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

                            targetStepObj.working_sub_steps = targetStepObj.working_sub_steps.map((ss, index) => ({
                                ...ss,
                                order: index + 1
                            }));

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

            fetch(route('admin.project.working-sub-steps.reorder'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ sub_steps: allSubSteps }),
                credentials: 'same-origin',
            }).catch(error => {
                console.error('Error reordering substeps:', error);
                router.reload();
            });
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        
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
                            {project.name} - {project.client.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {steps?.length || 0} working steps
                        </p>
                    </div>
                    <Link
                        href={route('admin.project.index')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Back to Projects
                    </Link>
                </div>
            }
        >
            <Head title={`${project.name} - Project Management`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Project Info Header */}
                    <div className="mb-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Project Information</h3>
                                    <p className="text-xl font-semibold text-gray-800">{project.name}</p>
                                    <p className="text-sm text-gray-600">Client: {project.client.name} ({project.client.user.email})</p>
                                </div>
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
                                        <DraggableStep 
                                            step={step}
                                            isCollapsed={collapsedSteps.has(step.id)}
                                            onToggleCollapse={() => toggleStepCollapse(step.id)}
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                {/* Actions can be added here if needed */}
                                            </div>
                                        </DraggableStep>

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
                                                                onEdit={(subStep) => {
                                                                    router.visit(route('admin.project.edit', subStep.id));
                                                                }}
                                                            />
                                                        ))}
                                                    </SortableContext>
                                                </div>
                                            </div>
                                        )}

                                        {collapsedSteps.has(step.id) && (
                                            <div className="px-6 py-3 bg-gray-50 border-t cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => toggleStepCollapse(step.id)}>
                                                <p className="text-sm text-gray-500 text-center">
                                                    {step.working_sub_steps ? step.working_sub_steps.length : 0} sub-step{(step.working_sub_steps ? step.working_sub_steps.length : 0) !== 1 ? 's' : ''} hidden • Click to expand
                                                </p>
                                            </div>
                                        )}

                                        {!collapsedSteps.has(step.id) && (!step.working_sub_steps || step.working_sub_steps.length === 0) && (
                                            <div className="px-4 pb-4">
                                                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg mx-2">
                                                    <p>No sub steps yet.</p>
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
                                                This project has no working steps yet.
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
        </AuthenticatedLayout>
    );
}
