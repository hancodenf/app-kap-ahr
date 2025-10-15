import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';

interface AuditKlien {
    id: number;
    data: any;
    level: {
        id: number;
        nama: string;
    };
    subLevel: {
        id: number;
        nama: string;
    };
    document: {
        id: number;
        nama: string;
    };
    klien: {
        id: number;
        name: string;
        email: string;
    };
}

interface AuditEditPageProps extends PageProps {
    auditKlien: AuditKlien;
}

export default function Edit({ auditKlien }: AuditEditPageProps) {
    const [jsonData, setJsonData] = useState(() => {
        try {
            return JSON.stringify(auditKlien.data, null, 2);
        } catch {
            return String(auditKlien.data || '{}');
        }
    });

    const [formData, setFormData] = useState(auditKlien.data || {});
    const [processing, setProcessing] = useState(false);
    const [jsonError, setJsonError] = useState('');

    const handleJsonChange = (value: string) => {
        setJsonData(value);
        setJsonError('');
        
        try {
            const parsed = JSON.parse(value);
            setFormData(parsed);
        } catch (error) {
            setJsonError('Format JSON tidak valid');
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (jsonError) {
            return;
        }

        setProcessing(true);

        router.put(route('admin.audit.update', auditKlien.id), {
            data: formData
        }, {
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
                            {auditKlien.klien.name} - {auditKlien.level.nama} - {auditKlien.subLevel.nama}
                        </p>
                    </div>
                    <Link
                        href={route('admin.audit.show', auditKlien.klien.id)}
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
                                        <span className="ml-2 text-gray-600">{auditKlien.klien.name}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Email:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.klien.email}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Level:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.level.nama}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Sub Level:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.subLevel.nama}</span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="font-medium text-gray-700">Dokumen:</span>
                                        <span className="ml-2 text-gray-600">{auditKlien.document.nama}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Form */}
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="audit-data" className="block text-sm font-medium text-gray-700 mb-2">
                                        Data Audit (Format JSON)
                                    </label>
                                    <div className="space-y-2">
                                        <textarea
                                            id="audit-data"
                                            rows={15}
                                            value={jsonData}
                                            onChange={(e) => handleJsonChange(e.target.value)}
                                            className={`w-full border rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                jsonError ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Masukkan data dalam format JSON..."
                                        />
                                        {jsonError && (
                                            <p className="text-sm text-red-600">{jsonError}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Masukkan data dalam format JSON yang valid. Contoh: {`{"nama": "value", "status": "completed"}`}
                                        </p>
                                    </div>
                                </div>

                                {/* JSON Preview */}
                                {!jsonError && jsonData && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preview Data
                                        </label>
                                        <div className="bg-gray-50 border rounded-md p-3 max-h-60 overflow-y-auto">
                                            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                                {jsonData}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('admin.audit.show', auditKlien.klien.id)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || !!jsonError}
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