import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card } from '@/Components/UI/Card';
import { Button } from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Select } from '@/Components/UI/Select';
import { Label } from '@/Components/UI/Label';
import { Table } from '@/Components/UI/Table';
import Offcanvas from '@/Components/Offcanvas';
import { Transition } from '@headlessui/react';
import { useMemo, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const InlineCockField = ({
    cockId,
    cockCode,
    cockStatus,
    field,
    value,
    type = 'text',
    formatValue,
    onCritical,
}) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value ?? '');

    useEffect(() => {
        if (!editing) setDraft(value ?? '');
    }, [value, editing]);

    const validateFieldValue = (f, raw) => {
        const s = String(raw ?? '').trim();
        if (s === '') return { ok: true, value: '' };

        const intFields = new Set(['cock_entry_number', 'wins', 'draws', 'losses', 'age']);
        const numberFields = new Set(['weight', 'height']);

        if (intFields.has(f)) {
            if (!/^[0-9]+$/.test(s)) return { ok: false, message: 'This field only accepts integers.' };
            const n = Number(s);
            if (!Number.isFinite(n) || n < 0) return { ok: false, message: 'Integer must be 0 or greater.' };
        }

        if (numberFields.has(f)) {
            const n = Number(s);
            if (!Number.isFinite(n)) return { ok: false, message: 'This field only accepts numbers.' };
            if (n < 0) return { ok: false, message: 'Number must be 0 or greater.' };
        }

        return { ok: true, value: s };
    };

    const buildCockUpdatePayload = (f, v) => {
        const code = String(cockCode ?? '').trim();
        const status = String(cockStatus ?? '').trim();
        if (!code || !status) {
            onCritical?.('Unable to save: missing required cock data (code/status). Refresh the page and try again.');
            return null;
        }

        const payload = {
            code,
            status,
        };

        const vv = String(v ?? '');
        const maybeNull = vv.trim() === '' ? null : vv;

        if (f === 'fighting_style') {
            payload.fighting_style = maybeNull;
            return payload;
        }

        payload[f] = maybeNull;
        return payload;
    };

    const commit = () => {
        const res = validateFieldValue(field, draft);
        if (!res.ok) {
            onCritical?.(res.message);
            return;
        }

        setEditing(false);
        const payload = buildCockUpdatePayload(field, res.value);
        if (!payload) return;
        router.post(route('cocks.update', cockId), { ...payload, _method: 'put' }, { preserveScroll: true });
    };

    if (editing) {
        return (
            <Input
                autoFocus
                type={type}
                value={draft ?? ''}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commit();
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        setEditing(false);
                        setDraft(value ?? '');
                    }
                }}
                onBlur={() => {
                    setEditing(false);
                    setDraft(value ?? '');
                }}
            />
        );
    }

    const display = (() => {
        if (formatValue) return formatValue(value);
        const s = String(value ?? '').trim();
        return s === '' ? '-' : s;
    })();
    return (
        <button
            type="button"
            className="text-left text-sm font-semibold text-[var(--text-primary)] hover:underline"
            onClick={() => setEditing(true)}
        >
            {display}
        </button>
    );
};

