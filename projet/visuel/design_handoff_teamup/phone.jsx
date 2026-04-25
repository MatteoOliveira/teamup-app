// Phone shell — replaces IOSDevice for our needs (we need full control over content)
// 390 × 844 (iPhone 14 Pro), with status bar + Dynamic Island + home indicator.

function TUStatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#1A2B4A';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 54,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 26px 0', zIndex: 30, pointerEvents: 'none',
      fontFamily: TUType.body,
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: c, letterSpacing: 0.2 }}>{time}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="7" width="3" height="4" rx="0.6" fill={c}/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.6" fill={c}/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.6" fill={c}/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c}/>
        </svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 17 12" fill={c}>
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z"/>
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z"/>
          <circle cx="8.5" cy="10.5" r="1.5"/>
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.4" fill="none"/>
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c}/>
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

function TUPhone({ children, dark = false, label, width = 390, height = 844, statusBarTime = '9:41', noStatusBar = false }) {
  return (
    <div style={{
      width, height,
      borderRadius: 52,
      background: dark ? '#0B0F1A' : '#FFFFFF',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 30px 60px -20px rgba(26,43,74,0.25), 0 0 0 1px rgba(26,43,74,0.08)',
      fontFamily: TUType.body,
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 122, height: 35, borderRadius: 22, background: '#000', zIndex: 50,
      }} />
      {!noStatusBar && <TUStatusBar dark={dark} time={statusBarTime} />}

      {/* content */}
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>

      {/* home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 100,
        background: dark ? 'rgba(255,255,255,0.85)' : 'rgba(26,43,74,0.4)',
        zIndex: 60, pointerEvents: 'none',
      }} />
    </div>
  );
}

// Bottom navigation bar
function TUBottomNav({ active = 'home', onTap, variant = 'label' }) {
  const items = [
    { id: 'home',   label: 'Accueil',   Icon: IcHome },
    { id: 'events', label: 'Events',    Icon: IcCal },
    { id: 'create', label: '',          Icon: IcPlus, fab: true },
    { id: 'teams',  label: 'Équipes',   Icon: IcUsers },
    { id: 'profile',label: 'Profil',    Icon: IcUser },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 10,
      background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 30%, #fff 60%)',
      zIndex: 40,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0 12px',
      }}>
        {items.map(it => {
          if (it.fab) {
            return (
              <button key={it.id} onClick={() => onTap && onTap(it.id)} style={{
                width: 54, height: 54, borderRadius: 18,
                background: `linear-gradient(135deg, ${TUPalette.orange}, ${TUPalette.orangeDark})`,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', boxShadow: '0 8px 22px -6px rgba(255,107,53,0.6)',
                transform: 'translateY(-10px)',
              }}>
                <it.Icon size={26} sw={2.5}/>
              </button>
            );
          }
          const isActive = active === it.id;
          return (
            <button key={it.id} onClick={() => onTap && onTap(it.id)} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 0',
              color: isActive ? TUPalette.orange : TUPalette.inkSoft,
            }}>
              <it.Icon size={23} sw={isActive ? 2.4 : 2}/>
              {variant !== 'icon' && (
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 600, letterSpacing: 0.1 }}>
                  {it.label}
                </span>
              )}
              {isActive && (
                <span style={{
                  width: 4, height: 4, borderRadius: 999,
                  background: TUPalette.orange, marginTop: 1,
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Header (sticky, with logo)
function TUHeader({ title, subtitle, leading, trailing, transparent = false }) {
  return (
    <div style={{
      paddingTop: 56, paddingLeft: 20, paddingRight: 20, paddingBottom: 12,
      background: transparent ? 'transparent' : '#fff',
      borderBottom: transparent ? 'none' : `1px solid ${TUPalette.border}`,
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && <div style={{ fontSize: 11, color: TUPalette.inkSoft, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{subtitle}</div>}
        <div style={{ fontSize: 18, fontWeight: 800, color: TUPalette.ink, letterSpacing: -0.2 }}>{title}</div>
      </div>
      {trailing}
    </div>
  );
}

// Logo mark — uses uploaded logo
function TULogo({ size = 28, withWord = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <img src="assets/teamup-logo.png" alt="TeamUp!" style={{ width: size, height: size, objectFit: 'contain' }}/>
      {withWord && (
        <span style={{ fontWeight: 800, fontSize: size * 0.62, color: TUPalette.navy, letterSpacing: -0.3 }}>
          TeamUp!
        </span>
      )}
    </div>
  );
}

// Tab bar (horizontal pills)
function TUTabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '0 20px', overflowX: 'auto',
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange && onChange(t.id)} style={{
            padding: '8px 14px', borderRadius: 999,
            background: isActive ? TUPalette.navy : '#fff',
            color: isActive ? '#fff' : TUPalette.ink,
            border: `1px solid ${isActive ? TUPalette.navy : TUPalette.border}`,
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            {t.label} {t.count != null && (
              <span style={{ opacity: 0.6, fontWeight: 600, marginLeft: 4 }}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { TUPhone, TUStatusBar, TUBottomNav, TUHeader, TULogo, TUTabs });
