import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useCallback } from 'react';
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

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user as any;
    const isAdmin = user.role?.name === 'admin';

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

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            position: user.position || '',
            user_type: user.user_type || '',
            profile_photo: null as File | null,
            whatsapp: user.whatsapp || '',
            _method: 'PATCH',
        });

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
    const [isCompressing, setIsCompressing] = useState(false);

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

        // Compression logic - max 200KB
        return new Promise((resolve) => {
            const maxSizeKB = 200;
            const maxSizeBytes = maxSizeKB * 1024;
            let quality = 0.95;

            const attemptCompress = () => {
                canvas.toBlob((currentBlob) => {
                    if (!currentBlob) return;

                    console.log(`Compression attempt - Quality: ${(quality * 100).toFixed(0)}%, Size: ${(currentBlob.size / 1024).toFixed(2)} KB`);

                    if (currentBlob.size <= maxSizeBytes || quality <= 0.1) {
                        console.log(`Final compressed size: ${(currentBlob.size / 1024).toFixed(2)} KB`);
                        resolve(currentBlob);
                    } else {
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
            setIsCompressing(true);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            const croppedFile = new File([croppedImageBlob], 'profile.jpg', { type: 'image/jpeg' });
            
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
        } finally {
            setIsCompressing(false);
        }
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setImageSrc(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'));
    };

    return (
        <section className={className}>
            {/* Crop Modal */}
            {showCropModal && imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Crop Foto Profil</h3>
                            <p className="text-sm text-gray-500 mt-1">Sesuaikan posisi dan ukuran foto Anda (Rasio 1:1)</p>
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
                        
                        <div className="p-4 border-t border-gray-200">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            Foto akan otomatis dikompres hingga maksimal 200 KB untuk menghemat ruang penyimpanan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCropCancel}
                                    disabled={isCompressing}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCropSave}
                                    disabled={isCompressing}
                                    className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCompressing ? 'Mengkompress...' : 'Simpan & Gunakan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Informasi Profil
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Perbarui informasi profil dan alamat email akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
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
                                Ubah Foto
                            </label>
                            <p className="mt-2 text-xs text-gray-500">
                                JPG, PNG, atau GIF (MAX. 2MB)
                            </p>
                        </div>
                    </div>
                    {errors.profile_photo && (
                        <p className="mt-2 text-sm text-red-600">{errors.profile_photo}</p>
                    )}
                </div>

                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />

                    {isAdmin ? (
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                            placeholder="Masukkan nama lengkap"
                        />
                    ) : (
                        <div className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-gray-700">
                            {data.name}
                        </div>
                    )}

                    <InputError className="mt-2" message={errors.name} />
                    {!isAdmin && (
                        <p className="mt-1 text-xs text-gray-500">
                            Hubungi admin untuk mengubah nama
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    {isAdmin ? (
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Masukkan email"
                        />
                    ) : (
                        <div className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-gray-700">
                            {data.email}
                        </div>
                    )}

                    <InputError className="mt-2" message={errors.email} />
                    {!isAdmin && (
                        <p className="mt-1 text-xs text-gray-500">
                            Hubungi admin untuk mengubah email
                        </p>
                    )}
                </div>

                {/* WhatsApp */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        WhatsApp {!isAdmin && <span className="text-gray-400 text-xs">(Tidak dapat diubah)</span>}
                    </label>
                    {isAdmin ? (
                        <>
                            <div className="flex gap-2 mt-1">
                                <select 
                                    value={selectedCountryCode}
                                    onChange={(e) => {
                                        setSelectedCountryCode(e.target.value);
                                        if (whatsappInput) {
                                            setData('whatsapp', e.target.value + whatsappInput);
                                        }
                                    }}
                                    className="block border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm"
                                    style={{ width: '140px' }}
                                >
                                    {countryCodes.map((country) => (
                                        <option key={country.value} value={country.value}>
                                            {country.flag} {country.value}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={whatsappInput}
                                        onChange={handleWhatsappChange}
                                        maxLength={15}
                                        className="block w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-md shadow-sm pr-10"
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
                                    Contoh: Untuk nomor 0812-3456-789, masukkan 8123456789
                                </p>
                                {whatsappInput && (
                                    <p className={`text-xs ${whatsappInput.length >= 15 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                        {whatsappInput.length}/15
                                    </p>
                                )}
                            </div>
                            {data.whatsapp && (
                                <p className="mt-1 text-xs text-green-600 font-medium">
                                    Format lengkap: {data.whatsapp}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-gray-700 flex items-center gap-2">
                            {data.whatsapp ? (
                                <>
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    <span>{data.whatsapp}</span>
                                </>
                            ) : (
                                <span className="text-gray-400">Belum diisi</span>
                            )}
                        </div>
                    )}
                    {errors.whatsapp && (
                        <p className="mt-2 text-sm text-red-600">{errors.whatsapp}</p>
                    )}
                    {!isAdmin && (
                        <p className="mt-1 text-xs text-gray-500">
                            Hubungi admin untuk mengubah nomor WhatsApp
                        </p>
                    )}
                </div>

                {/* Position - Only for Company role */}
                {user.role?.name === 'company' && (
                    <div>
                        <InputLabel htmlFor="position" value="Posisi" />

                        {isAdmin ? (
                            <TextInput
                                id="position"
                                className="mt-1 block w-full"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                placeholder="Masukkan posisi"
                            />
                        ) : (
                            <div className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-gray-700">
                                {data.position || '-'}
                            </div>
                        )}

                        <InputError className="mt-2" message={errors.position} />
                        {!isAdmin && (
                            <p className="mt-1 text-xs text-gray-500">
                                Hubungi admin untuk mengubah posisi
                            </p>
                        )}
                    </div>
                )}

                {/* User Type - Only for Company role */}
                {user.role?.name === 'company' && (
                    <div>
                        <InputLabel htmlFor="user_type" value="Tipe User" />

                        {isAdmin ? (
                            <select
                                id="user_type"
                                value={data.user_type}
                                onChange={(e) => setData('user_type', e.target.value)}
                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Pilih Tipe User</option>
                                <option value="Tenaga Ahli">Tenaga Ahli</option>
                                <option value="Staff">Staff</option>
                            </select>
                        ) : (
                            <div className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-gray-700">
                                {data.user_type || '-'}
                            </div>
                        )}

                        <InputError className="mt-2" message={errors.user_type} />
                        {!isAdmin && (
                            <p className="mt-1 text-xs text-gray-500">
                                Hubungi admin untuk mengubah tipe user
                            </p>
                        )}
                    </div>
                )}

                {/* Client Name - Read only for Client role */}
                {user.role?.name === 'client' && user.client_name && (
                    <div>
                        <InputLabel htmlFor="client_name" value="Client" />

                        <div className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-gray-700">
                            {user.client_name}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Informasi client tidak dapat diubah
                        </p>
                    </div>
                )} 

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Alamat email Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ml-1"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Link verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 font-medium">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
