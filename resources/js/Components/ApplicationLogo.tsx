import { ImgHTMLAttributes } from 'react';

interface ApplicationLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
    className?: string;
}

export default function ApplicationLogo({ className = '', ...props }: ApplicationLogoProps) {
    return (
        <img
            {...props}
            src="/logo1x1.png"
            alt="AURA - Audit, Reporting and Analyze"
            className={`block h-auto w-12 ${className}`}
        />
    );
}
