// Dashboard screen — Bento-style

function Greeting() {
  const t = useTheme();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'בוקר טוב' : hour < 18 ? 'צהריים טובים' : 'ערב טוב';
  return (
    <div>
      <div style={{ fontSize: 13, color: t.fgMuted, marginBottom: 2 }}>{greet},</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: t.fg, lineHeight: 1.2 }}>ניב</div>
      <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 4 }}>
        יום ג׳ · 21 באפריל 2026 · {new Date().toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})}
      </div>
    </div>
  );
}

function StatTile({ label, value, delta, tone = 'default', icon, onClick }) {
  const t = useTheme();
  const toneColors = {
    default: { bg: t.primarySoft, fg: t.primary },
    warn:    { bg: t.mode==='combat'? t.primarySoft : '#FEF3D8', fg: t.warning },
    danger:  { bg: t.mode==='combat'? t.primarySoft : '#FEE0E8', fg: t.error },
    ok:      { bg: t.mode==='combat'? t.primarySoft : '#D7F5E4', fg: t.success },
  }[tone];
  return (
    <button onClick={onClick} style={{
      ...cardStyle(t),
      border: 'none', textAlign: 'start', cursor: 'pointer',
      background: t.bgCard, padding: t.density.cardPad,
      display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'inherit',
      boxShadow: t.cardStyle === 'shadow' ? t.shadow : 'none',
      ...(t.cardStyle === 'outlined' ? { border: `1px solid ${t.border}` } : {}),
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: toneColors.bg,
          display: 'grid', placeItems: 'center', color: toneColors.fg }}>
          <Icon name={icon} size={18} color={toneColors.fg} />
        </div>
        {delta && <div style={{ fontSize: 11, color: t.fgMuted }}>{delta}</div>}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: t.fg, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 4 }}>{label}</div>
      </div>
    </button>
  );
}

function ActiveActivityCard({ activity, onOpen }) {
  const t = useTheme();
  return (
    <button onClick={onOpen} style={{
      ...cardStyle(t),
      border: 'none', textAlign: 'start', cursor: 'pointer', fontFamily: 'inherit',
      background: t.mode==='combat' ? t.primarySoft : (t.mode==='dark' ? t.bgCard : `linear-gradient(135deg, ${t.palette[400]}, ${t.palette[600]})`),
      color: t.mode==='combat' ? t.fg : (t.mode==='dark' ? t.fg : '#fff'),
      padding: 18, position: 'relative', overflow: 'hidden',
      boxShadow: t.cardStyle === 'shadow' ? t.shadow : 'none',
      ...(t.cardStyle === 'outlined' ? { border: `1px solid ${t.mode==='combat'? t.primaryBorder : t.border}` } : {}),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%',
          background: t.mode==='combat'? t.primary : '#fff',
          boxShadow: t.mode==='combat' ? `0 0 8px ${t.primary}` : '0 0 0 4px rgba(255,255,255,0.25)',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, opacity: 0.9 }}>פעילות פעילה</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>{activity.name}</div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 14 }}>
        החל ב-{activity.startDate} · {activity.selectedItemCount} פריטים
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <MiniStat n={activity.txCount} label="תנועות" />
        <MiniStat n={activity.soldierCount} label="חיילים" />
        <div style={{ flex: 1 }} />
        <div onClick={(e)=>{e.stopPropagation(); onOpen && onOpen('issuance');}}
          style={{ padding:'8px 14px', borderRadius: 999,
            background: t.mode==='combat'? t.primary : 'rgba(255,255,255,0.2)',
            color: t.mode==='combat'? t.primaryFg : '#fff',
            fontSize: 12.5, fontWeight: 700, display:'flex', alignItems:'center', gap:4 }}>
          הנפק עכשיו <Icon name="plus" size={14} color={t.mode==='combat'? t.primaryFg : '#fff'} strokeWidth={2.4} />
        </div>
      </div>
    </button>
  );
}

function MiniStat({ n, label }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10.5, opacity: 0.8, marginTop: 3 }}>{label}</div>
    </div>
  );
}

