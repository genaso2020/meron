import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/Components/UI/Button';
import { Card } from '@/Components/UI/Card';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';

export default function RolesSettings({ auth, roles = [] }) {
    const errors = usePage().props.errors || {};

    const [createName, setCreateName] = useState('');
    const [createLabel, setCreateLabel] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editLabel, setEditLabel] = useState('');

    const sortedRoles = useMemo(() => {
        return [...roles].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [roles]);

    const startEdit = (role) => {
        setEditingId(role.id);
        setEditName(role.name || '');
        setEditLabel(role.label || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditLabel('');
    };

    const submitCreate = (e) => {
        e.preventDefault();
        router.post(
            route('settings.roles.store'),
            { name: createName, label: createLabel },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCreateName('');
                    setCreateLabel('');
                },
            },
        );
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        if (!editingId) return;
        router.put(
            route('settings.roles.update', editingId),
            { name: editName, label: editLabel },
            {
                preserveScroll: true,
                onSuccess: () => {
                    cancelEdit();
                },
            },
        );
    };

    const submitDelete = (role) => {
        const ok = window.confirm(`Delete role "${role.name}"?`);
        if (!ok) return;
        router.delete(route('settings.roles.destroy', role.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-[var(--text-primary)]">
                    Roles
                </h2>
            }
        >
            <Head title="Roles" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        <Card>
                            <div className="text-[var(--text-primary)] text-lg font-semibold">
                                Create Role
                            </div>

                            <form onSubmit={submitCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="sm:col-span-1">
                                    <Label>Name</Label>
                                    <Input
                                        value={createName}
                                        onChange={(e) => setCreateName(e.target.value)}
                                        placeholder="Admin"
                                        required
                                    />
                                    {errors?.name && (
                                        <div className="mt-1 text-sm text-[var(--danger)]">{errors.name}</div>
                                    )}
                                </div>

                                <div className="sm:col-span-1">
                                    <Label>Label</Label>
                                    <Input
                                        value={createLabel}
                                        onChange={(e) => setCreateLabel(e.target.value)}
                                        placeholder="Administrator"
                                    />
                                    {errors?.label && (
                                        <div className="mt-1 text-sm text-[var(--danger)]">{errors.label}</div>
                                    )}
                                </div>

                                <div className="sm:col-span-1 flex items-end">
                                    <Button type="submit">Create</Button>
                                </div>
                            </form>
                        </Card>

                        <Card>
                            <div className="text-[var(--text-primary)] text-lg font-semibold">
                                Existing Roles
                            </div>

                            {errors?.roles && (
                                <div className="mt-3 text-sm text-[var(--danger)]">{errors.roles}</div>
                            )}

                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full border-collapse text-sm text-left">
                                    <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                                        <tr>
                                            <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Name</th>
                                            <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Label</th>
                                            <th className="border-b border-[var(--border)] px-3 py-2 font-semibold">Users</th>
                                            <th className="border-b border-[var(--border)] px-3 py-2 font-semibold w-40">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[var(--text-secondary)]">
                                        {sortedRoles.map((role) => {
                                            const isEditing = editingId === role.id;
                                            return (
                                                <tr
                                                    key={role.id}
                                                    className="border-t border-[var(--border)] hover:bg-[var(--bg-tertiary)]"
                                                >
                                                    <td className="px-3 py-2">
                                                        {isEditing ? (
                                                            <Input
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                required
                                                            />
                                                        ) : (
                                                            <span className="text-[var(--text-primary)] font-medium">
                                                                {role.name}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {isEditing ? (
                                                            <Input
                                                                value={editLabel}
                                                                onChange={(e) => setEditLabel(e.target.value)}
                                                            />
                                                        ) : (
                                                            <span>{role.label}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">{role.users_count ?? 0}</td>
                                                    <td className="px-3 py-2">
                                                        {isEditing ? (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    type="button"
                                                                    onClick={submitUpdate}
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    onClick={cancelEdit}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => startEdit(role)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="danger"
                                                                    onClick={() => submitDelete(role)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
