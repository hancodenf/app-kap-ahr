import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, FormEventHandler, useEffect, useRef } from 'react';

interface FailedLoginAttempt {
    id: number;
    email: string;
    user_id: number | null;
    user_name: string;
    ip_address: string;
    location: string;
    attempt_number: number;
    resulted_in_suspension: boolean;
    attempted_at: string;
    attempted_at_human: string;
}

interface Stats {
    total_attempts: number;
    last_24h: number;
    resulted_in_suspension: number;
    unique_ips: number;
    suspended_users: number;
    hourly_data?: Array<{ hour: string; count: number }>;
    top_ips?: Array<{ ip: string; count: number; location: string }>;
}

interface LoginSecurityPageProps extends PageProps {
    attempts: {
        data: FailedLoginAttempt[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: Stats;
    filters: {
        search: string;
        filter: string;
        start_date: string;
        end_date: string;
        page: number;
    };
}

export default function Index({ attempts, stats, filters }: LoginSecurityPageProps) {
    const [search, setSearch] = useState(filters.search);
    const [filter, setFilter] = useState(filters.filter);
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [currentPage, setCurrentPage] = useState(filters.page || 1);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto refresh every 10 seconds for real-time monitoring
    useEffect(() => {
        if (!autoRefresh) {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
            return;
        }

        refreshIntervalRef.current = setInterval(() => {
            router.reload({ only: ['attempts', 'stats'] });
        }, 10000); // 10 seconds for real-time

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [autoRefresh]);

    const handleSearch: FormEventHandler = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        router.get(route('admin.login-security.index'), { 
            search, 
            filter,
            start_date: startDate,
            end_date: endDate,
            page: 1
        }, { 
            preserveState: true,
            replace: true
        });
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1);
        router.get(route('admin.login-security.index'), { 
            search, 
            filter: newFilter,
            start_date: startDate,
            end_date: endDate,
            page: 1
        }, { 
            preserveState: true,
            replace: true
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        router.get(route('admin.login-security.index'), { 
            search, 
            filter,
            start_date: startDate,
            end_date: endDate,
            page
        }, { 
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setSearch('');
        setFilter('all');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
        router.get(route('admin.login-security.index'), {}, { 
            preserveState: true,
            replace: true
        });
    };

    // Calculate max value for chart scaling
    const maxCount = Math.max(...(stats.hourly_data?.map(d => d.count) || [0]), 1);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            🔒 Login Security Monitoring
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Real-time monitoring of failed login attempts</p>
                    </div>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            autoRefresh 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></span>
                        {autoRefresh ? 'Live (10s)' : 'Paused'}
                    </button>
                </div>
            }
        >
            <Head title="Login Security" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-blue-800 mb-1">Total Attempts</div>
                                    <div className="text-3xl font-bold text-blue-900">{stats.total_attempts.toLocaleString()}</div>
                                </div>
                                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-md border border-yellow-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-yellow-800 mb-1">Last 24 Hours</div>
                                    <div className="text-3xl font-bold text-yellow-900">{stats.last_24h.toLocaleString()}</div>
                                </div>
                                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-md border border-red-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-red-800 mb-1">Suspensions</div>
                                    <div className="text-3xl font-bold text-red-900">{stats.resulted_in_suspension.toLocaleString()}</div>
                                </div>
                                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-purple-800 mb-1">Unique IPs</div>
                                    <div className="text-3xl font-bold text-purple-900">{stats.unique_ips.toLocaleString()}</div>
                                </div>
                                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-md border border-indigo-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-indigo-800 mb-1">Suspended Users</div>
                                    <div className="text-3xl font-bold text-indigo-900">{stats.suspended_users.toLocaleString()}</div>
                                </div>
                                <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Hourly Trend Chart */}
                        {stats.hourly_data && stats.hourly_data.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">📊 24-Hour Activity Trend</h3>
                                        <p className="text-xs text-gray-500 mt-1">Real-time login attempt monitoring</p>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between h-56 gap-1 px-2">
                                    {stats.hourly_data.map((data, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center group">
                                            <div className="w-full flex flex-col justify-end" style={{ height: '180px' }}>
                                                <div
                                                    className={`w-full ${
                                                        data.count > 5 ? 'bg-red-500 hover:bg-red-600' :
                                                        data.count > 2 ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                        'bg-green-500 hover:bg-green-600'
                                                    } transition-all duration-300 rounded-t-lg relative shadow-sm`}
                                                    style={{ 
                                                        height: `${maxCount > 0 ? (data.count / maxCount) * 100 : 0}%`, 
                                                        minHeight: data.count > 0 ? '8px' : '0' 
                                                    }}
                                                >
                                                    {data.count > 0 && (
                                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                                                            <div className="font-bold">{data.count} attempts</div>
                                                            <div className="text-gray-300">{data.hour}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-2 font-medium">{data.hour.split(':')[0]}h</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                                        <span className="text-gray-600">Low (1-2)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                        <span className="text-gray-600">Medium (3-5)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                                        <span className="text-gray-600">High (6+)</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top IPs */}
                        {stats.top_ips && stats.top_ips.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">🎯 Most Active IP Addresses</h3>
                                    <p className="text-xs text-gray-500 mt-1">Top suspicious sources</p>
                                </div>
                                <div className="space-y-3">
                                    {stats.top_ips.map((ipData, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                                                    index === 0 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' :
                                                    index === 1 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' :
                                                    index === 2 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                                                    'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                                                }`}>
                                                    {index === 0 ? '👑' : `#${index + 1}`}
                                                </div>
                                                <div>
                                                    <div className="font-mono text-sm font-bold text-gray-900">{ipData.ip}</div>
                                                    <div className="text-xs text-gray-600 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {ipData.location || 'Unknown Location'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">{ipData.count}</div>
                                                <div className="text-xs text-gray-500 font-medium">attempts</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Filters */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
                        </div>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Email, IP address, or location..."
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter Type
                                    </label>
                                    <select
                                        value={filter}
                                        onChange={(e) => handleFilterChange(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="all">All Attempts</option>
                                        <option value="recent">Last 24 Hours</option>
                                        <option value="suspended">Resulted in Suspension</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date Range
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today = new Date().toISOString().split('T')[0];
                                                setStartDate(today);
                                                setEndDate(today);
                                            }}
                                            className="px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            title="Today"
                                        >
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const end = new Date();
                                                const start = new Date();
                                                start.setDate(start.getDate() - 7);
                                                setStartDate(start.toISOString().split('T')[0]);
                                                setEndDate(end.toISOString().split('T')[0]);
                                            }}
                                            className="px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            title="Last 7 days"
                                        >
                                            7D
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const end = new Date();
                                                const start = new Date();
                                                start.setMonth(start.getMonth() - 1);
                                                setStartDate(start.toISOString().split('T')[0]);
                                                setEndDate(end.toISOString().split('T')[0]);
                                            }}
                                            className="px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            title="Last 30 days"
                                        >
                                            30D
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Enhanced Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {attempts.data.length > 0 ? (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
                                            <tr>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">No</th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">IP Address</th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                                                <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Attempt</th>
                                                <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                                                <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {attempts.data.map((attempt, index) => {
                                                const rowNumber = (attempts.current_page - 1) * attempts.per_page + index + 1;
                                                return (
                                                    <tr key={attempt.id} className="hover:bg-blue-50 transition-colors">
                                                        <td className="px-4 py-4">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
                                                                {rowNumber}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <span className="text-sm font-medium text-gray-900">{attempt.email}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-700 font-medium">{attempt.user_name}</td>
                                                        <td className="px-4 py-4">
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md font-mono text-xs font-medium text-gray-800">
                                                                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                                </svg>
                                                                {attempt.ip_address}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {attempt.location}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                                                                attempt.attempt_number >= 3 ? 'bg-red-100 text-red-800 ring-2 ring-red-200' :
                                                                attempt.attempt_number === 2 ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200' :
                                                                'bg-green-100 text-green-800 ring-2 ring-green-200'
                                                            }`}>
                                                                #{attempt.attempt_number}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            {attempt.resulted_in_suspension ? (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 ring-2 ring-red-200">
                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Suspended
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 ring-2 ring-green-200">
                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                    Active
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-600" title={attempt.attempted_at}>
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {attempt.attempted_at_human}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <Link
                                                                href={route('admin.login-security.show', attempt.id)}
                                                                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-900 text-sm font-semibold hover:underline"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden divide-y divide-gray-100">
                                    {attempts.data.map((attempt, index) => {
                                        const rowNumber = (attempts.current_page - 1) * attempts.per_page + index + 1;
                                        return (
                                            <div key={attempt.id} className="p-4 hover:bg-blue-50 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                                                            {rowNumber}
                                                        </span>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{attempt.email}</div>
                                                            <div className="text-xs text-gray-500">{attempt.user_name}</div>
                                                        </div>
                                                    </div>
                                                    {attempt.resulted_in_suspension ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Suspended
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                                                            attempt.attempt_number >= 3 ? 'bg-red-100 text-red-800' :
                                                            attempt.attempt_number === 2 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            #{attempt.attempt_number}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                        </svg>
                                                        <span className="font-mono">{attempt.ip_address}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        </svg>
                                                        {attempt.location}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {attempt.attempted_at_human}
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <Link
                                                        href={route('admin.login-security.show', attempt.id)}
                                                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-900 text-sm font-semibold"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Details
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Enhanced Pagination */}
                                {attempts.last_page > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div className="text-sm text-gray-700 font-medium">
                                                Showing <span className="font-bold text-primary-600">{attempts.from || 0}</span> to <span className="font-bold text-primary-600">{attempts.to || 0}</span> of <span className="font-bold text-primary-600">{attempts.total.toLocaleString()}</span> entries
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Previous Button */}
                                                <button
                                                    onClick={() => attempts.current_page > 1 && handlePageChange(attempts.current_page - 1)}
                                                    disabled={attempts.current_page === 1}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        attempts.current_page === 1
                                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-300'
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>

                                                {/* Page Numbers */}
                                                {Array.from({ length: Math.min(attempts.last_page, 5) }, (_, i) => {
                                                    let pageNum;
                                                    if (attempts.last_page <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (attempts.current_page <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (attempts.current_page >= attempts.last_page - 2) {
                                                        pageNum = attempts.last_page - 4 + i;
                                                    } else {
                                                        pageNum = attempts.current_page - 2 + i;
                                                    }
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                                                                pageNum === attempts.current_page
                                                                    ? 'bg-primary-600 text-white shadow-lg scale-110'
                                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-300'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}

                                                {/* Next Button */}
                                                <button
                                                    onClick={() => attempts.current_page < attempts.last_page && handlePageChange(attempts.current_page + 1)}
                                                    disabled={attempts.current_page === attempts.last_page}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        attempts.current_page === attempts.last_page
                                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-primary-50 hover:border-primary-300'
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No failed login attempts</h3>
                                <p className="mt-1 text-sm text-gray-500">Great! No suspicious activity detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
