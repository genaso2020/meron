function Key({ children, className = '', disabled, onClick }) {
  return (
    <button className={`key ${className}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export default function AmountPad({
  amountText,
  disabled,
  onDigit,
  onDoubleZero,
  onQuadZero,
  enterVariant,
  enterDisabled,
  onBackspace,
  onClear,
  onEnter
}) {
  return (
    <div className="pad">

      <div className="pad-grid">
        <Key disabled={disabled} onClick={() => onDigit('7')}>7</Key>
        <Key disabled={disabled} onClick={() => onDigit('8')}>8</Key>
        <Key disabled={disabled} onClick={() => onDigit('9')}>9</Key>
        <Key className="key-warn" disabled={disabled} onClick={onBackspace}>⌫</Key>

        <Key disabled={disabled} onClick={() => onDigit('4')}>4</Key>
        <Key disabled={disabled} onClick={() => onDigit('5')}>5</Key>
        <Key disabled={disabled} onClick={() => onDigit('6')}>6</Key>
        <Key className="key-danger" disabled={disabled} onClick={onClear}>C</Key>

        <Key disabled={disabled} onClick={() => onDigit('1')}>1</Key>
        <Key disabled={disabled} onClick={() => onDigit('2')}>2</Key>
        <Key disabled={disabled} onClick={() => onDigit('3')}>3</Key>
        <Key
          className={`key-enter key-enter-${enterVariant || 'normal'}`}
          disabled={disabled || enterDisabled}
          onClick={onEnter}
        >
          ENTER
        </Key>

        <Key disabled={disabled} onClick={() => onDigit('0')}>0</Key>
        <Key disabled={disabled} onClick={onDoubleZero}>00</Key>
        <Key disabled={disabled} onClick={onQuadZero}>0000</Key>
      
      </div>
    </div>
  );
}
