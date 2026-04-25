// ════════════════════════════════════════════════════════════════
// TeamUp! — All screens
// ════════════════════════════════════════════════════════════════

// Generated cover (gradient + sport pattern) — placeholder for real photos
function SportCover({ sport, height = 140, rounded = 18 }) {
  const m = TUSports[sport] || TUSports.basket;
  const c1 = m.color;
  const c2 = `hsl(from ${m.color} h s calc(l - 18%))`;
  return (
    <div style={{
      height, width: '100%', borderRadius: rounded,
      background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* abstract shapes */}
      <div style={{
        position: 'absolute', right: -30, top: -30,
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
      }}/>
      <div style={{
        position: 'absolute', left: -40, bottom: -50,
        width: 140, height: 140, borderRadius: '50%',
        background: 'rgba(0,0,0,0.12)',
      }}/>
      <div style={{
        position: 'absolute', right: 16, bottom: 14,
        fontSize: height * 0.55, opacity: 0.9, transform: 'rotate(-8deg)',
        filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.2))',
      }}>{m.emoji}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 1. ONBOARDING — 3 slides
// ════════════════════════════════════════════════════════════════
function ScreenOnboarding({ slide = 0, onNext, onBack, onFinish }) {
  const slides = [
    {
      tag: 'Découvre',
      title: 'Le sport autour de toi',
      desc: 'Trouve des matchs, courses et sessions près de chez toi. Géolocalisé, instantané.',
      bg: 'linear-gradient(160deg, #FF6B35 0%, #E5551F 100%)',
      illu: '🏀',
    },
    {
      tag: 'Réserve',
      title: 'Un terrain en 2 taps',
      desc: 'Playground, court, stade. Vois les disponibilités et bloque ton créneau direct.',
      bg: 'linear-gradient(160deg, #2EC4B6 0%, #1FA89B 100%)',
      illu: '📍',
    },
    {
      tag: 'Équipe',
      title: 'Joue avec ta team',
      desc: 'Crée ton équipe, invite tes potes, chat temps réel. Le sport c\'est mieux ensemble.',
      bg: 'linear-gradient(160deg, #1A2B4A 0%, #0F1B33 100%)',
      illu: '👥',
    },
  ];
  const s = slides[slide];
  const isLast = slide === slides.length - 1;
  return (
    <div style={{ height: '100%', position: 'relative', background: s.bg, overflow: 'hidden' }}>
      {/* bg shapes */}
      <div style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.08)'}}/>
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(0,0,0,0.12)'}}/>

      {/* skip */}
      {!isLast && (
        <button onClick={onFinish} style={{
          position: 'absolute', top: 60, right: 20, zIndex: 5,
          background: 'rgba(255,255,255,0.18)', border: 'none',
          color: '#fff', padding: '8px 14px', borderRadius: 999,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Passer</button>
      )}

      {/* hero illustration */}
      <div style={{
        position: 'absolute', top: 100, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          width: 240, height: 240, borderRadius: 60,
          background: 'rgba(255,255,255,0.16)',
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 130, transform: 'rotate(-6deg)',
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.3)',
        }}>{s.illu}</div>
      </div>

      {/* logo top-left */}
      <div style={{ position: 'absolute', top: 60, left: 20, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="assets/teamup-logo.png" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}/>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>TeamUp!</span>
      </div>

      {/* content card */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36,
        padding: '32px 28px 40px',
      }}>
        <div style={{
          display: 'inline-block',
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
          color: TUPalette.orange, marginBottom: 10,
        }}>{s.tag}</div>
        <div style={{
          fontSize: 30, fontWeight: 800, color: TUPalette.ink,
          lineHeight: 1.1, letterSpacing: -0.6, marginBottom: 12,
        }}>{s.title}</div>
        <div style={{ fontSize: 15, color: TUPalette.inkMuted, lineHeight: 1.5, marginBottom: 28 }}>
          {s.desc}
        </div>

        {/* dots + button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            {slides.map((_, i) => (
              <div key={i} style={{
                height: 6, borderRadius: 3,
                width: i === slide ? 24 : 6,
                background: i === slide ? TUPalette.orange : TUPalette.border,
                transition: 'all 200ms',
              }}/>
            ))}
          </div>
          <TUButton onClick={isLast ? onFinish : onNext} size="md" icon={
            isLast ? <IcCheck size={18}/> : <IcArrowR size={18}/>
          }>
            {isLast ? 'Commencer' : 'Suivant'}
          </TUButton>
        </div>

        {slide === 0 && (
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: TUPalette.inkSoft }}>
            Déjà membre ? <span style={{ color: TUPalette.orange, fontWeight: 700 }}>Connexion</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 2. ACCUEIL — feed + mini map
// ════════════════════════════════════════════════════════════════
function EventCard({ ev, onClick, variant = 'standard' }) {
  if (variant === 'compact') {
    const m = TUSports[ev.sport];
    return (
      <div onClick={onClick} style={{
        display: 'flex', gap: 12, padding: 12,
        background: '#fff', borderRadius: 14,
        border: `1px solid ${TUPalette.border}`,
        cursor: 'pointer',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${m.color}, ${m.color}AA)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
        }}>{m.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.label.toUpperCase()}</span>
            <span style={{ fontSize: 11, color: TUPalette.inkSoft }}>· {ev.distance}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: TUPalette.ink, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ev.title}
          </div>
          <div style={{ fontSize: 12, color: TUPalette.inkMuted, marginTop: 3 }}>
            {ev.date} · {ev.time} · {ev.participants}/{ev.max}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 20,
      border: `1px solid ${TUPalette.border}`,
      overflow: 'hidden', cursor: 'pointer',
      boxShadow: '0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)',
    }}>
      <div style={{ position: 'relative' }}>
        <SportCover sport={ev.sport} height={130} rounded={0}/>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <TUSportBadge sport={ev.sport} size="sm" tone="solid"/>
          {ev.hot && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: 'rgba(0,0,0,0.5)', color: '#fff',
              padding: '4px 8px', borderRadius: 999,
              fontWeight: 700, fontSize: 11,
              backdropFilter: 'blur(8px)',
            }}>
              <IcFlame size={11} sw={2.4}/> HOT
            </span>
          )}
        </div>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)', color: TUPalette.ink,
        }}>
          <IcHeart size={16} sw={2.2}/>
        </div>
        <div style={{
          position: 'absolute', bottom: 10, right: 12,
          background: 'rgba(0,0,0,0.55)', color: '#fff',
          padding: '4px 10px', borderRadius: 999,
          fontWeight: 700, fontSize: 11,
          backdropFilter: 'blur(8px)',
        }}>
          {ev.distance}
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: TUPalette.orange }}>{ev.date.toUpperCase()}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: TUPalette.inkSoft }}/>
          <span style={{ fontSize: 12, color: TUPalette.inkMuted, fontWeight: 600 }}>{ev.time}</span>
          <TULevelChip level={ev.level}/>
        </div>
        <div style={{ fontWeight: 800, fontSize: 16, color: TUPalette.ink, letterSpacing: -0.2, marginBottom: 4 }}>
          {ev.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: TUPalette.inkMuted, marginBottom: 12 }}>
          <IcPin size={13} sw={2}/> {ev.place} · {ev.city}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TUAvatarStack names={['M K','C P','Y A','T R']} extra={ev.participants - 4} size={26}/>
            <span style={{ fontSize: 12, color: TUPalette.inkMuted, fontWeight: 600 }}>
              {ev.max - ev.participants} {ev.max - ev.participants === 1 ? 'place' : 'places'}
            </span>
          </div>
          <TUButton size="sm">Rejoindre</TUButton>
        </div>
      </div>
    </div>
  );
}

// Mini map widget — fake interactive map
function MiniMap({ events = [], height = 180, expanded = false, onPin }) {
  return (
    <div style={{
      position: 'relative', height, borderRadius: 18, overflow: 'hidden',
      background: 'linear-gradient(135deg, #E8EEF5 0%, #DDE6F0 100%)',
      border: `1px solid ${TUPalette.border}`,
    }}>
      {/* fake streets */}
      <svg viewBox="0 0 390 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect width="390" height="200" fill="#E8EEF5"/>
        {/* parks */}
        <rect x="20" y="30" width="80" height="50" rx="4" fill="#D5E8D4" opacity="0.7"/>
        <rect x="240" y="120" width="100" height="60" rx="4" fill="#D5E8D4" opacity="0.7"/>
        {/* water */}
        <path d="M 0 80 Q 100 70, 200 90 T 390 100 L 390 130 Q 290 110, 180 130 T 0 120 Z" fill="#BFD7E8" opacity="0.6"/>
        {/* roads */}
        <line x1="0" y1="50" x2="390" y2="80" stroke="#fff" strokeWidth="6"/>
        <line x1="0" y1="150" x2="390" y2="135" stroke="#fff" strokeWidth="4"/>
        <line x1="100" y1="0" x2="130" y2="200" stroke="#fff" strokeWidth="4"/>
        <line x1="280" y1="0" x2="270" y2="200" stroke="#fff" strokeWidth="4"/>
        <line x1="0" y1="100" x2="390" y2="115" stroke="#fff" strokeWidth="3" opacity="0.6"/>
      </svg>
      {/* pins */}
      {events.slice(0, 5).map((ev, i) => {
        const m = TUSports[ev.sport];
        const positions = [
          { left: '28%', top: '35%' },
          { left: '60%', top: '55%' },
          { left: '42%', top: '70%' },
          { left: '75%', top: '30%' },
          { left: '15%', top: '60%' },
        ];
        return (
          <div key={ev.id} onClick={() => onPin && onPin(ev)} style={{
            position: 'absolute', ...positions[i],
            transform: 'translate(-50%, -100%)',
            cursor: 'pointer',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              background: m.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              border: '2px solid #fff',
            }}>
              <span style={{ transform: 'rotate(45deg)', fontSize: 16 }}>{m.emoji}</span>
            </div>
          </div>
        );
      })}
      {/* user dot */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: '#3B82F6', border: '3px solid #fff',
          boxShadow: '0 0 0 6px rgba(59,130,246,0.2), 0 2px 6px rgba(0,0,0,0.2)',
        }}/>
      </div>
      {/* corner label */}
      {!expanded && (
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
          padding: '6px 10px', borderRadius: 10,
          fontSize: 11, fontWeight: 700, color: TUPalette.ink,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <IcLayers size={12} sw={2.2}/> Voir la carte
        </div>
      )}
    </div>
  );
}

