// Tweaks panel — in-design controls for mode, primary, density, nav, card style

function TweaksPanel({ tweaks, setTweaks, open, setOpen }) {
  const t = useTheme();
  if (!open) return null;

  const Group = ({ title, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: t.fgMuted, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );

  const Chip = ({ active, onClick, children, swatch }) => (
    <button onClick={onClick} style={{
      padding: '7px 12px', borderRadius: 999,
      border: `1px solid ${active ? t.primary : t.border}`,
      background: active ? t.primary : 'transparent',
      color: active ? t.primaryFg : t.fg,
      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {swatch && <span style={{ width: 12, height: 12, borderRadius: '50%', background: swatch,
        border: `1px solid ${active ? 'rgba(255,255,255,0.4)' : t.border}` }} />}
      {children}
    </button>
  );

  const set = (k, v) => setTweaks({ ...tweaks, [k]: v });

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, zIndex: 100,
      width: 280, background: t.bgCard, borderRadius: 14,
      border: `1px solid ${t.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      padding: 16, color: t.fg, fontFamily: 'inherit', maxHeight: '80vh', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Tweaks</div>
        <button onClick={() => setOpen(false)} style={{
          width: 28, height: 28, borderRadius: 8, border: 'none', background: t.bgMuted,
          color: t.fg, cursor: 'pointer', fontFamily: 'inherit', display: 'grid', placeItems: 'center',
        }}>
          <Icon name="x" size={14} color={t.fg} />
        </button>
      </div>

      <Group title="מצב תצוגה">
        <Chip active={tweaks.mode==='light'} onClick={() => set('mode','light')}>☀ בהיר</Chip>
        <Chip active={tweaks.mode==='dark'} onClick={() => set('mode','dark')}>☾ כהה</Chip>
        <Chip active={tweaks.mode==='combat'} onClick={() => set('mode','combat')}>◆ לחימה</Chip>
      </Group>

      <Group title="צבע ראשי">
        <Chip active={tweaks.primary==='forest'} onClick={() => set('primary','forest')} swatch="#2F6B45">Forest ★</Chip>
        <Chip active={tweaks.primary==='olive'} onClick={() => set('primary','olive')} swatch="#4F6B3E">Olive</Chip>
        <Chip active={tweaks.primary==='sage'} onClick={() => set('primary','sage')} swatch="#6a857e">Sage</Chip>
        <Chip active={tweaks.primary==='teal'} onClick={() => set('primary','teal')} swatch="#3d857c">Teal</Chip>
        <Chip active={tweaks.primary==='slate'} onClick={() => set('primary','slate')} swatch="#566b85">Slate</Chip>
      </Group>

      <Group title="צפיפות">
        <Chip active={tweaks.density==='compact'} onClick={() => set('density','compact')}>דחוס</Chip>
        <Chip active={tweaks.density==='comfortable'} onClick={() => set('density','comfortable')}>נוח</Chip>
        <Chip active={tweaks.density==='spacious'} onClick={() => set('density','spacious')}>מרווח</Chip>
      </Group>

      <Group title="ניווט">
        <Chip active={tweaks.nav==='bottom'} onClick={() => set('nav','bottom')}>תחתון</Chip>
        <Chip active={tweaks.nav==='drawer'} onClick={() => set('nav','drawer')}>מגירה</Chip>
      </Group>

      <Group title="סגנון כרטיס">
        <Chip active={tweaks.card==='flat'} onClick={() => set('card','flat')}>שטוח</Chip>
        <Chip active={tweaks.card==='shadow'} onClick={() => set('card','shadow')}>צל</Chip>
        <Chip active={tweaks.card==='outlined'} onClick={() => set('card','outlined')}>מתאר</Chip>
        <Chip active={tweaks.card==='outlined-shadow'} onClick={() => set('card','outlined-shadow')}>מתאר + צל</Chip>
      </Group>

      <div style={{ padding: 10, background: t.bgMuted, borderRadius: 10, fontSize: 11, color: t.fgMuted, lineHeight: 1.5, marginTop: 6 }}>
        <strong style={{ color: t.fg }}>מצב לחימה</strong> — אדום־על־שחור בלבד, שומר על ראיית לילה בחתימות ופעילות לילית.
      </div>
    </div>
  );
}

function TweaksToggle({ onClick }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{
      position: 'fixed', bottom: 16, left: 16, zIndex: 90,
      width: 44, height: 44, borderRadius: '50%', border: 'none',
      background: t.bgCard, color: t.fg, cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
      display: 'grid', placeItems: 'center', fontFamily: 'inherit',
    }}>
      <Icon name="settings" size={20} color={t.fg} />
    </button>
  );
}

window.TweaksPanel = TweaksPanel;
window.TweaksToggle = TweaksToggle;
