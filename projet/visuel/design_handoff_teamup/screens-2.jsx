// ════════════════════════════════════════════════════════════════
// 4. CRÉER UN ÉVÉNEMENT — multi-step form
// ════════════════════════════════════════════════════════════════
function ScreenCreateEvent({ onBack, onDone, initialStep = 0 }) {
  const [step, setStep] = React.useState(initialStep);
  const [data, setData] = React.useState({
    sport: 'basket', level: 'intermediaire',
    date: 'Sam. 26 Avr.', time: '19:00', duration: 90,
    place: '', max: 10, visibility: 'public', title: '',
  });
  const steps = ['Sport', 'Quand', 'Où', 'Détails'];

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: TUPalette.bg }}>
      {/* Header */}
      <div style={{ paddingTop: 56, paddingLeft: 16, paddingRight: 16, paddingBottom: 14, background: '#fff', borderBottom: `1px solid ${TUPalette.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: TUPalette.surfaceAlt, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TUPalette.ink }}>
            <IcChevL size={18} sw={2.4}/>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TUPalette.orange, letterSpacing: 1, textTransform: 'uppercase' }}>Étape {step + 1}/4</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.3 }}>Nouvel événement</div>
          </div>
        </div>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= step ? TUPalette.orange : TUPalette.border, transition: 'all 200ms' }}/>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {step === 0 && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.4, marginBottom: 4 }}>Quel sport ?</div>
            <div style={{ fontSize: 14, color: TUPalette.inkMuted, marginBottom: 18 }}>On adapte les options selon ton sport.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(TUSports).map(([k, m]) => {
                const a = data.sport === k;
                return (
                  <button key={k} onClick={() => update('sport', k)} style={{
                    background: a ? '#fff' : '#fff',
                    border: `2px solid ${a ? m.color : TUPalette.border}`,
                    borderRadius: 16, padding: '14px 12px', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: a ? `0 8px 20px -8px ${m.color}66` : 'none',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: m.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{m.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: TUPalette.ink }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: TUPalette.inkMuted }}>{a ? '✓ Sélectionné' : 'Choisir'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TUPalette.ink, marginTop: 24, marginBottom: 10 }}>Niveau requis</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'tous', label: 'Tous niveaux' },
                { id: 'debutant', label: 'Débutant' },
                { id: 'intermediaire', label: 'Intermédiaire' },
                { id: 'confirme', label: 'Confirmé' },
              ].map(l => {
                const a = data.level === l.id;
                return (
                  <button key={l.id} onClick={() => update('level', l.id)} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 12,
                    border: `1.5px solid ${a ? TUPalette.orange : TUPalette.border}`,
                    background: a ? TUPalette.orangeSoft : '#fff',
                    color: a ? TUPalette.orangeDark : TUPalette.ink,
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  }}>{l.label}</button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.4, marginBottom: 18 }}>Quand ça se joue ?</div>
            {/* Date picker week strip */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {['Jeu', 'Ven', 'Sam', 'Dim', 'Lun', 'Mar', 'Mer'].map((d, i) => {
                const num = 24 + i;
                const a = i === 2;
                return (
                  <div key={i} style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, textAlign: 'center',
                    background: a ? TUPalette.navy : '#fff',
                    color: a ? '#fff' : TUPalette.ink,
                    border: a ? 'none' : `1px solid ${TUPalette.border}`,
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{d}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>{num}</div>
                  </div>
                );
              })}
            </div>
            {/* Time */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: `1px solid ${TUPalette.border}`, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TUPalette.inkSoft, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>Horaire</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['12:00', '14:00', '17:00', '18:30', '19:00', '20:30', '21:00'].map(t => {
                  const a = data.time === t;
                  return (
                    <button key={t} onClick={() => update('time', t)} style={{
                      padding: '8px 14px', borderRadius: 10, border: 'none',
                      background: a ? TUPalette.ink : TUPalette.surfaceAlt,
                      color: a ? '#fff' : TUPalette.ink,
                      fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>{t}</button>
                  );
                })}
              </div>
            </div>
            {/* Duration */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: `1px solid ${TUPalette.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TUPalette.inkSoft, letterSpacing: 0.6, textTransform: 'uppercase' }}>Durée</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: TUPalette.orange }}>{data.duration} min</div>
              </div>
              <input type="range" min="30" max="180" step="15" value={data.duration}
                onChange={(e) => update('duration', +e.target.value)}
                style={{ width: '100%', accentColor: TUPalette.orange }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: TUPalette.inkSoft, marginTop: 4 }}>
                <span>30 min</span><span>3 h</span>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.4, marginBottom: 14 }}>Où ça se passe ?</div>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <input placeholder="Rechercher un terrain..." style={{
                width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14,
                border: `1px solid ${TUPalette.border}`, background: '#fff',
                fontSize: 14, fontFamily: TUType.body, outline: 'none', boxSizing: 'border-box',
              }}/>
              <IcSearch size={18} sw={2.2} stroke={TUPalette.inkSoft} />
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: TUPalette.inkSoft }}>
                <IcSearch size={18} sw={2.2}/>
              </div>
            </div>
            <MiniMap events={TUData.events} height={180}/>
            <div style={{ fontSize: 13, fontWeight: 700, color: TUPalette.ink, marginTop: 18, marginBottom: 8 }}>Suggestions près de toi</div>
            {TUData.terrains.slice(0, 3).map((t, i) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 8,
                background: '#fff', borderRadius: 14,
                border: `1.5px solid ${i === 0 ? TUPalette.orange : TUPalette.border}`,
                cursor: 'pointer',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: TUSports[t.sport].color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{TUSports[t.sport].emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: TUPalette.ink, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: TUPalette.inkMuted }}>{t.distance} · {t.free ? 'Gratuit' : t.price}</div>
                </div>
                {i === 0 && <div style={{ width: 22, height: 22, borderRadius: '50%', background: TUPalette.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IcCheck size={13} sw={3}/></div>}
              </div>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.4, marginBottom: 18 }}>Quelques détails</div>
            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TUPalette.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>Titre de l'événement</div>
              <input placeholder="ex: 5v5 Playground République" defaultValue="5v5 Playground République" style={{
                width: '100%', padding: '13px 14px', borderRadius: 14,
                border: `1px solid ${TUPalette.border}`, background: '#fff',
                fontSize: 14, fontWeight: 600, fontFamily: TUType.body, outline: 'none', boxSizing: 'border-box',
                color: TUPalette.ink,
              }}/>
            </div>
            {/* Max participants */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: `1px solid ${TUPalette.border}`, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TUPalette.ink }}>Participants max</div>
                  <div style={{ fontSize: 11, color: TUPalette.inkMuted }}>Toi inclus</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => update('max', Math.max(2, data.max - 1))} style={{ width: 32, height: 32, borderRadius: 10, background: TUPalette.surfaceAlt, border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 800 }}>−</button>
                  <span style={{ fontSize: 22, fontWeight: 800, color: TUPalette.orange, minWidth: 32, textAlign: 'center' }}>{data.max}</span>
                  <button onClick={() => update('max', data.max + 1)} style={{ width: 32, height: 32, borderRadius: 10, background: TUPalette.orangeSoft, color: TUPalette.orange, border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 800 }}>+</button>
                </div>
              </div>
            </div>
            {/* Visibility */}
            <div style={{ fontSize: 13, fontWeight: 700, color: TUPalette.ink, marginBottom: 8 }}>Visibilité</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'public', icon: <IcGlobe size={18}/>, title: 'Public', desc: 'Visible par tous' },
                { id: 'team', icon: <IcUsers size={18}/>, title: 'Équipe', desc: 'Mes équipes uniquement' },
                { id: 'private', icon: <IcLock size={18}/>, title: 'Privé', desc: 'Sur invitation seulement' },
              ].map(v => {
                const a = data.visibility === v.id;
                return (
                  <button key={v.id} onClick={() => update('visibility', v.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 14, borderRadius: 14,
                    background: '#fff',
                    border: `1.5px solid ${a ? TUPalette.orange : TUPalette.border}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: a ? TUPalette.orangeSoft : TUPalette.surfaceAlt, color: a ? TUPalette.orange : TUPalette.inkMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {v.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TUPalette.ink }}>{v.title}</div>
                      <div style={{ fontSize: 12, color: TUPalette.inkMuted }}>{v.desc}</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: `2px solid ${a ? TUPalette.orange : TUPalette.borderStrong}`,
                      background: a ? TUPalette.orange : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {a && <IcCheck size={12} sw={3.5} stroke="#fff"/>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 16px 30px', background: '#fff', borderTop: `1px solid ${TUPalette.border}`, display: 'flex', gap: 10 }}>
        {step > 0 && (
          <TUButton variant="ghost" size="lg" onClick={() => setStep(step - 1)}>Retour</TUButton>
        )}
        <TUButton size="lg" full onClick={() => step < 3 ? setStep(step + 1) : (onDone && onDone())}
          icon={step < 3 ? <IcArrowR size={18}/> : <IcCheck size={18}/>}>
          {step < 3 ? 'Continuer' : 'Publier l\'événement'}
        </TUButton>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 5. PROFIL
// ════════════════════════════════════════════════════════════════
function ScreenProfile({ onBack }) {
  const u = TUData.user;
  return (
    <div style={{ height: '100%', overflow: 'auto', background: TUPalette.bg, paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(160deg, ${TUPalette.navy} 0%, #243757 60%, #2D4670 100%)`,
        paddingTop: 56, paddingBottom: 60, paddingLeft: 20, paddingRight: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,107,53,0.18)' }}/>
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(46,196,182,0.12)' }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Profil</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IcShare size={15} sw={2.2}/>
            </button>
            <button style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IcSliders size={15} sw={2.2}/>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <TUAvatar name={u.name} size={76} ring ringColor={TUPalette.orange}/>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>{u.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>{u.handle} · {u.city}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,107,53,0.25)', border: '1px solid rgba(255,107,53,0.5)', padding: '4px 10px', borderRadius: 999, color: '#fff', fontWeight: 700, fontSize: 11 }}>
              <IcFlame size={11} sw={2.4}/> Niveau Or · 1240 pts
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid (overlap) */}
      <div style={{ marginTop: -40, padding: '0 16px', position: 'relative', zIndex: 2 }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '16px 8px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
          boxShadow: '0 12px 32px -16px rgba(26,43,74,0.25)',
          border: `1px solid ${TUPalette.border}`,
        }}>
          {[
            { v: u.stats.events, l: 'Events', c: TUPalette.orange },
            { v: u.stats.victories, l: 'Victoires', c: TUPalette.teal },
            { v: u.stats.teams, l: 'Équipes', c: '#7B61FF' },
            { v: u.stats.hours + 'h', l: 'Joué', c: TUPalette.intermediate },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 4px', borderRight: i < 3 ? `1px solid ${TUPalette.border}` : 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c, letterSpacing: -0.5 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: TUPalette.inkMuted, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sports & levels */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.2 }}>Mes sports</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: TUPalette.orange }}>+ Ajouter</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(u.level).map(([sport, lvl]) => {
            const m = TUSports[sport];
            const lblMap = { debutant: 'Débutant', intermediaire: 'Intermédiaire', confirme: 'Confirmé' };
            const widthMap = { debutant: '33%', intermediaire: '66%', confirme: '95%' };
            return (
              <div key={sport} style={{
                background: '#fff', borderRadius: 14, padding: 14,
                border: `1px solid ${TUPalette.border}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: m.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{m.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: TUPalette.ink, fontSize: 14 }}>{m.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{lblMap[lvl]}</span>
                  </div>
                  <div style={{ height: 5, background: TUPalette.surfaceAlt, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: widthMap[lvl], background: m.color, borderRadius: 999 }}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.2, marginBottom: 12 }}>Récompenses</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { icon: '🏆', label: 'MVP', sub: '×3', color: TUPalette.intermediate },
            { icon: '🔥', label: 'Streak', sub: '5j', color: TUPalette.orange },
            { icon: '⚡', label: 'Rapide', sub: 'Top 10', color: '#7B61FF' },
            { icon: '🤝', label: 'Team', sub: 'Fair-play', color: TUPalette.teal },
          ].map((a, i) => (
            <div key={i} style={{
              minWidth: 90, background: '#fff', borderRadius: 14, padding: 12, textAlign: 'center',
              border: `1px solid ${TUPalette.border}`,
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{a.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TUPalette.ink }}>{a.label}</div>
              <div style={{ fontSize: 10, color: a.color, fontWeight: 700 }}>{a.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity / next */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: TUPalette.ink, marginBottom: 12 }}>Prochains events</div>
        {TUData.events.slice(0, 2).map(ev => (
          <div key={ev.id} style={{ marginBottom: 10 }}>
            <EventCard ev={ev} variant="compact"/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 6. MESSAGERIE ÉQUIPE — chat
// ════════════════════════════════════════════════════════════════
function ScreenChat({ onBack, team }) {
  const t = team || TUData.teams[0];
  const [messages, setMessages] = React.useState(TUData.messages);
  const [draft, setDraft] = React.useState('');
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);
  const send = () => {
    if (!draft.trim()) return;
    setMessages([...messages, { from: 'Léo', text: draft, t: 'maintenant', mine: true }]);
    setDraft('');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: TUPalette.bg }}>
      {/* Header */}
      <div style={{
        paddingTop: 56, paddingLeft: 12, paddingRight: 16, paddingBottom: 12,
        background: '#fff', borderBottom: `1px solid ${TUPalette.border}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TUPalette.ink }}>
          <IcChevL size={20} sw={2.4}/>
        </button>
        <div style={{ position: 'relative', marginRight: 8 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: `linear-gradient(135deg, ${TUSports[t.sport].color}, ${TUSports[t.sport].color}AA)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>{TUSports[t.sport].emoji}</div>
          <span style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: TUPalette.ink }}>{t.name}</div>
          <div style={{ fontSize: 11, color: TUPalette.teal, fontWeight: 600 }}>● {t.members} membres · 4 en ligne</div>
        </div>
        <button style={{ width: 38, height: 38, borderRadius: 12, background: TUPalette.surfaceAlt, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TUPalette.ink }}>
          <IcMore size={18}/>
        </button>
      </div>

      {/* Pinned event */}
      <div style={{ padding: '10px 12px 0' }}>
        <div style={{
          background: 'linear-gradient(95deg, #FF6B35, #E5551F)',
          borderRadius: 14, padding: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          color: '#fff',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏀</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.6 }}>📌 Event épinglé</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>5v5 ce soir 19h00 · Jules Ferry</div>
          </div>
          <IcChevR size={18} sw={2.2}/>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '14px 14px 8px' }}>
        <div style={{ textAlign: 'center', fontSize: 11, color: TUPalette.inkSoft, fontWeight: 600, padding: '6px 0 14px' }}>
          Aujourd'hui
        </div>
        {messages.map((msg, i) => {
          const showAvatar = !msg.mine && (i === 0 || messages[i-1].from !== msg.from);
          const showName = showAvatar;
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: msg.mine ? 'flex-end' : 'flex-start',
              gap: 8, marginBottom: 6, alignItems: 'flex-end',
            }}>
              {!msg.mine && (
                <div style={{ width: 30 }}>
                  {showAvatar && <TUAvatar name={msg.from} size={30}/>}
                </div>
              )}
              <div style={{ maxWidth: '75%' }}>
                {showName && !msg.mine && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: TUPalette.inkMuted, marginBottom: 3, marginLeft: 4 }}>{msg.from}</div>
                )}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.mine ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: msg.mine
                    ? `linear-gradient(135deg, ${TUPalette.orange}, ${TUPalette.orangeDark})`
                    : '#fff',
                  color: msg.mine ? '#fff' : TUPalette.ink,
                  fontSize: 14, lineHeight: 1.35,
                  boxShadow: msg.mine ? '0 4px 12px -4px rgba(255,107,53,0.4)' : '0 1px 0 rgba(26,43,74,0.05)',
                  border: msg.mine ? 'none' : `1px solid ${TUPalette.border}`,
                  wordBreak: 'break-word',
                }}>{msg.text}</div>
                <div style={{ fontSize: 10, color: TUPalette.inkSoft, marginTop: 3, textAlign: msg.mine ? 'right' : 'left', paddingLeft: msg.mine ? 0 : 4, paddingRight: msg.mine ? 4 : 0 }}>
                  {msg.t}
                </div>
              </div>
            </div>
          );
        })}
        {/* Typing indicator */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
          <TUAvatar name="Camille P." size={30}/>
          <div style={{
            background: '#fff', padding: '12px 16px', borderRadius: '4px 18px 18px 18px',
            border: `1px solid ${TUPalette.border}`,
            display: 'flex', gap: 4,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: TUPalette.inkSoft,
                animation: `tu-typing 1.2s ${i * 0.2}s infinite`,
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px 28px', background: '#fff',
        borderTop: `1px solid ${TUPalette.border}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button style={{ width: 38, height: 38, borderRadius: 12, background: TUPalette.surfaceAlt, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TUPalette.inkMuted }}>
          <IcPlus size={20} sw={2.4}/>
        </button>
        <div style={{
          flex: 1, background: TUPalette.surfaceAlt,
          borderRadius: 22, padding: '4px 4px 4px 16px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Message à l'équipe..."
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: 14, fontFamily: TUType.body, color: TUPalette.ink, padding: '8px 0',
            }}/>
          <button onClick={send} disabled={!draft.trim()} style={{
            width: 36, height: 36, borderRadius: 12,
            background: draft.trim() ? `linear-gradient(135deg, ${TUPalette.orange}, ${TUPalette.orangeDark})` : TUPalette.border,
            border: 'none', cursor: draft.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
          }}>
            <IcSend size={16} sw={2.2}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 7. TERRAINS (carte + liste)
// ════════════════════════════════════════════════════════════════
function ScreenTerrains({ onBack }) {
  return (
    <div style={{ height: '100%', overflow: 'hidden', position: 'relative', background: TUPalette.bg }}>
      {/* Map full */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <MiniMap events={TUData.events} height={844} expanded/>
      </div>
      {/* Top search */}
      <div style={{
        position: 'absolute', top: 56, left: 16, right: 16,
        background: '#fff', borderRadius: 16, padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.2)',
      }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: TUPalette.ink }}>
          <IcChevL size={20} sw={2.4}/>
        </button>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: TUPalette.ink }}>Terrains à proximité</div>
        <button style={{ width: 32, height: 32, borderRadius: 10, background: TUPalette.orangeSoft, border: 'none', color: TUPalette.orange, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcSliders size={15} sw={2.2}/>
        </button>
      </div>
      {/* Quick filters */}
      <div style={{
        position: 'absolute', top: 116, left: 0, right: 0,
        display: 'flex', gap: 6, padding: '0 16px', overflowX: 'auto',
      }}>
        {['Tous', 'Basket', 'Foot', 'Tennis', 'Padel', 'Gratuit'].map((f, i) => (
          <button key={f} style={{
            padding: '7px 12px', borderRadius: 999, whiteSpace: 'nowrap',
            background: i === 0 ? TUPalette.ink : '#fff',
            color: i === 0 ? '#fff' : TUPalette.ink,
            border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>{f}</button>
        ))}
      </div>
      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 0 100px',
        boxShadow: '0 -8px 30px -8px rgba(0,0,0,0.15)',
        maxHeight: '55%', overflow: 'auto',
      }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: TUPalette.borderStrong, margin: '0 auto 14px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 10px' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.2 }}>4 terrains trouvés</div>
            <div style={{ fontSize: 11, color: TUPalette.inkMuted }}>Trié par proximité</div>
          </div>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: TUPalette.orange, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Liste <IcChevD size={14} sw={2.4}/>
          </button>
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TUData.terrains.map(t => {
            const m = TUSports[t.sport];
            return (
              <div key={t.id} style={{
                background: '#fff', borderRadius: 16, padding: 12,
                border: `1px solid ${TUPalette.border}`,
                display: 'flex', gap: 12, cursor: 'pointer',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${m.color}, ${m.color}99)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                }}>{m.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: TUPalette.ink, letterSpacing: -0.1 }}>{t.name}</span>
                    {t.available && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }}/>}
                  </div>
                  <div style={{ fontSize: 11, color: TUPalette.inkMuted, marginBottom: 6 }}>
                    <IcStar size={10} stroke={TUPalette.intermediate}/> {t.rating} · {t.distance}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: t.free ? TUPalette.tealSoft : TUPalette.orangeSoft, color: t.free ? TUPalette.tealDark : TUPalette.orangeDark }}>
                      {t.free ? 'Gratuit' : t.price}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: t.available ? '#DCFCE7' : '#FEE2E2', color: t.available ? '#166534' : '#991B1B' }}>
                      {t.available ? 'Disponible' : 'Complet aujourd\'hui'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: TUPalette.inkSoft }}>
                  <IcChevR size={16} sw={2.2}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 8. ÉQUIPES (liste)
// ════════════════════════════════════════════════════════════════
function ScreenTeams({ onOpenTeam }) {
  return (
    <div style={{ height: '100%', overflow: 'auto', background: TUPalette.bg, paddingBottom: 110 }}>
      <TUHeader title="Mes équipes" subtitle="3 équipes" trailing={
        <button style={{ width: 38, height: 38, borderRadius: 12, background: TUPalette.orangeSoft, color: TUPalette.orange, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcPlus size={18} sw={2.4}/>
        </button>
      }/>
      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TUData.teams.map(t => (
          <div key={t.id} onClick={() => onOpenTeam && onOpenTeam(t)} style={{
            background: '#fff', borderRadius: 16, padding: 14,
            border: `1px solid ${TUPalette.border}`,
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg, ${TUSports[t.sport].color}, ${TUSports[t.sport].color}AA)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>{TUSports[t.sport].emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.2 }}>{t.name}</span>
                <span style={{ fontSize: 10, color: TUPalette.inkSoft, fontWeight: 600, flexShrink: 0 }}>{t.when}</span>
              </div>
              <div style={{ fontSize: 12, color: TUPalette.inkMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.lastMsg}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: t.color, padding: '2px 7px', background: t.color + '15', borderRadius: 6 }}>
                  {t.members} membres
                </span>
                {t.unread > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', padding: '2px 7px', background: TUPalette.orange, borderRadius: 999 }}>
                    {t.unread} non lus
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Create team CTA */}
        <button style={{
          background: '#fff', borderRadius: 16, padding: 18,
          border: `1.5px dashed ${TUPalette.borderStrong}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer', color: TUPalette.inkMuted, fontWeight: 700, fontSize: 14,
        }}>
          <IcPlus size={18} sw={2.4}/> Créer une nouvelle équipe
        </button>
      </div>
    </div>
  );
}

window.ScreenCreateEvent = ScreenCreateEvent;
window.ScreenProfile = ScreenProfile;
window.ScreenChat = ScreenChat;
window.ScreenTerrains = ScreenTerrains;
window.ScreenTeams = ScreenTeams;
