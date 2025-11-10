import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

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

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            position: user.position || '',
            user_type: user.user_type || '',
            profile_photo: null as File | null,
            _method: 'PATCH',
        });

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        user.profile_photo ? `/storage/${user.profile_photo}` : null
    );

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('profile.update'));
    };

    return (
        <section className={className}>
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

                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />

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

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Position - Only for Company role */}
                {user.role?.name === 'company' && (
                    <div>
                        <InputLabel htmlFor="position" value="Posisi" />

                        <TextInput
                            id="position"
                            className="mt-1 block w-full"
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                            placeholder="Masukkan posisi"
                        />

                        <InputError className="mt-2" message={errors.position} />
                    </div>
                )}

                {/* User Type - Only for Company role */}
                {user.role?.name === 'company' && (
                    <div>
                        <InputLabel htmlFor="user_type" value="Tipe User" />

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

                        <InputError className="mt-2" message={errors.user_type} />
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
