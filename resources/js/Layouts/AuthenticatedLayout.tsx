import ApplicationLogo from '@/Components/ApplicationLogo';
import Toast from '@/Components/Toast';
import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import axios from 'axios';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        // Load state from localStorage, default to false
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved === 'true';
        }
        return false;
    });
    
    // Security unlock state
    const [securityUnlocked, setSecurityUnlocked] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('security_unlocked') === 'true';
        }
        return false;
    });
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockKey, setUnlockKey] = useState('');
    const [unlockError, setUnlockError] = useState('');

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    // Keyboard shortcut Ctrl+K for unlock/lock toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k' && user.role === 'admin') {
                e.preventDefault();
                
                // If already unlocked, lock it with confirmation
                if (securityUnlocked) {
                    if (confirm('Lock security monitoring access? You will need to enter the key again to unlock.')) {
                        handleLock();
                    }
                } else {
                    // Show unlock modal
                    setShowUnlockModal(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [user.role, securityUnlocked]);

    // Handle lock
    const handleLock = () => {
        // Clear local state
        setSecurityUnlocked(false);
        localStorage.removeItem('security_unlocked');
        
        // Redirect to lock endpoint which will clear session and redirect back
        window.location.href = route('admin.security.lock');
    };

    // Handle unlock
    const handleUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUnlockError('');

        try {
            const response = await axios.post(route('admin.security.unlock'), {
                key: unlockKey
            });

            if (response.data.success) {
                setSecurityUnlocked(true);
                localStorage.setItem('security_unlocked', 'true');
                setShowUnlockModal(false);
                setUnlockKey('');
                router.reload();
            }
        } catch (error: any) {
            setUnlockError(error.response?.data?.message || 'Invalid key');
        }
    };

    const getDashboardRoute = () => {
        const role = user.role;
        switch (role) {
            case 'admin':
                return 'admin.dashboard';
            case 'company':
                return 'company.dashboard';
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            active: route().current(getDashboardRoute()) || route().current('dashboard'),
        },
        ...(user.role === 'admin' ? [
            {
                name: 'Projects',
                href: route('admin.projects.bundles.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
                active: route().current('admin.projects.*'),
            },
            {
                name: 'Project Templates',
                href: route('admin.project-templates.template-bundles.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                ),
                active: route().current('admin.project-templates.*'),
            },
            {
                name: 'Users',
                href: route('admin.users.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                ),
                active: route().current('admin.users.*'),
            },
            {
                name: 'Registered AP',
                href: route('admin.registered-aps.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
                active: route().current('admin.registered-aps.*'),
            },
            ...(securityUnlocked ? [{
                name: 'Login Security',
                href: route('admin.login-security.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                ),
                active: route().current('admin.login-security.*'),
            }] : []),
            {
                name: 'Clients',
                href: route('admin.clients.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
                active: route().current('admin.clients.*'),
            }
        ] : []),
        ...(user.role === 'company' ? [
            {
                name: 'My Projects',
                href: route('company.projects.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                ),
                active: route().current('company.projects.*'),
            },
            {
                name: 'My Clients',
                href: route('company.clients.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                ),
                active: route().current('company.clients.*'),
            },
        ] : []),
        ...(user.role === 'client' || user.role === 'klien' ? [
            {
                name: 'My Projects',
                href: route('klien.projects.index'),
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                ),
                active: route().current('klien.projects.*'),
            },
        ] : []),
    ];

    return (
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
            {/* Toast Notifications */}
            <Toast />

            {/* Top Navbar - Fixed for all screen sizes */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-4">
                {/* Mobile menu button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo and App Name */}
                <Link href="/" className="flex items-center space-x-3 ml-2 lg:ml-0">
                    <ApplicationLogo className="h-8 w-8" />
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-primary-600">AURA</span>
                        <span className="text-xs text-gray-500">Audit, Reporting & Analyze</span>
                    </div>
                </Link>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* User info on desktop */}
                <div className="hidden lg:flex items-center space-x-3 relative">
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</div>
                    </div>
                    <button 
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center focus:outline-none"
                    >
                        {user.profile_photo ? (
                            <img 
                                src={`/storage/${user.profile_photo}`} 
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-primary-300 hover:border-primary-400 transition-colors"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors border-2 border-primary-300 hover:border-primary-400">
                                <span className="text-base font-medium text-primary-600">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </button>

                    {/* Dropdown menu */}
                    {userMenuOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setUserMenuOpen(false)}
                            ></div>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setUserMenuOpen(false)}
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
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" style={{ top: '64px' }}>
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Main container below navbar */}
            <div className="flex flex-1 pt-16 overflow-hidden">
                {/* Sidebar */}
                <div className={`fixed left-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 ${sidebarCollapsed ? 'w-16' : 'w-64'
                    } bg-white border-r border-gray-200`}
                    style={{ top: '64px', bottom: 0 }}
                >
                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">{menuItems.map((item, index) => (
                        <div 
                            key={item.name} 
                            className="relative group"
                            onMouseEnter={(e) => {
                                if (sidebarCollapsed) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const tooltip = e.currentTarget.querySelector('.tooltip-content') as HTMLElement;
                                    if (tooltip) {
                                        tooltip.style.position = 'fixed';
                                        tooltip.style.left = `${rect.right + 12}px`;
                                        tooltip.style.top = `${rect.top + rect.height / 2}px`;
                                        tooltip.style.transform = 'translateY(-50%)';
                                    }
                                }
                            }}
                        >
                            <Link
                                href={item.href}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.active
                                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <span className={`${sidebarCollapsed ? '' : 'mr-3'}`}>
                                    {item.icon}
                                </span>
                                {!sidebarCollapsed && <span>{item.name}</span>}
                            </Link>

                            {/* Tooltip when sidebar is collapsed */}
                            {sidebarCollapsed && (
                                <div className="tooltip-content fixed px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl pointer-events-none">
                                    {item.name}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User menu at bottom of sidebar */}
                <div className="border-t border-gray-200 p-4">
                    {!sidebarCollapsed ? (
                        <div className="space-y-1">
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
                    ) : (
                        <div className="space-y-1">
                            <div className="relative group">
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center justify-center px-1 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </Link>
                                <div className="absolute left-full ml-3 bottom-0 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl">
                                    Profile
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"></div>
                                </div>
                            </div>
                            <div className="relative group">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center justify-center w-full px-1 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </Link>
                                <div className="absolute left-full ml-3 bottom-0 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[9999] shadow-xl">
                                    Logout
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
                {/* Page header */}
                {header && (
                    <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                        <div className="px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-3">
                            {/* Toggle button - Next to page title */}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div className="flex-1 min-w-0">
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto bg-gray-100">
                    {children}
                </main>
            </div>

            {/* Security Unlock Modal */}
            {showUnlockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Security Access</h3>
                            <button
                                onClick={() => {
                                    setShowUnlockModal(false);
                                    setUnlockKey('');
                                    setUnlockError('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleUnlock}>
                            <div className="mb-4">
                                <label htmlFor="unlockKey" className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter Security Key
                                </label>
                                <input
                                    id="unlockKey"
                                    type="password"
                                    value={unlockKey}
                                    onChange={(e) => setUnlockKey(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter key..."
                                    autoFocus
                                />
                                {unlockError && (
                                    <p className="mt-2 text-sm text-red-600">{unlockError}</p>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUnlockModal(false);
                                        setUnlockKey('');
                                        setUnlockError('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Unlock
                                </button>
                            </div>
                        </form>
                        
                        <p className="mt-4 text-xs text-gray-500 text-center">
                            Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">K</kbd> to open this dialog
                        </p>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}
