import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface TemplateBundle {
    id: number;
    name: string;
    project_templates_count: number;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    bundles: TemplateBundle[];
}

export default function Index({ auth, bundles }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Template
                    </h2>
                </div>
            }
        >
            <Head title="Template" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Template Management</h3>
                                    <p className="text-sm text-gray-600">
                                        Kelola template berdasarkan kategori. Setiap template berisi kumpulan project template.
                                    </p>
                                </div>
                                <Link
                                    href={route('admin.project-templates.template-bundles.create')}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                                >
                                    Add Template Category
                                </Link>
                            </div>

                            {bundles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bundles.map((bundle) => (
                                        <div key={bundle.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {bundle.name}
                                                </h4>
                                                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    {bundle.project_templates_count} items
                                                </span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-4">
                                                Created: {new Date(bundle.created_at).toLocaleDateString('id-ID')}
                                            </p>

                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.project-templates.template-bundles.show', bundle.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex-1 text-center"
                                                >
                                                    View Details
                                                </Link>
                                                <Link
                                                    href={route('admin.project-templates.template-bundles.edit', bundle.id)}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={route('admin.project-templates.template-bundles.destroy', bundle.id)}
                                                    method="delete"
                                                    as="button"
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                                    onClick={(e) => {
                                                        if (!confirm('Are you sure you want to delete this template category?')) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No template categories found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Get started by creating your first template category.
                                        </p>
                                        <div className="mt-6">
                                            <Link
                                                href={route('admin.project-templates.template-bundles.create')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                            >
                                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add First Template Category
                                            </Link>
                                        </div>
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
