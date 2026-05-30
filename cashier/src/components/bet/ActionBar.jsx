export default function ActionBar({ disabled, onWinningCall, onRefund, onLock, onSod, onEod }) {
  return (
    <div className="action-row">
      <button className="action action-win" disabled={disabled} onClick={onWinningCall}>
        WINNING CALL
      </button>
      <button className="action action-refund" disabled={disabled} onClick={onRefund}>
        REFUND TICKET
      </button>
      <button className="action action-lock" disabled={disabled} onClick={onLock}>
        LOCK
      </button>
      <button className="action action-sod" disabled={disabled} onClick={onSod}>
        SOD
      </button>
      <button className="action action-eod" disabled={disabled} onClick={onEod}>
        EOD
      </button>
    </div>
  );
}
