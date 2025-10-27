import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Client {
    id: number;
    user_id: number;
    name: string;
    alamat: string;
    kementrian: string;
    kode_satker: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        email_verified_at: string | null;
        created_at: string;
    };
}

interface WorkingStep {
    id: number;
    name: string;
    slug: string;
}

interface WorkingSubStep {
    id: number;
    name: string;
    slug: string;
    working_step_id: number;
    working_step: WorkingStep;
}

interface Document {
    id: number;
    name: string;
    slug: string;
    working_sub_step_id: number;
}

interface ProjectItem {
    id: number;
    project_id: number;
    working_step_id: number | null;
    working_sub_step_id: number;
    time: string | null;
    comment: string | null;
    client_comment: string | null;
    client_interact: boolean;
    multiple_files: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    working_step?: WorkingStep | null;
    working_sub_step: WorkingSubStep;
    documents?: Document[];
}

interface ProjectShowPageProps extends PageProps {
    client: Client;
    project: Record<string, ProjectItem[]>;
    hasProjectData: boolean;
}

export default function Show({ client, project, hasProjectData }: ProjectShowPageProps) {
    console.log(hasProjectData && project && Object.keys(project).length > 0);
    
    const { flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);

    const handleGenerateFromTemplate = () => {
        setShowModal(true);
    };

    const confirmGenerate = () => {
        router.post(route('admin.project.generate', client.id));
        setShowModal(false);
    };

    const cancelGenerate = () => {
        setShowModal(false);
    };

    const formatAuditInfo = (item: ProjectItem) => {
        return (
            <div className="space-y-2">
                {/* Documents Information */}
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Dokumen:</span>
                    <span className={`text-sm ${item.documents && item.documents.length > 0 ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                        {item.documents && item.documents.length > 0 ? `${item.documents.length} dokumen` : 'Belum ada dokumen'}
                    </span>
                </div>
                
                {/* Time Information */}
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Waktu:</span>
                    <span className={`text-sm ${item.time ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                        {item.time ? new Date(item.time).toLocaleDateString('id-ID') : 'Belum diisi'}
                    </span>
                </div>
                
                {/* Comment Information */}
                <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Komentar:</span>
                    <span className={`text-sm text-right max-w-xs ${item.comment ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                        {item.comment || 'Belum ada komentar'}
                    </span>
                </div>
                
                {/* Status Information */}
                <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                            item.status === 'Approved by Partner' ? 'bg-green-100 text-green-800' : 
                            item.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {item.status}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">Interaksi Klien:</span>
                        <span className={`text-sm font-medium ${
                            item.client_interact ? 'text-green-600' : 'text-gray-600'
                        }`}>
                            {item.client_interact ? 'Diizinkan' : 'Tidak Diizinkan'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Multiple Files:</span>
                        <span className={`text-sm font-medium ${
                            item.multiple_files ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                            {item.multiple_files ? 'Ya' : 'Tidak'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Data Audit - {client.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">{client.user.email}</p>
                    </div>
                    <div className="flex gap-3">
                        {hasProjectData && (
                            <Link
                                href={route('admin.project.manage', client.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                Kelola Project
                            </Link>
                        )}
                        <Link
                            href={route('admin.project.index')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Kembali ke Daftar Klien
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Data Audit - ${client.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {flash.error}
                        </div>
                    )}

                    {/* Client Info Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-xl font-medium text-primary-600">
                                        {client.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="ml-6">
                                    <h3 className="text-2xl font-bold text-gray-900">{client.name}</h3>
                                    <p className="text-gray-600">{client.user.email}</p>
                                    <p className="text-sm text-gray-500">{client.kementrian}</p>
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 mt-2">
                                        {client.user.role.charAt(0).toUpperCase() + client.user.role.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Data */}
                    {hasProjectData && project && Object.keys(project).length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(project).map(([working_stepName, items], working_stepIndex) => (
                                <div key={working_stepName} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="bg-primary-50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-primary-800">
                                                {working_stepIndex + 1}. {working_stepName}
                                            </h3>
                                            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                                                {items.length} item{items.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {items.map((item, itemIndex) => (
                                                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-gray-900">
                                                                        {itemIndex + 1}.{working_stepIndex + 1}. {item.working_sub_step?.name || 'N/A'}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        Dokumen Template: {item.working_sub_step?.name || 'N/A'} - Dokumen yang diperlukan
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Working Step: {item.working_step?.name || 'N/A'} | Sub: {item.working_sub_step?.name || 'N/A'} | Docs: {item.documents?.length || 0}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.project.edit', item.id)}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Edit
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-gray-50 rounded-md p-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Informasi Audit:</h5>
                                                                <div className="text-sm space-y-1">
                                                                    <div className="flex justify-between">
                                                                        <span className="font-medium text-gray-600">Audit ID:</span>
                                                                        <span className="text-gray-800 font-mono">#{item.id}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="font-medium text-gray-600">WorkingStep:</span>
                                                                        <span className="text-gray-800">
                                                                            {item.working_step?.name || 
                                                                             item.working_sub_step?.working_step?.name || 
                                                                             'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="font-medium text-gray-600">Sub WorkingStep:</span>
                                                                        <span className="text-gray-800">{item.working_sub_step?.name || 'N/A'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="font-medium text-gray-600">Dokumen Uploaded:</span>
                                                                        <span className={`text-right max-w-xs ${item.documents && item.documents.length > 0 ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                                                            {item.documents && item.documents.length > 0 ? item.documents.map(doc => doc.name).join(', ') : 'Belum ada dokumen'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-700 mb-2">Status & Data:</h5>
                                                                <div className="text-sm">
                                                                    {formatAuditInfo(item)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-8 text-center">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Audit</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Klien <strong>{client.name}</strong> belum memiliki data project. 
                                    Anda dapat generate data project dari template yang sudah ada untuk memulai proses project.
                                </p>
                                
                                <div className="space-y-3">
                                    <button
                                        onClick={handleGenerateFromTemplate}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Generate dari Template
                                    </button>
                                    
                                    <div className="text-xs text-gray-500">
                                        Ini akan membuat data project berdasarkan template yang telah dikonfigurasi admin
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Generate Template</h3>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-gray-600">
                                    Apakah Anda yakin ingin generate data project dari template untuk klien <strong>{client.name}</strong>?
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Ini akan membuat data project baru berdasarkan template yang ada dan dapat memakan waktu beberapa saat.
                                </p>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelGenerate}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmGenerate}
                                    className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                >
                                    Ya, Generate Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}