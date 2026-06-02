import { useEffect, useMemo, useRef, useState } from 'react';

function money(n) {
  const v = Number(n ?? 0);
  return `₱${(Number.isFinite(v) ? v : 0).toLocaleString()}`;
}

export default function ClaimTicketModal({ api, session, fight, onCancel, onClaimed }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const inputRef = useRef(null);

  const fightNo = fight?.fightNo;

  const possiblePayout = useMemo(() => {
    if (!ticket) return 0;
    const amount = Number(ticket.amount ?? 0);
    const odds = Number(ticket.odds ?? 0);
    if (!Number.isFinite(amount) || !Number.isFinite(odds)) return 0;
    return amount * odds;
  }, [ticket]);

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  async function lookup(nextCode) {
    const c = String(nextCode ?? '').trim();
    if (!c) return;
    try {
      setBusy(true);
      setError(null);
      const res = await api.getTicketByCode({ code: c });
      setTicket(res);
    } catch (err) {
      setTicket(null);
      setError(err?.message ?? 'Ticket not found');
    } finally {
      setBusy(false);
    }
  }

  async function claim() {
    if (!ticket) return;
    try {
      setBusy(true);
      setError(null);
      const res = await api.claimTicket({
        code: ticket.code,
        releasingTerminal: session?.userId,
        claimedBy: session?.tellerName,
        claimedAt: new Date().toISOString()
      });
      onClaimed?.({ ticket: res, possiblePayout });
    } catch (err) {
      setError(err?.message ?? 'Claim failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay modal-overlay-opaque" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title">Winning Ticket Claim</div>

        <div className="modal-form">
          <div className="claim-scan-row">
            <button className="modal-button" type="button" disabled={busy} onClick={() => inputRef.current?.focus?.()}>
              SCAN QR CODE
            </button>
            <button className="modal-button" type="button" disabled={busy} onClick={() => inputRef.current?.focus?.()}>
              SCAN BARCODE
            </button>
          </div>

          <label className="modal-label">
            QR / Barcode / Ticket No
            <input
              ref={inputRef}
              className="modal-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  lookup(code);
                }
              }}
              placeholder="Scan or type ticket code then press ENTER"
            />
          </label>

          <button className="modal-button" type="button" disabled={busy || !code.trim()} onClick={() => lookup(code)}>
            {busy ? 'LOADING...' : 'LOAD TICKET'}
          </button>

          {error ? <div className="modal-error">{error}</div> : null}

          {ticket ? (
            <div className="claim-details">
              <div className="claim-grid">
                <div className="claim-k">ticket_no</div>
                <div className="claim-v">{ticket.ticketNo}</div>

                <div className="claim-k">event_name</div>
                <div className="claim-v">{ticket.eventName}</div>

                <div className="claim-k">fight_no</div>
                <div className="claim-v">{ticket.fightNo}</div>

                <div className="claim-k">side</div>
                <div className="claim-v">{ticket.side}</div>

                <div className="claim-k">amount</div>
                <div className="claim-v claim-h3 claim-strong">{money(ticket.amount)}</div>

                <div className="claim-k">odds</div>
                <div className="claim-v claim-h3">{Number(ticket.odds ?? 0).toFixed(2)}</div>

                <div className="claim-k">possible_payout</div>
                <div className="claim-v claim-h1 claim-strong">{money(possiblePayout)}</div>

                <div className="claim-k">cashier</div>
                <div className="claim-v">{session?.tellerName ?? '--'}</div>

                <div className="claim-k">terminal</div>
                <div className="claim-v">{session?.userId ?? '--'}</div>

                <div className="claim-k">timestamp</div>
                <div className="claim-v">{ticket.createdAtText}</div>

                <div className="claim-k">QR/barcode</div>
                <div className="claim-v">{ticket.code}</div>

                <div className="claim-k">Date and time Claimed</div>
                <div className="claim-v">{new Date().toLocaleString()}</div>

                <div className="claim-k">Releasing Terminal</div>
                <div className="claim-v">{session?.userId ?? '--'}</div>
              </div>

              {Number.isFinite(fightNo) ? <div className="claim-note">Current Fight No: {fightNo}</div> : null}
            </div>
          ) : null}

          <div className="modal-actions claim-actions">
            <button className="modal-button modal-cancel" type="button" disabled={busy} onClick={onCancel}>
              CANCEL
            </button>
            <button className="modal-button" type="button" disabled={busy || !ticket} onClick={claim}>
              CLAIM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
