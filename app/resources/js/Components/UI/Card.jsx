export function Card({ children, className = '' }) {
    return (
        <div
            className={`bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-4 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}
