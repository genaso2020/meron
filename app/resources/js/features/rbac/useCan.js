import { useAuthzStore } from '@/stores/authzStore';

export function useCan() {
    const hasPermission = useAuthzStore((s) => s.hasPermission);
    const hasRole = useAuthzStore((s) => s.hasRole);

    return {
        hasPermission,
        hasRole,
    };
}
