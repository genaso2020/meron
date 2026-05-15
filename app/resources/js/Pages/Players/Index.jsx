import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Label } from '@/Components/UI/Label';
import { Table } from '@/Components/UI/Table';
import Offcanvas from '@/Components/Offcanvas';
import { useMemo, useState } from 'react';

export default function PlayersIndex({ players, filters = {} }) {
    const { errors } = usePage().props;
    const permissions = usePage().props?.auth?.permissions ?? [];

    const canCreate = permissions.includes('players.create');
    const canUpdate = permissions.includes('players.update');
    const canDelete = permissions.includes('players.delete');

    const perPageOptions = useMemo(() => {
        const opts = [];
        for (let i = 20; i <= 2000; i += 20) {
            opts.push({ value: String(i), label: String(i) });
        }
        return opts;
    }, []);

    const playersData = players?.data ?? [];
    const playersLinks = players?.links ?? [];
    const playersMeta = {
        from: players?.from ?? null,
        to: players?.to ?? null,
        total: players?.total ?? null,
    };

    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [editingPlayerId, setEditingPlayerId] = useState(null);

    const [form, setForm] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        contact_no: '',
        address: '',
        status: 'active',
    });
    const [busy, setBusy] = useState(false);

    const openCreate = () => {
        setMode('create');
        setEditingPlayerId(null);
        setForm({
            first_name: '',
            middle_name: '',
            last_name: '',
            contact_no: '',
            address: '',
            status: 'active',
        });
        setIsOffcanvasOpen(true);
    };

    const openEdit = (p) => {
        setMode('edit');
        setEditingPlayerId(p.id);
        setForm({
            first_name: p.first_name ?? '',
            middle_name: p.middle_name ?? '',
            last_name: p.last_name ?? '',
            contact_no: p.contact_no ?? '',
            address: p.address ?? '',
            status: p.status ?? 'active',
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
            router.post(route('players.store'), payload, {
                preserveScroll: true,
                onFinish: () => setBusy(false),
                onSuccess: () => {
                    setIsOffcanvasOpen(false);
                },
            });
            return;
        }

        router.post(
            route('players.update', editingPlayerId),
            { ...payload, _method: 'put' },
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
                onSuccess: () => {
                    setIsOffcanvasOpen(false);
                },
            },
        );
    };

    const doDelete = (p) => {
        const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
        if (!confirm(`Delete player "${name || p.id}"?`)) return;
        router.delete(route('players.destroy', p.id), {
            preserveScroll: true,
        });
    };

    const [search, setSearch] = useState(filters?.search ?? '');
    const [perPage, setPerPage] = useState(String(filters?.perPage ?? 20));

    const applyFilters = (next) => {
        router.get(
            route('players'),
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
                    Players
                </h2>
            }
        >
            <Head title="Players" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">
                                Players
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
                                Player List
                            </div>

                            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                                <form onSubmit={onSubmitSearch} className="flex w-full gap-2 md:w-auto">
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, contact, address"
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
                            columns={['Name', 'Contact', 'Address', 'Status', 'Actions']}
                            data={playersData.map((p) => ({
                                name: `${p.first_name ?? ''} ${p.middle_name ?? ''} ${p.last_name ?? ''}`
                                    .replace(/\s+/g, ' ')
                                    .trim(),
                                contact: p.contact_no ?? '-',
                                address: p.address ?? '-',
                                status: p.status ?? '-',
                                actions: (
                                    <div className="flex gap-2">
                                        {canUpdate && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => openEdit(p)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                type="button"
                                                variant="danger"
                                                onClick={() => doDelete(p)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                ),
                            }))}
                        />

                        {playersMeta.total !== null && (
                            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-[var(--text-muted)]">
                                    Showing {playersMeta.from ?? 0} to {playersMeta.to ?? 0} of {playersMeta.total ?? 0}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {playersLinks.map((l, idx) => (
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

                        {errors?.players && (
                            <div className="mt-4 text-sm text-[var(--danger)]">
                                {errors.players}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Offcanvas show={isOffcanvasOpen} onClose={closeOffcanvas}>
                <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
                                <div className="text-lg font-semibold">
                                    {mode === 'create' ? 'Add Player' : 'Edit Player'}
                                </div>
                                <Button type="button" variant="secondary" onClick={closeOffcanvas}>
                                    Close
                                </Button>
                            </div>

                            <form onSubmit={submit} className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-4">
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
                                            <Label>Status</Label>
                                            <Select
                                                value={form.status}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        status: e.target.value,
                                                    }))
                                                }
                                                options={[
                                                    { value: 'active', label: 'active' },
                                                    { value: 'in-active', label: 'in-active' },
                                                ]}
                                                required
                                            />
                                            {errors?.status && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.status}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Address</Label>
                                        <Input
                                            value={form.address}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    address: e.target.value,
                                                }))
                                            }
                                        />
                                        {errors?.address && (
                                            <div className="mt-1 text-sm text-[var(--danger)]">
                                                {errors.address}
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
