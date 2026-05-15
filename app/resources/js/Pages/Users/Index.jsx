import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Label } from '@/Components/UI/Label';
import { Table } from '@/Components/UI/Table';
import Offcanvas from '@/Components/Offcanvas';
import { useEffect, useMemo, useState } from 'react';

export default function UsersIndex({ users, roles = [], filters = {} }) {
    const { errors } = usePage().props;
    const permissions = usePage().props?.auth?.permissions ?? [];

    const canCreate = permissions.includes('users.create');
    const canUpdate = permissions.includes('users.update');
    const canDelete = permissions.includes('users.delete');

    const roleOptions = useMemo(() => {
        const opts = roles.map((r) => ({
            value: String(r.id),
            label: r.label ?? r.name,
        }));
        return [{ value: '', label: 'Select role' }, ...opts];
    }, [roles]);

    const perPageOptions = useMemo(() => {
        const opts = [];
        for (let i = 20; i <= 2000; i += 20) {
            opts.push({ value: String(i), label: String(i) });
        }
        return opts;
    }, []);

    const usersData = users?.data ?? [];
    const usersLinks = users?.links ?? [];
    const usersMeta = {
        from: users?.from ?? null,
        to: users?.to ?? null,
        total: users?.total ?? null,
    };

    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [editingUserId, setEditingUserId] = useState(null);

    const [form, setForm] = useState({
        photo: null,
        photo_path: null,
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        password: '',
        contact_no: '',
        frontend_themecolor: '',
        role_id: '',
    });
    const [busy, setBusy] = useState(false);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);

    const openCreate = () => {
        setMode('create');
        setEditingUserId(null);
        setForm({
            photo: null,
            photo_path: null,
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            password: '',
            contact_no: '',
            frontend_themecolor: '',
            role_id: '',
        });
        setIsOffcanvasOpen(true);
    };

    useEffect(() => {
        if (!isOffcanvasOpen) {
            setPhotoPreviewUrl(null);
            return;
        }

        if (form.photo instanceof File) {
            const url = URL.createObjectURL(form.photo);
            setPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }

        setPhotoPreviewUrl(null);
    }, [form.photo, isOffcanvasOpen]);

    const getStoredPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        if (String(photoPath).startsWith('http://') || String(photoPath).startsWith('https://')) {
            return photoPath;
        }
        return `/storage/${photoPath}`;
    };

    const openEdit = (u) => {
        setMode('edit');
        setEditingUserId(u.id);
        setForm({
            photo: null,
            photo_path: u.photo_path ?? null,
            first_name: u.first_name ?? '',
            middle_name: u.middle_name ?? '',
            last_name: u.last_name ?? '',
            email: u.email ?? '',
            password: '',
            contact_no: u.contact_no ?? '',
            frontend_themecolor: u.frontend_themecolor ?? '',
            role_id: u.role_id ? String(u.role_id) : '',
        });
        setIsOffcanvasOpen(true);
    };

    const closeOffcanvas = () => {
        if (busy) return;
        setIsOffcanvasOpen(false);
    };

    const submit = (e) => {
        e.preventDefault();
        setBusy(true);

        const payload = {
            ...form,
        };

        if (mode === 'create') {
            router.post(route('users.store'), payload, {
                preserveScroll: true,
                forceFormData: true,
                onFinish: () => setBusy(false),
                onSuccess: () => {
                    setIsOffcanvasOpen(false);
                },
            });
            return;
        }

        router.post(
            route('users.update', editingUserId),
            { ...payload, _method: 'put' },
            {
                preserveScroll: true,
                forceFormData: true,
                onFinish: () => setBusy(false),
                onSuccess: () => {
                    setIsOffcanvasOpen(false);
                },
            },
        );
    };

    const doDelete = (u) => {
        if (!confirm(`Delete user "${u.name}"?`)) return;
        router.delete(route('users.destroy', u.id), {
            preserveScroll: true,
        });
    };

    const [search, setSearch] = useState(filters?.search ?? '');
    const [perPage, setPerPage] = useState(String(filters?.perPage ?? 20));

    const applyFilters = (next) => {
        router.get(
            route('users'),
            {
                search: next.search,
                perPage: next.perPage,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const onSubmitSearch = (e) => {
        e.preventDefault();
        applyFilters({ search, perPage });
    };

    const onChangePerPage = (value) => {
        setPerPage(value);
        applyFilters({ search, perPage: value });
    };

    const goTo = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-[var(--text-primary)]">
                    Users
                </h2>
            }
        >
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">
                                Users
                            </div>
                            {canCreate && (
                                <Button type="button" onClick={openCreate}>
                                    Add
                                </Button>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">
                                User List
                            </div>

                            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                                <form onSubmit={onSubmitSearch} className="flex w-full gap-2 md:w-auto">
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, email, contact"
                                        className="md:w-72"
                                    />
                                    <Button type="submit" variant="outline">
                                        Search
                                    </Button>
                                </form>

                                <div className="flex items-center gap-2 md:ms-2">
                                    <Label className="whitespace-nowrap">Show</Label>
                                    <Select
                                        value={perPage}
                                        onChange={(e) => onChangePerPage(e.target.value)}
                                        options={perPageOptions}
                                        className="w-28"
                                    />
                                </div>
                            </div>
                        </div>

                        <Table
                            columns={['Name', 'Email', 'Contact', 'Theme', 'Role', 'Actions']}
                            data={usersData.map((u) => ({
                                name: u.name ?? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
                                email: u.email,
                                contact: u.contact_no ?? '-',
                                theme: u.frontend_themecolor ?? '-',
                                role: u.role?.label ?? u.role?.name ?? '-',
                                actions: (
                                    <div className="flex gap-2">
                                        {canUpdate && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => openEdit(u)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                type="button"
                                                variant="danger"
                                                onClick={() => doDelete(u)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                ),
                            }))}
                        />

                        {usersMeta.total !== null && (
                            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-[var(--text-muted)]">
                                    Showing {usersMeta.from ?? 0} to {usersMeta.to ?? 0} of {usersMeta.total ?? 0}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {usersLinks.map((l, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => goTo(l.url)}
                                            disabled={!l.url}
                                            className={
                                                'rounded-lg border px-3 py-1 text-sm transition ' +
                                                (l.active
                                                    ? 'border-[var(--accent)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]')
                                            }
                                            dangerouslySetInnerHTML={{ __html: l.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {errors?.users && (
                            <div className="mt-4 text-sm text-[var(--danger)]">
                                {errors.users}
                            </div>
                        )}
                    </Card>

                </div>
            </div>

            <Offcanvas show={isOffcanvasOpen} onClose={closeOffcanvas}>
                <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
                                <div className="text-lg font-semibold">
                                    {mode === 'create' ? 'Add User' : 'Edit User'}
                                </div>
                                <Button type="button" variant="secondary" onClick={closeOffcanvas}>
                                    Close
                                </Button>
                            </div>

                            <form onSubmit={submit} className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label>Profile Picture</Label>
                                        <div className="mb-3 flex items-center gap-4">
                                            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)]">
                                                {photoPreviewUrl || getStoredPhotoUrl(form.photo_path) ? (
                                                    <img
                                                        src={photoPreviewUrl ?? getStoredPhotoUrl(form.photo_path)}
                                                        alt="Profile preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--text-muted)]">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            photo: e.target.files?.[0] ?? null,
                                                        }))
                                                    }
                                                />
                                                <div className="mt-1 text-xs text-[var(--text-muted)]">
                                                    JPG/PNG/WEBP up to 2MB
                                                </div>
                                            </div>
                                        </div>
                                        {errors?.photo && (
                                            <div className="mt-1 text-sm text-[var(--danger)]">
                                                {errors.photo}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <Label>First Name</Label>
                                            <Input
                                                value={form.first_name}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        first_name: e.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                            {errors?.first_name && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.first_name}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Middle Name</Label>
                                            <Input
                                                value={form.middle_name}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        middle_name: e.target.value,
                                                    }))
                                                }
                                            />
                                            {errors?.middle_name && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.middle_name}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Last Name</Label>
                                            <Input
                                                value={form.last_name}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        last_name: e.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                            {errors?.last_name && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.last_name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    email: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                        {errors?.email && (
                                            <div className="mt-1 text-sm text-[var(--danger)]">
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Password {mode === 'edit' ? '(optional)' : ''}</Label>
                                        <Input
                                            type="password"
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    password: e.target.value,
                                                }))
                                            }
                                            required={mode === 'create'}
                                        />
                                        {errors?.password && (
                                            <div className="mt-1 text-sm text-[var(--danger)]">
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label>Contact No</Label>
                                            <Input
                                                value={form.contact_no}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        contact_no: e.target.value,
                                                    }))
                                                }
                                            />
                                            {errors?.contact_no && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.contact_no}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Theme Color</Label>
                                            <Input
                                                value={form.frontend_themecolor}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        frontend_themecolor: e.target.value,
                                                    }))
                                                }
                                                placeholder="#0B1220"
                                            />
                                            {errors?.frontend_themecolor && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.frontend_themecolor}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Role</Label>
                                        <Select
                                            value={form.role_id}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    role_id: e.target.value,
                                                }))
                                            }
                                            options={roleOptions}
                                            required
                                        />
                                        {errors?.role_id && (
                                            <div className="mt-1 text-sm text-[var(--danger)]">
                                                {errors.role_id}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-2">
                                    <Button type="button" variant="secondary" onClick={closeOffcanvas} disabled={busy}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={busy}>
                                        {busy ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </form>
                </div>
            </Offcanvas>
        </AuthenticatedLayout>
    );
}
