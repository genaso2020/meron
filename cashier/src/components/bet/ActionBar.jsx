export default function ActionBar({
  disabled,
  onWinningCall,
  onRefund,
  onLock,
  onChangeFight,
  onSod,
  onEod,
  onClearRefresh
}) {
  return (
    <div className="action-row">
      <button className="action action-win" disabled={disabled} onClick={onWinningCall}>
        WINNING CALL
      </button>
      <button className="action action-refund" disabled={disabled} onClick={onRefund}>
        REFUND TICKET
      </button>
      <button className="action action-lock" disabled={disabled} onClick={onLock}>
        LOCK SCREEN
      </button>
      <button className="action action-change" disabled={disabled} onClick={onChangeFight}>
        CHANGE FIGHT NO
      </button>
      <button className="action action-sod" disabled={disabled} onClick={onSod}>
        SOD
      </button>
      <button className="action action-eod" disabled={disabled} onClick={onEod}>
        EOD
      </button>
      <button className="action action-clear" disabled={disabled} onClick={onClearRefresh}>
        CLEAR
      </button>
    </div>
  );
}
