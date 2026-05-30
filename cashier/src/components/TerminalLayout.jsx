import { useEffect, useMemo, useState } from 'react';
import Header from './header/Header.jsx';
import BetSideCards from './bet/BetSideCards.jsx';
import AmountPad from './bet/AmountPad.jsx';
import ActionBar from './bet/ActionBar.jsx';
import Footer from './footer/Footer.jsx';
import LockModal from './lock/LockModal.jsx';

const SIDES = ['MERON', 'DRAW', 'WALA'];

export default function TerminalLayout({ api, session, fight, limits, odds }) {
  const [side, setSide] = useState('MERON');
  const [amountText, setAmountText] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastTicket, setLastTicket] = useState(null);
  const [locked, setLocked] = useState(false);

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
    if (!locked) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [locked]);

  function clearAmount() {
    setAmountText('');
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
    if (!fight) return;
    try {
      setBusy(true);
      await api.winningCall({ fightNo: fight.fightNo, winnerSide: side });
      showToast(`Winning call: ${side}`, 'success');
    } catch (e) {
      showToast(e?.message ?? 'Winning call failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function sod() {
    try {
      setBusy(true);
      await api.sod();
      showToast('SOD OK', 'success');
    } catch (e) {
      showToast(e?.message ?? 'SOD failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function eod() {
    try {
      setBusy(true);
      await api.eod();
      showToast('EOD OK', 'success');
    } catch (e) {
      showToast(e?.message ?? 'EOD failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <Header fight={fight} limits={limits} amount={amount} />

      <div className="terminal-main">
        <BetSideCards side={side} onSideChange={setSide} odds={odds} />

        <div className="amount-section">
          <div className="preset-row">
            {[1000, 5000, 10000, 50000, 100000].map((v) => (
              <button
                key={v}
                className="preset"
                disabled={busy}
                onClick={() => setAmountText(String(v))}
              >
                {v >= 1000 ? `₱${v.toLocaleString()}` : v}
              </button>
            ))}
          </div>

          <AmountPad
            amountText={amountText}
            disabled={busy}
            onDigit={appendDigit}
            onDoubleZero={append00}
            onQuadZero={append0000}
            onBackspace={backspace}
            onClear={clearAmount}
            onEnter={placeBet}
          />

          <ActionBar
            disabled={busy}
            onWinningCall={winningCall}
            onRefund={refundTicket}
            onLock={() => setLocked(true)}
            onSod={sod}
            onEod={eod}
          />

          {lastTicket ? (
            <div className="ticket-card">
              <div className="ticket-title">Last Ticket</div>
              <div className="ticket-grid">
                <div className="ticket-k">Ticket</div>
                <div className="ticket-v">{lastTicket.ticketId}</div>
                <div className="ticket-k">Fight</div>
                <div className="ticket-v">{lastTicket.fightNo}</div>
                <div className="ticket-k">Side</div>
                <div className="ticket-v">{lastTicket.side}</div>
                <div className="ticket-k">Amount</div>
                <div className="ticket-v">₱{lastTicket.amount.toLocaleString()}</div>
              </div>
            </div>
          ) : null}
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
    </div>
  );
}
