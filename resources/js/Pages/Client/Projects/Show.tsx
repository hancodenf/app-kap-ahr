import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface ClientDocument {
    id: number;
    name: string;
    description: string | null;
    file: string | null;
    uploaded_at: string | null;
    task_assignment_id: number;
}

interface Document {
    id: number;
    name: string;
    file: string;
    uploaded_at: string;
}

interface TaskAssignment {
    id: number;
    time: string | null;
    notes: string | null;
    comment: string | null;
    client_comment: string | null;
    is_approved: boolean;
    created_at: string;
    documents: Document[];
    client_documents: ClientDocument[];
    user?: {
        id: number;
        name: string;
        email: string;
        role?: {
            name: string;
        };
    };
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
    latest_assignment: {
        id: number;
        time: string | null;
        notes: string | null;
        comment: string | null;
        client_comment: string | null;
        is_approved: boolean;
        created_at: string;
    } | null;
    assignments: TaskAssignment[];
}

interface WorkingStep {
    id: number;
    name: string;
    slug: string;
    order: number;
    is_locked: boolean;
    can_access: boolean;
    required_progress: {
        total: number;
        completed: number;
        percentage: number;
    } | null;
    tasks: Task[];
}

interface Project {
    id: number;
    name: string;
    slug: string;
    status: string;
    client_name: string;
    client_alamat: string;
    client_kementrian: string;
    client_kode_satker: string;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    project: Project;
    workingSteps: WorkingStep[];
}

