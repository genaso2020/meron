import { create } from 'zustand';

export const useAuthzStore = create((set, get) => ({
    role: null,
    permissions: [],
    setAuthz: ({ role = null, permissions = [] } = {}) => set({ role, permissions }),
    hasRole: (role) => get().role === role,
    hasPermission: (permission) => get().permissions.includes(permission),
}));
