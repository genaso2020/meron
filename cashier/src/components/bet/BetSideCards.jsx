const sideMeta = {
  MERON: { className: 'side-meron', label: 'MERON' },
  DRAW: { className: 'side-draw', label: 'DRAW' },
  WALA: { className: 'side-wala', label: 'WALA' }
};

export default function BetSideCards({ side, onSideChange, odds }) {
  return (
    <div className="side-row">
      {Object.keys(sideMeta).map((k) => {
        const meta = sideMeta[k];
        const selected = side === k;
        return (
          <button
            key={k}
            className={`side-card ${meta.className} ${selected ? 'selected' : ''}`}
            onClick={() => onSideChange(k)}
          >
            <div className="side-label">{meta.label}</div>
            <div className="side-odds">Win: {odds ? `${odds[k].toFixed(2)}x` : '--'}</div>
          </button>
        );
      })}
    </div>
  );
}
