import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

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
}

interface Template {
    id: number;
    sub_level_id: number;
    document_id?: number;
    document_name?: string;
    file?: string;
    time?: string;
    comment?: string;
    acc_partner: string;
    acc_partner_id?: number;
    acc_partner_time?: string;
    for: string;
    acc_klien: string;
    acc_klien_id?: number;
    acc_klien_time?: string;
    sub_level: SubLevel;
    document?: Document;
}

interface Props extends PageProps {
    templates: Template[];
    levels: Level[];
}

export default function Index({ auth, templates, levels }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Template Management
                </h2>
            }
        >
            <Head title="Template Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-primary-600 mb-4">
                                    Daftar Template Audit
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Kelola template untuk setiap tahap audit. Klik "Edit" untuk mengubah template.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {(() => {
                                    // Group templates by level
                                    const groupedTemplates = templates.reduce((acc, template) => {
                                        const levelName = template.sub_level.level.name;
                                        if (!acc[levelName]) {
                                            acc[levelName] = [];
                                        }
                                        acc[levelName].push(template);
                                        return acc;
                                    }, {} as Record<string, Template[]>);

                                    return Object.entries(groupedTemplates).map(([levelName, levelTemplates]) => (
                                        <div key={levelName} className="bg-gray-50 rounded-lg p-6">
                                            <div className="mb-4">
                                                <h4 className="text-lg font-semibold text-primary-700 mb-2">
                                                    {levelName}
                                                </h4>
                                                <div className="h-1 w-16 bg-primary-600 rounded"></div>
                                            </div>
                                            
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-white">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                                                No
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Sub Tahap
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Dokumen
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Peruntuk
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Persetujuan
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Aksi
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {levelTemplates.map((template, index) => (
                                                            <tr key={template.id} className="hover:bg-gray-50">
                                                                <td className=" whitespace-nowrap text-sm text-gray-500 text-center">
                                                                    {index + 1}
                                                                </td>
                                                                <td className=" whitespace-wrap text-sm text-gray-900 font-medium">
                                                                    {template.sub_level.name}
                                                                </td>
                                                                <td className=" whitespace-wrap text-sm text-gray-700">
                                                                    {template.document?.name || template.document_name || 'N/A'}
                                                                </td>
                                                                <td className=" whitespace-wrap">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                                        template.for === 'kap' 
                                                                            ? 'bg-blue-100 text-blue-800' 
                                                                            : 'bg-green-100 text-green-800'
                                                                    }`}>
                                                                        {template.for.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td className=" whitespace-wrap">
                                                                    <div className="flex flex-col space-y-1">
                                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full w-fit ${
                                                                            template.acc_partner === 'true' 
                                                                                ? 'bg-green-100 text-green-800' 
                                                                                : 'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                            Partner: {template.acc_partner === 'true' ? 'Yes' : 'No'}
                                                                        </span>
                                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full w-fit ${
                                                                            template.acc_klien === 'true' 
                                                                                ? 'bg-green-100 text-green-800' 
                                                                                : 'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                            Klien: {template.acc_klien === 'true' ? 'Yes' : 'No'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className=" whitespace-wrap text-sm font-medium">
                                                                    <Link
                                                                        href={route('templates.edit', template.id)}
                                                                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                                                                    >
                                                                        Edit
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>

                            {templates.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada template</h3>
                                        <p className="mt-1 text-sm text-gray-500">Belum ada template yang dibuat.</p>
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