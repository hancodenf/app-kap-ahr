import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0 overflow-hidden">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/AHR-horizontal.jpg)' }}
            ></div>
            {/* Overlay Gradient untuk readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/65 to-emerald-900/70"></div>
            
            {/* Content */}
            <div className="relative z-10">
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-white drop-shadow-2xl" />
                </Link>
            </div>

            <div className="relative z-10 mt-6 w-full overflow-hidden bg-white/95 backdrop-blur-sm px-6 py-4 shadow-2xl sm:max-w-6xl sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
