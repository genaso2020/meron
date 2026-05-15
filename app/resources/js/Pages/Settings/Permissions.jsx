import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card } from '@/Components/UI/Card';

export default function PermissionsSettings({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-[var(--text-primary)]">
                    Permissions
                </h2>
            }
        >
            <Head title="Permissions" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <div className="text-[var(--text-primary)]">Permissions Settings</div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
