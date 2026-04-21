// Desktop dashboard — sidebar + main view with bento layout
// Designed for 1440x900 canvas. RTL.

function DesktopSidebar({ active, onNav, t }) {
  const items = [
    { id: 'dashboard', label: 'לוח בקרה', icon: 'dashboard' },
    { id: 'activities', label: 'פעילויות', icon: 'activity' },
    { id: 'inventory', label: 'מלאי', icon: 'inventory' },
    { id: 'soldiers', label: 'חיילים', icon: 'soldier' },
    { id: 'reports', label: 'דוחות', icon: 'trending' },
    { id: 'settings', label: 'הגדרות', icon: 'settings' },
  ];
  return (
    <div style={{
      width: 240, height: '100%',
      background: t.headerBg,
      borderInlineStart: `1px solid ${t.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px', gap: 4, flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 20px' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: t.primary,
          display: 'grid', placeItems: 'center',
          border: t.mode === 'combat' ? `1px solid ${t.primaryBorder}` : 'none',
        }}>
          <Icon name="shield" size={20} color={t.primaryFg} />
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: t.fg, letterSpacing: -0.2 }}>Logi8173</div>
          <div style={{ fontSize: 11, color: t.fgMuted }}>גדוד 8173</div>
        </div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: t.fgDim, letterSpacing: 0.6,
        padding: '10px 12px 6px', textTransform: 'uppercase' }}>ראשי</div>

      {items.map(it => {
        const isActive = it.id === active;
        return (
          <button key={it.id} onClick={() => onNav && onNav(it.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10,
            background: isActive ? t.navActiveBg : 'transparent',
            color: isActive ? t.primary : t.fg,
            border: 'none', cursor: 'pointer', textAlign: 'start',
            fontFamily: 'inherit', fontSize: 14, fontWeight: isActive ? 600 : 500,
            position: 'relative',
          }}>
            <Icon name={it.icon} size={18} color={isActive ? t.primary : t.fgMuted} strokeWidth={isActive ? 2 : 1.8} />
            <span>{it.label}</span>
            {isActive && (
              <span style={{ position: 'absolute', insetInlineEnd: 10, width: 5, height: 5,
                borderRadius: '50%', background: t.primary }} />
            )}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Active activity pill */}
      <div style={{
        margin: '8px 0 10px',
        padding: 14, borderRadius: 12,
        background: t.mode === 'combat' ? t.primarySoft : (t.mode === 'dark' ? t.bgCard : t.primarySoft),
        border: `1px solid ${t.mode === 'combat' ? t.primaryBorder : t.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.primary,
            boxShadow: t.mode === 'combat' ? `0 0 6px ${t.primary}` : 'none',
            animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: t.primary, letterSpacing: 0.4 }}>פעילות פעילה</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.fg, lineHeight: 1.25 }}>
          {MOCK.activities[0].name}
        </div>
        <div style={{ fontSize: 11, color: t.fgMuted, marginTop: 4 }}>
          {MOCK.activities[0].txCount} תנועות · {MOCK.activities[0].soldierCount} חיילים
        </div>
      </div>

      {/* Profile */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px',
        borderTop: `1px solid ${t.border}`, marginInline: -4,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: t.primarySoft, color: t.primary, fontWeight: 700, fontSize: 12,
          display: 'grid', placeItems: 'center',
          border: t.mode === 'combat' ? `1px solid ${t.primaryBorder}` : 'none',
        }}>נד</div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.15 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: t.fg }}>ניב דמיאנוביץ׳</div>
          <div style={{ fontSize: 10.5, color: t.fgMuted }}>אדמין · מחובר</div>
        </div>
        <button style={{
          width: 28, height: 28, borderRadius: 8, border: 'none',
          background: 'transparent', color: t.fgMuted, cursor: 'pointer',
          display: 'grid', placeItems: 'center',
        }}><Icon name="settings" size={15} /></button>
      </div>
    </div>
  );
}