export default function GamesIndex({ games, matches, cocks, cocks2, filters = {} }) {
    const { errors } = usePage().props;
    const permissions = usePage().props?.auth?.permissions ?? [];

    const renderCockpitCockCell = (cock, assignedColor, bettersCount, totalBetsPhp) => {
        const has = (v) => String(v ?? '').trim() !== '';
        const dash = (v) => (has(v) ? v : '-');
        const team = cock?.player?.name ?? cock?.player_name ?? null;
        const fightingStyle = cock?.fighting_style?.name ?? cock?.fightingStyle?.name ?? null;

        const formatPhp = (value) => {
            const n = Number(value);
            if (!Number.isFinite(n)) return 'Php0.00';
            const formatted = new Intl.NumberFormat('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(n);
            return `Php${formatted}`;
        };

        const assigned = String(assignedColor ?? '').toUpperCase();
        const colorBg = assigned === 'RED' ? 'bg-red-600' : assigned === 'WHITE' ? 'bg-white' : 'bg-transparent';
        const colorBorder = assigned === 'WHITE' ? 'border border-[var(--border)]' : '';

        return (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2">
                <div className="mb-2 flex items-start justify-between">
                    <div className="text-left">
                        <div className="text-[10px] font-semibold text-[var(--text-muted)]">No of Betters :</div>
                        <div className="text-xs font-semibold text-[var(--text-secondary)]">{dash(bettersCount)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-semibold text-[var(--text-muted)]">Total Bets :</div>
                        <div className="text-xs font-semibold text-[var(--text-secondary)]">{formatPhp(totalBetsPhp)}</div>
                    </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[var(--text-primary)]">
                            {dash(cock?.cock_name)}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                            Entry #: {dash(cock?.cock_entry_number)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            {assigned ? `${assigned} CORNER` : 'NO CORNER'}
                        </div>
                        <div className={`h-5 w-5 rounded ${colorBg} ${colorBorder}`} />
                    </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                    <div className="truncate">Team: {dash(team)}</div>
                    <div className="truncate">Color: {dash(cock?.color)}</div>
                    <div className="truncate">Breed: {dash(cock?.breed)}</div>
                    <div className="truncate">Origin: {dash(cock?.origin)}</div>
                    <div className="truncate">Weight: {dash(cock?.weight)}</div>
                    <div className="truncate">Height: {dash(cock?.height)}</div>
                    <div className="truncate">Age: {dash(cock?.age)}</div>
                    <div className="truncate">Style: {dash(fightingStyle)}</div>
                </div>

                <div className="mt-2 text-xs font-semibold text-[var(--text-secondary)]">
                    W - {dash(cock?.wins)} &nbsp;&nbsp; D - {dash(cock?.draws)} &nbsp;&nbsp; L - {dash(cock?.losses)}
                </div>
            </div>
        );
    };

    const fireCritical = (message) => {
        Swal.fire({
            title: 'Critical Information',
            text: message,
            icon: 'error',
            confirmButtonText: 'OK',
        });
    };

    const canCreateGame = permissions.includes('games.create');
    const canUpdateGame = permissions.includes('games.update');
    const canDeleteGame = permissions.includes('games.delete');
    const canCreateMatch = permissions.includes('matches.create');
    const canUpdateMatch = permissions.includes('matches.update');
    const canDeleteMatch = permissions.includes('matches.delete');

    const perPageOptions = useMemo(() => {
        const opts = [];
        for (let i = 20; i <= 2000; i += 20) {
            opts.push({ value: String(i), label: String(i) });
        }
        return opts;
    }, []);

    const statusOptions = useMemo(
        () => [
            { value: 'pending', label: 'pending' },
            { value: 'ongoing', label: 'ongoing' },
            { value: 'done', label: 'done' },
        ],
        [],
    );

    const gamesData = games?.data ?? [];
    const gamesLinks = games?.links ?? [];
    const gamesMeta = {
        from: games?.from ?? null,
        to: games?.to ?? null,
        total: games?.total ?? null,
    };

    const matchesData = matches?.data ?? [];
    const matchesLinks = matches?.links ?? [];
    const matchesMeta = {
        from: matches?.from ?? null,
        to: matches?.to ?? null,
        total: matches?.total ?? null,
    };

    const cocksData = cocks?.data ?? [];
    const cocksLinks = cocks?.links ?? [];
    const cocksMeta = {
        from: cocks?.from ?? null,
        to: cocks?.to ?? null,
        total: cocks?.total ?? null,
    };

    const cocks2Data = cocks2?.data ?? [];
    const cocks2Links = cocks2?.links ?? [];
    const cocks2Meta = {
        from: cocks2?.from ?? null,
        to: cocks2?.to ?? null,
        total: cocks2?.total ?? null,
    };

    const gameOptions = useMemo(() => {
        const opts = gamesData.map((g) => ({
            value: String(g.id),
            label: `${g.name ?? 'Game'} (#${g.id})`,
        }));
        return [{ value: '', label: 'Select event' }, ...opts];
    }, [gamesData]);

    const [search, setSearch] = useState(filters?.search ?? '');
    const [perPage, setPerPage] = useState(String(filters?.perPage ?? 20));

    const [matchSearch, setMatchSearch] = useState(filters?.matchSearch ?? '');
    const [matchPerPage, setMatchPerPage] = useState(String(filters?.matchPerPage ?? 20));

    const [selectedMatchId, setSelectedMatchId] = useState(null);

    const [cockSearch, setCockSearch] = useState(filters?.cockSearch ?? '');
    const [cockPerPage, setCockPerPage] = useState(String(filters?.cockPerPage ?? 20));

    const [cock2Search, setCock2Search] = useState(filters?.cock2Search ?? '');
    const [cock2PerPage, setCock2PerPage] = useState(String(filters?.cock2PerPage ?? 20));

    const [fightDateSortDir, setFightDateSortDir] = useState('desc');

    const [wizardStep, setWizardStep] = useState(0);
    const [wizardEventId, setWizardEventId] = useState('');
    const [wizardCock1Id, setWizardCock1Id] = useState('');
    const [wizardCock1Search, setWizardCock1Search] = useState('');
    const [wizardCock1Color, setWizardCock1Color] = useState('');
    const [wizardCock2Id, setWizardCock2Id] = useState('');
    const [wizardCock2Search, setWizardCock2Search] = useState('');
    const [wizardCock2Color, setWizardCock2Color] = useState('');
    const [wizardFightNo, setWizardFightNo] = useState('1');
    const [wizardScheduleTime, setWizardScheduleTime] = useState('');
    const [wizardSubmitting, setWizardSubmitting] = useState(false);

    const goTo = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveScroll: true, preserveState: true });
    };

    const goToMatches = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveScroll: true, preserveState: true });
    };

    const onSubmitSearch = (e) => {
        e.preventDefault();
        router.get(
            route('games'),
            { search, perPage, matchSearch, matchPerPage, cockSearch, cockPerPage, cock2Search, cock2PerPage },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const onChangePerPage = (nextPerPage) => {
        setPerPage(nextPerPage);
        router.get(
            route('games'),
            {
                search,
                perPage: nextPerPage,
                matchSearch,
                matchPerPage,
                cockSearch,
                cockPerPage,
                cock2Search,
                cock2PerPage,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const onSubmitMatchSearch = (e) => {
        e.preventDefault();
        router.get(
            route('games'),
            { search, perPage, matchSearch, matchPerPage, cockSearch, cockPerPage, cock2Search, cock2PerPage },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const onChangeMatchPerPage = (nextPerPage) => {
        setMatchPerPage(nextPerPage);
        router.get(
            route('games'),
            {
                search,
                perPage,
                matchSearch,
                matchPerPage: nextPerPage,
                cockSearch,
                cockPerPage,
                cock2Search,
                cock2PerPage,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const onSubmitCockSearch = (e) => {
        e.preventDefault();
        router.get(
            route('games'),
            { search, perPage, matchSearch, matchPerPage, cockSearch, cockPerPage, cock2Search, cock2PerPage },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const onChangeCockPerPage = (nextPerPage) => {
        setCockPerPage(nextPerPage);
        router.get(
            route('games'),
            {
                search,
                perPage,
                matchSearch,
                matchPerPage,
                cockSearch,
                cockPerPage: nextPerPage,
                cock2Search,
                cock2PerPage,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const onSubmitCock2Search = (e) => {
        e.preventDefault();
        router.get(
            route('games'),
            { search, perPage, matchSearch, matchPerPage, cockSearch, cockPerPage, cock2Search, cock2PerPage },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const onChangeCock2PerPage = (nextPerPage) => {
        setCock2PerPage(nextPerPage);
        router.get(
            route('games'),
            { search, perPage, matchSearch, matchPerPage, cockSearch, cockPerPage, cock2Search, cock2PerPage: nextPerPage },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const [busy, setBusy] = useState(false);

    const [offcanvas, setOffcanvas] = useState({ open: false, type: null });
    const [editingGameId, setEditingGameId] = useState(null);
    const [offcanvasGameSearch, setOffcanvasGameSearch] = useState('');
    const [openGameActionMenu, setOpenGameActionMenu] = useState(null);

    const [editingMatchId, setEditingMatchId] = useState(null);
    const [offcanvasMatchSearch, setOffcanvasMatchSearch] = useState('');
    const [openMatchActionMenu, setOpenMatchActionMenu] = useState(null);

    const [gameBoardGameId, setGameBoardGameId] = useState(null);
    const [rightTab, setRightTab] = useState('events');

    const [gameForm, setGameForm] = useState({
        name: '',
        location: '',
        date: '',
        details1: '',
        details2: '',
    });

    const filteredGamesForOffcanvas = useMemo(() => {
        const q = offcanvasGameSearch.trim().toLowerCase();
        if (!q) return gamesData;
        return gamesData.filter((g) => {
            const name = String(g.name ?? '').toLowerCase();
            const location = String(g.location ?? '').toLowerCase();
            const date = String(g.date ?? '').toLowerCase();
            return name.includes(q) || location.includes(q) || date.includes(q);
        });
    }, [gamesData, offcanvasGameSearch]);

    const filteredMatchesForOffcanvas = useMemo(() => {
        const q = offcanvasMatchSearch.trim().toLowerCase();
        if (!q) return matchesData;
        return matchesData.filter((m) => {
            const eventId = String(m.event_id ?? '').toLowerCase();
            const fightNumber = String(m.fight_number ?? '').toLowerCase();
            const scheduleTime = String(m.schedule_time ?? '').toLowerCase();
            const status = String(m.status ?? '').toLowerCase();
            return (
                eventId.includes(q) ||
                fightNumber.includes(q) ||
                scheduleTime.includes(q) ||
                status.includes(q)
            );
        });
    }, [matchesData, offcanvasMatchSearch]);

    const [matchForm, setMatchForm] = useState({
        event_id: '',
        fight_number: '',
        schedule_time: '',
        status: 'pending',
    });

    const selectedMatchGame = useMemo(() => {
        const id = Number(matchForm.event_id);
        if (!id) return null;
        return gamesData.find((g) => Number(g.id) === id) ?? null;
    }, [gamesData, matchForm.event_id]);

    const gamesById = useMemo(() => {
        const map = new Map();
        gamesData.forEach((g) => map.set(Number(g.id), g));
        return map;
    }, [gamesData]);

    const selectedBoardGame = useMemo(() => {
        const id = Number(gameBoardGameId);
        if (!id) return null;
        return gamesData.find((g) => Number(g.id) === id) ?? null;
    }, [gamesData, gameBoardGameId]);

    const boardMatches = useMemo(() => {
        if (!selectedBoardGame?.id) return [];
        return matchesData.filter((m) => Number(m.event_id) === Number(selectedBoardGame.id));
    }, [matchesData, selectedBoardGame?.id]);

    const formatBoardDate = (value) => {
        if (!value) return '';
        const d = value instanceof Date ? value : new Date(String(value));
        if (Number.isNaN(d.getTime())) return '';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        }).format(d);
    };

    const openCreateGame = () => {
        setEditingGameId(null);
        setGameForm({ name: '', location: '', date: '', details1: '', details2: '' });
        setOffcanvasGameSearch('');
        setOpenGameActionMenu(null);
        setOffcanvas({ open: true, type: 'game' });
    };

    const openEditGame = (g) => {
        setEditingGameId(g.id);
        setGameForm({
            name: g.name ?? '',
            location: g.location ?? '',
            date: g.date ? String(g.date).slice(0, 10) : '',
            details1: g.details1 ?? '',
            details2: g.details2 ?? '',
        });
        setOffcanvasGameSearch('');
        setOpenGameActionMenu(null);
        setOffcanvas({ open: true, type: 'game' });
    };

    const openCreateMatch = () => {
        setEditingMatchId(null);
        setMatchForm({ event_id: '', fight_number: '', schedule_time: '', status: 'pending' });
        setOffcanvasMatchSearch('');
        setOpenMatchActionMenu(null);
        setOffcanvas({ open: true, type: 'match' });
    };

    const openEditMatch = (m) => {
        setEditingMatchId(m.id);
        const normalizedScheduleTime = m.schedule_time
            ? String(m.schedule_time)
                  .replace(' ', 'T')
                  .replace(/\.\d+Z$/, '')
                  .slice(0, 16)
            : '';
        setMatchForm({
            event_id: m.event_id ? String(m.event_id) : '',
            fight_number: m.fight_number ? String(m.fight_number) : '',
            schedule_time: normalizedScheduleTime,
            status: m.status ?? 'pending',
        });
        setOffcanvasMatchSearch('');
        setOpenMatchActionMenu(null);
        setOffcanvas({ open: true, type: 'match' });
    };

    const closeOffcanvas = () => {
        if (busy) return;
        setOpenGameActionMenu(null);
        setOpenMatchActionMenu(null);
        setOffcanvas({ open: false, type: null });
    };

    const submitGame = (e) => {
        e.preventDefault();
        setBusy(true);

        if (!editingGameId) {
            router.post(route('games.store'), gameForm, {
                preserveScroll: true,
                onFinish: () => setBusy(false),
                onSuccess: () => setOffcanvas({ open: false, type: null }),
            });
            return;
        }

        router.put(route('games.update', editingGameId), gameForm, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
            onSuccess: () => setOffcanvas({ open: false, type: null }),
        });
    };

    const submitMatch = (e) => {
        e.preventDefault();
        setBusy(true);

        if (!editingMatchId) {
            router.post(route('matches.store'), matchForm, {
                preserveScroll: true,
                onFinish: () => setBusy(false),
                onSuccess: () => setOffcanvas({ open: false, type: null }),
            });
            return;
        }

        router.post(
            route('matches.update', editingMatchId),
            { ...matchForm, _method: 'put' },
            {
                preserveScroll: true,
                onFinish: () => setBusy(false),
                onSuccess: () => setOffcanvas({ open: false, type: null }),
            },
        );
    };

    const doDeleteGame = (g) => {
        if (!confirm(`Delete game "${g.name ?? g.id}"?`)) return;
        router.delete(route('games.destroy', g.id), { preserveScroll: true });
    };

    const doDeleteMatch = (m) => {
        if (!confirm(`Delete match "${m.fight_number ?? m.id}"?`)) return;
        router.delete(route('matches.destroy', m.id), { preserveScroll: true });
    };

    const setMatchStatus = (m, status) => {
        if (!canUpdateMatch) return;
        const payload = {
            event_id: m.event_id ? String(m.event_id) : '',
            fight_number: m.fight_number ? String(m.fight_number) : '',
            schedule_time: m.schedule_time
                ? String(m.schedule_time).replace(' ', 'T').replace(/\.\d+Z$/, '').slice(0, 16)
                : '',
            status,
        };

        router.post(route('matches.update', m.id), { ...payload, _method: 'put' }, { preserveScroll: true });
    };

    const cockpitMatches = useMemo(() => {
        const dir = fightDateSortDir === 'asc' ? 1 : -1;
        const clone = [...matchesData];

        clone.sort((a, b) => {
            const aOngoing = String(a.status ?? '').toLowerCase() === 'ongoing';
            const bOngoing = String(b.status ?? '').toLowerCase() === 'ongoing';
            if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;

            const aTime = a.schedule_time ? new Date(String(a.schedule_time)).getTime() : 0;
            const bTime = b.schedule_time ? new Date(String(b.schedule_time)).getTime() : 0;
            if (aTime !== bTime) return (aTime - bTime) * dir;

            return (Number(a.fight_number ?? 0) - Number(b.fight_number ?? 0)) * dir;
        });

        return clone;
    }, [matchesData, fightDateSortDir]);

    const cockOptions1 = useMemo(() => {
        return cocksData
            .filter((c) => String(c.id) !== String(wizardCock2Id))
            .map((c) => ({ id: String(c.id), name: c.cock_name ?? c.code ?? `Cock #${c.id}` }));
    }, [cocksData, wizardCock2Id]);

    const cockOptions2 = useMemo(() => {
        return cocks2Data
            .filter((c) => String(c.id) !== String(wizardCock1Id))
            .map((c) => ({ id: String(c.id), name: c.cock_name ?? c.code ?? `Cock #${c.id}` }));
    }, [cocks2Data, wizardCock1Id]);

    const selectedCock1 = useMemo(() => {
        if (!wizardCock1Id) return null;
        return cocksData.find((c) => String(c.id) === String(wizardCock1Id)) ?? null;
    }, [wizardCock1Id, cocksData]);

    const selectedCock2 = useMemo(() => {
        if (!wizardCock2Id) return null;
        return cocks2Data.find((c) => String(c.id) === String(wizardCock2Id)) ?? null;
    }, [wizardCock2Id, cocks2Data]);

    const cockColorOptions = useMemo(
        () => [
            { value: '', label: 'Select color' },
            { value: 'WHITE', label: 'WHITE' },
            { value: 'RED', label: 'RED' },
        ],
        [],
    );

    const cock1ColorOptions = useMemo(() => {
        return cockColorOptions.filter((o) => o.value === '' || String(o.value) !== String(wizardCock2Color));
    }, [cockColorOptions, wizardCock2Color]);

    const cock2ColorOptions = useMemo(() => {
        return cockColorOptions.filter((o) => o.value === '' || String(o.value) !== String(wizardCock1Color));
    }, [cockColorOptions, wizardCock1Color]);

    const oppositeCornerColor = (c) => {
        const v = String(c ?? '').toUpperCase();
        if (v === 'WHITE') return 'RED';
        if (v === 'RED') return 'WHITE';
        return '';
    };

    const formatAgeYearsMonths = (hatchDate) => {
        if (!hatchDate) return '-';
        const d = new Date(String(hatchDate).slice(0, 10) + 'T00:00:00');
        if (Number.isNaN(d.getTime())) return '-';
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
        return `${years}y ${months}m`;
    };

    const CockDetails = ({ cock, selectedColor, colorOptions, onChangeColor }) => {
        if (!cock) return null;

        const labelValue = (label, node) => (
            <>
                <div className="text-xs text-[var(--text-muted)]">{label}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{node}</div>
            </>
        );

        const stats = `W - ${cock.wins ?? 0}   D - ${cock.draws ?? 0}   L - ${cock.losses ?? 0}`;
        const hatchDateLabel = cock.hatch_date ? String(cock.hatch_date).slice(0, 10) : '';
        const ageLabel = formatAgeYearsMonths(cock.hatch_date);

        const isAllowedColor = (value) => {
            return (colorOptions ?? []).some((o) => String(o.value) === String(value));
        };

        const colorButtonClass = (isActive, isDisabled) => {
            const base = 'relative inline-flex items-center justify-center rounded-lg border transition';
            const size = 'h-12 w-12';
            if (isDisabled) return `${base} ${size} cursor-not-allowed border-[var(--border)] bg-[var(--bg-secondary)] opacity-40`;
            if (isActive) return `${base} ${size} border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-tertiary)]`;
            return `${base} ${size} border-[var(--border)] hover:ring-2 hover:ring-[var(--border)] hover:ring-offset-2 hover:ring-offset-[var(--bg-tertiary)]`;
        };

        const colorSwatchClass = (value) => {
            if (String(value) === 'RED') return 'h-full w-full rounded-md bg-red-600';
            return 'h-full w-full rounded-md bg-white border border-[var(--border)]';
        };

        const checkClass = (value) => {
            if (String(value) === 'RED') return 'text-white';
            return 'text-black';
        };

        return (
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {labelValue('Cock Name', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="cock_name"
                            value={cock.cock_name ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Entry No :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="cock_entry_number"
                            value={cock.cock_entry_number ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Alias', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="cock_alias"
                            value={cock.cock_alias ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Stand / Team :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="cock_stand"
                            value={cock.cock_stand ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Breed :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="breed"
                            value={cock.breed ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Color :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="color"
                            value={cock.color ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Weight :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="weight"
                            value={cock.weight ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Height :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="height"
                            value={cock.height ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Age :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="hatch_date"
                            type="date"
                            value={hatchDateLabel}
                            formatValue={() => ageLabel}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Hatch Date :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="hatch_date"
                            type="date"
                            value={hatchDateLabel}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Fighting Style :', (
                        <InlineCockField
                            cockId={cock.id}
                            cockCode={cock.code}
                            cockStatus={cock.status}
                            field="fighting_style"
                            value={cock.fighting_style?.name ?? ''}
                            onCritical={fireCritical}
                        />
                    ))}
                    {labelValue('Cock Stats :', stats)}
                </div>

                <div className="mt-3">
                    <div className="flex gap-2">
                        {['WHITE', 'RED'].map((c) => {
                            const disabled = !isAllowedColor(c);
                            const active = String(selectedColor) === String(c);
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    aria-label={c}
                                    className={colorButtonClass(active, disabled)}
                                    disabled={disabled}
                                    onClick={() => {
                                        if (disabled) return;
                                        onChangeColor(c);
                                    }}
                                >
                                    <span className={colorSwatchClass(c)} />
                                    {active ? (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className={`h-6 w-6 ${checkClass(c)}`}
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const wizardSteps = useMemo(
        () => [
            { key: 'event', label: 'Create Event' },
            { key: 'matchmaking', label: 'Create Matchmaking' },
            { key: 'schedule', label: 'Fight No & Schedule' },
            { key: 'ready', label: 'Match Ready' },
        ],
        [],
    );

    const canGoWizardStep = (nextStep) => {
        if (nextStep <= 0) return true;
        if (nextStep === 1) return !!wizardEventId;
        if (nextStep === 2) {
            return (
                !!wizardEventId &&
                !!wizardCock1Id &&
                !!wizardCock2Id &&
                !!wizardCock1Color &&
                !!wizardCock2Color
            );
        }
        if (nextStep === 3) {
            return (
                !!wizardEventId &&
                !!wizardCock1Id &&
                !!wizardCock2Id &&
                !!wizardCock1Color &&
                !!wizardCock2Color &&
                String(wizardFightNo).trim() !== ''
            );
        }
        return true;
    };

    const validateWizardMatchmaking = () => {
        if (!wizardEventId) {
            fireCritical('Select an event first.');
            return false;
        }

        if (!selectedCock1 || !selectedCock2) {
            fireCritical('Select Cock 1 and Cock 2 first.');
            return false;
        }

        const missing = [];

        const has = (v) => String(v ?? '').trim() !== '';
        const needsCock = (cock, labelPrefix) => {
            if (!has(cock.cock_name)) missing.push(`${labelPrefix}: Cock Name`);
            if (!has(cock.cock_entry_number)) missing.push(`${labelPrefix}: Cock Entry No`);
            if (!has(cock.cock_stand)) missing.push(`${labelPrefix}: Cock Stand`);
            if (!has(cock.breed)) missing.push(`${labelPrefix}: Cock Breed`);
            if (!has(cock.color)) missing.push(`${labelPrefix}: Cock Color`);
            if (!has(cock.weight)) missing.push(`${labelPrefix}: Cock Weight`);
            if (!has(cock.hatch_date)) missing.push(`${labelPrefix}: Cock Age`);
            if (!has(cock?.fighting_style?.name)) missing.push(`${labelPrefix}: Cock Fighting Style`);
        };

        needsCock(selectedCock1, 'Cock 1');
        needsCock(selectedCock2, 'Cock 2');

        if (!wizardCock1Color || !wizardCock2Color) {
            missing.push('Corner Colors (RED/WHITE)');
        }

        if (missing.length) {
            fireCritical(`Incomplete information:\n\n${missing.join('\n')}`);
            return false;
        }

        const stand1 = String(selectedCock1.cock_stand ?? '').trim().toLowerCase();
        const stand2 = String(selectedCock2.cock_stand ?? '').trim().toLowerCase();
        if (stand1 && stand2 && stand1 === stand2) {
            fireCritical('Same Cock Stand is not allowed to fight each other.');
            return false;
        }

        const p1 = selectedCock1.player_id ? String(selectedCock1.player_id) : '';
        const p2 = selectedCock2.player_id ? String(selectedCock2.player_id) : '';
        if (p1 && p2 && p1 === p2) {
            fireCritical('Same Player is not allowed to fight each other.');
            return false;
        }

        return true;
    };

    const submitWizardMatch = () => {
        if (wizardSubmitting) return;
        if (!wizardEventId) return;
        const fightNo = Number(wizardFightNo);
        if (!Number.isFinite(fightNo) || fightNo < 0) return;

        setWizardSubmitting(true);
        router.post(
            route('matches.store'),
            {
                event_id: Number(wizardEventId),
                cock1_id: wizardCock1Id ? Number(wizardCock1Id) : null,
                cock2_id: wizardCock2Id ? Number(wizardCock2Id) : null,
                cock1_color: wizardCock1Color || null,
                cock2_color: wizardCock2Color || null,
                fight_number: fightNo,
                schedule_time: wizardScheduleTime || null,
                status: 'pending',
            },
            {
                preserveScroll: true,
                onFinish: () => setWizardSubmitting(false),
                onSuccess: () => {
                    setWizardStep(0);
                    setWizardEventId('');
                    setWizardCock1Id('');
                    setWizardCock1Search('');
                    setWizardCock1Color('');
                    setWizardCock2Id('');
                    setWizardCock2Search('');
                    setWizardCock2Color('');
                    setWizardFightNo('1');
                    setWizardScheduleTime('');
                },
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Game Management" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card className="mb-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="text-xl font-semibold text-[var(--text-primary)]">
                                    Game Management
                                </div>
                                <div className="text-sm text-[var(--text-muted)]">
                                    Manage games and create matches
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                                <Button
                                    type="button"
                                    onClick={openCreateGame}
                                    disabled={!canCreateGame}
                                >
                                    Create New Game
                                </Button>
                                {canCreateMatch ? (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={openCreateMatch}
                                        disabled={!canCreateMatch}
                                    >
                                        Create New Match
                                    </Button>
                                ) : (
                                    <div title="Missing permission: matches.create">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={openCreateMatch}
                                            disabled={!canCreateMatch}
                                        >
                                            Create New Match
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="mb-4">
                        <div className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Cockpit</div>

                        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <table className="w-full table-fixed text-left text-sm text-[var(--text-secondary)]">
                                <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                                    <tr>
                                        <th className="w-[160px] p-3 font-medium">Actions</th>
                                        <th className="w-[190px] p-3 font-medium">
                                            <button
                                                type="button"
                                                className="font-medium hover:underline"
                                                onClick={() =>
                                                    setFightDateSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                                                }
                                            >
                                                Fight Date &amp; Time
                                            </button>
                                        </th>
                                        <th className="w-[180px] p-3 font-medium">Event Name</th>
                                        <th className="w-[260px] p-3 font-medium">Location / Details</th>
                                        <th className="w-[90px] p-3 font-medium">Fight No</th>
                                        <th className="w-[260px] p-3 font-medium">Cock 1</th>
                                        <th className="w-[260px] p-3 font-medium">Cock 2</th>
                                        <th className="w-[190px] p-3 font-medium">Draw</th>
                                        <th className="w-[110px] p-3 font-medium">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {cockpitMatches.map((m) => {
                                        const isOngoing = String(m.status ?? '').toLowerCase() === 'ongoing';
                                        const g = gamesById.get(Number(m.event_id));
                                        const scheduleLabel = m.schedule_time
                                            ? String(m.schedule_time).replace('T', ' ').slice(0, 16)
                                            : '-';

                                        const emptyBetters = 0;
                                        const emptyBets = 0;

                                        return (
                                            <tr
                                                key={m.id}
                                                className={`border-t border-[var(--border)] ${
                                                    isOngoing
                                                        ? 'bg-red-600/20'
                                                        : 'hover:bg-[var(--bg-tertiary)]'
                                                }`}
                                            >
                                                <td className="p-3 align-top">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            disabled={!canUpdateMatch}
                                                            onClick={() => setMatchStatus(m, 'ongoing')}
                                                        >
                                                            Play
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            disabled={!canUpdateMatch}
                                                            onClick={() => setMatchStatus(m, 'done')}
                                                        >
                                                            Stop
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={!canUpdateMatch}
                                                            onClick={() => openEditMatch(m)}
                                                        >
                                                            Update
                                                        </Button>
                                                    </div>
                                                </td>

                                                <td className="p-3 align-top">{scheduleLabel}</td>

                                                <td className="p-3 align-top">
                                                    <div className="font-semibold text-[var(--text-primary)]">
                                                        {g?.name ?? `Event #${m.event_id ?? '-'}`}
                                                    </div>
                                                </td>

                                                <td className="p-3 align-top">
                                                    <div className="font-semibold text-[var(--text-primary)]">
                                                        {g?.location ?? '-'}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-muted)]">
                                                        {g?.details1 ?? '-'}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-muted)]">
                                                        {g?.details2 ?? '-'}
                                                    </div>
                                                </td>

                                                <td className="p-3 align-top">{m.fight_number ?? '-'}</td>

                                                <td className="p-3 align-top">
                                                    {renderCockpitCockCell(m.cock1, m.cock1_color, emptyBetters, emptyBets)}
                                                </td>

                                                <td className="p-3 align-top">
                                                    {renderCockpitCockCell(m.cock2, m.cock2_color, emptyBetters, emptyBets)}
                                                </td>

                                                <td className="p-3 align-top">
                                                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                                                        <div>Betters: {emptyBetters}</div>
                                                        <div>Total: ₱{emptyBets}</div>
                                                    </div>
                                                </td>

                                                <td className="p-3 align-top">{m.status ?? '-'}</td>
                                            </tr>
                                        );
                                    })}

                                    {!cockpitMatches.length && (
                                        <tr>
                                            <td className="p-3 text-sm text-[var(--text-muted)]" colSpan={9}>
                                                No matches found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="mb-4">
                        <div className="flex flex-col gap-4">
                            <div>
                                <div className="text-lg font-semibold text-[var(--text-primary)]">
                                    Match Setup Wizard
                                </div>
                                <div className="text-sm text-[var(--text-muted)]">
                                    Complete each step to prepare a match.
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <div className="min-w-[620px]">
                                    <div className="grid grid-cols-4 gap-2">
                                        {wizardSteps.map((s, idx) => {
                                            const isActive = wizardStep === idx;
                                            const isDone = wizardStep > idx;
                                            const enabled = canGoWizardStep(idx);

                                            return (
                                                <button
                                                    key={s.key}
                                                    type="button"
                                                    disabled={!enabled}
                                                    onClick={() => enabled && setWizardStep(idx)}
                                                    className={
                                                        'rounded-xl border px-3 py-3 text-left transition ' +
                                                        (isActive
                                                            ? 'border-[var(--accent)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                                            : isDone
                                                              ? 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                                                              : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]') +
                                                        (!enabled ? ' opacity-60' : '')
                                                    }
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="text-xs font-semibold uppercase tracking-wide">
                                                            Step {idx + 1}
                                                        </div>
                                                        <div
                                                            className={
                                                                'h-2.5 w-2.5 rounded-full ' +
                                                                (isDone
                                                                    ? 'bg-[var(--accent)]'
                                                                    : isActive
                                                                      ? 'bg-[var(--accent)]'
                                                                      : 'bg-[var(--border)]')
                                                            }
                                                        />
                                                    </div>
                                                    <div className="mt-1 font-semibold">{s.label}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                                <Transition
                                    show={wizardStep === 0}
                                    appear
                                    enter="transition ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <div className="space-y-4">
                                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                                            Create Event
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label>Select Existing Event (optional)</Label>
                                                <Select
                                                    value={wizardEventId}
                                                    onChange={(e) => setWizardEventId(e.target.value)}
                                                    options={gameOptions}
                                                />
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={openCreateGame}
                                                    disabled={!canCreateGame}
                                                >
                                                    Create New Event
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => canGoWizardStep(1) && setWizardStep(1)}
                                                    disabled={!canGoWizardStep(1)}
                                                    title={!canGoWizardStep(1) ? 'Select an event first' : ''}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Transition>

                                <Transition
                                    show={wizardStep === 1}
                                    appear
                                    enter="transition ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <div className="space-y-4">
                                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                                            Create Matchmaking
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label>Cock 1</Label>
                                                <Input
                                                    value={wizardCock1Search}
                                                    onChange={(e) => {
                                                        const next = e.target.value;
                                                        const match = cockOptions1.find(
                                                            (c) => c.name.toLowerCase() === String(next).toLowerCase(),
                                                        );

                                                        setWizardCock1Search(next);

                                                        if (!match) {
                                                            setWizardCock1Id('');
                                                            return;
                                                        }

                                                        if (String(match.id) === String(wizardCock2Id)) {
                                                            return;
                                                        }

                                                        setWizardCock1Id(String(match.id));
                                                    }}
                                                    list="wizard-cocks-1"
                                                    placeholder="Type to search and select"
                                                />
                                                <datalist id="wizard-cocks-1">
                                                    {cockOptions1.map((c) => (
                                                        <option key={c.id} value={c.name} />
                                                    ))}
                                                </datalist>
                                                <CockDetails
                                                    cock={selectedCock1}
                                                    selectedColor={wizardCock1Color}
                                                    colorOptions={cock1ColorOptions}
                                                    onChangeColor={(next) => {
                                                        const value = String(next ?? '').toUpperCase();
                                                        if (value !== 'WHITE' && value !== 'RED') return;
                                                        if (String(wizardCock1Color) === String(value)) {
                                                            setWizardCock1Color('');
                                                            setWizardCock2Color('');
                                                            return;
                                                        }
                                                        setWizardCock1Color(value);
                                                        setWizardCock2Color(oppositeCornerColor(value));
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>Cock 2</Label>
                                                <Input
                                                    value={wizardCock2Search}
                                                    onChange={(e) => {
                                                        const next = e.target.value;
                                                        const match = cockOptions2.find(
                                                            (c) => c.name.toLowerCase() === String(next).toLowerCase(),
                                                        );

                                                        setWizardCock2Search(next);

                                                        if (!match) {
                                                            setWizardCock2Id('');
                                                            return;
                                                        }

                                                        if (String(match.id) === String(wizardCock1Id)) {
                                                            return;
                                                        }

                                                        setWizardCock2Id(String(match.id));
                                                    }}
                                                    list="wizard-cocks-2"
                                                    placeholder="Type to search and select"
                                                />
                                                <datalist id="wizard-cocks-2">
                                                    {cockOptions2.map((c) => (
                                                        <option key={c.id} value={c.name} />
                                                    ))}
                                                </datalist>
                                                <CockDetails
                                                    cock={selectedCock2}
                                                    selectedColor={wizardCock2Color}
                                                    colorOptions={cock2ColorOptions}
                                                    onChangeColor={(next) => {
                                                        const value = String(next ?? '').toUpperCase();
                                                        if (value !== 'WHITE' && value !== 'RED') return;
                                                        if (String(wizardCock2Color) === String(value)) {
                                                            setWizardCock1Color('');
                                                            setWizardCock2Color('');
                                                            return;
                                                        }
                                                        setWizardCock2Color(value);
                                                        setWizardCock1Color(oppositeCornerColor(value));
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                            <Button type="button" variant="secondary" onClick={() => setWizardStep(0)}>
                                                Back
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    if (!validateWizardMatchmaking()) return;
                                                    setWizardStep(2);
                                                }}
                                                disabled={!wizardEventId || !wizardCock1Id || !wizardCock2Id}
                                                title={
                                                    !wizardEventId
                                                        ? 'Select an event first'
                                                        : !wizardCock1Id || !wizardCock2Id
                                                          ? 'Select Cock 1 and Cock 2'
                                                          : ''
                                                }
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </Transition>

                                <Transition
                                    show={wizardStep === 2}
                                    appear
                                    enter="transition ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <div className="space-y-4">
                                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                                            Fight No &amp; Schedule
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div>
                                                <Label>Event</Label>
                                                <Select
                                                    value={wizardEventId}
                                                    onChange={(e) => setWizardEventId(e.target.value)}
                                                    options={gameOptions}
                                                />
                                            </div>
                                            <div>
                                                <Label>Fight No</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={wizardFightNo}
                                                    onChange={(e) => setWizardFightNo(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label>Schedule</Label>
                                                <Input
                                                    type="datetime-local"
                                                    value={wizardScheduleTime}
                                                    onChange={(e) => setWizardScheduleTime(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                            <Button type="button" variant="secondary" onClick={() => setWizardStep(1)}>
                                                Back
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => canGoWizardStep(3) && setWizardStep(3)}
                                                disabled={!canGoWizardStep(3)}
                                                title={!canGoWizardStep(3) ? 'Enter fight number first' : ''}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </Transition>

                                <Transition
                                    show={wizardStep === 3}
                                    appear
                                    enter="transition ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <div className="space-y-4">
                                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                                            Match Ready
                                        </div>

                                        {(() => {
                                            const gg = gamesById.get(Number(wizardEventId)) ?? null;
                                            const eventName = gg?.name ?? `Event #${wizardEventId || '-'}`;
                                            const location = gg?.location ?? '-';
                                            const details1 = gg?.details1 ?? '-';
                                            const details2 = gg?.details2 ?? '-';
                                            const fightSchedule = wizardScheduleTime
                                                ? String(wizardScheduleTime).replace('T', ' ')
                                                : '-';
                                            const fightLabel = `Fight #${wizardFightNo || '-'}`;

                                            const cockLabelValue = (label, value) => (
                                                <>
                                                    <div className="text-xs text-[var(--text-muted)]">{label}</div>
                                                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                                                        {value}
                                                    </div>
                                                </>
                                            );

                                            const ReadyCockPanel = ({ cock, cornerColor }) => {
                                                if (!cock) return null;
                                                const hatchDateLabel = cock.hatch_date
                                                    ? String(cock.hatch_date).slice(0, 10)
                                                    : '-';
                                                const ageLabel = formatAgeYearsMonths(cock.hatch_date);
                                                const stats = `W - ${cock.wins ?? 0}   D - ${cock.draws ?? 0}   L - ${cock.losses ?? 0}`;

                                                const swatch = String(cornerColor ?? '').toUpperCase() === 'RED'
                                                    ? 'bg-red-600'
                                                    : 'bg-white border border-[var(--border)]';

                                                return (
                                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                                                        <div className="mb-3 flex items-center gap-3">
                                                            <div className={`h-12 w-12 rounded-lg ${swatch}`} />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                                            {cockLabelValue('Cock Name', cock.cock_name ?? '-')}
                                                            {cockLabelValue('Cock Entry No :', cock.cock_entry_number ?? '-')}
                                                            {cockLabelValue('Cock Alias', cock.cock_alias ?? '-')}
                                                            {cockLabelValue('Cock Stand / Team :', cock.cock_stand ?? '-')}
                                                            {cockLabelValue('Cock Breed :', cock.breed ?? '-')}
                                                            {cockLabelValue('Cock Color :', cock.color ?? '-')}
                                                            {cockLabelValue('Cock Weight :', cock.weight ?? '-')}
                                                            {cockLabelValue('Cock Height :', cock.height ?? '-')}
                                                            {cockLabelValue('Cock Age :', ageLabel)}
                                                            {cockLabelValue('Cock Hatch Date :', hatchDateLabel)}
                                                            {cockLabelValue('Cock Fighting Style :', cock.fighting_style?.name ?? '-')}
                                                            {cockLabelValue('Cock Stats :', stats)}
                                                        </div>
                                                    </div>
                                                );
                                            };

                                            return (
                                                <div className="space-y-6">
                                                    <div className="space-y-2 text-center">
                                                        <div className="text-[58px] font-bold leading-none text-[var(--text-primary)]">
                                                            {eventName}
                                                        </div>
                                                        <div className="text-[38px] font-bold leading-tight text-[var(--text-primary)]">
                                                            {location}
                                                        </div>
                                                        <div className="text-[28px] font-bold leading-tight text-[var(--text-primary)]">
                                                            {details1}
                                                        </div>
                                                        <div className="text-[28px] leading-tight text-[var(--text-primary)]">
                                                            {details2}
                                                        </div>
                                                        <div className="text-[28px] font-bold leading-tight text-[#C05800]">
                                                            {fightSchedule}
                                                        </div>
                                                        <div className="text-[58px] font-bold leading-none text-[#D4DE95]">
                                                            {fightLabel}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <ReadyCockPanel
                                                            cock={selectedCock1}
                                                            cornerColor={wizardCock1Color}
                                                        />
                                                        <ReadyCockPanel
                                                            cock={selectedCock2}
                                                            cornerColor={wizardCock2Color}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                            <Button type="button" variant="secondary" onClick={() => setWizardStep(2)}>
                                                Back
                                            </Button>
                                            <Button
                                                type="button"
                                                disabled={!canCreateMatch || wizardSubmitting || !wizardEventId}
                                                onClick={submitWizardMatch}
                                            >
                                                {wizardSubmitting ? 'Creating...' : 'Create Match'}
                                            </Button>
                                        </div>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </Card>



                </div>
            </div>

            <Offcanvas show={offcanvas.open} onClose={closeOffcanvas}>
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
                                <div className="text-lg font-semibold">
                                    {offcanvas.type === 'game'
                                        ? editingGameId
                                            ? 'Edit Game'
                                            : 'Create New Game'
                                        : 'Create New Match'}
                                </div>
                                <Button type="button" variant="secondary" onClick={closeOffcanvas}>
                                    Close
                                </Button>
                    </div>

                            {offcanvas.type === 'game' ? (
                                <form onSubmit={submitGame} className="flex-1 overflow-hidden p-4">
                                    <div className="flex h-full flex-col">
                                        <div className="flex-1 overflow-y-auto pr-1">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Derby Name</Label>
                                                    <Input
                                                        value={gameForm.name}
                                                        onChange={(e) =>
                                                            setGameForm((f) => ({ ...f, name: e.target.value }))
                                                        }
                                                    />
                                                    {errors?.name && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.name}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Location</Label>
                                                    <Input
                                                        value={gameForm.location}
                                                        onChange={(e) =>
                                                            setGameForm((f) => ({
                                                                ...f,
                                                                location: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                    {errors?.location && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.location}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={gameForm.date}
                                                        onChange={(e) =>
                                                            setGameForm((f) => ({
                                                                ...f,
                                                                date: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                    {errors?.date && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.date}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Details 1</Label>
                                                    <Input
                                                        value={gameForm.details1}
                                                        onChange={(e) =>
                                                            setGameForm((f) => ({
                                                                ...f,
                                                                details1: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                    {errors?.details1 && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.details1}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Details 2</Label>
                                                    <Input
                                                        value={gameForm.details2}
                                                        onChange={(e) =>
                                                            setGameForm((f) => ({
                                                                ...f,
                                                                details2: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                    {errors?.details2 && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.details2}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={closeOffcanvas}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={busy}>
                                                {busy ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>

                                        <div className="mt-6 flex-1 min-h-0 border-t border-[var(--border)] pt-4">
                                            <div className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                                                Games List
                                            </div>

                                            <div className="mb-3 flex items-center gap-2">
                                                <Input
                                                    value={offcanvasGameSearch}
                                                    onChange={(e) => setOffcanvasGameSearch(e.target.value)}
                                                    placeholder="Search games"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setOffcanvasGameSearch('')}
                                                >
                                                    Clear
                                                </Button>
                                            </div>

                                            <div className="min-h-0 overflow-y-auto scroll-smooth pb-[10px]">
                                                <Table
                                                    columns={['Derby Name', 'Date', 'Actions']}
                                                    data={filteredGamesForOffcanvas.map((g) => ({
                                                        name: g.name ?? '-',
                                                        date: g.date
                                                            ? String(g.date).slice(0, 10)
                                                            : '-',
                                                        actions: (
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                                                onClick={(e) => {
                                                                    const rect =
                                                                        e.currentTarget.getBoundingClientRect();
                                                                    setOpenGameActionMenu((prev) => {
                                                                        if (prev?.id === g.id) return null;

                                                                        const width = 140;
                                                                        const left = Math.max(
                                                                            8,
                                                                            rect.right - width,
                                                                        );
                                                                        const top = rect.bottom + 8;
                                                                        return { id: g.id, top, left, width };
                                                                    });
                                                                }}
                                                                aria-label="Actions"
                                                            >
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="block h-0.5 w-4 bg-current" />
                                                                    <span className="block h-0.5 w-4 bg-current" />
                                                                    <span className="block h-0.5 w-4 bg-current" />
                                                                </div>
                                                            </button>
                                                        ),
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        {openGameActionMenu && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="fixed inset-0 z-40 cursor-default"
                                                    onClick={() => setOpenGameActionMenu(null)}
                                                    aria-label="Close menu"
                                                />
                                                <div
                                                    className="fixed z-50 origin-top-right overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg transition duration-150 ease-out"
                                                    style={{
                                                        top: openGameActionMenu.top,
                                                        left: openGameActionMenu.left,
                                                        width: openGameActionMenu.width,
                                                    }}
                                                >
                                                    {canUpdateGame && (
                                                        <button
                                                            type="button"
                                                            className="block w-full px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                                                            onClick={() => {
                                                                const gg = gamesData.find(
                                                                    (x) => x.id === openGameActionMenu.id,
                                                                );
                                                                setOpenGameActionMenu(null);
                                                                if (gg) openEditGame(gg);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {canDeleteGame && (
                                                        <button
                                                            type="button"
                                                            className="block w-full px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--bg-tertiary)]"
                                                            onClick={() => {
                                                                const gg = gamesData.find(
                                                                    (x) => x.id === openGameActionMenu.id,
                                                                );
                                                                setOpenGameActionMenu(null);
                                                                if (gg) doDeleteGame(gg);
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={submitMatch} className="flex-1 overflow-hidden p-4">
                                    <div className="flex h-full flex-col">
                                        <div className="flex-1 overflow-y-auto pr-1">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Event</Label>
                                                    <Select
                                                        value={matchForm.event_id}
                                                        onChange={(e) =>
                                                            setMatchForm((f) => ({
                                                                ...f,
                                                                event_id: e.target.value,
                                                            }))
                                                        }
                                                        options={gameOptions}
                                                    />
                                                    {errors?.event_id && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.event_id}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Location</Label>
                                                    <Input value={selectedMatchGame?.location ?? ''} disabled />
                                                </div>

                                                <div>
                                                    <Label>Fight Number</Label>
                                                    <Input
                                                        value={matchForm.fight_number}
                                                        onChange={(e) =>
                                                            setMatchForm((f) => ({
                                                                ...f,
                                                                fight_number: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                    {errors?.fight_number && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.fight_number}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Schedule Time</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={matchForm.schedule_time}
                                                        onChange={(e) =>
                                                            setMatchForm((f) => ({
                                                                ...f,
                                                                schedule_time: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                    {errors?.schedule_time && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.schedule_time}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label>Status</Label>
                                                    <Select
                                                        value={matchForm.status}
                                                        onChange={(e) =>
                                                            setMatchForm((f) => ({
                                                                ...f,
                                                                status: e.target.value,
                                                            }))
                                                        }
                                                        options={statusOptions}
                                                    />
                                                    {errors?.status && (
                                                        <div className="mt-1 text-sm text-[var(--danger)]">
                                                            {errors.status}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-2">
                                            <Button type="button" variant="secondary" onClick={closeOffcanvas}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={busy}>
                                                {busy ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>

                                        <div className="mt-6 flex-1 min-h-0 border-t border-[var(--border)] pt-4">
                                            <div className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                                                Matches List
                                            </div>

                                            <div className="mb-3 flex items-center gap-2">
                                                <Input
                                                    value={offcanvasMatchSearch}
                                                    onChange={(e) => setOffcanvasMatchSearch(e.target.value)}
                                                    placeholder="Search matches"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setOffcanvasMatchSearch('')}
                                                >
                                                    Clear
                                                </Button>
                                            </div>

                                            <div className="min-h-0 overflow-y-auto scroll-smooth pb-[10px]">
                                                <Table
                                                    columns={['Event ID', 'Fight #', 'Schedule Time', 'Status', 'Actions']}
                                                    data={filteredMatchesForOffcanvas.map((m) => ({
                                                        event_id: m.event_id ?? '-',
                                                        fight_number: m.fight_number ?? '-',
                                                        schedule_time: m.schedule_time
                                                            ? String(m.schedule_time)
                                                                  .replace('T', ' ')
                                                                  .slice(0, 16)
                                                            : '-',
                                                        status: m.status ?? '-',
                                                        actions: (
                                                            <button
                                                                type="button"
                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                                                                onClick={(e) => {
                                                                    const rect =
                                                                        e.currentTarget.getBoundingClientRect();
                                                                    setOpenMatchActionMenu((prev) => {
                                                                        if (prev?.id === m.id) return null;
                                                                        const width = 140;
                                                                        const left = Math.max(
                                                                            8,
                                                                            rect.right - width,
                                                                        );
                                                                        const top = rect.bottom + 8;
                                                                        return { id: m.id, top, left, width };
                                                                    });
                                                                }}
                                                                aria-label="Actions"
                                                            >
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="block h-0.5 w-4 bg-current" />
                                                                    <span className="block h-0.5 w-4 bg-current" />
                                                                    <span className="block h-0.5 w-4 bg-current" />
                                                                </div>
                                                            </button>
                                                        ),
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        {openMatchActionMenu && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="fixed inset-0 z-40 cursor-default"
                                                    onClick={() => setOpenMatchActionMenu(null)}
                                                    aria-label="Close menu"
                                                />
                                                <div
                                                    className="fixed z-50 origin-top-right overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg transition duration-150 ease-out"
                                                    style={{
                                                        top: openMatchActionMenu.top,
                                                        left: openMatchActionMenu.left,
                                                        width: openMatchActionMenu.width,
                                                    }}
                                                >
                                                    {canUpdateMatch && (
                                                        <button
                                                            type="button"
                                                            className="block w-full px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                                                            onClick={() => {
                                                                const mm = matchesData.find(
                                                                    (x) => x.id === openMatchActionMenu.id,
                                                                );
                                                                setOpenMatchActionMenu(null);
                                                                if (mm) openEditMatch(mm);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {canDeleteMatch && (
                                                        <button
                                                            type="button"
                                                            className="block w-full px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--bg-tertiary)]"
                                                            onClick={() => {
                                                                const mm = matchesData.find(
                                                                    (x) => x.id === openMatchActionMenu.id,
                                                                );
                                                                setOpenMatchActionMenu(null);
                                                                if (mm) doDeleteMatch(mm);
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </form>
                            )}
                </div>
            </Offcanvas>
        </AuthenticatedLayout>
    );
}
