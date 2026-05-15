export function Button({ children, variant = 'primary', className = '', ...props }) {
    const base =
        'px-4 py-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

    const styles = {
        primary:
            'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white',
        secondary:
            'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]',
        outline:
            'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]',
        danger: 'bg-[var(--danger)] hover:opacity-90 text-white',
    };

    return (
        <button className={`${base} ${styles[variant] ?? styles.primary} ${className}`} {...props}>
            {children}
        </button>
    );
}
