// Issuance flow — multi-step: activity → soldier → items → signature

function StepHeader({ step, total, title, onBack }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none', background: t.bgMuted,
          color: t.fg, cursor: 'pointer', display: 'grid', placeItems: 'center', fontFamily: 'inherit',
        }}>
          <Icon name="arrowFwd" size={18} color={t.fg} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: t.fgMuted, marginBottom: 2 }}>שלב {step} מתוך {total}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.fg }}>{title}</div>
      </div>
    </div>
  );
}

function StepDots({ step, total }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i < step ? t.primary : t.bgMuted,
          boxShadow: t.mode==='combat' && i < step ? `0 0 4px ${t.primary}` : 'none',
        }} />
      ))}
    </div>
  );
}

function IssuanceScreen({ onDone, onCancel }) {
  const t = useTheme();
  const [step, setStep] = React.useState(1);
  const [activity, setActivity] = React.useState(MOCK.activities[0]);
  const [soldier, setSoldier] = React.useState(null);
  const [items, setItems] = React.useState({}); // id -> qty
  const totalItems = Object.values(items).reduce((a, b) => a + b, 0);

  const next = () => setStep(s => Math.min(4, s + 1));
  const back = () => step > 1 ? setStep(s => s - 1) : onCancel && onCancel();

  return (
    <div style={{ padding: t.density.pad, display: 'flex', flexDirection: 'column', gap: t.density.gap,
      paddingBottom: 90 }}>
      <StepDots step={step} total={4} />
      <StepHeader step={step} total={4}
        title={['בחר פעילות','בחר חייל','בחר פריטים','חתימה ואישור'][step-1]}
        onBack={back}
      />

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: t.density.gap }}>
          {MOCK.activities.filter(a => a.status !== 'closed').map(a => {
            const sel = activity?.activityId === a.activityId;
            return (
              <button key={a.activityId} onClick={() => setActivity(a)} style={{
                ...cardStyle(t),
                border: `1.5px solid ${sel ? t.primary : t.border}`,
                background: sel ? (t.mode==='combat'? t.primarySoft : t.primarySoft) : t.bgCard,
                textAlign: 'start', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.fg }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: t.fgMuted, marginTop: 3 }}>{a.selectedItemCount} פריטים · החל {a.startDate}</div>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            background: t.bgCard, borderRadius: 12, border: `1px solid ${t.border}`,
          }}>
            <Icon name="search" size={18} color={t.fgMuted} />
            <input placeholder="שם / מספר אישי..." style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: 14, color: t.fg, direction: 'rtl',
            }} />
          </div>
          {MOCK.soldiers.map(s => {
            const sel = soldier?.id === s.id;
            return (
              <button key={s.id} onClick={() => setSoldier(s)} style={{
                ...cardStyle(t),
                padding: 12, border: `1.5px solid ${sel ? t.primary : t.border}`,
                background: sel ? t.primarySoft : t.bgCard,
                textAlign: 'start', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%',
                  background: sel ? t.primary : t.bgMuted,
                  color: sel ? t.primaryFg : t.primary, fontWeight: 700, fontSize: 14,
                  display: 'grid', placeItems: 'center' }}>
                  {s.name.split(' ').map(w => w[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.fg }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: t.fgMuted, marginTop: 2 }}>
                    {s.rank} · {s.company} · {s.platoon || '—'}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: t.fgMuted }}>{s.id}</div>
              </button>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK.inventory.slice(0, 8).filter(i => i.status !== 'gap').map(i => (
            <ItemRow key={i.id} item={i} qty={items[i.id] || 0}
              onChange={v => setItems(prev => ({ ...prev, [i.id]: v }))} />
          ))}
        </div>
      )}

      {step === 4 && (
        <SignaturePad soldier={soldier} activity={activity} items={items} onConfirm={onDone} />
      )}

      {step < 4 && (
        <div style={{
          position: 'sticky', bottom: 0, marginTop: 'auto',
          padding: '12px 0', background: t.bg,
        }}>
          <button onClick={next} disabled={step === 2 && !soldier || step === 3 && totalItems === 0}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: t.primary, color: t.primaryFg, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              opacity: (step === 2 && !soldier) || (step === 3 && totalItems === 0) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: t.mode==='combat' ? `0 0 0 1px ${t.primaryBorder}` : `0 6px 16px ${t.ring}`,
            }}>
            {step === 3 ? `המשך לחתימה (${totalItems} פריטים)` : 'המשך'}
            <Icon name="chevron" size={18} color={t.primaryFg} />
          </button>
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, qty, onChange }) {
  const t = useTheme();
  const dec = () => onChange(Math.max(0, qty - 1));
  const inc = () => onChange(Math.min(item.qty, qty + 1));
  return (
    <div style={{
      ...cardStyle(t),
      padding: 12, display: 'flex', alignItems: 'center', gap: 10,
      border: `1px solid ${qty > 0 ? t.primary : t.border}`,
      background: qty > 0 ? t.primarySoft : t.bgCard,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.fg }}>{item.name}</div>
        <div style={{ fontSize: 11, color: t.fgMuted, marginTop: 2 }}>
          #{item.num} · זמין {item.qty} {item.uom}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0,
        background: t.bgCard, borderRadius: 10, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
        <button onClick={dec} disabled={qty === 0} style={{
          width: 36, height: 36, border: 'none', background: 'transparent',
          color: qty > 0 ? t.fg : t.fgDim, fontSize: 20, cursor: qty > 0 ? 'pointer' : 'default',
          fontFamily: 'inherit',
        }}>−</button>
        <div style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 700, color: t.fg }}>{qty}</div>
        <button onClick={inc} style={{
          width: 36, height: 36, border: 'none', background: 'transparent',
          color: t.primary, fontSize: 20, cursor: 'pointer', fontFamily: 'inherit',
        }}>+</button>
      </div>
    </div>
  );
}

window.IssuanceScreen = IssuanceScreen;
