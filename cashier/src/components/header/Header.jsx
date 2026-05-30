export default function Header({ fight, limits, amount }) {
  return (
    <div className="header">
      <div className="amount-display">
        <div className="amount-big">{amount ? amount.toLocaleString() : 0}</div>
      </div>

      <div className="limits-row">
        <div className="limit">
          <div className="limit-value">{limits ? limits.min.toLocaleString() : '--'}</div>
          <div className="limit-label">Minimum</div>
        </div>
        <div className="limit right">
          <div className="limit-value max">{limits ? limits.max.toLocaleString() : '--'}</div>
          <div className="limit-label">Maximum</div>
        </div>
      </div>

      <div className="fight-card">
        <div className="fight-datetime">{fight?.datetimeLabel ?? '--'}</div>
        <div className="fight-title">{fight?.title ?? 'Loading...'}</div>
        <div className="fight-no">Fighting No : {fight?.fightNo ?? '--'}</div>
      </div>
    </div>
  );
}
