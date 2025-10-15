import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { PageProps } from '@/types';

interface Level {
    id: number;
    name: string;
    slug: string;
}

interface SubLevel {
    id: number;
    name: string;
    slug: string;
    level_id: number;
    level: Level;
}

interface Document {
    id: number;
    name: string;
    slug: string;
}

interface Template {
    id: number;
    sub_level_id: number;
    document_id?: number;
    document_name?: string;
    file?: string;
    time?: string;
    comment?: string;
    acc_partner: string;
    acc_partner_id?: number;
    acc_partner_time?: string;
    for: string;
    acc_klien: string;
    acc_klien_id?: number;
    acc_klien_time?: string;
    sub_level: SubLevel;
    document?: Document;
}

interface Props extends PageProps {
    template: Template;
}

export default function Edit({ auth, template }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        document_name: template.document_name || '',
        file: template.file || '',
        time: template.time ? template.time.split('T')[0] : '',
        comment: template.comment || '',
        acc_partner: template.acc_partner,
        for: template.for,
        acc_klien: template.acc_klien,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('templates.update', template.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit Template
                    </h2>
                    <Link
                        href={route('templates.index')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title="Edit Template" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-primary-600 mb-2">
                                    Edit Template: {template.sub_level.level.name} - {template.sub_level.name}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Update informasi template untuk sub level ini.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h4 className="font-medium text-gray-700 mb-2">Informasi Sub Level</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Level:</span> {template.sub_level.level.name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Sub Level:</span> {template.sub_level.name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Document Asli:</span> {template.document?.name || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="document_name" value="Nama Document" />
                                    <TextInput
                                        id="document_name"
                                        type="text"
                                        name="document_name"
                                        value={data.document_name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('document_name', e.target.value)}
                                    />
                                    <InputError message={errors.document_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="file" value="File Path" />
                                    <TextInput
                                        id="file"
                                        type="text"
                                        name="file"
                                        value={data.file}
                                        className="mt-1 block w-full"
                                        placeholder="Masukkan path file (opsional)"
                                        onChange={(e) => setData('file', e.target.value)}
                                    />
                                    <InputError message={errors.file} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="time" value="Waktu" />
                                    <TextInput
                                        id="time"
                                        type="date"
                                        name="time"
                                        value={data.time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('time', e.target.value)}
                                    />
                                    <InputError message={errors.time} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="comment" value="Komentar" />
                                    <textarea
                                        id="comment"
                                        name="comment"
                                        value={data.comment}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        rows={4}
                                        placeholder="Masukkan komentar (opsional)"
                                        onChange={(e) => setData('comment', e.target.value)}
                                    />
                                    <InputError message={errors.comment} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <InputLabel htmlFor="acc_partner" value="ACC Partner" />
                                        <select
                                            id="acc_partner"
                                            name="acc_partner"
                                            value={data.acc_partner}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            onChange={(e) => setData('acc_partner', e.target.value)}
                                        >
                                            <option value="false">Pending</option>
                                            <option value="true">Approved</option>
                                        </select>
                                        <InputError message={errors.acc_partner} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="for" value="Untuk" />
                                        <select
                                            id="for"
                                            name="for"
                                            value={data.for}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            onChange={(e) => setData('for', e.target.value)}
                                        >
                                            <option value="kap">KAP</option>
                                            <option value="klien">Klien</option>
                                        </select>
                                        <InputError message={errors.for} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="acc_klien" value="ACC Klien" />
                                        <select
                                            id="acc_klien"
                                            name="acc_klien"
                                            value={data.acc_klien}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            onChange={(e) => setData('acc_klien', e.target.value)}
                                        >
                                            <option value="false">Pending</option>
                                            <option value="true">Approved</option>
                                        </select>
                                        <InputError message={errors.acc_klien} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Update Template'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}