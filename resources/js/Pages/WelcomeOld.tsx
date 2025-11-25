import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useEffect, useState } from 'react';

export default function Welcome({
    auth,
}: PageProps) {
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});

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

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const stats = [
        { label: 'Projects Tracked', value: '€900+', color: 'from-orange-500 to-red-500' },
        { label: 'Clients worldwide', value: '35+', description: 'With active cross-border clients', color: 'from-amber-500 to-yellow-500' },
        { label: 'Efficiency Gain', value: '0°', description: 'Using green recycled energy (GW)', color: 'from-emerald-500 to-teal-500' }
    ];

    return (
        <>
            <Head title="AURA - Professional Audit Management System" />
            <div className="bg-gray-50 min-h-screen">
                {/* Header */}
                <header 
                    className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                    style={{
                        backgroundColor: scrollY > 50 ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
                        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
                        boxShadow: scrollY > 50 ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <Link href="/" className="flex items-center space-x-3">
                                <ApplicationLogo className="h-10 w-10" />
                                <span className={`text-xl font-bold transition-colors ${scrollY > 50 ? 'text-gray-900' : 'text-white'}`}>
                                    Heloscope
                                </span>
                            </Link>
                            
                            <nav className="hidden md:flex items-center space-x-8">
                                <a href="#solutions" className={`text-sm font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'}`}>Solutions</a>
                                <a href="#company" className={`text-sm font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'}`}>Company</a>
                                <a href="#resources" className={`text-sm font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'}`}>Resources</a>
                            </nav>

                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className={`text-sm font-medium transition-colors ${scrollY > 50 ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'}`}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                                        >
                                            Request a demo
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main>
                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '40px 40px'
                            }}></div>
                        </div>

                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Left Content */}
                                <div 
                                    id="hero-content"
                                    data-animate
                                    style={{
                                        opacity: isVisible['hero-content'] ? 1 : 0,
                                        transform: isVisible['hero-content'] ? 'translateX(0)' : 'translateX(-40px)',
                                        transition: 'all 1s ease'
                                    }}
                                >
                                    <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                        Embracing
                                        <br />
                                        <span className="italic">Evolution</span>
                                    </h1>
                                    
                                    <p className="text-lg text-gray-300 mb-4">
                                        From signal to structure —
                                    </p>
                                    
                                    <p className="text-base text-gray-400 mb-10">
                                        Can shareholders unravel the complexity of your supply chain for reduced risk and improved uptime? The blue dots is right cross the river.
                                    </p>

                                    <p className="text-sm text-gray-500 mb-8">
                                        ROX Pro Network detects 100k level-4 — no matter where it is
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                                            <div className="text-3xl font-bold text-white mb-1">314</div>
                                            <div className="text-xs text-gray-400">Suppliers in</div>
                                            <div className="text-xs text-gray-400">view</div>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                                            <div className="text-3xl font-bold text-white mb-1">94</div>
                                            <div className="text-xs text-gray-400">Total Alerts</div>
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                                            <div className="text-3xl font-bold text-white mb-1">3.8m</div>
                                            <div className="text-xs text-gray-400">Sub-tier</div>
                                            <div className="text-xs text-gray-400">entities tracked</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Image/Chart */}
                                <div 
                                    id="hero-visual"
                                    data-animate
                                    className="relative"
                                    style={{
                                        opacity: isVisible['hero-visual'] ? 1 : 0,
                                        transform: isVisible['hero-visual'] ? 'translateX(0)' : 'translateX(40px)',
                                        transition: 'all 1s ease 0.2s'
                                    }}
                                >
                                    <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                                        <img 
                                            src="/images/dashboard-admin.png" 
                                            alt="Dashboard Preview" 
                                            className="w-full h-auto"
                                        />
                                    </div>
                                    
                                    {/* Floating Card - Top Right */}
                                    <div className="absolute -top-6 -right-6 bg-orange-500 text-white rounded-xl shadow-xl p-6 w-64">
                                        <img 
                                            src="/AHR-horizontal.jpg" 
                                            alt="Preview" 
                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                        />
                                        <div className="text-xs font-medium mb-1">Supply partners</div>
                                        <div className="text-2xl font-bold mb-1">Enroll every</div>
                                        <div className="text-sm opacity-90">Sustainable business is the best...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trusted By Section */}
                        <div className="relative border-t border-white/10 py-12">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    <p className="text-sm text-gray-400 mb-8">Trusted by teams turning complexity into clarity.</p>
                                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
                                        <div className="text-white font-bold text-xl">Kaspersky</div>
                                        <div className="text-white font-bold text-xl">Renned</div>
                                        <div className="text-white font-bold text-xl">sword</div>
                                        <div className="text-white font-bold text-xl">SACTWELL</div>
                                        <div className="text-white font-bold text-xl">Venovex</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Supply Planning Section */}
                    <div className="bg-gray-50 py-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-5xl font-bold text-gray-900 mb-6">Supply Planning</h2>
                                <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
                                    PO-level truth without supplier portals
                                </p>
                                <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
                                    Detect risk at the PO or part level in real time—across traffic, blue nodes 6000 marks—at the blue plan to light into the river. PO delay line time
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {/* Feature 1 */}
                                <div 
                                    className="group"
                                    id="feature-1"
                                    data-animate
                                    style={{
                                        opacity: isVisible['feature-1'] ? 1 : 0,
                                        transform: isVisible['feature-1'] ? 'translateY(0)' : 'translateY(40px)',
                                        transition: 'all 0.8s ease'
                                    }}
                                >
                                    <div className="bg-gray-900 rounded-2xl overflow-hidden mb-4">
                                        <img 
                                            src="/images/fetures/company/manage-audit-projects.png" 
                                            alt="Supply partners" 
                                            className="w-full h-56 object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Supply partners</h3>
                                    <p className="text-gray-600">
                                        <span className="font-bold text-gray-900">~$0 PO confirmations —</span><br />
                                        all via email
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        A capture team from partners emails centrally and transmit to the collaboration workspace.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div 
                                    className="group"
                                    id="feature-2"
                                    data-animate
                                    style={{
                                        opacity: isVisible['feature-2'] ? 1 : 0,
                                        transform: isVisible['feature-2'] ? 'translateY(0)' : 'translateY(40px)',
                                        transition: 'all 0.8s ease 0.1s'
                                    }}
                                >
                                    <div className="bg-gray-100 rounded-2xl p-8 mb-4 h-56 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="inline-block bg-gray-900 text-white rounded-full px-4 py-2 text-sm font-medium mb-4">
                                                In shipment
                                            </div>
                                            <div className="text-5xl font-bold text-gray-900 mb-2">30-50%</div>
                                            <div className="text-gray-600">faster expedite</div>
                                            <div className="text-gray-600">turn teams, on POs/parts</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Spot late suppliers and reroute big shipments around slow parts to minimize impact on revenue and cash
                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div 
                                    className="group"
                                    id="feature-3"
                                    data-animate
                                    style={{
                                        opacity: isVisible['feature-3'] ? 1 : 0,
                                        transform: isVisible['feature-3'] ? 'translateY(0)' : 'translateY(40px)',
                                        transition: 'all 0.8s ease 0.2s'
                                    }}
                                >
                                    <div className="bg-amber-50 rounded-2xl p-8 mb-4 h-56">
                                        <div className="space-y-3">
                                            {[
                                                { label: 'BOM', items: ['Item name here', 'Item name 2 here'] },
                                                { label: 'Assembly', items: ['Item'] },
                                                { label: 'Product', items: ['Item'] }
                                            ].map((section, idx) => (
                                                <div key={idx}>
                                                    <div className="text-xs font-medium text-gray-600 mb-1">{section.label}</div>
                                                    {section.items.map((item, i) => (
                                                        <div key={i} className="bg-white rounded px-3 py-1.5 text-sm mb-1 flex items-center justify-between">
                                                            <span>{item}</span>
                                                            <span className="text-orange-500 text-xs">⚠</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        PO results before they escalate
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        Scale the plan and not just schedule BOM-level parts requirements, from the last plan to the final product
                                    </p>
                                </div>

                                {/* Feature 4 */}
                                <div 
                                    className="group"
                                    id="feature-4"
                                    data-animate
                                    style={{
                                        opacity: isVisible['feature-4'] ? 1 : 0,
                                        transform: isVisible['feature-4'] ? 'translateY(0)' : 'translateY(40px)',
                                        transition: 'all 0.8s ease 0.3s'
                                    }}
                                >
                                    <div className="bg-gray-100 rounded-2xl p-8 mb-4 h-56">
                                        <div className="mb-4">
                                            <img 
                                                src="/images/fetures/company/upload-documents.png" 
                                                alt="Products" 
                                                className="w-full h-32 object-contain"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-gray-600">
                                        Do the work you actually do – faster
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Upload materials from multi-tier suppliers, then automate manual production level queries that cost days per week
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inbound Transport Section */}
                    <div className="bg-white py-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                                    Inbound transport,
                                    <br />
                                    that runs itself
                                </h2>
                                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                    Heloscope routing loads-one tier of thousands and to set up agents for automatic dock level coordination. All loads can be 100% hands-free while building flexibility in individual manual controls.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Transport Feature 1 */}
                                <div 
                                    className="bg-gray-900 text-white rounded-2xl overflow-hidden"
                                    id="transport-1"
                                    data-animate
                                    style={{
                                        opacity: isVisible['transport-1'] ? 1 : 0,
                                        transform: isVisible['transport-1'] ? 'scale(1)' : 'scale(0.95)',
                                        transition: 'all 0.8s ease'
                                    }}
                                >
                                    <div className="p-12">
                                        <div className="inline-block bg-emerald-500 text-white rounded-full px-4 py-2 text-sm font-medium mb-6">
                                            Tender every load
                                        </div>
                                        <h3 className="text-4xl font-bold mb-6">
                                            Auto-capture forewarder emails
                                        </h3>
                                        <p className="text-gray-300 text-lg">
                                            Get email from forwarders to capture delays and automatically resolve discrepancies - all centrally audited in a paper trail.
                                        </p>
                                    </div>
                                    <div className="bg-gray-800 p-8">
                                        <img 
                                            src="/images/fetures/company/track-real-time-progress.png" 
                                            alt="Email Capture" 
                                            className="w-full rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Transport Features Grid */}
                                <div className="space-y-8">
                                    <div 
                                        className="bg-red-50 rounded-2xl p-8"
                                        id="transport-2"
                                        data-animate
                                        style={{
                                            opacity: isVisible['transport-2'] ? 1 : 0,
                                            transform: isVisible['transport-2'] ? 'translateX(0)' : 'translateX(40px)',
                                            transition: 'all 0.8s ease 0.1s'
                                        }}
                                    >
                                        <h4 className="text-2xl font-bold text-gray-900 mb-4">
                                            Hold transit disruptions
                                            <br />
                                            before they miss/ed
                                        </h4>
                                        <p className="text-gray-600">
                                            Raise a high-priority alert about any high-value load in trouble.
                                        </p>
                                    </div>

                                    <div 
                                        className="bg-amber-50 rounded-2xl p-8"
                                        id="transport-3"
                                        data-animate
                                        style={{
                                            opacity: isVisible['transport-3'] ? 1 : 0,
                                            transform: isVisible['transport-3'] ? 'translateX(0)' : 'translateX(40px)',
                                            transition: 'all 0.8s ease 0.2s'
                                        }}
                                    >
                                        <h4 className="text-2xl font-bold text-gray-900 mb-4">
                                            Forecast daily dock load
                                        </h4>
                                        <p className="text-gray-600 mb-6">
                                            See loads a week out for any dock to even capacity with casual labor.
                                        </p>
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-600">Arriving soon</span>
                                                <span className="text-2xl font-bold text-gray-900">10</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[1, 2, 3].map((day) => (
                                                    <div key={day} className="text-center">
                                                        <div className="text-xs text-gray-500 mb-1">T + {day}</div>
                                                        <div className="text-lg font-bold text-gray-900">{day}</div>
                                                    </div>
                                                ))}
                                                <div className="bg-orange-500 text-white rounded px-2 py-1 text-center">
                                                    <div className="text-xs mb-1">Clearing Vendor Orders</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROI Section */}
                    <div className="relative py-32 overflow-hidden">
                        {/* Background Image */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: 'url(/AHR-horizontal.jpg)' }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-gray-900/95"></div>
                        
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <p className="text-sm text-gray-400 mb-4">Key impact</p>
                                <h2 className="text-5xl font-bold text-white mb-6">
                                    AI that's proven in
                                    <br />
                                    real world at scale
                                </h2>
                                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                                    Heloscope designed to make team scale with AI, built for the reality big teams, small teams, and growth between billion-dollar customers.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {stats.map((stat, index) => (
                                    <div 
                                        key={index}
                                        className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12"
                                        id={`stat-${index}`}
                                        data-animate
                                        style={{
                                            opacity: isVisible[`stat-${index}`] ? 1 : 0,
                                            transform: isVisible[`stat-${index}`] ? 'translateY(0)' : 'translateY(40px)',
                                            transition: `all 0.8s ease ${index * 0.1}s`
                                        }}
                                    >
                                        <div className={`text-7xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-4`}>
                                            {stat.value}
                                        </div>
                                        <div className="text-xl font-semibold text-white mb-2">{stat.label}</div>
                                        {stat.description && (
                                            <div className="text-sm text-gray-400">{stat.description}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Three Solutions Section */}
                    <div className="bg-gray-50 py-24">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <div className="mb-16">
                                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                                    Three solutions.
                                    <br />
                                    One way forward.
                                </h2>
                                <p className="text-lg text-gray-600">
                                    As a Helo Pro plan app, you are connected to a custom-built platform which unites purchasing teams to work together with one source of info on supply risk, operating with our AI management.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl shadow-xl p-16">
                                <div className="text-6xl font-bold text-gray-900 mb-8">EPOCH</div>
                                <p className="text-lg text-gray-600 mb-8">
                                    + No setup; begins of integration-switchward
                                </p>
                                {!auth.user && (
                                    <Link
                                        href={route('login')}
                                        className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        Get Started
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gray-900 py-20">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-4xl font-bold text-white mb-8">
                                Ready to transform your operations?
                            </h2>
                            {!auth.user && (
                                <Link
                                    href={route('login')}
                                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Request a Demo
                                </Link>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-12 mb-12">
                            <div>
                                <div className="flex items-center space-x-3 mb-6">
                                    <ApplicationLogo className="h-10 w-10" />
                                    <span className="text-xl font-bold">AURA</span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Professional audit management system for KAP Abdul Hamid dan Rekan.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="font-bold mb-4">Product</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="font-bold mb-4">Company</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="font-bold mb-4">Contact</h4>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li>abdulhamidkap@gmail.com</li>
                                    <li>(021) 7417874</li>
                                    <li>Jakarta, Indonesia</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                            <p>&copy; 2025 KAP Abdul Hamid dan Rekan. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
