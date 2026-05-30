export default function ChangeModal({ changeAmount, onOk }) {
  return (
    <div className="change-overlay" role="dialog" aria-modal="true">
      <div className="change-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="change-title">CHANGE</div>
        <div className="change-amount">₱{Number(changeAmount ?? 0).toLocaleString()}</div>
        <button className="change-ok" type="button" onClick={onOk}>
          OK
        </button>
      </div>
    </div>
  );
}
