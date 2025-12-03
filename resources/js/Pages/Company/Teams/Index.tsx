import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    profile_photo?: string | null;
    position?: string | null;
    whatsapp?: string | null;
    is_active: boolean;
    role: {
        id: number;
        name: string;
        display_name: string;
    } | null;
    created_at: string;
    project_teams_count?: number;
}

interface TeamsPageProps extends PageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        position?: string;
    };
    positionCounts: {
        [key: string]: number;
    };
}

export default function Index({ users, filters, positionCounts }: TeamsPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activePosition, setActivePosition] = useState(filters.position || 'all');

    const positions = [
        { value: 'all', label: 'All Positions' },
        { value: 'Founder - Partner', label: 'Founder - Partner' },
        { value: 'Managing Partner', label: 'Managing Partner' },
        { value: 'Partner', label: 'Partner' },
        { value: 'Associates Manager', label: 'Associates Manager' },
        { value: 'Tenaga Ahli - Supervisor', label: 'Tenaga Ahli - Supervisor' },
        { value: 'Senior Auditor', label: 'Senior Auditor' },
        { value: 'Junior Auditor', label: 'Junior Auditor' },
        { value: 'Internship Auditor', label: 'Internship Auditor' },
        { value: 'Internship Finance', label: 'Internship Finance' },
        { value: 'Support', label: 'Support' },
        { value: 'Internship HR', label: 'Internship HR' },
    ];

    const handleSearch = () => {
        router.get(route('company.teams.index'), { search, position: activePosition !== 'all' ? activePosition : undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setActivePosition('all');
        router.get(route('company.teams.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePositionChange = (position: string) => {
        setActivePosition(position);
        router.get(route('company.teams.index'), { position: position !== 'all' ? position : undefined, search }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Teams
                </h2>
            }
        >
            <Head title="Teams" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Search and Filter Section */}
                    <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row gap-4 mb-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search by name or email..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Position Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {positions.map((position) => {
                                const count = position.value === 'all' 
                                    ? Object.values(positionCounts).reduce((a, b) => a + b, 0)
                                    : positionCounts[position.value] || 0;
                                
                                return (
                                    <button
                                        key={position.value}
                                        onClick={() => handlePositionChange(position.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            activePosition === position.value
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {position.label} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mb-4 text-sm text-gray-600">
                        Showing {users.data.length} of {users.total} team members
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Position
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Projects
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {user.profile_photo ? (
                                                            <img
                                                                src={`/storage/${user.profile_photo}`}
                                                                alt={user.name}
                                                                className="w-10 h-10 rounded-full object-cover mr-3"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                                                <span className="text-primary-600 font-medium">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                        {user.position || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.whatsapp ? (
                                                        <a 
                                                            href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-sm text-green-600 hover:text-green-700"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                            </svg>
                                                            {user.whatsapp}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {user.project_teams_count || 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(user.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route('company.teams.show', user.id)}
                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                <p className="text-lg font-medium">No team members found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {users.links[0].url && (
                                            <Link
                                                href={users.links[0].url}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {users.links[users.links.length - 1].url && (
                                            <Link
                                                href={users.links[users.links.length - 1].url}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing page <span className="font-medium">{users.current_page}</span> of{' '}
                                                <span className="font-medium">{users.last_page}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                {users.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        preserveState
                                                        preserveScroll
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            link.active
                                                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''} ${
                                                            index === 0 ? 'rounded-l-md' : ''
                                                        } ${index === users.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
