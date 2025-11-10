import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                    Profil Saya
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-4 sm:py-6 lg:py-12">
                <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 sm:p-6 lg:p-8 shadow sm:rounded-lg">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>

                    <div className="bg-white p-4 sm:p-6 lg:p-8 shadow sm:rounded-lg">
                        <UpdatePasswordForm className="max-w-2xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