function DesktopTopbar({ t }) {
  return (
    <div style={{
      height: 60, padding: '0 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      background: t.headerBg,
      borderBottom: `1px solid ${t.border}`,
      flexShrink: 0,
    }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: t.fg, lineHeight: 1.1 }}>לוח בקרה</div>
        <div style={{ fontSize: 11.5, color: t.fgMuted, marginTop: 2 }}>
          יום ג׳ · 21 באפריל 2026 · {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 440, marginInline: 20, display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 14px', background: t.bgMuted, borderRadius: 10,
        border: `1px solid ${t.border}` }}>
        <Icon name="search" size={16} color={t.fgMuted} />
        <input placeholder="חפש חייל, פריט או פעילות..." style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'inherit', fontSize: 13, color: t.fg, direction: 'rtl',
        }} />
        <span style={{ fontSize: 10.5, color: t.fgDim,
          padding: '2px 6px', border: `1px solid ${t.border}`, borderRadius: 5,
          fontFamily: 'JetBrains Mono, monospace' }}>⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      <button style={{
        padding: '9px 14px', borderRadius: 10, border: `1px solid ${t.border}`,
        background: t.bgCard, color: t.fg, fontFamily: 'inherit', fontSize: 13,
        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="arrowBack" size={14} color={t.fg} />
        ייצוא
      </button>
      <button style={{
        padding: '9px 16px', borderRadius: 10, border: 'none',
        background: t.primary, color: t.primaryFg, fontFamily: 'inherit', fontSize: 13,
        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="plus" size={14} color={t.primaryFg} strokeWidth={2.4} />
        הנפקה מהירה
      </button>

      <button style={{
        width: 38, height: 38, borderRadius: 10, border: `1px solid ${t.border}`,
        background: t.bgCard, color: t.fg, cursor: 'pointer',
        display: 'grid', placeItems: 'center', position: 'relative',
      }}>
        <Icon name="bell" size={16} />
        <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7,
          borderRadius: '50%', background: t.error, border: `2px solid ${t.bgCard}` }} />
      </button>
    </div>
  );
}

function DesktopStatTile({ label, value, delta, tone = 'default', icon, t }) {
  const toneColors = {
    default: { bg: t.primarySoft, fg: t.primary },
    warn: { bg: t.mode === 'combat' ? t.primarySoft : '#FEF3D8', fg: t.warning },
    danger: { bg: t.mode === 'combat' ? t.primarySoft : '#FEE0E8', fg: t.error },
    ok: { bg: t.mode === 'combat' ? t.primarySoft : '#D7F5E4', fg: t.success },
  }[tone];
  return (
    <div style={{
      background: t.bgCard, borderRadius: 14, padding: 18,
      border: `1px solid ${t.border}`,
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: toneColors.bg,
          display: 'grid', placeItems: 'center', color: toneColors.fg,
        }}>
          <Icon name={icon} size={20} color={toneColors.fg} />
        </div>
        {delta && (
          <div style={{ fontSize: 11, color: t.fgMuted,
            padding: '3px 8px', borderRadius: 6, background: t.bgMuted }}>{delta}</div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 800, color: t.fg, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: t.fgMuted, marginTop: 6 }}>{label}</div>
      </div>
    </div>
  );
}

function DesktopCompanyBars({ t }) {
  const data = MOCK.dashboard.companyBreakdown;
  const max = Math.max(...data.map(d => d.issuedCount));
  return (
    <div style={{
      background: t.bgCard, borderRadius: 14, padding: 20,
      border: `1px solid ${t.border}`,
      gridColumn: 'span 2', gridRow: 'span 2',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.fg }}>הנפקות לפי פלוגה</div>
          <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 3 }}>30 הימים האחרונים · כל הפעילויות</div>
        </div>
        <div style={{ fontSize: 11.5, color: t.primary, fontWeight: 600, cursor: 'pointer' }}>פרטים ←</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22 }}>
        {data.map((d, i) => {
          const pct = (d.issuedCount / max) * 100;
          const damage = MOCK.dashboard.damageBreakdown[i]?.totalDamagedQty || 0;
          return (
            <div key={d.companyName}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: t.fg }}>{d.companyName}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 11, color: t.error }}>{damage} פגום</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.fg, fontVariantNumeric: 'tabular-nums' }}>{d.issuedCount}</span>
                </div>
              </div>
              <div style={{ position: 'relative', height: 8, background: t.bgMuted, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', insetInlineStart: 0, top: 0, bottom: 0,
                  width: `${pct}%`,
                  background: `linear-gradient(to left, ${t.palette[500]}, ${t.palette[400]})`,
                  borderRadius: 4,
                }} />
                <div style={{
                  position: 'absolute', insetInlineStart: 0, top: 0, bottom: 0,
                  width: `${(damage / max) * 100}%`,
                  background: t.error, opacity: 0.75, borderRadius: 4,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22,
        paddingTop: 16, borderTop: `1px solid ${t.border}`, fontSize: 11, color: t.fgMuted }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: t.primary }} />הנפקות
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: t.error }} />פגום
        </span>
        <div style={{ flex: 1 }} />
        <span>סה״כ 151 תנועות</span>
      </div>
    </div>
  );
}

