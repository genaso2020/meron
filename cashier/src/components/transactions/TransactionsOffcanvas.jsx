import { useEffect, useRef, useState } from 'react';

function money(n) {
  const v = Number(n ?? 0);
  return `₱${(Number.isFinite(v) ? v : 0).toLocaleString()}`;
}

export default function TransactionsOffcanvas({ open, onRequestClose, onClosed, items }) {
  const [closing, setClosing] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (open) {
      setClosing(false);
      return;
    }
    setClosing(true);
    const t = setTimeout(() => onClosed?.(), 220);
    return () => clearTimeout(t);
  }, [open, onClosed]);

  function requestClose() {
    if (closing) return;
    onRequestClose?.();
  }

  return (
    <div
      className={`offcanvas-overlay ${open && !closing ? 'is-open' : ''} ${closing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      onMouseDown={requestClose}
    >
      <div
        className={`offcanvas-panel right ${open && !closing ? 'is-open' : ''} ${closing ? 'is-closing' : ''}`}
        ref={panelRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="offcanvas-header">
          <div className="offcanvas-title">Last 5 Transactions</div>
          <button className="offcanvas-close" type="button" onClick={requestClose}>
            CLOSE
          </button>
        </div>

        <div className="tx-list">
          {items?.length ? null : <div className="tx-empty">No transactions yet</div>}

          {items?.map((t) => (
            <div className="tx-card" key={t.id}>
              <div className="tx-row"><div className="tx-k">Bet ID/Ticket</div><div className="tx-v">{t.ticketId}</div></div>
              <div className="tx-row"><div className="tx-k">Trans Type</div><div className="tx-v">{t.transType}</div></div>
              <div className="tx-row"><div className="tx-k">Fight</div><div className="tx-v">{t.fightNo}</div></div>

              {t.transType === 'Payout' ? (
                <>
                  <div className="tx-row"><div className="tx-k">Winning Side</div><div className="tx-v">{t.winningSide}</div></div>
                  <div className="tx-row"><div className="tx-k">Bet Amount</div><div className="tx-v">{money(t.betAmount)}</div></div>
                  <div className="tx-row"><div className="tx-k">Odds</div><div className="tx-v">{t.odds}</div></div>
                  <div className="tx-row"><div className="tx-k">Payout Amount</div><div className="tx-v">{money(t.payoutAmount)}</div></div>
                  <div className="tx-row"><div className="tx-k">Payment Type</div><div className="tx-v">{t.paymentType}</div></div>
                </>
              ) : (
                <>
                  <div className="tx-row"><div className="tx-k">Side</div><div className="tx-v">{t.side}</div></div>
                  <div className="tx-row"><div className="tx-k">Amount</div><div className="tx-v">{money(t.amount)}</div></div>
                  <div className="tx-row"><div className="tx-k">Paid Amount</div><div className="tx-v">{money(t.paidAmount)}</div></div>
                  <div className="tx-row"><div className="tx-k">Change</div><div className="tx-v">{money(t.changeAmount)}</div></div>
                  <div className="tx-row"><div className="tx-k">Payment Type</div><div className="tx-v">{t.paymentType}</div></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
