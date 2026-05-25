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

export default function CocksIndex({ cocks, players = [], fightingStyles = [], filters = {} }) {
    const { errors } = usePage().props;
    const permissions = usePage().props?.auth?.permissions ?? [];

    const canCreate = permissions.includes('cocks.create');
    const canUpdate = permissions.includes('cocks.update');
    const canDelete = permissions.includes('cocks.delete');

    const perPageOptions = useMemo(() => {
        const opts = [];
        for (let i = 20; i <= 2000; i += 20) {
            opts.push({ value: String(i), label: String(i) });
        }
        return opts;
    }, []);

    const cocksData = cocks?.data ?? [];
    const cocksLinks = cocks?.links ?? [];
    const cocksMeta = {
        from: cocks?.from ?? null,
        to: cocks?.to ?? null,
        total: cocks?.total ?? null,
    };

    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [editingId, setEditingId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
    const [frontPhotoPreviewUrl, setFrontPhotoPreviewUrl] = useState(null);
    const [leftPhotoPreviewUrl, setLeftPhotoPreviewUrl] = useState(null);
    const [rightPhotoPreviewUrl, setRightPhotoPreviewUrl] = useState(null);
    const [actionPhotoPreviewUrl, setActionPhotoPreviewUrl] = useState(null);

    const [form, setForm] = useState({
        photo: null,
        photo_path: null,
        front_photo: null,
        front_photo_path: null,
        left_photo: null,
        left_photo_path: null,
        right_photo: null,
        right_photo_path: null,
        action_photo: null,
        action_photo_path: null,
        player_id: '',
        player_search: '',
        code: '',
        cock_name: '',
        cock_entry_number: '',
        cock_alias: '',
        cock_stand: '',
        color: '',
        breed: '',
        weight: '0.00',
        height: '0.00',
        age: '0',
        hatch_date: '',
        origin: '',
        fighting_style: '',
        wins: '0',
        draws: '0',
        losses: '0',
        status: 'in-active',
    });

    const computeAgeParts = (dateString) => {
        if (!dateString) return { years: 0, months: 0 };
        const d = new Date(`${dateString}T00:00:00`);
        if (Number.isNaN(d.getTime())) return { years: 0, months: 0 };

        const today = new Date();
        let years = today.getFullYear() - d.getFullYear();
        let months = today.getMonth() - d.getMonth();
        const dayDelta = today.getDate() - d.getDate();

        if (dayDelta < 0) months -= 1;
        if (months < 0) {
            years -= 1;
            months += 12;
        }

        years = Math.max(0, years);
        months = Math.max(0, months);

        return { years, months };
    };

    const ageDisplay = useMemo(() => {
        const { years, months } = computeAgeParts(form.hatch_date);
        return `${years}y ${months}m`;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.hatch_date]);

    useEffect(() => {
        const { years } = computeAgeParts(form.hatch_date);
        setForm((f) => ({ ...f, age: String(years) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.hatch_date]);

    const statusOptions = useMemo(
        () => [
            { value: 'active', label: 'active' },
            { value: 'in-active', label: 'in-active' },
        ],
        [],
    );

    const openCreate = () => {
        setMode('create');
        setEditingId(null);
        setForm({
            photo: null,
            photo_path: null,
            front_photo: null,
            front_photo_path: null,
            left_photo: null,
            left_photo_path: null,
            right_photo: null,
            right_photo_path: null,
            action_photo: null,
            action_photo_path: null,
            player_id: '',
            player_search: '',
            code: '',
            cock_name: '',
            cock_entry_number: '',
            cock_alias: '',
            cock_stand: '',
            color: '',
            breed: '',
            weight: '0.00',
            height: '0.00',
            age: '0',
            hatch_date: '',
            origin: '',
            fighting_style: '',
            wins: '0',
            draws: '0',
            losses: '0',
            status: 'in-active',
        });
        setIsOffcanvasOpen(true);
    };

    useEffect(() => {
        if (!isOffcanvasOpen) {
            setPhotoPreviewUrl(null);
            setFrontPhotoPreviewUrl(null);
            setLeftPhotoPreviewUrl(null);
            setRightPhotoPreviewUrl(null);
            setActionPhotoPreviewUrl(null);
            return;
        }

        if (form.photo instanceof File) {
            const url = URL.createObjectURL(form.photo);
            setPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }

        setPhotoPreviewUrl(null);
    }, [form.photo, isOffcanvasOpen]);

    useEffect(() => {
        if (!isOffcanvasOpen) return;
        if (form.front_photo instanceof File) {
            const url = URL.createObjectURL(form.front_photo);
            setFrontPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setFrontPhotoPreviewUrl(null);
    }, [form.front_photo, isOffcanvasOpen]);

    useEffect(() => {
        if (!isOffcanvasOpen) return;
        if (form.left_photo instanceof File) {
            const url = URL.createObjectURL(form.left_photo);
            setLeftPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setLeftPhotoPreviewUrl(null);
    }, [form.left_photo, isOffcanvasOpen]);

    useEffect(() => {
        if (!isOffcanvasOpen) return;
        if (form.right_photo instanceof File) {
            const url = URL.createObjectURL(form.right_photo);
            setRightPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setRightPhotoPreviewUrl(null);
    }, [form.right_photo, isOffcanvasOpen]);

    useEffect(() => {
        if (!isOffcanvasOpen) return;
        if (form.action_photo instanceof File) {
            const url = URL.createObjectURL(form.action_photo);
            setActionPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setActionPhotoPreviewUrl(null);
    }, [form.action_photo, isOffcanvasOpen]);

    const getStoredPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        if (String(photoPath).startsWith('http://') || String(photoPath).startsWith('https://')) {
            return photoPath;
        }
        return `/storage/${photoPath}`;
    };

    const openEdit = (c) => {
        const getPlayerName = (p) => {
            if (!p) return '';
            return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ').trim();
        };

        setMode('edit');
        setEditingId(c.id);
        setForm({
            photo: null,
            photo_path: c.photo_path || null,
            front_photo: null,
            front_photo_path: c.front_photo_path || null,
            left_photo: null,
            left_photo_path: c.left_photo_path || null,
            right_photo: null,
            right_photo_path: c.right_photo_path || null,
            action_photo: null,
            action_photo_path: c.action_photo_path || null,
            player_id: c.player_id ? String(c.player_id) : '',
            player_search: getPlayerName(c.player) || '',
            code: c.code || '',
            cock_name: c.cock_name || '',
            cock_entry_number: c.cock_entry_number != null ? String(c.cock_entry_number) : '',
            cock_alias: c.cock_alias || '',
            cock_stand: c.cock_stand || '',
            color: c.color || '',
            breed: c.breed || '',
            weight: c.weight != null ? String(c.weight) : '0.00',
            height: c.height != null ? String(c.height) : '0.00',
            age: c.age != null ? String(c.age) : '0',
            hatch_date: c.hatch_date ? String(c.hatch_date).slice(0, 10) : '',
            origin: c.origin || '',
            fighting_style: c.fighting_style?.name || '',
            wins: c.wins != null ? String(c.wins) : '0',
            draws: c.draws != null ? String(c.draws) : '0',
            losses: c.losses != null ? String(c.losses) : '0',
            status: c.status || 'in-active',
        });
        setIsOffcanvasOpen(true);
    };

    const closeOffcanvas = () => {
        if (busy) return;
        setIsOffcanvasOpen(false);
    };

    const submit = (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);

        const payload = {
            ...form,
            player_id: form.player_id ? Number(form.player_id) : null,
        };

        delete payload.player_search;

        if (mode === 'create') {
            router.post(route('cocks.store'), payload, {
                preserveScroll: true,
                forceFormData: true,
                onFinish: () => setBusy(false),
                onSuccess: () => setIsOffcanvasOpen(false),
            });
            return;
        }

        router.post(
            route('cocks.update', editingId),
            { ...payload, _method: 'put' },
            {
                preserveScroll: true,
                forceFormData: true,
                onFinish: () => setBusy(false),
                onSuccess: () => setIsOffcanvasOpen(false),
            },
        );
    };

    const doDelete = (c) => {
        if (!confirm(`Delete cock "${c.cock_name ?? c.code}"?`)) return;
        router.delete(route('cocks.destroy', c.id), { preserveScroll: true });
    };

    const [search, setSearch] = useState(filters?.search ?? '');
    const [perPage, setPerPage] = useState(String(filters?.perPage ?? 20));

    const applyFilters = (next) => {
        router.get(
            route('cocks'),
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

    const playerOptions = useMemo(() => {
        const nameOf = (p) => [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ').trim();
        return (players ?? []).map((p) => ({ id: p.id, name: nameOf(p) }));
    }, [players]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-[var(--text-primary)]">
                    Cock Management
                </h2>
            }
        >
            <Head title="Cock Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-[var(--text-primary)]">
                                Cock Management
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
                                Cock List
                            </div>

                            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                                <form onSubmit={onSubmitSearch} className="flex w-full gap-2 md:w-auto">
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search code, name, alias, breed"
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
                            columns={[
                                'Code',
                                'Player',
                                'Name',
                                'Entry #',
                                'Alias',
                                'Cock Stand',
                                'Hatch Date',
                                'Breed',
                                'Color',
                                'Weight',
                                'Status',
                                'Actions',
                            ]}
                            data={cocksData.map((c) => ({
                                code: c.code,
                                player: c.player
                                    ? [c.player.first_name, c.player.middle_name, c.player.last_name]
                                          .filter(Boolean)
                                          .join(' ')
                                    : '-',
                                name: c.cock_name ?? '-',
                                entry_number: c.cock_entry_number ?? '-',
                                alias: c.cock_alias ?? '-',
                                cock_stand: c.cock_stand ?? '-',
                                hatch_date: c.hatch_date ? String(c.hatch_date).slice(0, 10) : '-',
                                breed: c.breed ?? '-',
                                color: c.color ?? '-',
                                weight: c.weight ?? '-',
                                status: c.status ?? '-',
                                actions: (
                                    <div className="flex gap-2">
                                        {canUpdate && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => openEdit(c)}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                type="button"
                                                variant="danger"
                                                onClick={() => doDelete(c)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                ),
                            }))}
                        />

                        {cocksMeta.total !== null && (
                            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-[var(--text-muted)]">
                                    Showing {cocksMeta.from ?? 0} to {cocksMeta.to ?? 0} of {cocksMeta.total ?? 0}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {cocksLinks.map((l, idx) => (
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

                        {errors?.cocks && (
                            <div className="mt-4 text-sm text-[var(--danger)]">
                                {errors.cocks}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Offcanvas show={isOffcanvasOpen} onClose={closeOffcanvas}>
                <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
                                <div className="text-lg font-semibold">
                                    {mode === 'create' ? 'Add Cock' : 'Edit Cock'}
                                </div>
                                <Button type="button" variant="secondary" onClick={closeOffcanvas}>
                                    Close
                                </Button>
                            </div>

                            <form onSubmit={submit} className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="md:col-span-3">
                                            <Label>Pictures</Label>
                                            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                                                {[
                                                    {
                                                        key: 'front',
                                                        label: 'Front Pic',
                                                        preview: frontPhotoPreviewUrl,
                                                        stored: getStoredPhotoUrl(form.front_photo_path),
                                                        error: errors?.front_photo,
                                                        onChange: (file) =>
                                                            setForm((f) => ({ ...f, front_photo: file ?? null })),
                                                    },
                                                    {
                                                        key: 'left',
                                                        label: 'Left Side Pic',
                                                        preview: leftPhotoPreviewUrl,
                                                        stored: getStoredPhotoUrl(form.left_photo_path),
                                                        error: errors?.left_photo,
                                                        onChange: (file) =>
                                                            setForm((f) => ({ ...f, left_photo: file ?? null })),
                                                    },
                                                    {
                                                        key: 'right',
                                                        label: 'Right Side Pic',
                                                        preview: rightPhotoPreviewUrl,
                                                        stored: getStoredPhotoUrl(form.right_photo_path),
                                                        error: errors?.right_photo,
                                                        onChange: (file) =>
                                                            setForm((f) => ({ ...f, right_photo: file ?? null })),
                                                    },
                                                    {
                                                        key: 'normal',
                                                        label: 'Normal Pic',
                                                        preview: photoPreviewUrl,
                                                        stored: getStoredPhotoUrl(form.photo_path),
                                                        error: errors?.photo,
                                                        onChange: (file) => setForm((f) => ({ ...f, photo: file ?? null })),
                                                    },
                                                    {
                                                        key: 'action',
                                                        label: 'Action Pic',
                                                        preview: actionPhotoPreviewUrl,
                                                        stored: getStoredPhotoUrl(form.action_photo_path),
                                                        error: errors?.action_photo,
                                                        onChange: (file) =>
                                                            setForm((f) => ({ ...f, action_photo: file ?? null })),
                                                    },
                                                ].map((slot) => (
                                                    <div key={slot.key}>
                                                        <label className="block cursor-pointer">
                                                            <div className="h-20 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]">
                                                                {slot.preview || slot.stored ? (
                                                                    <img
                                                                        src={slot.preview ?? slot.stored}
                                                                        alt={slot.label}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
                                                                        <img
                                                                            src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                                                                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
  <rect width="120" height="80" rx="12" ry="12" fill="#E5E7EB"/>
  <path d="M60 18c-10 0-18 6-18 14h10c0-4 4-7 8-7s8 3 8 7c0 4-3 6-7 8-5 2-9 5-9 12v3h10v-2c0-3 1-4 6-6 6-2 10-6 10-15 0-8-8-14-18-14z" fill="#6B7280"/>
  <circle cx="60" cy="62" r="5" fill="#6B7280"/>
</svg>`,
                                                                            )}`}
                                                                            alt="?"
                                                                            className="h-10 w-10 opacity-80"
                                                                        />
                                                                        <div className="text-[10px] font-semibold text-[var(--text-muted)]">
                                                                            {slot.label}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => slot.onChange(e.target.files?.[0] ?? null)}
                                                            />
                                                        </label>
                                                        {slot.error && (
                                                            <div className="mt-1 text-xs text-[var(--danger)]">{slot.error}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-xs text-[var(--text-muted)]">JPG/PNG/WEBP up to 2MB</div>
                                        </div>

                                        <div>
                                            <Label>Player</Label>
                                            <Input
                                                value={form.player_search}
                                                onChange={(e) => {
                                                    const next = e.target.value;
                                                    const match = playerOptions.find(
                                                        (p) => p.name.toLowerCase() === String(next).toLowerCase(),
                                                    );
                                                    setForm((f) => ({
                                                        ...f,
                                                        player_search: next,
                                                        player_id: match ? String(match.id) : '',
                                                    }));
                                                }}
                                                list="players-list"
                                                placeholder="Search player and select"
                                            />
                                            <datalist id="players-list">
                                                {playerOptions.map((p) => (
                                                    <option key={p.id} value={p.name} />
                                                ))}
                                            </datalist>
                                            {errors?.player_id && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.player_id}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Code</Label>
                                            <Input
                                                value={form.code}
                                                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                                                required
                                            />
                                            {errors?.code && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.code}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Cock Entry #</Label>
                                            <Input
                                                value={form.cock_entry_number}
                                                onChange={(e) =>
                                                    setForm((f) => ({ ...f, cock_entry_number: e.target.value }))
                                                }
                                                placeholder="Optional"
                                            />
                                            {errors?.cock_entry_number && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.cock_entry_number}
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <Label>Cock Name</Label>
                                            <Input
                                                value={form.cock_name}
                                                onChange={(e) => setForm((f) => ({ ...f, cock_name: e.target.value }))}
                                            />
                                            {errors?.cock_name && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.cock_name}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Cock Alias</Label>
                                            <Input
                                                value={form.cock_alias}
                                                onChange={(e) => setForm((f) => ({ ...f, cock_alias: e.target.value }))}
                                            />
                                            {errors?.cock_alias && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.cock_alias}</div>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Cock Stand/Team</Label>
                                            <Input
                                                value={form.cock_stand}
                                                onChange={(e) => setForm((f) => ({ ...f, cock_stand: e.target.value }))}
                                            />
                                            {errors?.cock_stand && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.cock_stand}</div>
                                            )}
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                        <div>
                                            <Label>Origin/Class</Label>
                                            <Input
                                                value={form.origin}
                                                onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                                            />
                                            {errors?.origin && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.origin}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Color</Label>
                                            <Input
                                                value={form.color}
                                                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                                            />
                                            {errors?.color && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.color}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Breed/Bloodline</Label>
                                            <Input
                                                value={form.breed}
                                                onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
                                            />
                                            {errors?.breed && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.breed}</div>
                                            )}
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <div>
                                            <Label>Weight</Label>
                                            <Input
                                                value={form.weight}
                                                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                                            />
                                            {errors?.weight && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.weight}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Height</Label>
                                            <Input
                                                value={form.height}
                                                onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                                            />
                                            {errors?.height && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.height}</div>
                                            )}
                                        </div>
                                        <div className="md:col-span-1">
                                            <Label>Hatch Date</Label>
                                            <Input
                                                type="date"
                                                value={form.hatch_date}
                                                onChange={(e) => setForm((f) => ({ ...f, hatch_date: e.target.value }))}
                                            />
                                            {errors?.hatch_date && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.hatch_date}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Age</Label>
                                            <Input
                                                value={ageDisplay}
                                                disabled
                                            />
                                            {errors?.age && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.age}</div>
                                            )}
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label>Fighting Style</Label>
                                            <Input
                                                value={form.fighting_style}
                                                onChange={(e) =>
                                                    setForm((f) => ({ ...f, fighting_style: e.target.value }))
                                                }
                                                list="fighting-styles"
                                                placeholder="Type or select"
                                            />
                                            <datalist id="fighting-styles">
                                                {(fightingStyles ?? []).map((s) => (
                                                    <option key={s.id} value={s.name} />
                                                ))}
                                            </datalist>
                                            {errors?.fighting_style && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">
                                                    {errors.fighting_style}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Status</Label>
                                            <Select
                                                value={form.status}
                                                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                                options={statusOptions}
                                            />
                                            {errors?.status && (
                                                <div className="mt-1 text-sm text-[var(--danger)]">{errors.status}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Record (W - D - L)</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={form.wins}
                                                onChange={(e) => setForm((f) => ({ ...f, wins: e.target.value }))}
                                                className="w-20"
                                            />
                                            <div className="text-[var(--text-muted)]">-</div>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={form.draws}
                                                onChange={(e) => setForm((f) => ({ ...f, draws: e.target.value }))}
                                                className="w-20"
                                            />
                                            <div className="text-[var(--text-muted)]">-</div>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={form.losses}
                                                onChange={(e) => setForm((f) => ({ ...f, losses: e.target.value }))}
                                                className="w-20"
                                            />
                                        </div>
                                        {(errors?.wins || errors?.draws || errors?.losses) && (
                                            <div className="mt-1 text-sm text-[var(--danger)]">
                                                {errors?.wins || errors?.draws || errors?.losses}
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
