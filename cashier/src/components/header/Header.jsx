export default function Header({ fight, limits, amount, dueAmount, paymentMode, onOpenResults, onOpenTransactions }) {
  return (
    <div className="header">
      <div className="amount-display">
        <div className={`amount-top ${paymentMode ? '' : 'is-hidden'}`}>{dueAmount ? dueAmount.toLocaleString() : 0}</div>
        <div className="amount-big">{amount ? amount.toLocaleString() : 0}</div>
      </div>

      <div className="limits-row">
        <div className="limit">
          <button className="results-toggle" type="button" onClick={onOpenTransactions} aria-label="Open transactions">
            ▶
          </button>
          <div className="limit-value">{limits ? limits.min.toLocaleString() : '--'}</div>
          <div className="limit-label">Minimum Amount</div>
        </div>
        <div className="limit right">
          <button className="results-toggle" type="button" onClick={onOpenResults} aria-label="Open results">
            ◀
          </button>
          <div className="limit-value max">{limits ? limits.max.toLocaleString() : '--'}</div>
          <div className="limit-label">Maximum Amount</div>
        </div>
      </div>
      
      <div className="fight-card">
        <div className="fight-datetime">{fight?.datetimeLabel ?? '--'}</div>
        <div className="fight-title">{fight?.title ?? 'Loading...'}</div>
        <div className="fight-no">Fighting No : {fight?.fightNo ?? '--'}</div>
        {fight?.scheduleTime ? <div className="fight-no">{fight.scheduleTime}</div> : null}
      </div>
    </div>
  );
}
