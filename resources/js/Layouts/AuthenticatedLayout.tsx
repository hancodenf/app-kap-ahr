import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const getDashboardRoute = () => {
        const role = user.role;
        switch (role) {
            case 'admin':
                return 'admin.dashboard';
            case 'partner':
                return 'partner.dashboard';
            case 'staff':
                return 'staff.dashboard';
            case 'klien':
            case 'client':
                return 'klien.dashboard';
            default:
                return 'dashboard';
        }
    };

    const menuItems = [
        {
            name: 'Dashboard',
            href: route(getDashboardRoute()),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
                </svg>
            ),
            active: route().current(getDashboardRoute()) || route().current('dashboard'),
        },
        ...(user.role === 'admin' ? [
            {
                name: 'Project',
                href: route('admin.project.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                active: route().current('admin.projects.*'),
            },
            {
                name: 'Project Template',
                href: route('admin.project-templates.template-bundles.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
                active: route().current('admin.project-templates.*'),
            },
            {
                name: 'User Management',
                href: route('admin.users.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                ),
                active: route().current('admin.users.*'),
            },
            {
                name: 'Client Management',
                href: route('admin.clients.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
                active: route().current('admin.clients.*'),
            }
        ] : []),
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 ${
                sidebarCollapsed ? 'w-16' : 'w-64'
            } bg-white shadow-lg`}>
                {/* Sidebar Header */}
                <div className={`flex items-center px-4 py-4 border-b border-gray-200 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!sidebarCollapsed && (
                        <Link href="/" className="flex items-center space-x-3">
                            <ApplicationLogo className="h-8 w-8" />
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-primary-600">AURA</span>
                                <span className="text-xs text-gray-500">Audit, Reporting & Analyze</span>
                            </div>
                        </Link>
                    )}
                    {sidebarCollapsed && (
                        <ApplicationLogo className="h-8 w-8" />
                    )}
                    
                    {/* Toggle button for desktop */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:block p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M13 7l5 5-5 5M6 12h12" : "M11 17l-5-5 5-5M18 12H6"} />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                item.active
                                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.name : undefined}
                        >
                            <span className={`${sidebarCollapsed ? '' : 'mr-3'}`}>
                                {item.icon}
                            </span>
                            {!sidebarCollapsed && <span>{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User section - Fixed at bottom */}
                <div className="border-t border-gray-200 p-4 mt-auto">
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary-600">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            {!sidebarCollapsed && (
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {!sidebarCollapsed && (
                        <div className="mt-3 space-y-1">
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profile
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex items-center space-x-3">
                            <ApplicationLogo className="h-8 w-8" />
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-primary-600">AURA</span>
                                <span className="text-xs text-gray-500">Audit, Reporting & Analyze</span>
                            </div>
                        </div>
                        <div className="w-10"></div> {/* Spacer for centering */}
                    </div>
                </header>

                {/* Page header */}
                {header && (
                    <header className="bg-white shadow-sm border-b border-gray-200">
                        <div className="px-4 py-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
