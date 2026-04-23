import { Headset } from 'lucide-react';

export default function HelpdeskFloatingButton() {
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                // TODO: Buka modal chat / redirect ke CS
            }}
            className="fixed bottom-6 right-6 z-[8000] bg-indigo-600 text-white p-4 rounded-full shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300 group flex items-center justify-center focus:outline-none"
            aria-label="Bantuan & Dukungan"
            title="Hubungi Helpdesk"
        >
            <Headset className="w-6 h-6 group-hover:animate-pulse" />
        </button>
    );
}
