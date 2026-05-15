export function Label({ children, className = '' }) {
    return <label className={`text-[var(--text-muted)] text-sm ${className}`}>{children}</label>;
}
