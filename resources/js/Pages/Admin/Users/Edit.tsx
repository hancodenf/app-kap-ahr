import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';
import Select from 'react-select';

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
        _method: 'PUT',
    });

    const [showPassword, setShowPassword] = useState(false);
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
                        href={route('admin.users.index')}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title={`Edit User: ${user.name}`} />

            <div className="py-6">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
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
                                        placeholder="Masukkan nama lengkap"
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
                                        placeholder="Masukkan email"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
                                        href={route('admin.users.index')}
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
