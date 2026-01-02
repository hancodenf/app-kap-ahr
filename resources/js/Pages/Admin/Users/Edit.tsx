import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState, useCallback } from 'react';
import Select from 'react-select';
import Cropper from 'react-easy-crop';

interface Point {
    x: number;
    y: number;
}

interface Area {
    width: number;
    height: number;
    x: number;
    y: number;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    profile_photo?: string | null;
    position?: string | null;
    user_type?: string | null;
    client_id?: number | null;
    whatsapp?: string | null;
    role: Role | null;
}

interface Client {
    id: number;
    name: string;
}

interface EditUserPageProps extends PageProps {
    user: User;
    roles: Role[];
    positions: string[];
    userTypes: string[];
    clients: Client[];
}

export default function Edit({ user, roles, positions, userTypes, clients }: EditUserPageProps) {
    // Get URL parameters for back navigation
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] || '');
    const from_page = params.get('from_page') || '1';
    const search = params.get('search') || '';
    const role = params.get('role') || '';
    
    // Build back URL with preserved state
    const backUrl = `${route('admin.users.index')}?page=${from_page}&search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}`;
    
    // Parse existing WhatsApp number
    const parseWhatsApp = (whatsapp: string | null | undefined) => {
        if (!whatsapp) return { countryCode: '+62', number: '' };
        
        // Cari country code yang cocok
        const countryCodes = ['+62', '+60', '+65', '+1', '+44', '+61', '+81', '+82', '+86', '+91', '+66', '+84', '+63'];
        for (const code of countryCodes) {
            if (whatsapp.startsWith(code)) {
                return {
                    countryCode: code,
                    number: whatsapp.substring(code.length)
                };
            }
        }
        
        return { countryCode: '+62', number: whatsapp };
    };

    const parsedWA = parseWhatsApp(user.whatsapp);

    const { data, setData, post, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role_id: user.role?.id.toString() || '',
        position: user.position || '',
        user_type: user.user_type || '',
        client_id: user.client_id?.toString() || '',
        profile_photo: null as File | null,
        whatsapp: user.whatsapp || '',
        _method: 'PUT',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        user.profile_photo ? `/storage/${user.profile_photo}` : null
    );
    const [selectedCountryCode, setSelectedCountryCode] = useState(parsedWA.countryCode);
    const [whatsappInput, setWhatsappInput] = useState(parsedWA.number);

    // Crop Image States
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [rotation, setRotation] = useState(0);

    // Daftar kode negara populer
    const countryCodes = [
        { value: '+62', label: '+62 (Indonesia)', flag: '🇮🇩' },
        { value: '+60', label: '+60 (Malaysia)', flag: '🇲🇾' },
        { value: '+65', label: '+65 (Singapore)', flag: '🇸🇬' },
        { value: '+1', label: '+1 (USA/Canada)', flag: '🇺🇸' },
        { value: '+44', label: '+44 (UK)', flag: '🇬🇧' },
        { value: '+61', label: '+61 (Australia)', flag: '🇦🇺' },
        { value: '+81', label: '+81 (Japan)', flag: '🇯🇵' },
        { value: '+82', label: '+82 (South Korea)', flag: '🇰🇷' },
        { value: '+86', label: '+86 (China)', flag: '🇨🇳' },
        { value: '+91', label: '+91 (India)', flag: '🇮🇳' },
        { value: '+66', label: '+66 (Thailand)', flag: '🇹🇭' },
        { value: '+84', label: '+84 (Vietnam)', flag: '🇻🇳' },
        { value: '+63', label: '+63 (Philippines)', flag: '🇵🇭' },
    ];

    const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // Hanya terima angka
        value = value.replace(/\D/g, '');
        // Hapus angka 0 di depan jika ada
        value = value.replace(/^0+/, '');
        // Batasi maksimal 15 digit
        if (value.length > 15) {
            value = value.substring(0, 15);
        }
        setWhatsappInput(value);
        // Gabungkan dengan country code
        if (value) {
            setData('whatsapp', selectedCountryCode + value);
        } else {
            setData('whatsapp', '');
        }
    };

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });
    };

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        // Compress image to max 200KB
        const maxSizeKB = 200;
        const maxSizeBytes = maxSizeKB * 1024;
        let quality = 0.95;
        let blob: Blob | null = null;

        return new Promise((resolve, reject) => {
            const attemptCompress = () => {
                canvas.toBlob((currentBlob) => {
                    if (!currentBlob) {
                        reject(new Error('Failed to create blob'));
                        return;
                    }

                    // Check if size is acceptable or quality is too low
                    if (currentBlob.size <= maxSizeBytes || quality <= 0.1) {
                        resolve(currentBlob);
                    } else {
                        // Reduce quality and try again
                        quality -= 0.05;
                        attemptCompress();
                    }
                }, 'image/jpeg', quality);
            };

            attemptCompress();
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            // Show loading state
            const saveButton = document.getElementById('crop-save-button');
            if (saveButton) {
                saveButton.textContent = 'Mengkompress...';
                saveButton.setAttribute('disabled', 'true');
            }

            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            const croppedFile = new File([croppedImageBlob], 'profile.jpg', { type: 'image/jpeg' });
            
            // Show file size info
            const sizeKB = (croppedImageBlob.size / 1024).toFixed(2);
            console.log(`Compressed image size: ${sizeKB} KB`);
            
            setData('profile_photo', croppedFile);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(croppedFile);
            
            setShowCropModal(false);
            setImageSrc(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
        } catch (error) {
            console.error('Error cropping image:', error);
            alert('Gagal memproses gambar. Silakan coba lagi.');
        }
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    const generatePassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setData('password', password);
        setData('password_confirmation', password);
        setShowPassword(true);
    };

    const copyPassword = () => {
        navigator.clipboard.writeText(data.password);
        alert('Password copied to clipboard!');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit User: {user.name}
                    </h2>
                    <Link
                        href={backUrl}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <Head title={`Edit User: ${user.name}`} />

            <div className="py-6">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {/* Crop Modal */}
                    {showCropModal && imageSrc && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Crop Profile Photo</h3>
                                    <p className="text-sm text-gray-500 mt-1">Adjust photo position and size (1:1 Ratio)</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span>Foto akan otomatis dikompress maksimal 200KB saat disimpan</span>
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                                        <Cropper
                                            image={imageSrc}
                                            crop={crop}
                                            zoom={zoom}
                                            rotation={rotation}
                                            aspect={1}
                                            onCropChange={setCrop}
                                            onZoomChange={setZoom}
                                            onRotationChange={setRotation}
                                            onCropComplete={onCropComplete}
                                        />
                                    </div>
                                    
                                    <div className="mt-4 space-y-4">
                                        {/* Zoom Control */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Zoom: {zoom.toFixed(1)}x
                                            </label>
                                            <input
                                                type="range"
                                                min={1}
                                                max={3}
                                                step={0.1}
                                                value={zoom}
                                                onChange={(e) => setZoom(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>
                                        
                                        {/* Rotation Control */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rotasi: {rotation}°
                                            </label>
                                            <input
                                                type="range"
                                                min={0}
                                                max={360}
                                                step={1}
                                                value={rotation}
                                                onChange={(e) => setRotation(Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCropCancel}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        id="crop-save-button"
                                        type="button"
                                        onClick={handleCropSave}
                                        className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Simpan & Gunakan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Profile Photo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Foto Profil
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {photoPreview ? (
                                            <img 
                                                src={photoPreview} 
                                                alt="Preview" 
                                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl border-2 border-gray-300">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                id="profile_photo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="profile_photo"
                                                className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            >
                                                Change Photo
                                            </label>
                                            <p className="mt-2 text-xs text-gray-500">
                                                JPG, PNG, or GIF (MAX. 2MB)
                                            </p>
                                        </div>
                                    </div>
                                    {errors.profile_photo && (
                                        <p className="mt-2 text-sm text-red-600">{errors.profile_photo}</p>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter full name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                            errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter email"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* WhatsApp */}
                                <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                                        WhatsApp <span className="text-gray-500 font-normal">(Opsional)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedCountryCode}
                                            onChange={(e) => {
                                                setSelectedCountryCode(e.target.value);
                                                if (whatsappInput) {
                                                    setData('whatsapp', e.target.value + whatsappInput);
                                                }
                                            }}
                                            className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                        >
                                            {countryCodes.map((country) => (
                                                <option key={country.value} value={country.value}>
                                                    {country.flag} {country.value}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex-1 relative">
                                            <input
                                                id="whatsapp"
                                                type="text"
                                                value={whatsappInput}
                                                onChange={handleWhatsappChange}
                                                maxLength={15}
                                                className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                    errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="8123456789 (tanpa 0 di depan)"
                                            />
                                            {whatsappInput && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-gray-500">
                                            Contoh: Untuk nomor 0812-3456-789, masukkan <span className="font-semibold">8123456789</span>
                                        </p>
                                        {whatsappInput && (
                                            <p className={`text-xs ${whatsappInput.length >= 15 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {whatsappInput.length}/15
                                            </p>
                                        )}
                                    </div>
                                    {data.whatsapp && (
                                        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Format lengkap: {data.whatsapp}
                                        </p>
                                    )}
                                    {errors.whatsapp && (
                                        <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
                                    )}
                                </div>

                                {/* Role */}
                                <div>
                                    <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-2">
                                        Role
                                    </label>
                                    <select
                                        id="role_id"
                                        value={data.role_id}
                                        onChange={(e) => setData('role_id', e.target.value)}
                                        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                            errors.role_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">Pilih Role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.display_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.role_id}</p>
                                    )}
                                </div>

                                {/* Position - Only for Company role */}
                                {data.role_id === 'company' && (
                                    <div>
                                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                                            Posisi <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="position"
                                            value={data.position}
                                            onChange={(e) => setData('position', e.target.value)}
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                errors.position ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        >
                                            <option value="">Pilih Posisi</option>
                                            {positions.map((position) => (
                                                <option key={position} value={position}>
                                                    {position}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.position && (
                                            <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                                        )}
                                    </div>
                                )}

                                {/* User Type - Only for Company role */}
                                {data.role_id === 'company' && (
                                    <div>
                                        <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipe User <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="user_type"
                                            value={data.user_type}
                                            onChange={(e) => setData('user_type', e.target.value)}
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                errors.user_type ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        >
                                            <option value="">Pilih Tipe User</option>
                                            {userTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.user_type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.user_type}</p>
                                        )}
                                    </div>
                                )}

                                {/* Client - Only for Client role */}
                                {data.role_id === 'client' && (
                                    <div>
                                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            Client <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            id="client_id"
                                            options={clients.map(client => ({
                                                value: client.id.toString(),
                                                label: client.name
                                            }))}
                                            value={clients.find(client => client.id.toString() === data.client_id) ? {
                                                value: data.client_id,
                                                label: clients.find(client => client.id.toString() === data.client_id)!.name
                                            } : null}
                                            onChange={(option) => setData('client_id', option?.value || '')}
                                            placeholder="Pilih Client..."
                                            isClearable
                                            isSearchable
                                            noOptionsMessage={() => "Tidak ada data"}
                                            styles={{
                                                control: (base, state) => ({
                                                    ...base,
                                                    minHeight: '42px',
                                                    borderRadius: '0.375rem',
                                                    borderColor: errors.client_id ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
                                                    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                                                    '&:hover': {
                                                        borderColor: errors.client_id ? '#ef4444' : state.isFocused ? '#3b82f6' : '#9ca3af'
                                                    }
                                                }),
                                                valueContainer: (base) => ({
                                                    ...base,
                                                    padding: '2px 12px'
                                                }),
                                                input: (base) => ({
                                                    ...base,
                                                    margin: 0,
                                                    padding: 0
                                                }),
                                                indicatorSeparator: () => ({
                                                    display: 'none'
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 50,
                                                    borderRadius: '0.375rem',
                                                    marginTop: '4px'
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e0e7ff' : 'white',
                                                    color: state.isSelected ? 'white' : '#1f2937',
                                                    cursor: 'pointer',
                                                    '&:active': {
                                                        backgroundColor: '#3b82f6'
                                                    }
                                                })
                                            }}
                                        />
                                        {errors.client_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Akun ini akan terkait dengan client yang dipilih
                                        </p>
                                    </div>
                                )}

                                {/* Password */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password Baru
                                            <span className="text-xs text-gray-500 ml-1">(Kosongkan jika tidak ingin mengubah)</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                            Generate Password
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full border rounded-md px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Masukkan password baru (min. 8 karakter)"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                                            {data.password && (
                                                <button
                                                    type="button"
                                                    onClick={copyPassword}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="Copy password"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                {/* Password Confirmation */}
                                {data.password && (
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Konfirmasi Password Baru
                                        </label>
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                                errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Konfirmasi password baru"
                                        />
                                        {errors.password_confirmation && (
                                            <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href={backUrl}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        {processing ? 'Menyimpan...' : 'Update User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
