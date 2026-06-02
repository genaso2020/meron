export default function SodErrorModal({ title = 'ERROR', message, onClose }) {
  return (
    <div className="modal-overlay modal-overlay-opaque" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title">{title}</div>

        <div className="modal-form">
          <div className="modal-error">{message || 'An error occurred'}</div>

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
