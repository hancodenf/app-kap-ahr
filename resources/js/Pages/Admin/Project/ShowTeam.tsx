import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

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
    task_workers?: TaskWorker[];
}

interface TaskWorker {
    id: number;
    task_id: number;
    project_team_id: number;
    task_name: string;
    working_step_name: string;
    project_name: string;
    project_client_name: string;
    worker_name: string;
    worker_email: string;
    worker_role: string;
    task?: Task;
}

interface TeamMember {
    id: number;
    project_id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    user_position: string | null;
    role: 'partner' | 'manager' | 'supervisor' | 'team leader' | 'member';
    task_workers?: TaskWorker[];
}

interface ProjectBundle {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    bundle: ProjectBundle;
    workingSteps: WorkingStep[];
    teamMembers: TeamMember[];
}

export default function Show({ auth, bundle, workingSteps, teamMembers }: Props) {
    const steps = workingSteps || [];
    const members = teamMembers || [];

    // Helper function to get role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'partner': return 'bg-purple-100 text-purple-800';
            case 'manager': return 'bg-blue-100 text-blue-800';
            case 'supervisor': return 'bg-green-100 text-green-800';
            case 'team leader': return 'bg-yellow-100 text-yellow-800';
            case 'member': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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
                            {steps.length} working steps
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('admin.projects.bundles.edit', bundle.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Edit Project
                        </Link>
                        <Link
                            href={route('admin.projects.bundles.index')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Back to Projects
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${bundle.name} - Project Steps`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Project Name Header */}
                    <div className="mb-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Project Name</h3>
                                    <p className="text-xl font-semibold text-gray-800">{bundle.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Members Section */}
                    <div className="mt-8 mb-5">
                        <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Project Team Members</h3>
                                        <p className="text-sm text-gray-600 mt-1">All team members assigned to this project</p>
                                    </div>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                                        {members.length} Members
                                    </span>
                                </div>
                            </div>

                            {members.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h4>
                                    <p className="text-gray-600 mb-4">This project doesn't have any team members yet.</p>
                                    <Link
                                        href={route('admin.projects.bundles.edit', bundle.id)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                                    >
                                        Add Team Members
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Member
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Position
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Assigned Sub Steps
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {members.map((member) => (
                                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                    <span className="text-indigo-600 font-medium text-sm">
                                                                        {member.user_name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {member.user_name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {member.user_email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {member.user_position || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${getRoleBadgeColor(member.role)}`}>
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {member.task_workers && member.task_workers.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {member.task_workers.map((worker) => (
                                                                    <span 
                                                                        key={worker.id}
                                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200"
                                                                        title={worker.task_name}
                                                                    >
                                                                        {worker.task_name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">No assignments</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Structure Display */}
                    <div className="mb-6">
                        <div className="bg-white shadow-sm sm:rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Working Steps Overview</h3>
                                    <p className="text-sm text-gray-600">Project structure and workflow steps</p>
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
                                <p className="text-gray-600 mb-4">This project doesn't have any working steps yet.</p>
                                <Link
                                    href={route('admin.projects.bundles.edit', bundle.id)}
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
                                                        {step.tasks?.length || 0} tasks
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub Steps List - Read Only */}
                                    {step.tasks && step.tasks.length > 0 && (
                                        <div className="p-6">
                                            <h5 className="text-sm font-medium text-gray-700 mb-4">Sub Steps:</h5>
                                            <div className="space-y-3">
                                                {step.tasks
                                                    .sort((a, b) => a.order - b.order)
                                                    .map((subStep, subStepIndex) => (
                                                    <div
                                                        key={subStep.id}
                                                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border"
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-xs font-medium">
                                                                {subStepIndex + 1}
                                                            </span>
                                                            <div>
                                                                <h6 className="text-sm font-medium text-gray-900">
                                                                    {subStep.name}
                                                                </h6>
                                                                
                                                                {(subStep.client_interact || subStep.multiple_files || (subStep.task_workers && subStep.task_workers.length > 0)) && (
                                                                    <div className="flex flex-wrap gap-2 mt-2">
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
                                                                        {subStep.task_workers && subStep.task_workers.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {subStep.task_workers.map((worker, idx) => (
                                                                                    <span 
                                                                                        key={idx}
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
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty Sub Steps State */}
                                    {(!step.tasks || step.tasks.length === 0) && (
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
                                <h3 className="text-lg font-medium text-gray-900">Project Management</h3>
                                <p className="text-sm text-gray-600">Manage this project structure</p>
                            </div>
                            <Link
                                href={route('admin.projects.bundles.edit', bundle.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Edit This Project
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