function ScreenAccueil({ onOpenEvent, onOpenMap, density = 'standard' }) {
  const [activeChip, setActiveChip] = React.useState('all');
  const chips = [
    { id: 'all', label: 'Tous', emoji: '✨' },
    { id: 'basket', label: 'Basket', emoji: '🏀' },
    { id: 'foot', label: 'Foot', emoji: '⚽' },
    { id: 'tennis', label: 'Tennis', emoji: '🎾' },
    { id: 'running', label: 'Run', emoji: '🏃' },
    { id: 'padel', label: 'Padel', emoji: '🎾' },
  ];
  const events = activeChip === 'all' ? TUData.events : TUData.events.filter(e => e.sport === activeChip);
  return (
    <div style={{ height: '100%', overflow: 'auto', background: TUPalette.bg, paddingBottom: 110 }}>
      {/* Hero header */}
      <div style={{
        background: `linear-gradient(180deg, ${TUPalette.navy} 0%, #243757 100%)`,
        paddingTop: 60, paddingBottom: 22, paddingLeft: 20, paddingRight: 20,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,107,53,0.15)'}}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TUAvatar name={TUData.user.name} size={38} ring ringColor={TUPalette.orange}/>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Salut Léo 👋</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 13, fontWeight: 700 }}>
                <IcPin size={12} sw={2.4}/> {TUData.user.city}
              </div>
            </div>
          </div>
          <button style={{
            position: 'relative', width: 38, height: 38, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <IcBell size={18} sw={2.2}/>
            <span style={{
              position: 'absolute', top: 7, right: 8,
              width: 8, height: 8, borderRadius: '50%',
              background: TUPalette.orange, border: '2px solid #243757',
            }}/>
          </button>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.4, lineHeight: 1.15, marginBottom: 14 }}>
          Quel match aujourd'hui ?
        </div>
        <div onClick={() => {}} style={{
          background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          backdropFilter: 'blur(12px)',
        }}>
          <IcSearch size={18} sw={2.2} stroke="rgba(255,255,255,0.8)"/>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, flex: 1 }}>
            Rechercher un sport, un lieu...
          </span>
          <div style={{
            background: TUPalette.orange, padding: '5px 9px', borderRadius: 9,
            color: '#fff', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
          }}>
            <IcSliders size={11} sw={2.4}/> Filtres
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Cette semaine', value: '8', sub: 'events', color: TUPalette.orange },
          { label: 'À 1 km', value: '12', sub: 'matchs', color: TUPalette.teal },
          { label: 'Streak', value: '5', sub: 'jours 🔥', color: '#7B61FF' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '10px 12px',
            border: `1px solid ${TUPalette.border}`,
          }}>
            <div style={{ fontSize: 10, color: TUPalette.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -0.5 }}>{s.value}</span>
              <span style={{ fontSize: 11, color: TUPalette.inkMuted, fontWeight: 600 }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sport chips */}
      <div style={{ marginTop: 18, paddingLeft: 20, paddingRight: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.2 }}>Près de toi</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: TUPalette.orange, cursor: 'pointer' }}>Voir tout</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {chips.map(c => {
          const a = activeChip === c.id;
          return (
            <button key={c.id} onClick={() => setActiveChip(c.id)} style={{
              padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap',
              background: a ? TUPalette.ink : '#fff',
              color: a ? '#fff' : TUPalette.ink,
              border: a ? 'none' : `1px solid ${TUPalette.border}`,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ fontSize: 14 }}>{c.emoji}</span> {c.label}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div style={{ padding: '14px 20px 0' }} onClick={onOpenMap}>
        <MiniMap events={events} height={170}/>
      </div>

      {/* Featured event */}
      <div style={{ padding: '18px 20px 0' }}>
        <EventCard ev={events[0]} onClick={() => onOpenEvent && onOpenEvent(events[0])}/>
      </div>

      {/* List of next */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.2 }}>À venir cette semaine</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.slice(1).map(ev => (
            <EventCard key={ev.id} ev={ev} variant="compact" onClick={() => onOpenEvent && onOpenEvent(ev)}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3. DÉTAIL ÉVÉNEMENT
// ════════════════════════════════════════════════════════════════
function ScreenEventDetail({ event, onBack, onJoin, onChat }) {
  const ev = event || TUData.events[0];
  const [joined, setJoined] = React.useState(false);
  const m = TUSports[ev.sport];
  return (
    <div style={{ height: '100%', overflow: 'auto', background: TUPalette.bg, paddingBottom: 100 }}>
      {/* Hero cover */}
      <div style={{ position: 'relative' }}>
        <SportCover sport={ev.sport} height={310} rounded={0}/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.5) 100%)',
        }}/>
        {/* top bar */}
        <div style={{
          position: 'absolute', top: 56, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: TUPalette.ink, backdropFilter: 'blur(8px)',
          }}>
            <IcChevL size={20} sw={2.4}/>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              width: 40, height: 40, borderRadius: 14,
              background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: TUPalette.ink,
            }}>
              <IcShare size={17} sw={2.2}/>
            </button>
            <button style={{
              width: 40, height: 40, borderRadius: 14,
              background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: TUPalette.ink,
            }}>
              <IcHeart size={17} sw={2.2}/>
            </button>
          </div>
        </div>
        {/* badges over */}
        <div style={{ position: 'absolute', bottom: 24, left: 20, right: 20 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <TUSportBadge sport={ev.sport} size="md" tone="solid"/>
            <TULevelChip level={ev.level}/>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.5, lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {ev.title}
          </div>
        </div>
      </div>

      {/* Card overlap */}
      <div style={{ marginTop: -22, padding: '0 16px', position: 'relative', zIndex: 2 }}>
        <TUCard padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: TUPalette.orangeSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TUPalette.orange }}>
                <IcCal size={18}/>
              </div>
              <div>
                <div style={{ fontSize: 11, color: TUPalette.inkSoft, fontWeight: 600 }}>QUAND</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TUPalette.ink }}>{ev.date}</div>
                <div style={{ fontSize: 12, color: TUPalette.inkMuted }}>{ev.time} · {ev.duration}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: TUPalette.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TUPalette.tealDark }}>
                <IcPin size={18}/>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: TUPalette.inkSoft, fontWeight: 600 }}>OÙ</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TUPalette.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.place}</div>
                <div style={{ fontSize: 12, color: TUPalette.inkMuted }}>{ev.distance} · {ev.city}</div>
              </div>
            </div>
          </div>
        </TUCard>
      </div>

      {/* Organizer */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
          border: `1px solid ${TUPalette.border}`,
        }}>
          <TUAvatar name={ev.organizer} size={44}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: TUPalette.inkSoft, fontWeight: 600 }}>Organisé par</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TUPalette.ink }}>{ev.organizer}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: TUPalette.inkMuted, marginTop: 2 }}>
              <IcStar size={11} stroke={TUPalette.intermediate}/> 4.8 · 23 events organisés
            </div>
          </div>
          <TUButton variant="ghost" size="sm">Profil</TUButton>
        </div>
      </div>

      {/* Participants */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.2 }}>Participants</span>
            <span style={{ fontSize: 13, color: TUPalette.inkMuted, marginLeft: 6 }}>
              {ev.participants}/{ev.max}
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: TUPalette.orange }}>Voir tout</span>
        </div>
        {/* progress */}
        <div style={{ height: 6, background: TUPalette.surfaceAlt, borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            height: '100%', width: `${(ev.participants / ev.max) * 100}%`,
            background: `linear-gradient(90deg, ${m.color}, ${m.color}DD)`, borderRadius: 999,
          }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {TUData.participants.slice(0, 4).map((p, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <TUAvatar name={p.name} size={48}/>
              <div style={{ fontSize: 10, fontWeight: 600, color: TUPalette.ink, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                {p.name.split(' ')[0]}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: TUPalette.surfaceAlt, color: TUPalette.inkMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14,
              border: `2px dashed ${TUPalette.borderStrong}`,
            }}>+{ev.participants - 4}</div>
            <div style={{ fontSize: 10, color: TUPalette.inkMuted }}>+autres</div>
          </div>
        </div>
      </div>

      {/* Place / map */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: TUPalette.ink, marginBottom: 10 }}>Le terrain</div>
        <MiniMap events={[ev]} height={140}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div style={{ fontSize: 12, color: TUPalette.inkMuted }}>
            <IcMapDot size={12} sw={2.2} stroke={TUPalette.inkMuted}/> 12 min en métro · ligne 9
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: TUPalette.orange }}>Itinéraire →</span>
        </div>
      </div>

      {/* CTA bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 22px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%)',
        display: 'flex', gap: 10, zIndex: 10,
      }}>
        <button onClick={onChat} style={{
          width: 52, height: 52, borderRadius: 16,
          background: '#fff', border: `1px solid ${TUPalette.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: TUPalette.ink, cursor: 'pointer',
        }}>
          <IcSend size={20} sw={2}/>
        </button>
        <TUButton size="lg" full onClick={() => { setJoined(!joined); onJoin && onJoin(); }}
          variant={joined ? 'teal' : 'primary'}
          icon={joined ? <IcCheck size={18}/> : null}>
          {joined ? 'Tu participes !' : `Rejoindre · ${ev.max - ev.participants} place${ev.max - ev.participants > 1 ? 's' : ''}`}
        </TUButton>
      </div>
    </div>
  );
}

window.SportCover = SportCover;
window.EventCard = EventCard;
window.MiniMap = MiniMap;
window.ScreenOnboarding = ScreenOnboarding;
window.ScreenAccueil = ScreenAccueil;
window.ScreenEventDetail = ScreenEventDetail;
