import { useState } from 'react';

export default function SignIn({ onSubmit, busy, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function submit(e) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-title">Cashier Sign In</div>
        <div className="auth-subtitle">Use your email and password</div>

        <form onSubmit={submit} className="auth-form">
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="username"
              required
              disabled={busy}
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </label>

          {error ? <div className="auth-error">{error}</div> : null}

          <button className="auth-button" type="submit" disabled={busy}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-hint">
            Mock login: <span className="auth-mono">cashier@demo.local</span> / <span className="auth-mono">1234</span>
          </div>
        </form>
      </div>
    </div>
  );
}
