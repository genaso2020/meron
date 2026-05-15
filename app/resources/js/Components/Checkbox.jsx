export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-[var(--border)] text-[var(--accent)] shadow-sm focus:ring-[var(--accent)] ' +
                className
            }
        />
    );
}
