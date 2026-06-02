export default function WelcomeModal({ session, openedAtText, fightNo, onClose }) {
  return (
    <div className="modal-overlay modal-overlay-opaque" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title">WELCOME</div>

        <div className="modal-form">
          <div className="modal-welcome">
            <div className="modal-welcome-strong">{session?.tellerName ?? 'User'}</div>
            <div className="modal-welcome-sub">{openedAtText}</div>
            <div className="modal-welcome-sub">Potential Fight No: {fightNo ?? '--'}</div>
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
