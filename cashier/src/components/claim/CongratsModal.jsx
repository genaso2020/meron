function money(n) {
  const v = Number(n ?? 0);
  return `₱${(Number.isFinite(v) ? v : 0).toLocaleString()}`;
}

export default function CongratsModal({ payoutAmount, onClose }) {
  return (
    <div className="modal-overlay modal-overlay-opaque" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title">CONGRATULATIONS</div>

        <div className="modal-form">
          <div className="modal-welcome">
            <div className="modal-welcome-sub">Possible Payout</div>
            <div className="claim-h1 claim-strong">{money(payoutAmount)}</div>
          </div>

          <div className="modal-actions">
            <button className="modal-button" type="button" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
