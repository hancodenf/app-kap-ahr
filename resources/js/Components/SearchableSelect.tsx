import { useState, useRef, useEffect } from 'react';

interface Option {
    value: string | number;
    label: string;
    subtitle?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number | (string | number)[];
    onChange: (value: string | number | (string | number)[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    multiple?: boolean;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select an option...',
    disabled = false,
    className = '',
    multiple = false,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Get selected option(s)
    const valueArray = Array.isArray(value) ? value : [value];
    const selectedOptions = options.filter(opt => valueArray.includes(opt.value));

    // Filter options based on search
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string | number) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            if (currentValues.includes(optionValue)) {
                onChange(currentValues.filter(v => v !== optionValue));
            } else {
                onChange([...currentValues, optionValue]);
            }
        } else {
            onChange(optionValue);
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    const handleRemove = (optionValue: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (Array.isArray(value)) {
            onChange(value.filter(v => v !== optionValue));
        }
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Select Button */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full min-h-[42px] flex items-center justify-between px-3 py-2
                    border border-gray-300 rounded-md shadow-sm
                    bg-white text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
                    transition-colors
                `}
            >
                {multiple && selectedOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-1 flex-1">
                        {selectedOptions.map(option => (
                            <span
                                key={option.value}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                            >
                                {option.label}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemove(option.value, e)}
                                        className="ml-1 hover:text-primary-900"
                                    >
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className={selectedOptions.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedOptions.length > 0 ? selectedOptions[0].label : placeholder}
                    </span>
                )}
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-[9999] mt-1 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = valueArray.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`
                                            w-full text-left px-3 py-2 text-sm
                                            hover:bg-primary-50 transition-colors
                                            ${isSelected ? 'bg-primary-100 text-primary-900' : 'text-gray-900'}
                                        `}
                                    >
                                        <div className="flex items-center">
                                            {multiple && (
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium">{option.label}</div>
                                                {option.subtitle && (
                                                    <div className="text-xs text-gray-500 mt-0.5">{option.subtitle}</div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
