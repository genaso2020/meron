import { useEffect, useRef, useState } from 'react';

export default function ChangeFightModal({ fight, api, onClose, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current?.focus?.();
    let mounted = true;
    setBusy(true);
    setError(null);
    api
      .getScheduledFights()
      .then((rows) => {
        if (!mounted) return;
        setItems(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load fights');
      })
      .finally(() => {
        if (!mounted) return;
        setBusy(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function pickFightNo(n) {
    try {
      setBusy(true);
      setError(null);
      await api.setFightNo({ fightNo: n });
      onChanged?.(n);
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Failed to change fight number');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-title">Change Fight No</div>

        <div className="modal-form">
          <div className="fightlist-wrap" ref={containerRef} tabIndex={-1}>
            <div className="fightlist-header">
              <div>Fight No</div>
              <div>Scheduled Date and Time</div>
              <div>Cock 1 Name</div>
              <div>Cock 2 Name</div>
            </div>

            <div className="fightlist-body">
              {items.length === 0 && !busy ? (
                <div className="fightlist-empty">No scheduled fights found</div>
              ) : null}

              {items.map((m) => {
                const selected = m.fightNo === fight?.fightNo;
                return (
                  <button
                    key={m.fightNo}
                    type="button"
                    className={`fightlist-row ${selected ? 'selected' : ''}`}
                    disabled={busy}
                    onClick={() => pickFightNo(m.fightNo)}
                  >
                    <div className="fightlist-cell">{m.fightNo}</div>
                    <div className="fightlist-cell">{m.scheduleTime}</div>
                    <div className="fightlist-cell">{m.cock1Name}</div>
                    <div className="fightlist-cell">{m.cock2Name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <div className="modal-error">{error}</div> : null}

          <div className="modal-actions">
            <button className="modal-button modal-cancel" type="button" disabled={busy} onClick={onClose}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