function DesktopActivityCard({ t }) {
  const a = MOCK.activities[0];
  return (
    <div style={{
      gridColumn: 'span 2',
      borderRadius: 14, padding: 22,
      background: t.mode === 'combat' ? t.primarySoft : (t.mode === 'dark' ? t.bgCard : `linear-gradient(135deg, ${t.palette[500]}, ${t.palette[700]})`),
      color: t.mode === 'combat' ? t.fg : (t.mode === 'dark' ? t.fg : '#fff'),
      border: t.mode === 'combat' ? `1px solid ${t.primaryBorder}` : (t.mode === 'dark' ? `1px solid ${t.border}` : 'none'),
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', gap: 24,
    }}>
      {/* decorative ring */}
      <div style={{
        position: 'absolute', insetInlineEnd: -80, top: -80,
        width: 260, height: 260, borderRadius: '50%',
        border: `1px solid ${t.mode === 'combat' ? t.primary : 'rgba(255,255,255,0.15)'}`,
        opacity: 0.6, pointerEvents: 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%',
            background: t.mode === 'combat' ? t.primary : '#fff',
            boxShadow: t.mode === 'combat' ? `0 0 8px ${t.primary}` : '0 0 0 4px rgba(255,255,255,0.25)',
            animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, opacity: 0.9 }}>פעילות פעילה</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15, marginBottom: 8, letterSpacing: -0.3 }}>
          {a.name}
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.85 }}>
          החל ב-{a.startDate} · {a.selectedItemCount} פריטים · פתח על ידי {a.openedBy}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'center', position: 'relative' }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{a.txCount}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>תנועות</div>
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{a.soldierCount}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>חיילים</div>
        </div>
        <button style={{
          padding: '11px 20px', borderRadius: 10, border: 'none',
          background: t.mode === 'combat' ? t.primary : '#fff',
          color: t.mode === 'combat' ? t.primaryFg : t.palette[600],
          fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="plus" size={14} color={t.mode === 'combat' ? t.primaryFg : t.palette[600]} strokeWidth={2.4} />
          הנפק ציוד
        </button>
      </div>
    </div>
  );
}

