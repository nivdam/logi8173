// Mobile shell — extracted from main.jsx so it can be reused inside a
// design canvas artboard without re-mounting the full App wrapper.
// Renders the phone bezel + screen + nav for a given tweaks object.

function MobileSoldiersScreen() {
  const t = useTheme();
  const grouped = {};
  MOCK.soldiers.forEach(s => { (grouped[s.company] = grouped[s.company] || []).push(s); });
  return (
    <div style={{ padding: t.density.pad, display: 'flex', flexDirection: 'column', gap: t.density.gap }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: t.fg }}>חיילים</div>
        <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 2 }}>{MOCK.soldiers.length} חיילים · {Object.keys(grouped).length} פלוגות</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        background: t.bgCard, borderRadius: 12, border: `1px solid ${t.border}` }}>
        <Icon name="search" size={18} color={t.fgMuted} />
        <input placeholder="חפש חייל..." style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'inherit', fontSize: 14, color: t.fg, direction: 'rtl',
        }} />
      </div>
      {Object.entries(grouped).map(([company, list]) => (
        <div key={company}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.fgMuted, padding: '6px 4px 8px' }}>
            {company} · {list.length}
          </div>
          <div style={{ ...cardStyle(t), padding: 0, overflow: 'hidden',
            boxShadow: t.cardStyle==='shadow'? t.shadow : 'none',
            ...(t.cardStyle==='outlined'? { border: `1px solid ${t.border}` } : {}),
          }}>
            {list.map((s, i) => (
              <div key={s.id} style={{
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                borderTop: i===0? 'none' : `1px solid ${t.border}`,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%',
                  background: t.primarySoft, color: t.primary, fontWeight: 700, fontSize: 13,
                  display: 'grid', placeItems: 'center' }}>
                  {s.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.fg }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: t.fgMuted, marginTop: 2 }}>{s.rank} · {s.platoon || '—'}</div>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: t.fgMuted }}>{s.id}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ height: 20 }} />
    </div>
  );
}

function MobileSuccessScreen({ onDone }) {
  const t = useTheme();
  return (
    <div style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%',
        background: t.mode==='combat'? t.primarySoft : (t.mode==='dark'? '#19BE6520' : '#D7F5E4'),
        display: 'grid', placeItems: 'center',
        boxShadow: t.mode==='combat'? `0 0 20px ${t.primary}40` : 'none',
      }}>
        <Icon name="check" size={40} color={t.mode==='combat'? t.primary : t.success} strokeWidth={3} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: t.fg, textAlign: 'center' }}>ההנפקה בוצעה</div>
      <div style={{ fontSize: 13, color: t.fgMuted, textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
        התנועה נרשמה בפעילות ונשמרה לתיקיית ה-Drive של הפעילות.
      </div>
      <button onClick={onDone} style={{
        marginTop: 14, padding: '12px 28px', borderRadius: 10, border: `1px solid ${t.primary}`,
        background: 'transparent', color: t.primary, fontSize: 14, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>חזור ללוח בקרה</button>
    </div>
  );
}

function MobileStatusBar({ theme }) {
  const fg = theme.mode === 'combat' ? theme.primary : theme.fg;
  return (
    <div style={{
      height: 32, padding: '0 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: theme.bg, color: fg, fontSize: 13, fontWeight: 600,
      flexShrink: 0,
    }}>
      <div>9:41</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 14, height: 10, border: `1.5px solid ${fg}`, borderRadius: 2, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 1, background: fg, borderRadius: 1, width: '70%' }} />
        </div>
      </div>
    </div>
  );
}

function MobileShell({ tweaks }) {
  const [active, setActive] = React.useState('dashboard');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const theme = React.useMemo(() => buildTheme(tweaks), [tweaks]);

  const screenTitle = {
    dashboard: 'לוח בקרה',
    activities: 'פעילויות',
    inventory: 'מלאי',
    soldiers: 'חיילים',
    issuance: 'הנפקת ציוד',
  }[active] || 'Logi8173';

  const handleIssuanceDone = () => { setShowSuccess(true); };
  const handleSuccessDone = () => { setShowSuccess(false); setActive('dashboard'); };

  const frameW = 412, frameH = 892;
  return (
    <ThemeCtx.Provider value={theme}>
      <div style={{
        width: frameW, height: frameH,
        borderRadius: 46,
        background: theme.mode === 'combat' ? '#0a0000' : '#1a1d20',
        padding: 10,
        boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.04) inset',
        position: 'relative',
      }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 36, overflow: 'hidden', background: theme.bg,
          position: 'relative',
          display: 'flex', flexDirection: 'column',
        }}>
          <MobileStatusBar theme={theme} />
          <AppHeader
            title={screenTitle}
            subtitle={active === 'dashboard' ? 'גדוד 8173' : undefined}
            showMenu={tweaks.nav === 'drawer'}
            showProfile={tweaks.nav === 'bottom'}
            onMenu={() => setDrawerOpen(true)}
          />
          <div style={{ flex: 1, overflowY: 'auto', background: theme.bg, minHeight: 0 }}>
            {showSuccess ? (
              <MobileSuccessScreen onDone={handleSuccessDone} />
            ) : (
              <>
                {active === 'dashboard' && <DashboardScreen onNav={setActive} />}
                {active === 'activities' && <ActivitiesScreen />}
                {active === 'inventory' && <InventoryScreen />}
                {active === 'soldiers' && <MobileSoldiersScreen />}
                {active === 'issuance' && (
                  <IssuanceScreen onDone={handleIssuanceDone} onCancel={() => setActive('dashboard')} />
                )}
              </>
            )}
          </div>

          {tweaks.nav === 'bottom' && !showSuccess && active !== 'issuance' && (
            <BottomNav active={active} onNav={setActive} />
          )}
          {tweaks.nav === 'drawer' && (
            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
              active={active} onNav={setActive} />
          )}

          <div style={{
            height: 20, display: 'grid', placeItems: 'center',
            background: theme.mode === 'combat' ? '#0a0000' : theme.bg,
            flexShrink: 0,
          }}>
            <div style={{ width: 120, height: 4, borderRadius: 2,
              background: theme.mode === 'combat' ? theme.primary : theme.fgDim,
              opacity: theme.mode === 'combat' ? 0.8 : 0.4 }} />
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}

window.MobileShell = MobileShell;
