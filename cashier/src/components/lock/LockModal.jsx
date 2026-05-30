import { useEffect, useRef, useState } from 'react';

export default function LockModal({ session, api, onUnlocked, onLogout }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function unlock(e) {
    e?.preventDefault?.();
    try {
      setBusy(true);
      setError(null);
      await api.verifyPassword({ userId: session.userId, password });
      setPassword('');
      onUnlocked();
    } catch (err) {
      setError(err?.message ?? 'Invalid password');
      setPassword('');
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lock-overlay" role="dialog" aria-modal="true">
      <div className="lock-modal">
        <div className="lock-title">Locked</div>
        <div className="lock-subtitle">
          User: <span className="lock-strong">{session?.email ?? '---'}</span>
        </div>

        <form className="lock-form" onSubmit={unlock}>
          <label className="lock-label">
            Enter password to unlock
            <input
              ref={inputRef}
              className="lock-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={busy}
              required
            />
          </label>

          {error ? <div className="lock-error">{error}</div> : null}

          <div className="lock-actions">
            <button className="lock-button" type="submit" disabled={busy}>
              {busy ? 'Checking...' : 'UNLOCK'}
            </button>

            <button className="lock-button lock-logout" type="button" disabled={busy} onClick={onLogout}>
              LOGOUT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
