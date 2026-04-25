// Main app — clickable prototype with screen routing + Tweaks integration

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#FF6B35",
  "accentColor": "#2EC4B6",
  "navStyle": "label",
  "cardDensity": "standard",
  "cornerRadius": 18,
  "darkMode": false
}/*EDITMODE-END*/;

function ProtoApp() {
  const [tweaks, setTweaks] = useTweaks ? useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const [active, setActive] = React.useState('home');
  const [stack, setStack] = React.useState([{ screen: 'home' }]);
  const [transition, setTransition] = React.useState(null);

  // Apply tweaks (live)
  React.useEffect(() => {
    if (tweaks.primaryColor) {
      TUPalette.orange = tweaks.primaryColor;
      // also update soft variant
      TUPalette.orangeSoft = tweaks.primaryColor + '22';
    }
    if (tweaks.accentColor) TUPalette.teal = tweaks.accentColor;
  }, [tweaks.primaryColor, tweaks.accentColor]);

  const top = stack[stack.length - 1];
  const push = (screen, props) => setStack([...stack, { screen, props }]);
  const pop = () => stack.length > 1 && setStack(stack.slice(0, -1));
  const reset = (screen) => { setStack([{ screen }]); setActive(screen === 'home' ? 'home' : screen === 'events' ? 'events' : screen === 'teams' ? 'teams' : screen === 'profile' ? 'profile' : screen === 'terrains' ? 'terrains' : 'home'); };

  const onNavTap = (id) => {
    if (id === 'create') { push('create'); return; }
    const map = { home: 'home', events: 'events', teams: 'teams', profile: 'profile' };
    if (map[id]) reset(map[id]);
  };

  let content;
  switch (top.screen) {
    case 'home':
      content = <ScreenAccueil
        onOpenEvent={(ev) => push('eventDetail', { event: ev })}
        onOpenMap={() => push('terrains')}
      />; break;
    case 'eventDetail':
      content = <ScreenEventDetail event={top.props.event} onBack={pop} onChat={() => push('chat')}/>; break;
    case 'create':
      content = <ScreenCreateEvent onBack={pop} onDone={pop}/>; break;
    case 'profile':
      content = <ScreenProfile/>; break;
    case 'chat':
      content = <ScreenChat onBack={pop} team={top.props && top.props.team}/>; break;
    case 'terrains':
      content = <ScreenTerrains onBack={pop}/>; break;
    case 'teams':
      content = <ScreenTeams onOpenTeam={(t) => push('chat', { team: t })}/>; break;
    case 'events':
      content = <ScreenEvents onOpenEvent={(ev) => push('eventDetail', { event: ev })}/>; break;
    default:
      content = <div style={{ padding: 60 }}>Unknown screen: {top.screen}</div>;
  }

  // Hide bottom nav on certain modal screens
  const hideNav = ['eventDetail', 'create', 'chat'].includes(top.screen);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {content}
      {!hideNav && <TUBottomNav active={active} onTap={onNavTap} variant={tweaks.navStyle}/>}
    </div>
  );
}

// Lightweight events list screen
function ScreenEvents({ onOpenEvent }) {
  const [tab, setTab] = React.useState('upcoming');
  return (
    <div style={{ height: '100%', overflow: 'auto', background: TUPalette.bg, paddingBottom: 110 }}>
      <TUHeader title="Événements" subtitle="Découvre & participe" trailing={
        <button style={{ width: 38, height: 38, borderRadius: 12, background: TUPalette.orangeSoft, color: TUPalette.orange, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcSearch size={18} sw={2.2}/>
        </button>
      }/>
      <div style={{ padding: '14px 0 0' }}>
        <TUTabs tabs={[
          { id: 'upcoming', label: 'À venir', count: 5 },
          { id: 'mine', label: 'Mes events', count: 3 },
          { id: 'past', label: 'Passés' },
        ]} active={tab} onChange={setTab}/>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TUData.events.map(ev => (
          <EventCard key={ev.id} ev={ev} onClick={() => onOpenEvent && onOpenEvent(ev)}/>
        ))}
      </div>
    </div>
  );
}

window.ProtoApp = ProtoApp;
window.ScreenEvents = ScreenEvents;
