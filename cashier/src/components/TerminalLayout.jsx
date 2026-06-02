import { useEffect, useMemo, useState } from 'react';
import Header from './header/Header.jsx';
import BetSideCards from './bet/BetSideCards.jsx';
import AmountPad from './bet/AmountPad.jsx';
import ActionBar from './bet/ActionBar.jsx';
import Footer from './footer/Footer.jsx';
import LockModal from './lock/LockModal.jsx';
import ChangeFightModal from './fight/ChangeFightModal.jsx';
import ResultsOffcanvas from './results/ResultsOffcanvas.jsx';
import TransactionsOffcanvas from './transactions/TransactionsOffcanvas.jsx';
import ManagerPinModal from './sod/ManagerPinModal.jsx';
import OpeningCashModal from './sod/OpeningCashModal.jsx';
import WelcomeModal from './sod/WelcomeModal.jsx';
import SodErrorModal from './sod/SodErrorModal.jsx';
import ClaimTicketModal from './claim/ClaimTicketModal.jsx';
import CongratsModal from './claim/CongratsModal.jsx';
import EndOfDayModal from './eod/EndOfDayModal.jsx';

const SIDES = ['MERON', 'DRAW', 'WALA'];

export default function TerminalLayout({ api, session, fight, limits, odds, onRefresh }) {
  const [side, setSide] = useState(null);
  const [enterVariant, setEnterVariant] = useState('normal');
  const [amountText, setAmountText] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastTicket, setLastTicket] = useState(null);
  const [locked, setLocked] = useState(false);
  const [changeFightOpen, setChangeFightOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txOpen, setTxOpen] = useState(false);
  const [txMounted, setTxMounted] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsMounted, setResultsMounted] = useState(false);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [sodPinOpen, setSodPinOpen] = useState(false);
  const [sodCashOpen, setSodCashOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [openedAtText, setOpenedAtText] = useState('');
  const [activeMatch, setActiveMatch] = useState(null);
  const [sodError, setSodError] = useState(null);
  const [sodSession, setSodSession] = useState(null);
  const [totals, setTotals] = useState({ sales: 0, payout: 0 });

  const [eodOpen, setEodOpen] = useState(false);
  const [eodCancelPinOpen, setEodCancelPinOpen] = useState(false);

  const [claimOpen, setClaimOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [congratsPayout, setCongratsPayout] = useState(0);

  const showChangeFight = String(session?.role ?? '').toLowerCase() === 'manager';

  const uiDisabled = busy || locked || !terminalOpen || claimOpen;

  const amount = useMemo(() => {
    if (!amountText) return 0;
    const n = Number(amountText);
    return Number.isFinite(n) ? n : 0;
  }, [amountText]);

  function showToast(message, kind = 'info') {
    setToast({ message, kind, ts: Date.now() });
    setTimeout(() => setToast(null), 2400);
  }

  useEffect(() => {
    if (!locked && !txMounted && !resultsMounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [locked, txMounted, resultsMounted]);

  function clearAmount() {
    setAmountText('');
    setSide(null);
    setEnterVariant('normal');
  }

  function backspace() {
    setAmountText((t) => t.slice(0, -1));
  }

  function appendDigit(d) {
    setAmountText((t) => {
      const next = (t + d).replace(/^0+(?=\d)/, '');
      return next;
    });
  }

  function append00() {
    setAmountText((t) => (t ? `${t}00` : '0'));
  }

  function append0000() {
    setAmountText((t) => (t ? `${t}0000` : '0'));
  }

  async function clearAndRefresh() {
    try {
      setBusy(true);
      setAmountText('');
      setLastTicket(null);
      setSide(null);
      setEnterVariant('normal');
      await onRefresh?.();
      showToast('Refreshed', 'success');
    } catch (e) {
      showToast(e?.message ?? 'Refresh failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  function handleSideChange(nextSide) {
    setSide(nextSide);
    setEnterVariant(nextSide);
  }

  async function placeBet() {
    if (!fight) return;
    if (!side) return;
    if (!amount || amount <= 0) {
      showToast('Enter amount', 'error');
      return;
    }

    if (limits) {
      if (amount < limits.min) {
        showToast(`Minimum is ${limits.min}`, 'error');
        return;
      }
      if (amount > limits.max) {
        showToast(`Maximum is ${limits.max}`, 'error');
        return;
      }
    }

    try {
      setBusy(true);
      const ticket = await api.placeBet({
        tellerNo: session.tellerNo,
        fightNo: fight.fightNo,
        side,
        amount
      });
      setLastTicket(ticket);
      setTransactions((prev) => {
        const entry = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          ticketId: ticket.ticketId,
          transType: 'Bet',
          fightNo: ticket.fightNo,
          side: ticket.side,
          amount: ticket.amount,
          paidAmount: ticket.amount,
          changeAmount: 0,
          paymentType: 'Cash'
        };
        return [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, 5);
      });
      setTotals((t) => ({ ...t, sales: Number(t?.sales ?? 0) + Number(ticket.amount ?? 0) }));
      clearAmount();
      showToast(`Ticket ${ticket.ticketId} saved`, 'success');
    } catch (e) {
      showToast(e?.message ?? 'Failed to place bet', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function refundTicket() {
    if (!lastTicket?.ticketId) {
      showToast('No ticket to refund', 'error');
      return;
    }
    try {
      setBusy(true);
      await api.refundTicket({ ticketId: lastTicket.ticketId });
      showToast(`Ticket ${lastTicket.ticketId} refunded`, 'success');
      setLastTicket(null);
    } catch (e) {
      showToast(e?.message ?? 'Refund failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function winningCall() {
    if (!terminalOpen || locked) return;
    setClaimOpen(true);
  }

  async function sod() {
    if (terminalOpen) return;
    setSodPinOpen(true);
  }

  async function eod() {
    if (!terminalOpen || locked) return;
    setEodOpen(true);
  }

  return (
    <div className="app-shell">
      <Header
        fight={fight}
        limits={limits}
        amount={amount}
        onOpenResults={() => {
          setResultsMounted(true);
          setResultsOpen(true);
        }}
        onOpenTransactions={() => {
          setTxMounted(true);
          setTxOpen(true);
        }}
      />

      <div className="terminal-main">
        <BetSideCards side={side} onSideChange={handleSideChange} odds={odds} disabled={uiDisabled} />

        <div className="amount-section">
          <div className="preset-row">
            {[10, 20, 50, 100, 200, 500, 1000, 5000, 10000, 50000].map((v) => (
              <button
                key={v}
                className="preset"
                disabled={uiDisabled}
                onClick={() =>
                  setAmountText((t) => {
                    const base = Number(t || 0);
                    const next = (Number.isFinite(base) ? base : 0) + v;
                    return String(next);
                  })
                }
              >
                {v >= 1000 ? `₱${v.toLocaleString()}` : v}
              </button>
            ))}
          </div>

          <AmountPad
            amountText={amountText}
            disabled={uiDisabled}
            onDigit={appendDigit}
            onDoubleZero={append00}
            onQuadZero={append0000}
            enterVariant={enterVariant}
            enterDisabled={!side}
            onBackspace={backspace}
            onClear={clearAmount}
            onEnter={placeBet}
          />

          <ActionBar
            disabled={busy}
            actionsDisabled={!terminalOpen || locked}
            sodDisabled={terminalOpen || locked}
            onWinningCall={winningCall}
            onRefund={refundTicket}
            onLock={() => setLocked(true)}
            onChangeFight={() => setChangeFightOpen(true)}
            onSod={sod}
            onEod={eod}
            onClearRefresh={clearAndRefresh}
            showChangeFight={showChangeFight}
          />

        </div>
      </div>

      <Footer session={session} />

      {toast ? (
        <div className={`toast toast-${toast.kind}`} key={toast.ts}>
          {toast.message}
        </div>
      ) : null}

      {locked ? (
        <LockModal
          session={session}
          api={api}
          onUnlocked={() => setLocked(false)}
          onLogout={() => {
            setLocked(false);
            api.logout?.();
            window.dispatchEvent(new CustomEvent('meron:logout'));
          }}
        />
      ) : null}

      {changeFightOpen ? (
        <ChangeFightModal
          fight={fight}
          api={api}
          onClose={() => setChangeFightOpen(false)}
          onChanged={(n) => showToast(`Fight No changed to ${n}`, 'success')}
        />
      ) : null}

      {sodPinOpen ? (
        <ManagerPinModal
          api={api}
          onCancel={() => setSodPinOpen(false)}
          onVerified={async () => {
            try {
              setBusy(true);
              setSodError(null);
              const m = await api.getActiveMatchForSod();
              setActiveMatch(m);
              setSodPinOpen(false);
              setSodCashOpen(true);
            } catch (e) {
              setSodPinOpen(false);
              setSodCashOpen(false);
              setActiveMatch(null);
              setSodError(e?.message ?? 'Unable to start SOD');
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {sodCashOpen ? (
        <OpeningCashModal
          session={session}
          activeMatch={activeMatch}
          onCancel={() => setSodCashOpen(false)}
          onSubmit={async ({ openingCash, openedAt }) => {
            try {
              setBusy(true);
              await api.sod?.({ openingCash, openedAt: openedAt?.toISOString?.() });
              const openText = openedAt?.toLocaleString?.() ?? String(openedAt ?? '');
              setOpenedAtText(openText);
              setSodSession({
                openedAt: openedAt?.toISOString?.(),
                openedAtText: openText,
                openingCash,
                eventName: activeMatch?.eventName,
                fightNo: activeMatch?.fightNo
              });
              setTotals({ sales: 0, payout: 0 });
              setSodCashOpen(false);
              setWelcomeOpen(true);
              setTerminalOpen(true);
            } catch (e) {
              showToast(e?.message ?? 'SOD failed', 'error');
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {welcomeOpen ? (
        <WelcomeModal
          session={session}
          openedAtText={openedAtText}
          fightNo={activeMatch?.fightNo ?? fight?.fightNo}
          onClose={() => setWelcomeOpen(false)}
        />
      ) : null}

      {sodError ? <SodErrorModal title="SOD ERROR" message={sodError} onClose={() => setSodError(null)} /> : null}

      {claimOpen ? (
        <ClaimTicketModal
          api={api}
          session={session}
          fight={fight}
          onCancel={() => setClaimOpen(false)}
          onClaimed={({ ticket, possiblePayout }) => {
            setClaimOpen(false);
            setCongratsPayout(possiblePayout);
            setCongratsOpen(true);

            setTotals((t) => ({ ...t, payout: Number(t?.payout ?? 0) + Number(ticket.possiblePayout ?? 0) }));

            setTransactions((prev) => {
              const entry = {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                ticketId: ticket.ticketNo,
                transType: 'Payout',
                fightNo: ticket.fightNo,
                winningSide: ticket.side,
                betAmount: ticket.amount,
                odds: Number(ticket.odds ?? 0).toFixed(2),
                payoutAmount: ticket.possiblePayout,
                paymentType: 'Cash'
              };
              return [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, 5);
            });
          }}
        />
      ) : null}

      {congratsOpen ? (
        <CongratsModal payoutAmount={congratsPayout} onClose={() => setCongratsOpen(false)} />
      ) : null}

      {eodOpen ? (
        <EndOfDayModal
          session={session}
          sod={sodSession}
          totals={totals}
          onCancel={() => setEodCancelPinOpen(true)}
          onSubmit={async (payload) => {
            try {
              setBusy(true);
              await api.eod?.(payload);
              setEodOpen(false);
              setTerminalOpen(false);
              setSodSession(null);
              setTotals({ sales: 0, payout: 0 });
              clearAmount();
              showToast('EOD OK', 'success');
            } catch (e) {
              showToast(e?.message ?? 'EOD failed', 'error');
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {eodCancelPinOpen ? (
        <ManagerPinModal
          api={api}
          onCancel={() => setEodCancelPinOpen(false)}
          onVerified={() => {
            setEodCancelPinOpen(false);
            setEodOpen(false);
          }}
        />
      ) : null}

      {txMounted ? (
        <TransactionsOffcanvas
          open={txOpen}
          onRequestClose={() => setTxOpen(false)}
          onClosed={() => setTxMounted(false)}
          items={transactions}
          side="left"
        />
      ) : null}

      {resultsMounted ? (
        <ResultsOffcanvas
          api={api}
          open={resultsOpen}
          onRequestClose={() => setResultsOpen(false)}
          onClosed={() => setResultsMounted(false)}
          side="right"
        />
      ) : null}
    </div>
  );
}
