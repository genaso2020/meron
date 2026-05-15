import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/Components/UI/Card';

export default function RbacMatrixSettings({ auth, roles = [], permissions = [], matrix = {} }) {
    const hasPermission = (roleId, permissionId) => {
        const rolePerms = matrix?.[String(roleId)] ?? [];
        return rolePerms.map(Number).includes(Number(permissionId));
    };

    const toggle = (roleId, permissionId, enabled) => {
        router.post(
            route('settings.rbac_matrix.toggle'),
            {
                role_id: roleId,
                permission_id: permissionId,
                enabled,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({
                        only: ['matrix'],
                        preserveScroll: true,
                        preserveState: true,
                    });
                },
            },
        );
    };

    const sortedRoles = [...roles].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const sortedPermissions = [...permissions].sort((a, b) => {
        const cat = (a.category || '').localeCompare(b.category || '');
        if (cat !== 0) return cat;
        const so = (a.sort_order ?? 0) - (b.sort_order ?? 0);
        if (so !== 0) return so;
        return (a.name || '').localeCompare(b.name || '');
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-[var(--text-primary)]">
                    RBAC Matrix
                </h2>
            }
        >
            <Head title="RBAC Matrix" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="p-0">
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-sm text-left">
                                    <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                                        <tr>
                                            <th className="sticky left-0 z-10 bg-[var(--bg-tertiary)] border-b border-[var(--border)] px-3 py-2 text-left text-sm font-semibold">
                                                Permission / Role
                                            </th>
                                            {sortedRoles.map((role) => (
                                                <th
                                                    key={role.id}
                                                    className="border-b border-[var(--border)] px-3 py-2 text-left text-sm font-semibold whitespace-nowrap"
                                                >
                                                    {role.label || role.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-[var(--text-secondary)]">
                                        {sortedPermissions.map((permission) => (
                                            <tr
                                                key={permission.id}
                                                className="border-t border-[var(--border)] hover:bg-[var(--bg-tertiary)]"
                                            >
                                                <td className="sticky left-0 z-10 bg-[var(--bg-secondary)] px-3 py-2 whitespace-nowrap">
                                                    <div className="font-medium text-[var(--text-primary)]">
                                                        {permission.label || permission.name}
                                                    </div>
                                                    <div className="text-xs text-[var(--text-muted)]">
                                                        {permission.category || 'uncategorized'}
                                                    </div>
                                                </td>

                                                {sortedRoles.map((role) => {
                                                    const checked = hasPermission(role.id, permission.id);
                                                    return (
                                                        <td
                                                            key={`${permission.id}:${role.id}`}
                                                            className="px-3 py-2"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 accent-[var(--accent)] cursor-pointer"
                                                                checked={checked}
                                                                onChange={(e) =>
                                                                    toggle(
                                                                        role.id,
                                                                        permission.id,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
