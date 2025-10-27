import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';

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
    working_step?: WorkingStep;
}

interface Document {
    id: number;
    name: string;
    slug: string;
    working_sub_step_id: number;
}

interface Project {
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
    working_sub_step?: WorkingSubStep | null;
    documents?: Document[];
    project?: {
        id: number;
        name: string;
        client_id: number;
        client?: {
            id: number;
            user_id: number;
            name: string;
            alamat: string;
            kementrian: string;
            kode_satker: string;
            user?: {
                id: number;
                name: string;
                email: string;
                role: string;
            };
        };
    };
}

interface ProjectEditPageProps extends PageProps {
    project: Project;
}

export default function Edit({ project }: ProjectEditPageProps) {
    // Debug: Log the project data structure
    console.log('Project data:', project);
    console.log('Working Step:', project.working_step);
    console.log('Working Sub Step:', project.working_sub_step);
    
    const [formData, setFormData] = useState({
        time: project.time || '',
        comment: project.comment || '',
        client_comment: project.client_comment || '',
        status: project.status || 'Draft',
        client_interact: project.client_interact || false,
        multiple_files: project.multiple_files || false,
    });
    const [processing, setProcessing] = useState(false);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.put(route('admin.project.update', project.id), formData, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Edit Data Project
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {project.project?.client?.name} - {project.working_step?.name || project.working_sub_step?.working_step?.name} - {project.working_sub_step?.name}
                        </p>
                    </div>
                    <Link
                        href={route('admin.project.show', project.project?.client?.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title="Edit Data Project" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Project Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Tahapan:</span>
                                        <span className="ml-2 text-gray-600">
                                            {project.working_step?.name || project.working_sub_step?.working_step?.name || 'Tidak ada data tahapan'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Sub Tahapan:</span>
                                        <span className="ml-2 text-gray-600">
                                            {project.working_sub_step?.name || 'Tidak ada data sub tahapan'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Approval Info */}
                            {/* <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Status Persetujuan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Diisi Oleh:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                            project.for === 'kap' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {project.for === 'kap' ? 'KAP (Staff/Partner)' : 'Klien'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Status Partner:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                            project.acc_partner === 'true' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {project.acc_partner === 'true' ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Status Klien:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                            project.acc_klien === 'true' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {project.acc_klien === 'true' ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Terakhir Update:</span>
                                        <span className="ml-2 text-gray-600">
                                            {project.acc_partner_time || project.acc_klien_time 
                                                ? new Date(project.acc_partner_time || project.acc_klien_time!).toLocaleDateString('id-ID')
                                                : 'Belum ada update'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div> */}

                            {/* Edit Form */}
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    {/* Status */}
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            value={formData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Submitted">Submitted</option>
                                            <option value="Under Review by Team Leader">Under Review by Team Leader</option>
                                            <option value="Approved by Team Leader">Approved by Team Leader</option>
                                            <option value="Returned for Revision (by Team Leader)">Returned for Revision (by Team Leader)</option>
                                            <option value="Under Review by Manager">Under Review by Manager</option>
                                            <option value="Approved by Manager">Approved by Manager</option>
                                            <option value="Returned for Revision (by Manager)">Returned for Revision (by Manager)</option>
                                            <option value="Under Review by Supervisor">Under Review by Supervisor</option>
                                            <option value="Approved by Supervisor">Approved by Supervisor</option>
                                            <option value="Returned for Revision (by Supervisor)">Returned for Revision (by Supervisor)</option>
                                            <option value="Under Review by Partner">Under Review by Partner</option>
                                            <option value="Approved by Partner">Approved by Partner</option>
                                            <option value="Returned for Revision (by Partner)">Returned for Revision (by Partner)</option>
                                            <option value="Submitted to Client">Submitted to Client</option>
                                            <option value="Client Reply">Client Reply</option>
                                        </select>
                                    </div>

                                    {/* Client Interact */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Interaksi Klien
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="client_interact"
                                                    value="true"
                                                    checked={formData.client_interact === true}
                                                    onChange={(e) => handleInputChange('client_interact', e.target.value === 'true')}
                                                    className="mr-2"
                                                />
                                                Diizinkan
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="client_interact"
                                                    value="false"
                                                    checked={formData.client_interact === false}
                                                    onChange={(e) => handleInputChange('client_interact', e.target.value === 'true')}
                                                    className="mr-2"
                                                />
                                                Tidak Diizinkan
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Apakah klien diizinkan untuk berinteraksi dengan item ini
                                        </p>
                                    </div>

                                    {/* Multiple Files */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Multiple Files
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="multiple_files"
                                                    value="true"
                                                    checked={formData.multiple_files === true}
                                                    onChange={(e) => handleInputChange('multiple_files', e.target.value === 'true')}
                                                    className="mr-2"
                                                />
                                                Ya
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="multiple_files"
                                                    value="false"
                                                    checked={formData.multiple_files === false}
                                                    onChange={(e) => handleInputChange('multiple_files', e.target.value === 'true')}
                                                    className="mr-2"
                                                />
                                                Tidak
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Apakah item ini mendukung multiple file upload
                                        </p>
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                        Komentar Internal
                                    </label>
                                    <textarea
                                        id="comment"
                                        rows={3}
                                        value={formData.comment}
                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Komentar internal untuk tim..."
                                    />
                                </div>

                                {/* Client Comment */}
                                <div>
                                    <label htmlFor="client_comment" className="block text-sm font-medium text-gray-700 mb-2">
                                        Komentar untuk Klien
                                    </label>
                                    <textarea
                                        id="client_comment"
                                        rows={3}
                                        value={formData.client_comment}
                                        onChange={(e) => handleInputChange('client_comment', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Komentar yang akan dilihat oleh klien..."
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('admin.project.show', project.project?.client?.id)}
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