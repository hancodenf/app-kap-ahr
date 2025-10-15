import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';

interface Level {
    id: number;
    name: string;
    slug: string;
}

interface SubLevel {
    id: number;
    name: string;
    slug: string;
    level_id: number;
    level: Level;
}

interface Document {
    id: number;
    name: string;
    slug: string;
    sub_level_id: number;
}

interface AuditKlien {
    id: number;
    klien_id: number;
    level_id: number | null;
    sub_level_id: number | null;
    document_id: number | null;
    document_name: string | null;
    file: string | null;
    time: string | null;
    comment: string | null;
    acc_partner: string;
    acc_partner_id: number | null;
    acc_partner_time: string | null;
    for: string;
    acc_klien: string;
    acc_klien_id: number | null;
    acc_klien_time: string | null;
    level?: Level | null;
    subLevel?: SubLevel | null;
    document?: Document | null;
    klien?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface AuditEditPageProps extends PageProps {
    auditKlien: AuditKlien;
}

export default function Edit({ auditKlien }: AuditEditPageProps) {
    const [formData, setFormData] = useState({
        document_name: auditKlien.document_name || '',
        file: auditKlien.file || '',
        time: auditKlien.time || '',
        comment: auditKlien.comment || '',
        acc_partner: auditKlien.acc_partner,
        for: auditKlien.for,
        acc_klien: auditKlien.acc_klien,
    });
    const [processing, setProcessing] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.put(route('admin.audit.update', auditKlien.id), formData, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Edit Data Audit
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {auditKlien.klien?.name} - {auditKlien.level?.name || auditKlien.subLevel?.level?.name} - {auditKlien.subLevel?.name}
                        </p>
                    </div>
                    <Link
                        href={route('admin.audit.show', auditKlien.klien?.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title="Edit Data Audit" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Audit Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Informasi Audit</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Klien:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.klien?.name}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Email:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.klien?.email}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Level:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.level?.name || auditKlien.subLevel?.level?.name}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Sub Level:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.subLevel?.name}</span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="font-medium text-gray-700">Dokumen:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.document?.name || auditKlien.document_name || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Approval Info */}
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Status Persetujuan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Diisi Oleh:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                            auditKlien.for === 'kap' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {auditKlien.for === 'kap' ? 'KAP (Staff/Partner)' : 'Klien'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Status Partner:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                            auditKlien.acc_partner === 'true' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {auditKlien.acc_partner === 'true' ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Status Klien:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                            auditKlien.acc_klien === 'true' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {auditKlien.acc_klien === 'true' ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Terakhir Update:</span>
                                        <span className="ml-2 text-gray-600">
                                            {auditKlien.acc_partner_time || auditKlien.acc_klien_time 
                                                ? new Date(auditKlien.acc_partner_time || auditKlien.acc_klien_time!).toLocaleDateString('id-ID')
                                                : 'Belum ada update'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Form */}
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Document Name */}
                                    <div>
                                        <label htmlFor="document_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Dokumen
                                        </label>
                                        <input
                                            id="document_name"
                                            type="text"
                                            value={formData.document_name}
                                            onChange={(e) => handleInputChange('document_name', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Nama dokumen audit"
                                        />
                                    </div>

                                    {/* File */}
                                    <div>
                                        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                                            File
                                        </label>
                                        <input
                                            id="file"
                                            type="text"
                                            value={formData.file}
                                            onChange={(e) => handleInputChange('file', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Nama file atau path"
                                        />
                                    </div>

                                    {/* Time */}
                                    <div>
                                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                                            Waktu
                                        </label>
                                        <input
                                            id="time"
                                            type="datetime-local"
                                            value={formData.time ? new Date(formData.time).toISOString().slice(0, 16) : ''}
                                            onChange={(e) => handleInputChange('time', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    {/* For */}
                                    <div>
                                        <label htmlFor="for" className="block text-sm font-medium text-gray-700 mb-2">
                                            Diisi Oleh
                                        </label>
                                        <select
                                            id="for"
                                            value={formData.for}
                                            onChange={(e) => handleInputChange('for', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="kap">KAP (Staff/Partner)</option>
                                            <option value="klien">Klien</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.for === 'kap' 
                                                ? 'Data ini diisi oleh pihak KAP (Admin/Staff/Partner)' 
                                                : 'Data ini diisi oleh Klien'
                                            }
                                        </p>
                                    </div>

                                    {/* Partner Approval */}
                                    <div>
                                        <label htmlFor="acc_partner" className="block text-sm font-medium text-gray-700 mb-2">
                                            Persetujuan Partner
                                        </label>
                                        <select
                                            id="acc_partner"
                                            value={formData.acc_partner}
                                            onChange={(e) => handleInputChange('acc_partner', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="false">Pending</option>
                                            <option value="true">Approved</option>
                                        </select>
                                    </div>

                                    {/* Client Approval */}
                                    <div>
                                        <label htmlFor="acc_klien" className="block text-sm font-medium text-gray-700 mb-2">
                                            Persetujuan Klien
                                        </label>
                                        <select
                                            id="acc_klien"
                                            value={formData.acc_klien}
                                            onChange={(e) => handleInputChange('acc_klien', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="false">Pending</option>
                                            <option value="true">Approved</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                        Komentar
                                    </label>
                                    <textarea
                                        id="comment"
                                        rows={4}
                                        value={formData.comment}
                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Tambahkan komentar audit..."
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('admin.audit.show', auditKlien.klien?.id)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}