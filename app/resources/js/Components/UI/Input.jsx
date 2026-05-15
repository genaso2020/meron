export function Input({ className = '', ...props }) {
    return (
        <input
            {...props}
            className={`w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
        />
    );
}
