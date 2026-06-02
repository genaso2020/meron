import { useEffect, useMemo, useRef, useState } from 'react';

function formatDateTime(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hh = String(h).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${mm} ${dd}, ${yyyy}, ${hh}:${mi}:${ss} ${ampm}`;
}

export default function OpeningCashModal({ session, activeMatch, onCancel, onSubmit }) {
  const [openingCashText, setOpeningCashText] = useState('');
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  function submit(e) {
    e?.preventDefault?.();
    const n = Number(openingCashText);
    if (!Number.isFinite(n) || n < 0) {
      setError('Invalid opening cash');
      return;
    }
    setError(null);
    onSubmit?.({ openingCash: n, openedAt: now });
  }

  return (
    <div className="modal-overlay modal-overlay-opaque" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title">Start Of Day (SOD)</div>

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
            <input className="modal-input" value={formatDateTime(now)} readOnly />
          </div>

          <div className="modal-label">
            Event Name
            <input className="modal-input" value={activeMatch?.eventName ?? '--'} readOnly />
          </div>

          <div className="modal-label">
            Fight No
            <input className="modal-input" value={activeMatch?.fightNo ?? '--'} readOnly />
          </div>

          <label className="modal-label">
            Bal Cash Opening
            <input
              ref={inputRef}
              className="modal-input"
              inputMode="decimal"
              value={openingCashText}
              onChange={(e) => setOpeningCashText(e.target.value)}
              required
            />
          </label>

          {error ? <div className="modal-error">{error}</div> : null}

          <div className="modal-actions">
            <button className="modal-button" type="submit">
              SUBMIT
            </button>
            <button className="modal-button modal-cancel" type="button" onClick={onCancel}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
