import { useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';

export default function GlobalUploadProgress() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [progress, setProgress] = useState(0);

    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const removeProgress = router.on('progress', (event) => {
            if (event.detail?.progress?.percentage) {
                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                setIsVisible(true);
                setProgress(Math.round(event.detail.progress.percentage));
            }
        });

        const removeStart = router.on('start', (event) => {
            const { visit } = event.detail;
            
            let isFileUpload = visit.forceFormData || visit.data instanceof FormData;
            
            if (!isFileUpload && typeof visit.data === 'object' && visit.data !== null) {
                 Object.values(visit.data).forEach(val => {
                     if (val instanceof File || (Array.isArray(val) && val[0] instanceof File)) {
                         isFileUpload = true;
                     }
                 });
            }

            if (isFileUpload) {
                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                setIsVisible(true);
                setProgress(0);
                setIsMinimized(false);
            }
        });

        const removeFinish = router.on('finish', () => {
            setProgress(100);
            
            hideTimeoutRef.current = setTimeout(() => {
                setIsVisible(false);
                setProgress(0);
                setIsMinimized(false);
            }, 2500);
        });

        return () => {
            removeProgress();
            removeStart();
            removeFinish();
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, []);

    if (!isVisible) return null;

    if (isMinimized) {
        return (
            <div 
                className="fixed bottom-6 right-6 z-[9999] bg-white rounded-full shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-200 p-2 pr-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 hover:scale-105 transition-all animate-[bounce_1s_ease-in-out_infinite]"
                style={{ animation: 'none' }}
                onClick={() => setIsMinimized(false)}
            >
                <div className="relative w-8 h-8 flex flex-shrink-0 items-center justify-center bg-indigo-50 rounded-full">
                    {progress < 100 ? (
                        <div className="absolute inset-0 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin"></div>
                    ) : (
                        <div className="absolute inset-0 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {progress < 100 && (
                        <span className="text-[9px] font-bold text-indigo-700 absolute tracking-tighter">
                            {progress}%
                        </span>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 leading-none">
                         {progress < 100 ? 'Mengunggah...' : 'Selesai!'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 min-w-[320px] overflow-hidden transform transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {progress < 100 ? (
                        <svg className="w-5 h-5 text-indigo-200 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    <h3 className="font-semibold text-white text-sm tracking-wide">
                        {progress < 100 ? 'Unggah File' : 'Berhasil Diunggah'}
                    </h3>
                </div>
                {progress < 100 && (
                    <button 
                        onClick={() => setIsMinimized(true)}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-md transition-colors"
                        title="Minimize"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        {progress < 100 ? 'Sedang mengirim data...' : 'Menunggu respon server...'}
                    </span>
                    <span className="text-xl font-bold text-indigo-700">{progress}%</span>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-3 mb-1 overflow-hidden shadow-inner border border-slate-200">
                    <div 
                        className={`h-full opacity-90 rounded-full transition-all duration-[400ms] ease-out flex justify-end items-center px-[2px] ${progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`} 
                        style={{ width: `${progress}%` }}
                    >
                        {progress > 5 && progress < 100 && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></div>
                        )}
                    </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                    {progress < 100 
                        ? 'Mohon tidak menutup jendela selama proses.' 
                        : 'Sistem sedang memuat ulang halaman...'}
                </p>
            </div>
        </div>
    );
}
