// Inventory screen

function StockBar({ qty, min }) {
  const t = useTheme();
  const ratio = Math.min(1.5, qty / Math.max(min, 1));
  const pct = Math.min(100, (ratio / 1.5) * 100);
  const color = ratio >= 1 ? t.success : ratio >= 0.6 ? t.warning : t.error;
  return (
    <div style={{ height: 4, background: t.bgMuted, borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color,
        boxShadow: t.mode==='combat' ? `0 0 4px ${color}` : 'none' }} />
    </div>
  );
}

function InventoryItemCard({ item }) {
  const t = useTheme();
  const statusTone = {
    ok:   { label: 'במלאי', fg: t.success, bg: t.mode==='combat'? t.primarySoft : '#D7F5E4' },
    low:  { label: 'מתחת לסף', fg: t.warning, bg: t.mode==='combat'? t.primarySoft : '#FEF3D8' },
    gap:  { label: 'חוסר', fg: t.error, bg: t.mode==='combat'? t.primarySoft : '#FEE0E8' },
  }[item.status];
  return (
    <div style={{
      ...cardStyle(t),
      padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: t.cardStyle === 'shadow' ? t.shadow : 'none',
      ...(t.cardStyle === 'outlined' ? { border: `1px solid ${t.border}` } : {}),
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: t.fgMuted,
              background: t.bgMuted, padding: '1px 6px', borderRadius: 4 }}>#{item.num}</span>
            <span style={{ fontSize: 11, color: t.fgMuted }}>{item.category}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: t.fg }}>{item.name}</div>
          {item.note && <div style={{ fontSize: 11, color: t.error, marginTop: 3 }}>{item.note}</div>}
        </div>
        <span style={{
          fontSize: 10.5, fontWeight: 600, color: statusTone.fg, background: statusTone.bg,
          padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap',
        }}>{statusTone.label}</span>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <div style={{ display: 'baseline', display: 'flex', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: t.fg, lineHeight: 1 }}>{item.qty}</span>
            <span style={{ fontSize: 12, color: t.fgMuted }}>{item.uom}</span>
          </div>
          <div style={{ fontSize: 11, color: t.fgMuted }}>סף {item.min}</div>
        </div>
        <StockBar qty={item.qty} min={item.min} />
      </div>
    </div>
  );
}

function InventoryScreen() {
  const t = useTheme();
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const cats = ['all', ...Array.from(new Set(MOCK.inventory.map(i => i.category)))];
  const filtered = MOCK.inventory.filter(i =>
    (cat === 'all' || i.category === cat) &&
    (!q || i.name.includes(q) || i.num.includes(q))
  );

  return (
    <div style={{ padding: t.density.pad, display: 'flex', flexDirection: 'column', gap: t.density.gap }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: t.fg }}>מלאי גדוד</div>
        <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 2 }}>
          {MOCK.inventory.length} פריטים · <span style={{ color: t.error, fontWeight: 600 }}>
            {MOCK.inventory.filter(i=>i.status==='gap').length} בחוסר קריטי
          </span>
        </div>
      </div>

      {/* search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        background: t.bgCard, borderRadius: 12,
        border: `1px solid ${t.border}`,
      }}>
        <Icon name="search" size={18} color={t.fgMuted} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="חפש פריט / מק״ט..." style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'inherit', fontSize: 14, color: t.fg, direction: 'rtl',
        }} />
      </div>

      {/* category chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '6px 12px', borderRadius: 999, border: `1px solid ${cat===c ? t.primary : t.border}`,
            background: cat===c ? t.primary : 'transparent',
            color: cat===c ? t.primaryFg : t.fg,
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}>
            {c === 'all' ? 'הכל' : c}
          </button>
        ))}
      </div>

      {filtered.map(i => <InventoryItemCard key={i.id} item={i} />)}
      <div style={{ height: 8 }} />
    </div>
  );
}

window.InventoryScreen = InventoryScreen;
