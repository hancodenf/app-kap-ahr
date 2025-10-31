import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

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
    client_interact: boolean;
    multiple_files: boolean;
}

interface TemplateBundle {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    project_templates?: any[];
}

interface Props extends PageProps {
    bundle: TemplateBundle;
    workingSteps: TemplateWorkingStep[];
}

export default function Show({ auth, bundle, workingSteps }: Props) {
    const steps = workingSteps || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {bundle.name} - Template Steps
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {steps.length} working steps
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('admin.project-templates.template-bundles.edit', bundle.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Edit Template
                        </Link>
                        <Link
                            href={route('admin.project-templates.template-bundles.index')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Back to Templates
                        </Link>
                    </div>
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
                            </div>
                        </div>
                    </div>

                    {/* Template Structure Display */}
                    <div className="mb-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Working Steps Overview</h3>
                                    <p className="text-sm text-gray-600">Template structure and workflow steps</p>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    {steps.length} Steps
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Working Steps List - Read Only */}
                    <div className="space-y-6">
                        {steps.length === 0 ? (
                            <div className="bg-white shadow-sm sm:rounded-lg p-8 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Working Steps</h3>
                                <p className="text-gray-600 mb-4">This template doesn't have any working steps yet.</p>
                                <Link
                                    href={route('admin.project-templates.template-bundles.edit', bundle.id)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                                >
                                    Add Working Steps
                                </Link>
                            </div>
                        ) : (
                            steps.map((step, stepIndex) => (
                                <div key={step.id} className="bg-white shadow-sm sm:rounded-lg">
                                    {/* Step Header - Read Only */}
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-800 font-medium">
                                                        {stepIndex + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        {step.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {step.template_tasks?.length || 0} tasks
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub Steps List - Read Only */}
                                    {step.template_tasks && step.template_tasks.length > 0 && (
                                        <div className="p-6">
                                            <h5 className="text-sm font-medium text-gray-700 mb-4">Tasks:</h5>
                                            <div className="space-y-3">
                                                {step.template_tasks
                                                    .sort((a, b) => a.order - b.order)
                                                    .map((task, taskIndex) => (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border"
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-xs font-medium">
                                                                {taskIndex + 1}
                                                            </span>
                                                            <div>
                                                                <h6 className="text-sm font-medium text-gray-900">
                                                                    {task.name}
                                                                </h6>
                                                                
                                                                {(task.client_interact || task.multiple_files) && (
                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                        {task.client_interact && (
                                                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                                Client Interact
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
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty Tasks State */}
                                    {(!step.template_tasks || step.template_tasks.length === 0) && (
                                        <div className="p-6 text-center text-gray-500">
                                            <p className="text-sm">No tasks defined for this step</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="mt-8 bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Template Management</h3>
                                <p className="text-sm text-gray-600">Manage this project template structure</p>
                            </div>
                            <Link
                                href={route('admin.project-templates.template-bundles.edit', bundle.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Edit This Template
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