export default function Show({ project, workingSteps }: Props) {
    const [activeTab, setActiveTab] = useState<number>(0);

    // Calculate overall project statistics
    const allTasks = workingSteps.flatMap(step => step.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.completion_status === 'completed').length;
    const inProgressTasks = allTasks.filter(t => t.completion_status === 'in_progress').length;
    const pendingTasks = allTasks.filter(t => t.completion_status === 'pending').length;
    
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('klien.projects.index')}
                            className="text-sm text-primary-600 hover:text-primary-700 mb-1 inline-flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali ke Projects
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900 mt-1">
                            {project.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {project.client_name} • Role: Client
                        </p>
                    </div>
                    <span
                        className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm ${
                            project.status === 'open'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                    >
                        {project.status.toUpperCase()}
                    </span>
                </div>
            }
        >
            <Head title={project.name} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Dashboard Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {/* Overall Progress */}
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-primary-100 text-sm font-medium">Overall Progress</p>
                                    <p className="text-3xl font-bold mt-1">{completionPercentage}%</p>
                                </div>
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div 
                                    className="bg-white rounded-full h-2 transition-all duration-500"
                                    style={{ width: `${completionPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Completed Tasks */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">{completedTasks}</p>
                                    <p className="text-xs text-gray-500 mt-1">dari {totalTasks} tasks</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* In Progress Tasks */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-yellow-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">In Progress</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-1">{inProgressTasks}</p>
                                    <p className="text-xs text-gray-500 mt-1">sedang dikerjakan</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Pending Tasks */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Pending</p>
                                    <p className="text-3xl font-bold text-gray-600 mt-1">{pendingTasks}</p>
                                    <p className="text-xs text-gray-500 mt-1">belum dimulai</p>
                                </div>
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Steps Navigation Tabs */}
                    {workingSteps.length > 0 ? (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Workflow Steps</h3>
                                    <p className="text-sm text-gray-600 mt-1">Klik tab untuk melihat tasks di setiap step</p>
                                </div>
                                
                                {/* Tab Headers */}
                                <div className="flex overflow-x-auto">
                                    {workingSteps.map((step, index) => {
                                        const stepTasks = step.tasks;
                                        const stepCompleted = stepTasks.filter(t => t.completion_status === 'completed').length;
                                        const stepTotal = stepTasks.length;
                                        const stepPercentage = stepTotal > 0 ? Math.round((stepCompleted / stepTotal) * 100) : 0;
                                        
                                        return (
                                            <button
                                                key={step.id}
                                                onClick={() => setActiveTab(index)}
                                                className={`flex-1 min-w-[200px] px-6 py-4 border-b-4 transition-all ${
                                                    activeTab === index
                                                        ? 'border-primary-600 bg-primary-50'
                                                        : 'border-transparent hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                                        activeTab === index 
                                                            ? 'bg-primary-600 text-white' 
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-xs text-gray-600 font-medium">{stepPercentage}%</span>
                                                </div>
                                                <p className={`text-sm font-semibold text-left ${
                                                    activeTab === index ? 'text-primary-900' : 'text-gray-700'
                                                }`}>
                                                    {step.name}
                                                </p>
                                                <p className="text-xs text-gray-500 text-left mt-1">
                                                    {stepCompleted}/{stepTotal} tasks
                                                </p>
                                                {/* Progress bar */}
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                                    <div 
                                                        className={`h-1.5 rounded-full transition-all ${
                                                            stepPercentage === 100 ? 'bg-green-500' :
                                                            stepPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                                                        }`}
                                                        style={{ width: `${stepPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Step Content */}
                            {workingSteps[activeTab] && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {workingSteps[activeTab].name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Step {activeTab + 1} dari {workingSteps.length}
                                        </p>
                                    </div>

                                    {workingSteps[activeTab].tasks.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="text-sm font-medium text-gray-900">Belum Ada Task</p>
                                            <p className="text-xs text-gray-500 mt-1">Belum ada task dalam step ini</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {workingSteps[activeTab].tasks.map((task) => {
                                                const isDisabled = task.completion_status === 'pending';
                                                
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className={`group relative border-2 rounded-xl p-5 transition-all duration-200 ${
                                                            isDisabled
                                                                ? 'border-gray-200 bg-gray-50 opacity-60'
                                                                : task.completion_status === 'completed'
                                                                ? 'border-green-200 bg-green-50 hover:shadow-lg hover:border-green-300'
                                                                : task.completion_status === 'in_progress'
                                                                ? 'border-yellow-200 bg-yellow-50 hover:shadow-lg hover:border-yellow-300'
                                                                : 'border-gray-200 bg-white hover:shadow-lg hover:border-primary-300'
                                                        }`}
                                                    >
                                                        {/* Status Indicator */}
                                                        <div className="absolute top-0 right-0 mt-4 mr-4">
                                                            {task.completion_status === 'completed' && (
                                                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            {task.completion_status === 'in_progress' && (
                                                                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                                                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            {task.completion_status === 'pending' && (
                                                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="pr-14">
                                                            <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                                                {task.name}
                                                            </h4>

                                                            {/* Badges */}
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {isDisabled && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Belum Tersedia
                                                                    </span>
                                                                )}
                                                                {task.is_required && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                                        Required
                                                                    </span>
                                                                )}
                                                                {task.client_interact && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                                        Perlu Input
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Task Info */}
                                                            {task.latest_assignment?.notes && (
                                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                                    📝 {task.latest_assignment.notes}
                                                                </p>
                                                            )}

                                                            {/* Team Info - Show who's working on it */}
                                                            {task.assignments && task.assignments.length > 0 && task.assignments[0].user && (
                                                                <div className="mb-3 p-2 bg-white border border-gray-200 rounded-lg">
                                                                    <p className="text-xs text-gray-500 mb-1">Tim yang mengerjakan:</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                                            <span className="text-xs font-medium text-primary-700">
                                                                                {task.assignments[0].user.name.charAt(0)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-medium text-gray-900 truncate">
                                                                                {task.assignments[0].user.name}
                                                                            </p>
                                                                            {task.assignments[0].user.role && (
                                                                                <p className="text-xs text-gray-500 truncate">
                                                                                    {task.assignments[0].user.role.name}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Action Button */}
                                                            <div className="mt-4">
                                                                {isDisabled ? (
                                                                    <button
                                                                        type="button"
                                                                        disabled
                                                                        className="w-full px-4 py-2.5 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
                                                                    >
                                                                        <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Belum Tersedia
                                                                    </button>
                                                                ) : (
                                                                    <Link
                                                                        href={route('klien.tasks.show', task.id)}
                                                                        className="block w-full text-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                                                                    >
                                                                        Lihat Detail & Kelola →
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                            <div className="text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-lg font-medium text-gray-900 mb-2">Belum Ada Working Steps</p>
                                <p className="text-sm text-gray-500">Project ini belum memiliki working steps yang tersedia</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
