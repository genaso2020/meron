export function Table({ columns = [], data = [], className = '' }) {
    return (
        <div
            className={`overflow-x-auto bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] ${className}`}
        >
            <table className="w-full text-sm text-left text-[var(--text-secondary)]">
                <thead className="bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                    <tr>
                        {columns.map((col) => (
                            <th key={col} className="p-3 font-medium">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={i}
                            className="border-t border-[var(--border)] hover:bg-[var(--bg-tertiary)]"
                        >
                            {Object.values(row).map((cell, idx) => (
                                <td key={idx} className="p-3">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