function QuickActions({ onAction }) {
  const t = useTheme();
  const actions = [
    { id: 'issue',   label: 'הנפק ציוד', icon: 'plus', tone: 'primary' },
    { id: 'return',  label: 'החזרת ציוד', icon: 'arrowBack' },
    { id: 'scan',    label: 'חיפוש פריט', icon: 'search' },
    { id: 'new-act', label: 'פעילות חדשה', icon: 'folder' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.density.gap }}>
      {actions.map(a => (
        <button key={a.id} onClick={() => onAction && onAction(a.id)} style={{
          ...cardStyle(t),
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: a.tone === 'primary' ? t.primary : t.bgCard,
          color: a.tone === 'primary' ? t.primaryFg : t.fg,
          padding: 14, display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: t.cardStyle === 'shadow' ? t.shadow : 'none',
          ...(t.cardStyle === 'outlined' ? { border: `1px solid ${t.border}` } : {}),
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: a.tone === 'primary' ? 'rgba(255,255,255,0.15)' : t.bgMuted,
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name={a.icon} size={18} color={a.tone === 'primary' ? t.primaryFg : t.primary} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</div>
        </button>
      ))}
    </div>
  );
}

function RecentActivityList() {
  const t = useTheme();
  return (
    <div style={{
      ...cardStyle(t),
      padding: 0, overflow: 'hidden',
      boxShadow: t.cardStyle === 'shadow' ? t.shadow : 'none',
      ...(t.cardStyle === 'outlined' ? { border: `1px solid ${t.border}` } : {}),
    }}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.fg }}>פעילות אחרונה</div>
        <div style={{ fontSize: 11, color: t.primary, fontWeight: 600 }}>הצג הכל</div>
      </div>
      {MOCK.recentTx.map((tx, i) => (
        <div key={tx.id} style={{
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
          borderTop: i === 0 ? 'none' : `1px solid ${t.border}`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: tx.type === 'issue'
              ? (t.mode==='combat' ? t.primarySoft : '#FEE0E8')
              : (t.mode==='combat' ? t.primarySoft : '#D7F5E4'),
            color: tx.type === 'issue' ? t.error : t.success,
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name={tx.type === 'issue' ? 'arrowFwd' : 'arrowBack'} size={16}
              color={tx.type === 'issue' ? t.error : t.success} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.fg }}>
              {tx.type === 'issue' ? 'הנפקה' : 'החזרה'} · {tx.item} ×{tx.qty}
            </div>
            <div style={{ fontSize: 11, color: t.fgMuted, marginTop: 2 }}>{tx.soldier} · {tx.ago}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardScreen({ onNav }) {
  const t = useTheme();
  const d = MOCK.dashboard;
  return (
    <div style={{
      padding: t.density.pad, display: 'flex', flexDirection: 'column', gap: t.density.gap,
    }}>
      <Greeting />

      <ActiveActivityCard activity={MOCK.activities[0]} onOpen={(dest) => onNav(dest || 'activities')} />

      <div style={{ fontSize: 13, fontWeight: 600, color: t.fgMuted, marginTop: 4 }}>פעולות מהירות</div>
      <QuickActions onAction={(id) => { if (id === 'issue') onNav('issuance'); }} />

      <div style={{ fontSize: 13, fontWeight: 600, color: t.fgMuted, marginTop: 4 }}>מצב מלאי</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.density.gap }}>
        <StatTile label="פריטים במלאי" value={d.totalItems} tone="default" icon="inventory" onClick={() => onNav('inventory')} />
        <StatTile label="חוסר קריטי" value={d.gapCount} tone="danger" icon="alert" onClick={() => onNav('inventory')} />
        <StatTile label="מתחת לסף" value={d.lowStockCount} tone="warn" icon="trending" onClick={() => onNav('inventory')} />
        <StatTile label="פעילויות פעילות" value={d.activeActivities} tone="ok" icon="activity" onClick={() => onNav('activities')} />
      </div>

      <RecentActivityList />

      <div style={{ height: 8 }} />
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
