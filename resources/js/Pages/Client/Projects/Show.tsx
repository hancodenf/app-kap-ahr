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

interface TaskWorker {
    id: number;
    worker_name: string;
    worker_email: string;
    worker_role: string;
    user?: {
        id: number;
        name: string;
        email: string;
        profile_photo: string | null;
        position: string | null;
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
    client_interact: 'read only' | 'comment' | 'upload';
    multiple_files: boolean;
    is_assigned_to_me: boolean;
    my_assignment_id: number | null;
    workers: TaskWorker[]; // Add workers array
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

interface ProjectTeam {
    id: number;
    user_name: string;
    user_email: string;
    user_position: string | null;
    role: 'partner' | 'manager' | 'supervisor' | 'team leader' | 'member';
    user?: {
        id: number;
        name: string;
        email: string;
        position: string | null; // enum field from users table
        user_type: string | null; // enum field from users table
        profile_photo: string | null; // profile photo path
        whatsapp: string | null; // WhatsApp number
    };
}

interface Props extends PageProps {
    project: Project;
    workingSteps: WorkingStep[];
    projectTeams: ProjectTeam[];
}

export default function Show({ project, workingSteps, projectTeams }: Props) {
    const [activeTab, setActiveTab] = useState<number>(0);
    const [hoveredWorker, setHoveredWorker] = useState<string | null>(null);
    
    // Check if project is active (only In Progress allows interactions)
    const isProjectActive = project.status === 'In Progress';

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
                            project.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : project.status === 'Completed'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : project.status === 'Draft'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
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
                    {/* Read-Only Warning */}
                    {!isProjectActive && (
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Project dalam mode Read-Only
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        Project ini berstatus <strong>{project.status}</strong> sehingga tidak dapat diubah. Hanya project dengan status "In Progress" yang dapat dikelola.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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

                    {/* Project Team Members */}
                    {projectTeams && projectTeams.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Tim Proyek</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Anggota tim yang bekerja di proyek ini ({projectTeams.length} orang)
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projectTeams.map((team) => {
                                    // Get role badge color
                                    const getRoleBadge = (role: string) => {
                                        switch (role) {
                                            case 'partner':
                                                return 'bg-purple-100 text-purple-800 border-purple-200';
                                            case 'manager':
                                                return 'bg-blue-100 text-blue-800 border-blue-200';
                                            case 'supervisor':
                                                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                                            case 'team leader':
                                                return 'bg-green-100 text-green-800 border-green-200';
                                            default:
                                                return 'bg-gray-100 text-gray-800 border-gray-200';
                                        }
                                    };

                                    // Get initials for avatar
                                    const getInitials = (name: string) => {
                                        return name
                                            .split(' ')
                                            .map(word => word.charAt(0))
                                            .join('')
                                            .toUpperCase()
                                            .substring(0, 2);
                                    };

                                    return (
                                        <div
                                            key={team.id}
                                            className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                {team.user?.profile_photo ? (
                                                    <img 
                                                        src={`/storage/${team.user.profile_photo}`} 
                                                        alt={team.user_name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 shadow-md flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                        <span className="text-white font-bold text-sm">
                                                            {getInitials(team.user_name)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                        {team.user_name}
                                                    </h4> 
                                                    
                                                    {/* WhatsApp - Show if available */}
                                                    {team.user?.whatsapp && (
                                                        <>
                                                            <a
                                                                href={`https://wa.me/${team.user.whatsapp.replace(/\+/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 hover:underline mt-1"
                                                                title="Hubungi via WhatsApp"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                                </svg>
                                                                <span className="font-medium">{team.user.whatsapp}</span>
                                                            </a>
                                                            <br />
                                                        </>
                                                    )}
                                                    {/* Role Badge */}
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadge(team.role)}`}>
                                                        {team.role.charAt(0).toUpperCase() + team.role.slice(1)}
                                                    </span> 
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
                                            {workingSteps[activeTab].tasks.map((task, taskIndex) => {
                                                // Only disable if task is truly pending (not started yet)
                                                // Allow viewing details even if project is not active (read-only handled inside)
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
                                                        {/* Task Number Badge */}
                                                        <div className="absolute top-0 left-0 mt-4 ml-4">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-sm shadow-md">
                                                                {taskIndex + 1}
                                                            </div>
                                                        </div>

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

                                                        <div className="pl-12 pr-14">
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
                                                                {task.client_interact === 'upload' && task.status === 'Submitted to Client' && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Perlu Upload File
                                                                    </span>
                                                                )}
                                                                {task.client_interact === 'comment' && task.status === 'Submitted to Client' && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Perlu Komentar
                                                                    </span>
                                                                )}
                                                                {task.client_interact !== 'read only' && task.status === 'Client Reply' && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Sudah Dibalas
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Task Info */}
                                                            {task.latest_assignment?.notes && (
                                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                                    📝 {task.latest_assignment.notes}
                                                                </p>
                                                            )}

                                                            {/* Team Workers - Show profile photos with tooltip */}
                                                            {task.workers && task.workers.length > 0 && (
                                                                <div className="mb-3">
                                                                    <p className="text-xs text-gray-500 mb-2">Tim yang mengerjakan:</p>
                                                                    <div className="flex items-center gap-1">
                                                                        {task.workers.slice(0, 5).map((worker, index) => {
                                                                            const workerId = `${task.id}-${worker.id}`;
                                                                            const isHovered = hoveredWorker === workerId;
                                                                            
                                                                            return (
                                                                                <div 
                                                                                    key={worker.id}
                                                                                    className="relative"
                                                                                    onMouseEnter={() => setHoveredWorker(workerId)}
                                                                                    onMouseLeave={() => setHoveredWorker(null)}
                                                                                >
                                                                                    {/* Avatar */}
                                                                                    {worker.user?.profile_photo ? (
                                                                                        <img 
                                                                                            src={`/storage/${worker.user.profile_photo}`} 
                                                                                            alt={worker.worker_name}
                                                                                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm hover:scale-110 hover:z-[60] transition-transform cursor-pointer"
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-2 border-white shadow-sm hover:scale-110 hover:z-[60] transition-transform cursor-pointer">
                                                                                            <span className="text-white font-semibold text-xs">
                                                                                                {worker.worker_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    
                                                                                    {/* Tooltip - only shows for hovered worker */}
                                                                                    {isHovered && (
                                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-[100] animate-in fade-in duration-200">
                                                                                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                                                                                                <p className="font-semibold">{worker.worker_name}</p>
                                                                                                <p className="text-gray-300 text-[10px]">{worker.worker_role}</p>
                                                                                                {worker.user?.position && (
                                                                                                    <p className="text-gray-400 text-[10px] mt-0.5">{worker.user.position}</p>
                                                                                                )}
                                                                                                {/* Arrow */}
                                                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                                                                                    <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        
                                                                        {/* Show count if more than 5 */}
                                                                        {task.workers.length > 5 && (
                                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                                                                                <span className="text-gray-600 font-semibold text-xs">
                                                                                    +{task.workers.length - 5}
                                                                                </span>
                                                                            </div>
                                                                        )}
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
