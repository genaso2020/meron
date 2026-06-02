import { useEffect, useMemo, useRef, useState } from 'react';

function money(n) {
  const v = Number(n ?? 0);
  return `₱${(Number.isFinite(v) ? v : 0).toLocaleString()}`;
}

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function EndOfDayModal({
  session,
  sod,
  totals,
  onSubmit,
  onCancel
}) {
  const [openingCashText, setOpeningCashText] = useState(String(sod?.openingCash ?? ''));
  const [closingCashText, setClosingCashText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const closingRef = useRef(null);

  const closedAt = useMemo(() => new Date(), []);

  const openingCash = useMemo(() => toNumberOrNull(openingCashText) ?? 0, [openingCashText]);
  const totalClosingCash = useMemo(() => toNumberOrNull(closingCashText) ?? 0, [closingCashText]);

  const actualSales = useMemo(() => Number(totals?.sales ?? 0) || 0, [totals?.sales]);
  const winPayout = useMemo(() => Number(totals?.payout ?? 0) || 0, [totals?.payout]);

  const discrepancy = useMemo(() => {
    return (openingCash + actualSales) - (winPayout + totalClosingCash);
  }, [openingCash, actualSales, winPayout, totalClosingCash]);

  const balanced = Math.abs(discrepancy) < 0.000001;

  useEffect(() => {
    closingRef.current?.focus?.();
  }, []);

  async function submit(e) {
    e?.preventDefault?.();
    if (!balanced) {
      setError('Not Balance');
      return;
    }

    try {
      setBusy(true);
      setError(null);
      await onSubmit?.({
        cashierName: session?.tellerName,
        terminalNumber: session?.userId,
        openedAt: sod?.openedAt,
        eventName: sod?.eventName,
        fightNo: sod?.fightNo,
        openingCash,
        totalClosingCash,
        actualSales,
        winPayout,
        discrepancy,
        closedAt: closedAt.toISOString()
      });
    } catch (err) {
      setError(err?.message ?? 'EOD submit failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay modal-overlay-opaque" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title">End Of Day (EOD)</div>

        <form className="modal-form" onSubmit={submit}>
          <div className="modal-label">
            Cashier Name
            <input className="modal-input" value={session?.tellerName ?? '--'} readOnly />
          </div>

          <div className="modal-label">
            Terminal Number
            <input className="modal-input" value={session?.userId ?? '--'} readOnly />
          </div>

          <div className="modal-label">
            Date and Time Opened
            <input className="modal-input" value={sod?.openedAtText ?? '--'} readOnly />
          </div>

          <div className="modal-label">
            Event Name
            <input className="modal-input" value={sod?.eventName ?? '--'} readOnly />
          </div>

          <div className="modal-label">
            Fight No
            <input className="modal-input" value={sod?.fightNo ?? '--'} readOnly />
          </div>

          <label className="modal-label">
            Bal Opening Cash
            <input
              className="modal-input"
              inputMode="decimal"
              value={openingCashText}
              onChange={(e) => setOpeningCashText(e.target.value)}
              disabled={busy}
              required
            />
          </label>

          <div className="modal-label">
            Actual Sales
            <input className="modal-input" value={money(actualSales)} readOnly />
          </div>

          <div className="modal-label">
            Win Payout
            <input className="modal-input" value={money(winPayout)} readOnly />
          </div>

          <label className="modal-label">
            Total Closing Cash
            <input
              ref={closingRef}
              className="modal-input"
              inputMode="decimal"
              value={closingCashText}
              onChange={(e) => setClosingCashText(e.target.value)}
              disabled={busy}
              required
            />
          </label>

          <div className="modal-label">
            Discrepancy Cash Amount
            <input className="modal-input" value={money(discrepancy)} readOnly />
          </div>

          <div className="modal-label">
            Status
            <input className="modal-input" value={balanced ? 'BALANCED' : 'Not Balance'} readOnly />
          </div>

          <div className="modal-label">
            Date and Time Closed
            <input className="modal-input" value={closedAt.toLocaleString()} readOnly />
          </div>

          {error ? <div className="modal-error">{error}</div> : null}

          <div className="modal-actions claim-actions">
            <button className="modal-button modal-cancel" type="button" disabled={busy} onClick={onCancel}>
              CANCEL
            </button>
            <button className="modal-button" type="submit" disabled={busy || !balanced}>
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
