// Signature pad — auto-switches to red-on-black in combat mode for night ops

function SignaturePad({ soldier, activity, items, onConfirm }) {
  const t = useTheme();
  const canvasRef = React.useRef(null);
  const [hasInk, setHasInk] = React.useState(false);
  const totalItems = Object.values(items || {}).reduce((a,b)=>a+b,0);

  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr; c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = t.mode === 'combat' ? '#ff3838' : t.fg;
    let drawing = false, last = null;
    const pos = e => {
      const r = c.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    };
    const start = e => { e.preventDefault(); drawing = true; last = pos(e); };
    const move = e => {
      if (!drawing) return; e.preventDefault();
      const p = pos(e);
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p; setHasInk(true);
    };
    const end = () => { drawing = false; };
    c.addEventListener('mousedown', start); c.addEventListener('mousemove', move);
    c.addEventListener('mouseup', end); c.addEventListener('mouseleave', end);
    c.addEventListener('touchstart', start); c.addEventListener('touchmove', move);
    c.addEventListener('touchend', end);
    return () => {
      c.removeEventListener('mousedown', start); c.removeEventListener('mousemove', move);
      c.removeEventListener('mouseup', end); c.removeEventListener('mouseleave', end);
      c.removeEventListener('touchstart', start); c.removeEventListener('touchmove', move);
      c.removeEventListener('touchend', end);
    };
  }, [t.mode]);

  const clear = () => {
    const c = canvasRef.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.density.gap }}>
      {t.mode === 'combat' && (
        <div style={{
          padding: '8px 12px', background: t.primarySoft, border: `1px solid ${t.primaryBorder}`,
          borderRadius: 10, fontSize: 12, color: t.fg, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="moon" size={14} color={t.primary} />
          מצב לחימה פעיל · שומר על ראיית לילה
        </div>
      )}

      {/* Summary */}
      <div style={{ ...cardStyle(t),
        boxShadow: t.cardStyle === 'shadow' ? t.shadow : 'none',
        ...(t.cardStyle === 'outlined' ? { border: `1px solid ${t.border}` } : {}),
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.fgMuted, marginBottom: 10 }}>סיכום הנפקה</div>
        <Row k="חייל" v={soldier?.name || '—'} sub={soldier?.id} />
        <Row k="פעילות" v={activity?.name || '—'} />
        <Row k="פריטים" v={`${totalItems} יחידות (${Object.keys(items||{}).filter(k=>items[k]>0).length} סוגים)`} />
      </div>

      {/* Canvas */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.fg }}>חתימת החייל</div>
          <button onClick={clear} style={{
            fontSize: 12, color: t.fgMuted, background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit',
          }}>נקה</button>
        </div>
        <div style={{
          height: 220, background: t.mode === 'combat' ? '#000' : t.bgCard,
          borderRadius: 12, border: `1.5px dashed ${t.mode === 'combat' ? t.primaryBorder : t.border}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }} />
          {!hasInk && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              color: t.fgDim, fontSize: 13,
            }}>
              <Icon name="signature" size={18} color={t.fgDim} />
              חתום כאן
            </div>
          )}
          {/* baseline */}
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 30,
            borderBottom: `1px dashed ${t.mode === 'combat' ? '#3a0a0a' : t.border}` }} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: t.fgMuted }}>
        <input type="checkbox" defaultChecked style={{ marginTop: 3 }} />
        <span>אני מאשר/ת קבלת הציוד המצוין לעיל במצב תקין.</span>
      </label>

      <button onClick={onConfirm} disabled={!hasInk} style={{
        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
        background: hasInk ? t.primary : t.bgMuted, color: hasInk ? t.primaryFg : t.fgDim,
        fontSize: 15, fontWeight: 700,
        cursor: hasInk ? 'pointer' : 'default', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: hasInk && t.mode!=='combat' ? `0 6px 16px ${t.ring}` : 'none',
      }}>
        <Icon name="check" size={18} color={hasInk ? t.primaryFg : t.fgDim} />
        אישור והנפקה
      </button>
    </div>
  );
}

function Row({ k, v, sub }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '8px 0', borderBottom: `1px solid ${t.border}`, gap: 10 }}>
      <div style={{ fontSize: 12, color: t.fgMuted }}>{k}</div>
      <div style={{ textAlign: 'end' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.fg }}>{v}</div>
        {sub && <div style={{ fontSize: 11, color: t.fgMuted, fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>}
      </div>
    </div>
  );
}

window.SignaturePad = SignaturePad;
