import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface AdminDashboardProps extends PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: {
            id: number;
            name: string;
            display_name: string;
            description: string;
        };
    };
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Welcome, {user.name}!
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Role: <span className="font-medium text-primary-600">{user.role.display_name}</span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {user.role.description}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                                    <h4 className="font-medium text-primary-900 mb-2">User Management</h4>
                                    <p className="text-sm text-primary-700">Manage users and their roles</p>
                                </div>
                                
                                <div className="bg-primary-100 p-4 rounded-lg border border-primary-300">
                                    <h4 className="font-medium text-primary-900 mb-2">System Settings</h4>
                                    <p className="text-sm text-primary-800">Configure system settings</p>
                                </div>
                                
                                <div className="bg-primary-200 p-4 rounded-lg border border-primary-400">
                                    <h4 className="font-medium text-primary-900 mb-2">Reports & Analytics</h4>
                                    <p className="text-sm text-primary-800">View audit reports and analytics</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}