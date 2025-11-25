import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';

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
    status: string;
    created_at: string;
    documents: Document[];
    client_documents: ClientDocument[];
    // No user relation in TaskAssignment model
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
        whatsapp: string | null;
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
    project_name: string;
    working_step_name: string;
    workers: TaskWorker[];
    latest_assignment: TaskAssignment | null;
    assignments: TaskAssignment[]; // All assignments with status "Submitted to Client" or "Client Reply"
}

interface Props extends PageProps {
    task: Task;
    project: {
        id: number;
        name: string;
        slug: string;
    };
    pendingClientDocs: ClientDocument[];
}

export default function TaskDetail({ task, project, pendingClientDocs }: Props) {
    const [hoveredWorker, setHoveredWorker] = useState<string | null>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm<{
        client_comment: string;
        client_document_files: { [key: number]: File | null };
    }>({
        client_comment: '',
        client_document_files: pendingClientDocs.reduce((acc, doc) => {
            acc[doc.id] = null;
            return acc;
        }, {} as { [key: number]: File | null }),
    });

    const handleClientDocFileChange = (docId: number, file: File | null) => {
        setData('client_document_files', {
            ...data.client_document_files,
            [docId]: file,
        });
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('klien.client-documents.upload', task.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    // Client can interact if permission is 'comment' or 'upload' and hasn't replied yet
    const canInteract = task.client_interact !== 'read only' && !task.latest_assignment?.client_comment;
    const canUploadFiles = task.client_interact === 'upload' && !task.latest_assignment?.client_comment;

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

    const getTaskStatusBadgeClass = (status: string) => {
        if (status.includes('Approved')) {
            return 'bg-green-100 text-green-800 border border-green-200';
        } else if (status.includes('Under Review')) {
            return 'bg-blue-100 text-blue-800 border border-blue-200';
        } else if (status.includes('Returned')) {
            return 'bg-red-100 text-red-800 border border-red-200';
        } else if (status === 'Submitted to Client' || status === 'Client Reply') {
            return 'bg-purple-100 text-purple-800 border border-purple-200';
        }
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <Link
                        href={route('klien.projects.show', project.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Project
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900 mt-1">
                        {task.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {project.name} • {task.working_step_name}
                    </p>
                </div>
            }
        >
            <Head title={`${task.name} - ${project.name}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Task Overview Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Task</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Status Completion</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(task.completion_status)}`}>
                                            {task.completion_status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Status Task</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${getTaskStatusBadgeClass(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Team Workers */}
                                {task.workers && task.workers.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm font-medium text-gray-700 mb-3">
                                            Tim yang Mengerjakan ({task.workers.length} orang)
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {task.workers.map((worker) => {
                                                // Get role badge color
                                                const getRoleBadge = (role: string) => {
                                                    const roleLower = role.toLowerCase();
                                                    if (roleLower.includes('partner')) {
                                                        return 'bg-purple-100 text-purple-800 border-purple-200';
                                                    } else if (roleLower.includes('manager')) {
                                                        return 'bg-blue-100 text-blue-800 border-blue-200';
                                                    } else if (roleLower.includes('supervisor')) {
                                                        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                                                    } else if (roleLower.includes('leader')) {
                                                        return 'bg-green-100 text-green-800 border-green-200';
                                                    }
                                                    return 'bg-gray-100 text-gray-800 border-gray-200';
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
                                                        key={worker.id}
                                                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* Avatar */}
                                                            {worker.user?.profile_photo ? (
                                                                <img 
                                                                    src={`/storage/${worker.user.profile_photo}`} 
                                                                    alt={worker.worker_name}
                                                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 shadow-md flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                                    <span className="text-white font-bold text-sm">
                                                                        {getInitials(worker.worker_name)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                                    {worker.worker_name}
                                                                </h4> 
                                                                
                                                                {/* WhatsApp - Show if available */}
                                                                {worker.user?.whatsapp && (
                                                                    <>
                                                                    <a
                                                                        href={`https://wa.me/${worker.user.whatsapp.replace(/\+/g, '')}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 hover:underline mt-1"
                                                                        title="Hubungi via WhatsApp"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                                        </svg>
                                                                        <span className="font-medium">Hubungi saya</span>
                                                                    </a>
                                                                    <br />
                                                                    </>
                                                                )}
                                                                
                                                                {/* Role Badge */} 
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadge(worker.worker_role)}`}>
                                                                    {worker.worker_role.charAt(0).toUpperCase() + worker.worker_role.slice(1)}
                                                                </span> 
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Submission History & Team */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Client Interaction History (Submitted to Client & Client Reply only) */}
                            {task.assignments && task.assignments.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Riwayat Interaksi ({task.assignments.length})
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {task.assignments.map((assignment, index) => (
                                            <div key={assignment.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                                                                #{task.assignments.length - index}
                                                            </span>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    {assignment.status === 'Submitted to Client' ? 'Permintaan Dokumen' : 'Balasan Anda'}
                                                                    {index === 0 && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Terbaru</span>}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
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
                                                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                                            assignment.status === 'Client Reply' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {assignment.status === 'Client Reply' ? '✓ Sudah Dibalas' : '⏳ Menunggu'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 space-y-4">
                                                    {assignment.notes && (
                                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                                            <p className="text-xs font-medium text-blue-900 mb-1">📝 Notes dari Tim:</p>
                                                            <p className="text-sm text-blue-800" style={{ whiteSpace: 'pre-line' }}>{assignment.notes}</p>
                                                        </div>
                                                    )}

                                                    {assignment.client_comment && (
                                                        <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded">
                                                            <p className="text-xs font-medium text-purple-900 mb-1">💬 Komentar Anda:</p>
                                                            <p className="text-sm text-purple-800">{assignment.client_comment}</p>
                                                        </div>
                                                    )}

                                                    {assignment.documents && assignment.documents.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-700 mb-2">📁 Dokumen dari Tim ({assignment.documents.length}):</p>
                                                            <div className="space-y-2">
                                                                {assignment.documents.map((doc) => (
                                                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                            <span className="text-sm text-gray-900 font-medium">{doc.name}</span>
                                                                        </div>
                                                                        <a
                                                                            href={`/storage/${doc.file}`}
                                                                            download
                                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                                                        >
                                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                            </svg>
                                                                            Download
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {assignment.client_documents && assignment.client_documents.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-700 mb-2">📋 Dokumen yang Diminta ({assignment.client_documents.length}):</p>
                                                            <div className="space-y-2">
                                                                {assignment.client_documents.map((clientDoc) => (
                                                                    <div key={clientDoc.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-gray-900 truncate">{clientDoc.name}</p>
                                                                                {clientDoc.description && (
                                                                                    <p className="text-xs text-gray-600 mt-0.5">{clientDoc.description}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        {clientDoc.file ? (
                                                                            <a
                                                                                href={`/storage/${clientDoc.file}`}
                                                                                download
                                                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex-shrink-0 ml-2"
                                                                            >
                                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                </svg>
                                                                                Download
                                                                            </a>
                                                                        ) : (
                                                                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-lg flex-shrink-0 ml-2">
                                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                Menunggu
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Upload Form */}
                        <div className="lg:col-span-1">
                            {canInteract ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        {task.client_interact === 'upload' ? (
                                            <>
                                                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Kirim Balasan
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                </svg>
                                                Kirim Komentar
                                            </>
                                        )}
                                    </h3>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {canUploadFiles && pendingClientDocs.length > 0 && (
                                            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                                <p className="text-sm font-semibold text-purple-900 mb-1">
                                                    📋 {pendingClientDocs.length} Dokumen Diminta
                                                </p>
                                                <p className="text-xs text-purple-800">
                                                    Upload semua dokumen yang diminta
                                                </p>
                                            </div>
                                        )}

                                        {canUploadFiles && pendingClientDocs.length > 0 ? (
                                            <>
                                                {pendingClientDocs.map((doc, index) => (
                                                    <div key={doc.id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                                                        <div className="flex items-start gap-2 mb-3">
                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex-shrink-0">
                                                                {index + 1}
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                                                                {doc.description && (
                                                                    <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <input
                                                            type="file"
                                                            onChange={(e) => handleClientDocFileChange(doc.id, e.target.files?.[0] || null)}
                                                            className="block w-full text-sm text-gray-600 
                                                                file:mr-4 file:py-2 file:px-4 
                                                                file:rounded-lg file:border-0 
                                                                file:text-sm file:font-semibold 
                                                                file:bg-purple-600 file:text-white 
                                                                hover:file:bg-purple-700
                                                                border-2 border-gray-300 rounded-lg
                                                                focus:outline-none focus:border-purple-500"
                                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                            required
                                                        />

                                                        {data.client_document_files[doc.id] && (
                                                            <p className="text-xs text-green-700 mt-2 flex items-center">
                                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                {data.client_document_files[doc.id]?.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-sm text-gray-600">Tidak ada dokumen yang diminta</p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Komentar (Optional)
                                            </label>
                                            <textarea
                                                value={data.client_comment}
                                                onChange={(e) => setData('client_comment', e.target.value)}
                                                rows={4}
                                                placeholder="Tambahkan catatan atau komentar..."
                                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full px-4 py-3 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            {processing ? 'Mengupload...' : 'Upload Dokumen'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="text-center py-6">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-lg font-medium text-gray-900 mb-1">
                                            {task.latest_assignment?.client_comment ? 'Balasan Terkirim' : 'View Only'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {task.latest_assignment?.client_comment 
                                                ? 'Anda sudah mengirim balasan untuk task ini' 
                                                : 'Task ini hanya untuk melihat informasi'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
