import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useMemo, useEffect } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';

interface Client {
    id: number;
    name: string;
    alamat: string;
    kementrian: string;
    kode_satker: string;
    used_years?: number[];
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    position: string | null;
}

interface Template {
    id: number;
    name: string;
}

interface Props extends PageProps {
    clients: Client[];
    availableUsers: User[];
    templates: Template[];
    registeredApUserIds: number[];
}

interface TeamMemberRow {
    user_id: number;
    role: 'partner' | 'manager' | 'supervisor' | 'team leader' | 'member';
}

export default function Create({ auth, clients, availableUsers, templates, registeredApUserIds }: Props) {
    const currentYear = new Date().getFullYear();
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        client_id: 0,
        year: currentYear,
        team_members: [] as TeamMemberRow[],
        template_id: 0,
    });

    // Helper function to check if user is registered AP
    const isUserRegisteredAp = (userId: number): boolean => {
        return registeredApUserIds.includes(userId);
    };

    // Helper function to check if partner option should be disabled
    const isPartnerOptionDisabled = (userId: number | null): boolean => {
        // If no user selected yet, allow partner to be selected (don't disable)
        if (!userId || userId === 0) return false;
        // If user is selected, check if they're registered AP
        return !isUserRegisteredAp(userId);
    };

    // Get filtered users based on role for each team member
    const getFilteredUsers = (role: string) => {
        if (role === 'partner') {
            // If role is partner, only show registered APs
            return availableUsers.filter(user => isUserRegisteredAp(user.id));
        }
        // Otherwise show all users
        return availableUsers;
    };

    // Get year options with disabled status for used years
    const yearOptions = useMemo(() => {
        const selectedClient = clients.find(c => c.id === data.client_id);
        const usedYears = (selectedClient?.used_years || []).map(y => Number(y)); // Convert to numbers
        
        return Array.from({ length: currentYear - 1999 }, (_, i) => {
            const year = currentYear - i;
            const isDisabled = usedYears.includes(year);
            return {
                value: year,
                label: year.toString(),
                isDisabled: isDisabled
            };
        });
    }, [data.client_id, clients, currentYear]);

    // Reset year if it becomes disabled when client changes
    useEffect(() => {
        const selectedClient = clients.find(c => c.id === data.client_id);
        const usedYears = (selectedClient?.used_years || []).map(y => Number(y)); // Convert to numbers
        
        if (usedYears.includes(data.year)) {
            // Find first available year
            const availableYear = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i)
                .find(year => !usedYears.includes(year));
            
            if (availableYear) {
                setData('year', availableYear);
            }
        }
    }, [data.client_id]);

    const addTeamMember = () => {
        setData('team_members', [
            ...data.team_members,
            { user_id: 0, role: 'member' }
        ]);
    };

    const updateTeamMember = (index: number, field: 'user_id' | 'role', value: number | string) => {
        const updated = [...data.team_members];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        setData('team_members', updated);
    };

    const removeTeamMember = (index: number) => {
        setData('team_members', data.team_members.filter((_, i) => i !== index));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.projects.bundles.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Create New Project
                    </h2>
                </div>
            }
        >
            <Head title="Create New Project" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">New Project</h3>
                                <p className="text-sm text-gray-600">
                                    Create a new project
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="e.g., Project Audit ABC Company"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Client <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        options={clients.map(client => ({
                                            value: client.id,
                                            label: client.name,
                                            subtitle: `${client.kementrian} - ${client.alamat}`,
                                        }))}
                                        value={data.client_id}
                                        onChange={(value) => setData('client_id', value as number)}
                                        placeholder="Select a client..."
                                    />
                                    {errors.client_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Year <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        options={yearOptions}
                                        value={data.year}
                                        onChange={(value) => setData('year', value as number)}
                                        placeholder="Select project year..."
                                    />
                                    {errors.year && (
                                        <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Team Members
                                    </label>
                                    
                                    <div className="space-y-3">
                                        {data.team_members.map((member, index) => (
                                            <div key={index} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Select User
                                                    </label>
                                                    <SearchableSelect
                                                        options={getFilteredUsers(member.role).map(user => ({
                                                            value: user.id,
                                                            label: user.name,
                                                            subtitle: `${user.email}${user.position ? ' - ' + user.position : ''}`,
                                                        }))}
                                                        value={member.user_id}
                                                        onChange={(value) => updateTeamMember(index, 'user_id', value as number)}
                                                        placeholder="Select a user..."
                                                    />
                                                </div>
                                                
                                                <div className="w-48">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                                        Role
                                                    </label>
                                                    <SearchableSelect
                                                        options={[
                                                            { value: 'member', label: 'Member' },
                                                            { value: 'team leader', label: 'Team Leader' },
                                                            { value: 'supervisor', label: 'Supervisor' },
                                                            { value: 'manager', label: 'Manager' },
                                                            { 
                                                                value: 'partner', 
                                                                label: member.user_id > 0 && isPartnerOptionDisabled(member.user_id) 
                                                                    ? 'Partner (Registered AP Only)' 
                                                                    : 'Partner',
                                                                isDisabled: isPartnerOptionDisabled(member.user_id)
                                                            },
                                                        ]}
                                                        value={member.role}
                                                        onChange={(value) => updateTeamMember(index, 'role', value as string)}
                                                        placeholder="Select role..."
                                                    />
                                                    {member.user_id > 0 && isPartnerOptionDisabled(member.user_id) && (
                                                        <p className="mt-1 text-xs text-orange-600">
                                                            ⚠️ This user is not a Registered AP
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTeamMember(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Remove member"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addTeamMember}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Team Member
                                        </button>
                                    </div>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Optional: Add team members with their roles in this project
                                    </p>
                                    {errors.team_members && (
                                        <p className="mt-1 text-sm text-red-600">{errors.team_members}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                                        Copy from Template (Optional)
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 0, label: '-- No Template --' },
                                            ...templates.map(template => ({
                                                value: template.id,
                                                label: template.name,
                                            }))
                                        ]}
                                        value={data.template_id}
                                        onChange={(value) => setData('template_id', value as number)}
                                        placeholder="Choose a template..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Optional: If selected, working steps will be copied from the template</p>
                                    {errors.template_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.template_id}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <Link
                                        href={route('admin.projects.bundles.index')}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Project'}
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
