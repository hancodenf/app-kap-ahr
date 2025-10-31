import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export default function Toast() {
    const { flash } = usePage().props as { flash?: FlashMessages };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 3000,
                position: 'top-right',
            });
        }
        if (flash?.error) {
            toast.error(flash.error, {
                duration: 3000,
                position: 'top-right',
            });
        }
        if (flash?.warning) {
            toast(flash.warning, {
                duration: 3000,
                position: 'top-right',
                icon: '⚠️',
            });
        }
        if (flash?.info) {
            toast(flash.info, {
                duration: 3000,
                position: 'top-right',
                icon: 'ℹ️',
            });
        }
    }, [flash]);

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                // Default options
                duration: 3000,
                style: {
                    background: '#fff',
                    color: '#333',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                },
                // Success
                success: {
                    duration: 3000,
                    style: {
                        background: '#10b981',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#10b981',
                    },
                },
                // Error
                error: {
                    duration: 3000,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                    },
                    iconTheme: {
                        primary: '#fff',
                        secondary: '#ef4444',
                    },
                },
            }}
        />
    );
}
