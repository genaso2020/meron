import { useEffect, useRef, useState } from 'react';

export default function ManagerPinModal({ api, onCancel, onVerified }) {
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  async function submit(e) {
    e?.preventDefault?.();
    try {
      setBusy(true);
      setError(null);
      const res = await api.verifyManagerPin({ pin });
      setPin('');
      onVerified?.(res);
    } catch (err) {
      setError(err?.message ?? 'Invalid PIN');
      setPin('');
      inputRef.current?.focus?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay modal-overlay-opaque" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title">SOD Authorization</div>

        <form className="modal-form" onSubmit={submit}>
          <label className="modal-label">
            Enter Manager/Supervisor PIN
            <input
              ref={inputRef}
              className="modal-input"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              disabled={busy}
              required
            />
          </label>

          {error ? <div className="modal-error">{error}</div> : null}

          <div className="modal-actions">
            <button className="modal-button" type="submit" disabled={busy}>
              {busy ? 'Checking...' : 'VERIFY'}
            </button>
            <button className="modal-button modal-cancel" type="button" disabled={busy} onClick={onCancel}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
