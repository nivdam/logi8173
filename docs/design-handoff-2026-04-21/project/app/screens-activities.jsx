// Activities list screen

function StatusPill({ status }) {
  const t = useTheme();
  const map = {
    active: { label: 'פעיל', bg: t.mode==='combat'? t.primarySoft : '#D7F5E4', fg: t.success },
    draft:  { label: 'טיוטה', bg: t.bgMuted, fg: t.fgMuted },
    closed: { label: 'סגור', bg: t.mode==='combat'? t.primarySoft : '#E0EAFE', fg: t.sky },
  };
  const m = map[status] || map.draft;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color: m.fg, background: m.bg,
      padding: '3px 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {status === 'active' && <span style={{
        width: 6, height: 6, borderRadius: '50%', background: m.fg,
        boxShadow: t.mode==='combat'? `0 0 6px ${m.fg}` : 'none',
      }} />}
      {m.label}
    </span>
  );
}

function ActivityRow({ activity, onOpen }) {
  const t = useTheme();
  return (
    <button onClick={onOpen} style={{
      ...cardStyle(t),
      border: 'none', textAlign: 'start', cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', flexDirection: 'column', gap: 10, width: '100%',
      boxShadow: t.cardStyle === 'shadow' ? t.shadow : 'none',
      ...(t.cardStyle === 'outlined' ? { border: `1px solid ${t.border}` } : {}),
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.fg, marginBottom: 4 }}>{activity.name}</div>
          <div style={{ fontSize: 12, color: t.fgMuted }}>
            {activity.activityType === 'operation' ? 'מבצע' : 'אימון'} · החל {activity.startDate}
          </div>
        </div>
        <StatusPill status={activity.status} />
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: t.fgMuted, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="package" size={14} color={t.fgMuted} />
          {activity.selectedItemCount} פריטים
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="soldier" size={14} color={t.fgMuted} />
          {activity.soldierCount} חיילים
        </div>
        <div style={{ flex: 1 }} />
        <Icon name="chevron" size={16} color={t.fgMuted} />
      </div>
    </button>
  );
}

function ActivitiesScreen() {
  const t = useTheme();
  const [filter, setFilter] = React.useState('all');
  const filtered = MOCK.activities.filter(a => filter === 'all' || a.status === filter);
  return (
    <div style={{ padding: t.density.pad, display: 'flex', flexDirection: 'column', gap: t.density.gap }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: t.fg }}>פעילויות</div>
        <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 2 }}>{MOCK.activities.length} פעילויות · 1 פעילה</div>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'all', label: 'הכל' },
          { id: 'active', label: 'פעילות' },
          { id: 'draft', label: 'טיוטה' },
          { id: 'closed', label: 'סגורות' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '7px 14px', borderRadius: 999, border: `1px solid ${filter===f.id ? t.primary : t.border}`,
            background: filter===f.id ? t.primary : 'transparent',
            color: filter===f.id ? t.primaryFg : t.fg,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <button style={{
        ...cardStyle(t),
        border: `1px dashed ${t.primaryBorder}`, background: 'transparent',
        color: t.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14,
      }}>
        <Icon name="plus" size={18} color={t.primary} />
        פתיחת פעילות חדשה
      </button>

      {filtered.map(a => <ActivityRow key={a.activityId} activity={a} />)}
      <div style={{ height: 8 }} />
    </div>
  );
}

window.ActivitiesScreen = ActivitiesScreen;
window.StatusPill = StatusPill;
