import { useEffect, useRef, useState } from 'react';

function parseCockInfo(value) {
  const parts = String(value ?? '')
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    name: parts[0] ?? '',
    alias: parts[1] ?? '',
    side: parts[2] ?? ''
  };
}

export default function ResultsOffcanvas({ api, open, onRequestClose, onClosed, side = 'left' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.focus?.();
    let mounted = true;
    setBusy(true);
    setError(null);

    api
      .getMatchResults()
      .then((rows) => {
        if (!mounted) return;
        setItems(Array.isArray(rows) ? rows : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load results');
      })
      .finally(() => {
        if (!mounted) return;
        setBusy(false);
      });

    return () => {
      mounted = false;
    };
  }, [api]);

  useEffect(() => {
    if (open) {
      setClosing(false);
      return;
    }
    setClosing(true);
    const t = setTimeout(() => onClosed?.(), 220);
    return () => clearTimeout(t);
  }, [open, onClosed]);

  function requestClose() {
    if (closing) return;
    onRequestClose?.();
  }

  return (
    <div
      className={`offcanvas-overlay ${open && !closing ? 'is-open' : ''} ${closing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      onMouseDown={requestClose}
    >
      <div
        className={`offcanvas-panel ${side === 'right' ? 'right' : ''} ${open && !closing ? 'is-open' : ''} ${closing ? 'is-closing' : ''}`}
        ref={panelRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="offcanvas-header">
          <div className="offcanvas-title">Match Results</div>
          <button className="offcanvas-close" type="button" onClick={requestClose}>
            CLOSE
          </button>
        </div>

        {error ? <div className="offcanvas-error">{error}</div> : null}

        <div className="results-wrap">
          <div className="results-header">
            <div>Fight No</div>
            <div>Date and Time</div>
            <div>Cock 1</div>
            <div>Cock 2</div>
            <div>WINNING SIDE</div>
          </div>

          <div className="results-body">
            {items.length === 0 && !busy ? <div className="results-empty">No results found</div> : null}

            {items.map((r) => (
              <div className="results-row" key={`${r.fightNo}-${r.datetime}`}
              >
                {(() => {
                  const c1 = parseCockInfo(r.cock1);
                  const c2 = parseCockInfo(r.cock2);
                  return (
                    <>
                      <div className="results-cell">{r.fightNo}</div>
                      <div className="results-cell">{r.datetime}</div>

                      <div className="results-cell">
                        <div className="cock-block">
                          <div className="cock-name">{c1.name}</div>
                          <div className="cock-alias">{c1.alias}</div>
                          <div className="cock-side">{c1.side}</div>
                        </div>
                      </div>

                      <div className="results-cell">
                        <div className="cock-block">
                          <div className="cock-name">{c2.name}</div>
                          <div className="cock-alias">{c2.alias}</div>
                          <div className="cock-side">{c2.side}</div>
                        </div>
                      </div>

                      <div className="results-cell">{r.winningSide}</div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
