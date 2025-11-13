import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useEffect, useState } from 'react';

export default function Welcome({
    auth,
}: PageProps) {
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState<'admin' | 'company' | 'client'>('admin');
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-animate]').forEach((el) => {
            observer.observe(el);
        });

        window.addEventListener('scroll', handleScroll);
        
        // Auto-rotate testimonials
        const testimonialInterval = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % 3);
        }, 5000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            clearInterval(testimonialInterval);
        };
    }, []);

    const features = {
        admin: [
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 3.03V5.25M6.75 15.75l-2.197 2.197M17.25 15.75l2.197 2.197" />,
                title: 'User & Role Management',
                description: 'Manage admins, partners, staff, and clients with a powerful role-based access control system'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
                title: 'Client & Project Management',
                description: 'Complete system to manage clients, audit projects, and documents in a structured way'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                title: 'Template Management',
                description: 'Create and manage audit templates with a flexible level & sub-level system'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                title: 'Analytics Dashboard',
                description: 'Real-time monitoring of all activities, user statistics, projects, and tasks'
            }
        ],
        company: [
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
                title: 'Manage Audit Projects',
                description: 'Full access to manage all audit projects handled by the company'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                title: 'Assign Audit Team',
                description: 'Assign auditor teams for each project with clear roles'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
                title: 'Track Real-time Progress',
                description: 'Monitor progress of each task in the audit workflow: Engagement, Planning, Execution, Reporting'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
                title: 'Upload Documents',
                description: 'Organized document storage system for all audit files'
            }
        ],
        client: [
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
                title: 'View Audit Progress',
                description: 'Monitor the progress of your company\'s audit project in real-time'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 3.03V5.25" />,
                title: 'Auditor Team Info',
                description: 'View the auditor team handling your project, complete with WhatsApp contacts'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                title: 'Task & Document Details',
                description: 'Access detailed information about each task and documents related to the audit'
            },
            {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                title: 'Project Timeline',
                description: 'Monitor the timeline and deadlines of each audit stage clearly'
            }
        ]
    };

    const testimonials = [
        {
            name: 'Budi Santoso',
            position: 'Finance Director',
            company: 'PT Maju Jaya',
            text: 'AURA has transformed the way we collaborate with auditors. Full transparency and real-time updates make the audit process much more efficient.',
            rating: 5
        },
        {
            name: 'Siti Nurhaliza',
            position: 'CEO',
            company: 'CV Berkah Sejahtera',
            text: 'Very helpful system! We can track audit progress anytime and communication with the audit team is much easier.',
            rating: 5
        },
        {
            name: 'Ahmad Wijaya',
            position: 'Managing Partner',
            company: 'KAP Internal Team',
            text: 'AURA makes our audit team\'s work more structured. Flexible templates and clear role system are very helpful.',
            rating: 5
        }
    ];

    return (
        <>
            <Head title="AURA - Professional Audit Management System" />
            <div className="bg-white min-h-screen overflow-hidden">
                {/* Floating Header */}
                <header 
                    className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
                    style={{
                        backgroundColor: scrollY > 50 ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
                        backdropFilter: scrollY > 50 ? 'blur(20px) saturate(180%)' : 'none',
                        boxShadow: scrollY > 50 ? '0 10px 30px -10px rgba(0, 0, 0, 0.1)' : 'none',
                        borderBottom: scrollY > 50 ? '1px solid rgba(22, 163, 74, 0.1)' : 'none'
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <Link href="/" className="flex items-center space-x-3 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full group-hover:bg-primary-500/30 transition-all duration-300"></div>
                                    <ApplicationLogo className="h-12 w-12 relative transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 bg-clip-text text-transparent">
                                        AURA
                                    </h1>
                                    <p className="text-xs text-gray-600 font-medium">Audit Management System</p>
                                </div>
                            </Link>
                            
                            <nav className="hidden md:flex items-center space-x-8">
                                <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Features</a>
                                <a href="#workflow" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Workflow</a>
                                <a href="#testimonials" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Testimonials</a>
                                <a href="#contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Contact</a>
                            </nav>

                            <div className="flex items-center space-x-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="group relative bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-600 hover:from-primary-700 hover:via-primary-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 transform hover:scale-105"
                                    >
                                        <span className="relative z-10 flex items-center">
                                            Dashboard
                                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="group relative bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-600 hover:from-primary-700 hover:via-primary-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 transform hover:scale-105"
                                    >
                                        <span className="relative z-10">Login</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section - Powerful & Visual */}
                <main className="relative pt-20">
                    {/* Animated Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-400/20 to-primary-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-primary-300/20 to-emerald-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                        {/* Hero Content */}
                        <div 
                            className="text-center mb-16"
                            id="hero"
                            data-animate
                            style={{
                                opacity: isVisible['hero'] ? 1 : 0,
                                transform: isVisible['hero'] ? 'translateY(0)' : 'translateY(40px)',
                                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-200 rounded-full px-4 py-2 mb-8">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                                </span>
                                <span className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                                    Trusted by 500+ Clients
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
                                Professional Audit
                                <br />
                                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 bg-clip-text text-transparent">
                                    Management System
                                </span>
                            </h1>
                            
                            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                                End-to-end digital platform for <span className="font-bold text-primary-600">KAP Abdul Hamid dan Rekan</span>. 
                                Manage audits from planning to reporting efficiently, transparently, and systematically.
                            </p>
                            
                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="group relative bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-600 hover:from-primary-700 hover:via-primary-600 hover:to-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl shadow-primary-500/40 hover:shadow-3xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105 flex items-center"
                                    >
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Open Dashboard
                                        <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="group relative bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-600 hover:from-primary-700 hover:via-primary-600 hover:to-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl shadow-primary-500/40 hover:shadow-3xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105 flex items-center"
                                        >
                                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Start Free Now
                                            <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                        <a
                                            href="#features"
                                            className="group border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center"
                                        >
                                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                            </svg>
                                            View Full Features
                                            <svg className="w-5 h-5 ml-3 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </a>
                                    </>
                                )}
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">No Credit Card Required</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Setup in 5 Minutes</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">24/7 Support</span>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Preview */}
                        <div 
                            className="relative"
                            id="dashboard-preview"
                            data-animate
                            style={{
                                opacity: isVisible['dashboard-preview'] ? 1 : 0,
                                transform: isVisible['dashboard-preview'] ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.95)',
                                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                            }}
                        >
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent rounded-3xl blur-3xl transform scale-105"></div>
                            
                            {/* Screenshot Container */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white/50 backdrop-blur-sm">
                                <img 
                                    src="/images/dashboard-admin.png" 
                                    alt="AURA Dashboard Preview" 
                                    className="w-full h-auto transform hover:scale-105 transition-transform duration-700"
                                />
                                
                                {/* Floating Feature Tags */}
                                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center space-x-2 animate-bounce">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">Real-time Updates</span>
                                </div>
                                
                                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                                    <span className="text-sm font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                                        36 Active Users
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features by Role - Interactive Tabs */}
                    <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                        <div 
                            className="text-center mb-16"
                            id="features-header"
                            data-animate
                            style={{
                                opacity: isVisible['features-header'] ? 1 : 0,
                                transform: isVisible['features-header'] ? 'translateY(0)' : 'translateY(30px)',
                                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <div className="inline-block bg-primary-50 border border-primary-200 rounded-full px-5 py-2 mb-6">
                                <span className="text-sm font-bold text-primary-600">COMPLETE FEATURES</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                Solutions for <span className="bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">All Roles</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                System designed specifically for Admin, Company Staff, and Client needs with powerful features
                            </p>
                        </div>

                        {/* Role Tabs */}
                        <div className="flex justify-center mb-12">
                            <div className="inline-flex bg-gray-100 rounded-full p-2 shadow-inner">
                                {(['admin', 'company', 'client'] as const).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setActiveTab(role)}
                                        className={`px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
                                            activeTab === role
                                                ? 'bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-lg'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {role === 'admin' && '👨‍💼 Admin'}
                                        {role === 'company' && '🏢 Company'}
                                        {role === 'client' && '👤 Client'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div 
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            id="features-grid"
                            data-animate
                            style={{
                                opacity: isVisible['features-grid'] ? 1 : 0,
                                transform: isVisible['features-grid'] ? 'translateY(0)' : 'translateY(30px)',
                                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {features[activeTab].map((feature, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                >
                                    {/* Icon */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {feature.icon}
                                        </svg>
                                    </div>
                                    
                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {/* Hover Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Workflow Section */}
                    <div id="workflow" className="bg-gradient-to-br from-gray-50 to-white py-32">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div 
                                className="text-center mb-16"
                                id="workflow-header"
                                data-animate
                                style={{
                                    opacity: isVisible['workflow-header'] ? 1 : 0,
                                    transform: isVisible['workflow-header'] ? 'translateY(0)' : 'translateY(30px)',
                                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div className="inline-block bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-6">
                                    <span className="text-sm font-bold text-emerald-600">AUDIT WORKFLOW</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                    4 <span className="bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">Structured</span> Audit Stages
                                </h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    Workflow system following professional audit standards: Engagement → Planning → Execution → Reporting
                                </p>
                            </div>

                            {/* Workflow Image */}
                            <div 
                                className="relative"
                                id="workflow-image"
                                data-animate
                                style={{
                                    opacity: isVisible['workflow-image'] ? 1 : 0,
                                    transform: isVisible['workflow-image'] ? 'scale(1)' : 'scale(0.9)',
                                    transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                                }}
                            >
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                                    <img 
                                        src="/images/project-proccess.png" 
                                        alt="AURA Workflow Process" 
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>

                            {/* Workflow Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                                {[
                                    { number: '1', label: 'Engagement', desc: 'KAP Assignment & Contract' },
                                    { number: '2', label: 'Planning', desc: 'Risk Assessment & Planning' },
                                    { number: '3', label: 'Execution', desc: 'Field Work & Testing' },
                                    { number: '4', label: 'Reporting', desc: 'Audit Report & Delivery' }
                                ].map((step, index) => (
                                    <div 
                                        key={index}
                                        className="text-center group cursor-pointer"
                                        id={`workflow-step-${index}`}
                                        data-animate
                                        style={{
                                            opacity: isVisible[`workflow-step-${index}`] ? 1 : 0,
                                            transform: isVisible[`workflow-step-${index}`] ? 'translateY(0)' : 'translateY(20px)',
                                            transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1 + 0.4}s`
                                        }}
                                    >
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                            {step.number}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                            {step.label}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {step.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Testimonials Section */}
                    <div id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                        <div className="text-center mb-16"
                            id="testimonials-header"
                            data-animate
                            style={{
                                opacity: isVisible['testimonials-header'] ? 1 : 0,
                                transform: isVisible['testimonials-header'] ? 'translateY(0)' : 'translateY(30px)',
                                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <div className="inline-block bg-amber-50 border border-amber-200 rounded-full px-5 py-2 mb-6">
                                <span className="text-sm font-bold text-amber-600">TESTIMONIALS</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                                Trusted by <span className="bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">500+ Clients</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                See what they say about their experience using AURA
                            </p>
                        </div>

                        {/* Testimonial Carousel */}
                        <div className="relative max-w-4xl mx-auto">
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 shadow-2xl border border-gray-200">
                                {testimonials.map((testimonial, index) => (
                                    <div
                                        key={index}
                                        className={`transition-all duration-500 ${
                                            currentTestimonial === index ? 'opacity-100 block' : 'opacity-0 hidden'
                                        }`}
                                    >
                                        <div className="flex mb-6">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-2xl text-gray-800 mb-8 leading-relaxed italic">
                                            "{testimonial.text}"
                                        </p>
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                                                {testimonial.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                                <p className="text-gray-600">{testimonial.position}</p>
                                                <p className="text-sm text-primary-600">{testimonial.company}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Dots */}
                            <div className="flex justify-center mt-8 space-x-3">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentTestimonial(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                            currentTestimonial === index
                                                ? 'bg-gradient-to-r from-primary-600 to-emerald-600 w-8'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-600 py-24">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Ready to Optimize Your Audit Process?
                            </h2>
                            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                                Join 500+ clients who have trusted AURA to manage their audits
                            </p>
                            {!auth.user && (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Start Now - Free!
                                </Link>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer id="contact" className="relative bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-white overflow-hidden">
                    {/* Pattern Background */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                            {/* Brand Column */}
                            <div className="md:col-span-2">
                                <Link href="/" className="flex items-center space-x-3 mb-6 group">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary-500/30 blur-xl rounded-full group-hover:bg-primary-500/50 transition-all duration-300"></div>
                                        <ApplicationLogo className="h-12 w-12 relative" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
                                            AURA
                                        </h3>
                                        <p className="text-sm text-gray-400">Audit Management System</p>
                                    </div>
                                </Link>
                                <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                                    Professional digital audit platform that integrates expertise with modern technology for more efficient and accurate audit services.
                                </p>
                                <div className="flex space-x-4">
                                    {[
                                        { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                                        { icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
                                        { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                                        { icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' }
                                    ].map((social, index) => (
                                        <a 
                                            key={index}
                                            href="#" 
                                            className="w-11 h-11 bg-white/5 hover:bg-gradient-to-br hover:from-primary-600 hover:to-emerald-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                                        >
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                                <path d={social.icon}/>
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Contact Column */}
                            <div>
                                <h4 className="font-bold text-lg mb-6 text-white">Contact</h4>
                                <div className="space-y-4">
                                    <a href="mailto:abdulhamidkap@gmail.com" className="flex items-start space-x-3 text-gray-400 hover:text-primary-400 transition-colors group">
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm">abdulhamidkap@gmail.com</span>
                                    </a>
                                    <a href="tel:+622174417874" className="flex items-start space-x-3 text-gray-400 hover:text-primary-400 transition-colors group">
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="text-sm">(021) 7417874</span>
                                    </a>
                                    <div className="flex items-start space-x-3 text-gray-400">
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm leading-relaxed">
                                            Jl. Ir. H. Juanda No. 50, Ciputat Tim., Kota Tangerang Selatan, Banten 15419
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Quick Links */}
                            <div>
                                <h4 className="font-bold text-lg mb-6 text-white">Quick Links</h4>
                                <ul className="space-y-3">
                                    {[
                                        { label: 'About Us', href: '#about' },
                                        { label: 'Features', href: '#features' },
                                        { label: 'Workflow', href: '#workflow' },
                                        { label: 'Testimonials', href: '#testimonials' },
                                        { label: 'Contact', href: '#contact' }
                                    ].map((link, index) => (
                                        <li key={index}>
                                            <a href={link.href} className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors group text-sm">
                                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                <span>{link.label}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        {/* Bottom Bar */}
                        <div className="border-t border-gray-700/50 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
                                <p className="text-gray-400">
                                    &copy; 2025 <span className="font-semibold text-gray-300">Kantor Akuntan Publik Abdul Hamid dan Rekan</span>. All rights reserved.
                                </p>
                                <div className="flex items-center space-x-6">
                                    <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Privacy Policy</a>
                                    <span className="text-gray-600">•</span>
                                    <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Terms of Service</a>
                                    <span className="text-gray-600">•</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-400">Made with</span>
                                        <svg className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-400">in Indonesia</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}