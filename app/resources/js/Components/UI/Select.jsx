export function Select({ options = [], className = '', ...props }) {
    return (
        <select
            {...props}
            className={`w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}
