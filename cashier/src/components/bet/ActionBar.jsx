export default function ActionBar({
  disabled,
  actionsDisabled,
  sodDisabled,
  onWinningCall,
  onRefund,
  onLock,
  onChangeFight,
  onSod,
  onEod,
  onClearRefresh,
  showChangeFight
}) {
  const otherDisabled = disabled || actionsDisabled;
  return (
    <div className="action-row">
      <button className="action action-win" disabled={otherDisabled} onClick={onWinningCall}>
        WINNING CALL
      </button>
      <button className="action action-refund" disabled={otherDisabled} onClick={onRefund}>
        REFUND TICKET
      </button>
      <button className="action action-lock" disabled={false} onClick={onLock}>
        LOCK SCREEN
      </button>
      {showChangeFight ? (
        <button className="action action-change" disabled={otherDisabled} onClick={onChangeFight}>
          CHANGE FIGHT NO
        </button>
      ) : null}
      <button className="action action-sod" disabled={disabled || sodDisabled} onClick={onSod}>
        SOD
      </button>
      <button className="action action-eod" disabled={otherDisabled} onClick={onEod}>
        EOD
      </button>
      <button className="action action-clear" disabled={otherDisabled} onClick={onClearRefresh}>
        CLEAR
      </button>
    </div>
  );
}
