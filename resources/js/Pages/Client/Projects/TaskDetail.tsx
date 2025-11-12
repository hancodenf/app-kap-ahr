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
    client_interact: boolean;
    multiple_files: boolean;
    project_name: string;
    working_step_name: string;
    workers: TaskWorker[];
    latest_assignment: TaskAssignment | null;
    assignments: TaskAssignment[];
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

    const canUpload = task.client_interact && !task.latest_assignment?.client_comment;

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
                                        <p className="text-xs text-gray-500 mb-2">Tim yang Mengerjakan:</p>
                                        <div className="flex items-center gap-1">
                                            {task.workers.slice(0, 5).map((worker) => {
                                                const workerId = `task-${task.id}-worker-${worker.id}`;
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
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm hover:scale-110 hover:z-[60] transition-transform cursor-pointer"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-2 border-white shadow-sm hover:scale-110 hover:z-[60] transition-transform cursor-pointer">
                                                                <span className="text-white font-semibold text-sm">
                                                                    {worker.worker_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Tooltip */}
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
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                                                    <span className="text-gray-600 font-semibold text-sm">
                                                        +{task.workers.length - 5}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Submission History & Team */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Assignment History */}
                            {task.assignments && task.assignments.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Riwayat Submission ({task.assignments.length})
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
                                                                    Submission {index === 0 && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Terbaru</span>}
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
                                                        {assignment.is_approved && (
                                                            <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                                                ✓ Disetujui
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Team Member Info */}
                                                    {assignment.user && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                            <p className="text-xs text-gray-500 mb-1">Dikerjakan oleh:</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-primary-700">
                                                                        {assignment.user.name.charAt(0)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{assignment.user.name}</p>
                                                                    {assignment.user.role && (
                                                                        <p className="text-xs text-gray-500">{assignment.user.role.name}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4 space-y-4">
                                                    {assignment.notes && (
                                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                                            <p className="text-xs font-medium text-blue-900 mb-1">📝 Notes dari Tim:</p>
                                                            <p className="text-sm text-blue-800">{assignment.notes.replace(/<br\s*\/?>/gi, '\n')}</p>
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
                                                                    <div key={clientDoc.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <p className="text-sm font-medium text-gray-900">{clientDoc.name}</p>
                                                                                {clientDoc.description && (
                                                                                    <p className="text-xs text-gray-600 mt-1">{clientDoc.description}</p>
                                                                                )}
                                                                            </div>
                                                                            {clientDoc.file ? (
                                                                                <a
                                                                                    href={`/storage/${clientDoc.file}`}
                                                                                    download
                                                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                                                                                >
                                                                                    ✓ Sudah Diupload
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-xs text-purple-700 italic">⏳ Menunggu...</span>
                                                                            )}
                                                                        </div>
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
                            {canUpload ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Kirim Balasan
                                    </h3>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {pendingClientDocs.length > 0 && (
                                            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                                <p className="text-sm font-semibold text-purple-900 mb-1">
                                                    📋 {pendingClientDocs.length} Dokumen Diminta
                                                </p>
                                                <p className="text-xs text-purple-800">
                                                    Upload semua dokumen yang diminta
                                                </p>
                                            </div>
                                        )}

                                        {pendingClientDocs.length > 0 ? (
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
