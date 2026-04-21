// App shell: header, bottom nav or side drawer nav
// Navigation modes: 'bottom' | 'drawer'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'לוח בקרה', icon: 'dashboard' },
  { id: 'activities', label: 'פעילויות', icon: 'activity' },
  { id: 'issuance', label: 'הנפקה', icon: 'plus', primary: true },
  { id: 'inventory', label: 'מלאי', icon: 'inventory' },
  { id: 'soldiers', label: 'חיילים', icon: 'soldier' },
];

function AppHeader({ title, subtitle, onMenu, showMenu, showProfile, right }) {
  const t = useTheme();
  return (
    <div style={{
      height: 56, minHeight: 56, padding: '0 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      background: t.headerBg,
      borderBottom: `1px solid ${t.border}`,
    }}>
      {showMenu && (
        <button onClick={onMenu} style={{
          width: 40, height: 40, borderRadius: 10, border: 'none',
          background: 'transparent', color: t.fg, cursor: 'pointer',
          display: 'grid', placeItems: 'center',
        }}>
          <Icon name="menu" size={22} />
        </button>
      )}
      <div style={{ width: 32, height: 32, borderRadius: 8, background: t.primary,
        display: 'grid', placeItems: 'center', color: t.primaryFg, fontWeight: 700, fontSize: 13,
        border: t.mode === 'combat' ? `1px solid ${t.primaryBorder}` : 'none' }}>
        <Icon name="shield" size={18} color={t.primaryFg} />
      </div>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: t.fg }}>{title || 'Logi8173'}</div>
        {subtitle && <div style={{ fontSize: 11, color: t.fgMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
      <button style={{
        width: 40, height: 40, borderRadius: '50%', border: 'none',
        background: t.bgMuted, color: t.fg, cursor: 'pointer',
        display: 'grid', placeItems: 'center', position: 'relative',
      }}>
        <Icon name="bell" size={18} />
        <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8,
          borderRadius: '50%', background: t.error, border: `2px solid ${t.headerBg}` }} />
      </button>
      {showProfile && (
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 8px',
          borderRadius: 999, border: `1px solid ${t.border}`, background: 'transparent',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <div style={{ textAlign: 'end', lineHeight: 1.15 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: t.fg }}>ניב דמיאנוביץ׳</div>
            <div style={{ fontSize: 9.5, color: t.fgMuted }}>אדמין · מחובר</div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%',
            background: t.primarySoft, color: t.primary, fontWeight: 700, fontSize: 12,
            display: 'grid', placeItems: 'center',
            border: t.mode==='combat' ? `1px solid ${t.primaryBorder}` : 'none' }}>נד</div>
        </button>
      )}
    </div>
  );
}

function BottomNav({ active, onNav }) {
  const t = useTheme();
  return (
    <div style={{
      height: 72, background: t.navBg,
      borderTop: `1px solid ${t.border}`,
      display: 'flex', padding: '0 6px', alignItems: 'stretch',
      flexShrink: 0,
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        if (item.primary) {
          return (
            <div key={item.id} style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
              <button onClick={() => onNav(item.id)} style={{
                width: 56, height: 56, borderRadius: 18, border: 'none',
                background: t.primary, color: t.primaryFg, cursor: 'pointer',
                display: 'grid', placeItems: 'center', marginTop: -18,
                boxShadow: t.mode === 'combat' ? `0 0 0 1px ${t.primaryBorder}` : `0 8px 20px ${t.ring}`,
              }}>
                <Icon name="plus" size={26} color={t.primaryFg} strokeWidth={2.4} />
              </button>
            </div>
          );
        }
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{
            flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, color: isActive ? t.primary : t.fgMuted, padding: '6px 2px',
          }}>
            <div style={{
              padding: '4px 12px', borderRadius: 12,
              background: isActive ? (t.mode === 'combat' ? t.primarySoft : t.navActiveBg) : 'transparent',
              transition: 'background 0.15s',
            }}>
              <Icon name={item.icon} size={22} color={isActive ? t.primary : t.fgMuted} />
            </div>
            <div style={{ fontSize: 10.5, fontWeight: isActive ? 600 : 500 }}>{item.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function Drawer({ open, onClose, active, onNav }) {
  const t = useTheme();
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: open ? 'auto' : 'none', zIndex: 50,
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: t.overlay,
        opacity: open ? 1 : 0, transition: 'opacity 0.2s',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 260,
        background: t.bgCard, borderLeft: `1px solid ${t.border}`,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: 18, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: t.primary,
              display: 'grid', placeItems: 'center' }}>
              <Icon name="shield" size={22} color={t.primaryFg} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.fg }}>Logi8173</div>
              <div style={{ fontSize: 11, color: t.fgMuted }}>גדוד 8173</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 10, flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const a = active === item.id;
            return (
              <button key={item.id} onClick={() => { onNav(item.id); onClose(); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: a ? (t.mode === 'combat' ? t.primarySoft : t.navActiveBg) : 'transparent',
                color: a ? t.primary : t.fg, fontSize: 15, fontWeight: a ? 600 : 500,
                marginBottom: 4, fontFamily: 'inherit',
              }}>
                <Icon name={item.icon} size={20} color={a ? t.primary : t.fgMuted} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.primarySoft,
            display: 'grid', placeItems: 'center', color: t.primary, fontWeight: 700, fontSize: 14 }}>נד</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.fg }}>ניב דמיאנוביץ׳</div>
            <div style={{ fontSize: 11, color: t.fgMuted }}>אדמין • מחובר</div>
          </div>
          <Icon name="settings" size={18} color={t.fgMuted} />
        </div>
      </div>
    </div>
  );
}

window.AppHeader = AppHeader;
window.BottomNav = BottomNav;
window.Drawer = Drawer;
window.NAV_ITEMS = NAV_ITEMS;
