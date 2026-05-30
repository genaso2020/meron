import { useEffect, useMemo, useState } from 'react';
import TerminalLayout from './components/TerminalLayout.jsx';
import { createApiClient } from './api/client.js';
import SignIn from './components/auth/SignIn.jsx';

export default function App() {
  const api = useMemo(() => createApiClient({ mode: 'mock' }), []);

  const [session, setSession] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [fight, setFight] = useState(null);
  const [limits, setLimits] = useState(null);
  const [odds, setOdds] = useState(null);

  async function refreshData() {
    const [f, l, o] = await Promise.all([api.getCurrentFight(), api.getLimits(), api.getOdds()]);
    setFight(f);
    setLimits(l);
    setOdds(o);
  }

  useEffect(() => {
    function onLogout() {
      setSession(null);
      setFight(null);
      setLimits(null);
      setOdds(null);
      setAuthError(null);
    }
    window.addEventListener('meron:logout', onLogout);
    return () => window.removeEventListener('meron:logout', onLogout);
  }, []);

  async function signIn({ email, password }) {
    try {
      setAuthBusy(true);
      setAuthError(null);
      const s = await api.login({ email, password });
      setSession(s);
    } catch (e) {
      setAuthError(e?.message ?? 'Sign in failed');
    } finally {
      setAuthBusy(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    let mounted = true;

    refreshData().catch(() => {});

    const stop = api.subscribeToFightUpdates((f) => {
      if (!mounted) return;
      setFight(f);
    });

    return () => {
      mounted = false;
      stop?.();
    };
  }, [api, session]);

  if (!session) {
    return <SignIn onSubmit={signIn} busy={authBusy} error={authError} />;
  }

  return (
    <TerminalLayout
      api={api}
      session={session}
      fight={fight}
      limits={limits}
      odds={odds}
      onRefresh={refreshData}
    />
  );
}
