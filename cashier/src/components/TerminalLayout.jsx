import { useEffect, useMemo, useState } from 'react';
import Header from './header/Header.jsx';
import BetSideCards from './bet/BetSideCards.jsx';
import AmountPad from './bet/AmountPad.jsx';
import ActionBar from './bet/ActionBar.jsx';
import Footer from './footer/Footer.jsx';
import LockModal from './lock/LockModal.jsx';
import ChangeFightModal from './fight/ChangeFightModal.jsx';
import ResultsOffcanvas from './results/ResultsOffcanvas.jsx';
import ChangeModal from './payment/ChangeModal.jsx';
import TransactionsOffcanvas from './transactions/TransactionsOffcanvas.jsx';

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
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsMounted, setResultsMounted] = useState(false);
  const [paymentMode, setPaymentMode] = useState(false);
  const [dueAmount, setDueAmount] = useState(0);
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [txOpen, setTxOpen] = useState(false);
  const [txMounted, setTxMounted] = useState(false);

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
    if (!locked && !resultsMounted && !changeOpen && !txMounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [locked, resultsMounted, changeOpen, txMounted]);

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

  async function clearAndRefresh() {
    try {
      setBusy(true);
      setAmountText('');
      setLastTicket(null);
      setSide(null);
      setEnterVariant('normal');
      setPaymentMode(false);
      setDueAmount(0);
      setChangeOpen(false);
      setChangeAmount(0);
      setPaidAmount(0);
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
    if (paymentMode) {
      const paid = amount;
      if (!paid || paid <= 0) {
        showToast('Enter amount paid', 'error');
        return;
      }
      if (paid < dueAmount) {
        showToast('Insufficient payment', 'error');
        return;
      }

      setChangeAmount(paid - dueAmount);
      setPaidAmount(paid);
      setChangeOpen(true);
      return;
    }

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
      setDueAmount(amount);
      setPaymentMode(true);
      setAmountText('');
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
      <Header
        fight={fight}
        limits={limits}
        amount={amount}
        dueAmount={paymentMode ? dueAmount : 0}
        paymentMode={paymentMode}
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
        <BetSideCards side={side} onSideChange={handleSideChange} odds={odds} />

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
            enterVariant={enterVariant}
            onBackspace={backspace}
            onClear={clearAmount}
            onEnter={placeBet}
          />

          <ActionBar
            disabled={busy}
            onWinningCall={winningCall}
            onRefund={refundTicket}
            onLock={() => setLocked(true)}
            onChangeFight={() => setChangeFightOpen(true)}
            onSod={sod}
            onEod={eod}
            onClearRefresh={clearAndRefresh}
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

      {resultsMounted ? (
        <ResultsOffcanvas
          api={api}
          open={resultsOpen}
          onRequestClose={() => setResultsOpen(false)}
          onClosed={() => setResultsMounted(false)}
        />
      ) : null}

      {txMounted ? (
        <TransactionsOffcanvas
          open={txOpen}
          onRequestClose={() => setTxOpen(false)}
          onClosed={() => setTxMounted(false)}
          items={transactions}
        />
      ) : null}

      {changeOpen ? (
        <ChangeModal
          changeAmount={changeAmount}
          onOk={() => {
            if (lastTicket) {
              const entry = {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                ticketId: lastTicket.ticketId,
                transType: 'Bet',
                fightNo: lastTicket.fightNo,
                side: lastTicket.side,
                amount: dueAmount,
                paidAmount,
                changeAmount,
                paymentType: 'Cash'
              };
              setTransactions((prev) => [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, 5));
            }
            setChangeOpen(false);
            setChangeAmount(0);
            setPaidAmount(0);
            setPaymentMode(false);
            setDueAmount(0);
            setAmountText('');
            setSide(null);
            setEnterVariant('normal');
          }}
        />
      ) : null}
    </div>
  );
}
