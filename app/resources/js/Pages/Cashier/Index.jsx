import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function CashierIndex({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user} header={null}>
            <Head title="Cashier" />

            <div className="h-[calc(100vh-4rem)] w-full">
                <iframe
                    title="Cashier UI"
                    src="/cashier/ui"
                    className="h-full w-full border-0"
                />
            </div>
        </AuthenticatedLayout>
    );
}