function DesktopInventoryTable({ t }) {
  const rows = MOCK.inventory.slice(0, 6);
  const statusMeta = {
    ok: { label: 'תקין', color: t.success, bg: t.mode === 'combat' ? t.primarySoft : '#D7F5E4' },
    low: { label: 'מתחת לסף', color: t.warning, bg: t.mode === 'combat' ? t.primarySoft : '#FEF3D8' },
    gap: { label: 'חוסר', color: t.error, bg: t.mode === 'combat' ? t.primarySoft : '#FEE0E8' },
  };
  return (
    <div style={{
      background: t.bgCard, borderRadius: 14, padding: 0,
      border: `1px solid ${t.border}`,
      gridColumn: 'span 2', overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.fg }}>מצב מלאי</div>
          <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 3 }}>פריטים דורשים תשומת לב</div>
        </div>
        <div style={{ fontSize: 11.5, color: t.primary, fontWeight: 600, cursor: 'pointer' }}>הצג הכל ←</div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '80px 1fr 110px 90px 110px',
        padding: '10px 20px', fontSize: 10.5, fontWeight: 700,
        color: t.fgDim, letterSpacing: 0.5, textTransform: 'uppercase',
        borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`,
        background: t.bgMuted,
      }}>
        <div>מק״ט</div>
        <div>פריט</div>
        <div>קטגוריה</div>
        <div style={{ textAlign: 'end' }}>כמות</div>
        <div>סטטוס</div>
      </div>

      {rows.map((r, i) => {
        const s = statusMeta[r.status];
        return (
          <div key={r.id} style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 110px 90px 110px',
            padding: '12px 20px', alignItems: 'center',
            borderTop: i === 0 ? 'none' : `1px solid ${t.border}`,
            fontSize: 13,
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: t.fgMuted }}>{r.num}</div>
            <div style={{ fontWeight: 600, color: t.fg }}>{r.name}
              {r.note && <span style={{ fontSize: 11, color: t.fgMuted, fontWeight: 400, marginInlineStart: 8 }}>· {r.note}</span>}
            </div>
            <div style={{ color: t.fgMuted, fontSize: 12 }}>{r.category}</div>
            <div style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: t.fg }}>
              {r.qty}
              <span style={{ fontSize: 11, color: t.fgDim, fontWeight: 400, marginInlineStart: 4 }}>/ {r.min}</span>
            </div>
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 9px', borderRadius: 999,
                background: s.bg, color: s.color,
                fontSize: 11, fontWeight: 600,
                border: t.mode === 'combat' ? `1px solid ${t.primaryBorder}` : 'none',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DesktopRecentTx({ t }) {
  return (
    <div style={{
      background: t.bgCard, borderRadius: 14, padding: 0,
      border: `1px solid ${t.border}`,
      gridRow: 'span 2', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '18px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        borderBottom: `1px solid ${t.border}` }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.fg }}>פעילות אחרונה</div>
          <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 3 }}>תנועות בזמן אמת</div>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: t.success, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.success,
            boxShadow: `0 0 6px ${t.success}`, animation: 'pulse 2s infinite' }} />חי
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {MOCK.recentTx.map((tx, i) => (
          <div key={tx.id} style={{
            padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
            borderTop: i === 0 ? 'none' : `1px solid ${t.border}`,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: tx.type === 'issue'
                ? (t.mode === 'combat' ? t.primarySoft : '#FEE0E8')
                : (t.mode === 'combat' ? t.primarySoft : '#D7F5E4'),
              color: tx.type === 'issue' ? t.error : t.success,
              display: 'grid', placeItems: 'center',
            }}>
              <Icon name={tx.type === 'issue' ? 'arrowFwd' : 'arrowBack'} size={16}
                color={tx.type === 'issue' ? t.error : t.success} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.fg, lineHeight: 1.3 }}>
                {tx.type === 'issue' ? 'הנפקה' : 'החזרה'} · {tx.item}
                <span style={{ color: t.fgMuted, fontWeight: 500, marginInlineStart: 4 }}>×{tx.qty}</span>
              </div>
              <div style={{ fontSize: 11.5, color: t.fgMuted, marginTop: 3 }}>
                {tx.soldier} · {tx.ago}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopShell({ tweaks }) {
  const theme = React.useMemo(() => buildTheme(tweaks), [tweaks]);
  const [active, setActive] = React.useState('dashboard');
  const t = theme;

  return (
    <ThemeCtx.Provider value={theme}>
      <div dir="rtl" style={{
        width: '100%', height: '100%', background: t.bg,
        fontFamily: 'Heebo, system-ui, sans-serif',
        color: t.fg, display: 'flex', overflow: 'hidden',
      }}>
        <DesktopSidebar active={active} onNav={setActive} t={t} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <DesktopTopbar t={t} />
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              gridAutoRows: 'minmax(130px, auto)',
            }}>
              <DesktopStatTile label="פריטים במלאי" value={MOCK.dashboard.totalItems} delta="+2" tone="default" icon="inventory" t={t} />
              <DesktopStatTile label="חוסר קריטי" value={MOCK.dashboard.gapCount} delta="!" tone="danger" icon="alert" t={t} />
              <DesktopStatTile label="מתחת לסף" value={MOCK.dashboard.lowStockCount} delta="-1" tone="warn" icon="trending" t={t} />
              <DesktopStatTile label="פעילויות" value={MOCK.dashboard.activeActivities} delta="פעיל" tone="ok" icon="activity" t={t} />

              <DesktopActivityCard t={t} />
              <DesktopRecentTx t={t} />

              <DesktopCompanyBars t={t} />
              <DesktopInventoryTable t={t} />
            </div>
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}

window.DesktopShell = DesktopShell;
