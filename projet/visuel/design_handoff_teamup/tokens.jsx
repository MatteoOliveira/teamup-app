// TeamUp! — Design tokens & shared atoms
// Tokens are exported via window so all screens can read them.

const TUPalette = {
  // Brand
  orange: '#FF6B35',
  orangeDark: '#E5551F',
  orangeSoft: '#FFE6DA',
  teal: '#2EC4B6',
  tealDark: '#1FA89B',
  tealSoft: '#D6F4F1',
  navy: '#1A2B4A',
  navySoft: '#E2E7F1',

  // Sport accents
  basket: '#FF6B35',
  foot: '#2EC4B6',
  tennis: '#F4B43A',
  running: '#7B61FF',
  padel: '#3B82F6',
  volley: '#EC4899',

  // Levels
  beginner: '#22C55E',
  intermediate: '#F4B43A',
  advanced: '#EF4444',

  // Surfaces
  bg: '#F6F7FA',
  bgWarm: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F3F7',
  border: '#E5E8EE',
  borderStrong: '#D5DAE3',

  // Text
  ink: '#1A2B4A',
  inkMuted: '#5B6478',
  inkSoft: '#8A93A6',
  inkInverse: '#FFFFFF',
};

const TUType = {
  display: '"Plus Jakarta Sans", system-ui, sans-serif',
  body: '"Plus Jakarta Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// Sport meta — icon + color
const TUSports = {
  basket:  { label: 'Basket',     emoji: '🏀', color: '#FF6B35' },
  foot:    { label: 'Foot',       emoji: '⚽', color: '#2EC4B6' },
  tennis:  { label: 'Tennis',     emoji: '🎾', color: '#F4B43A' },
  padel:   { label: 'Padel',      emoji: '🎾', color: '#3B82F6' },
  running: { label: 'Running',    emoji: '🏃', color: '#7B61FF' },
  volley:  { label: 'Volley',     emoji: '🏐', color: '#EC4899' },
  yoga:    { label: 'Yoga',       emoji: '🧘', color: '#14B8A6' },
  velo:    { label: 'Vélo',       emoji: '🚴', color: '#06B6D4' },
};

// ─────────────────────────────────────────────────────────────
// Sport Badge
// ─────────────────────────────────────────────────────────────
function TUSportBadge({ sport, size = 'md', tone = 'soft' }) {
  const m = TUSports[sport] || TUSports.basket;
  const sizes = {
    sm: { fs: 11, px: 8,  py: 3, gap: 4, dot: 6 },
    md: { fs: 12, px: 10, py: 5, gap: 5, dot: 7 },
    lg: { fs: 13, px: 12, py: 6, gap: 6, dot: 8 },
  };
  const s = sizes[size];
  if (tone === 'solid') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: s.gap,
        background: m.color, color: '#fff',
        padding: `${s.py}px ${s.px}px`, borderRadius: 999,
        fontWeight: 700, fontSize: s.fs, letterSpacing: 0.2,
      }}>
        <span style={{ fontSize: s.fs + 1 }}>{m.emoji}</span>
        {m.label}
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap,
      background: m.color + '1F', color: m.color,
      padding: `${s.py}px ${s.px}px`, borderRadius: 999,
      fontWeight: 700, fontSize: s.fs, letterSpacing: 0.2,
    }}>
      <span style={{
        width: s.dot, height: s.dot, borderRadius: '50%',
        background: m.color, display: 'inline-block',
      }} />
      {m.label}
    </span>
  );
}

// Level chip (débutant / intermédiaire / confirmé)
function TULevelChip({ level = 'intermediaire' }) {
  const map = {
    debutant:      { label: 'Débutant',      color: TUPalette.beginner,     dots: 1 },
    intermediaire: { label: 'Intermédiaire', color: TUPalette.intermediate, dots: 2 },
    confirme:      { label: 'Confirmé',      color: TUPalette.advanced,     dots: 3 },
    tous:          { label: 'Tous niveaux',  color: TUPalette.inkMuted,     dots: 0 },
  };
  const m = map[level] || map.intermediaire;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 9px', borderRadius: 999,
      background: '#fff', border: `1px solid ${TUPalette.border}`,
      fontWeight: 600, fontSize: 11, color: TUPalette.ink,
    }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: i < m.dots ? m.color : '#E5E8EE',
          }} />
        ))}
      </span>
      {m.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Avatar — gradient placeholder by initials
// ─────────────────────────────────────────────────────────────
function TUAvatar({ name = 'A', size = 36, src, ring = false, ringColor = '#FF6B35' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  // hash-based hue
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  const bg = `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h+40)%360} 70% 45%))`;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: src ? `url(${src}) center/cover` : bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.38,
      boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${ringColor}` : 'none',
      flexShrink: 0,
    }}>
      {!src && initials}
    </div>
  );
}

// Stack of avatars
function TUAvatarStack({ names = [], extra = 0, size = 26 }) {
  return (
    <div style={{ display: 'inline-flex' }}>
      {names.map((n, i) => (
        <div key={i} style={{
          marginLeft: i === 0 ? 0 : -size * 0.35,
          border: '2px solid #fff', borderRadius: '50%',
          zIndex: names.length - i,
        }}>
          <TUAvatar name={n} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -size * 0.35,
          width: size, height: size, borderRadius: '50%',
          background: TUPalette.navy, color: '#fff',
          border: '2px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: size * 0.34,
        }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────
function TUButton({ variant = 'primary', size = 'md', icon, children, onClick, full, style }) {
  const sizes = {
    sm: { fs: 13, px: 14, h: 36 },
    md: { fs: 15, px: 18, h: 44 },
    lg: { fs: 16, px: 22, h: 52 },
  };
  const s = sizes[size];
  const variants = {
    primary: { bg: TUPalette.orange, fg: '#fff', shadow: '0 6px 18px -6px rgba(255,107,53,0.55), 0 1px 0 rgba(255,255,255,0.2) inset' },
    dark:    { bg: TUPalette.navy,   fg: '#fff', shadow: '0 4px 14px -4px rgba(26,43,74,0.4)' },
    teal:    { bg: TUPalette.teal,   fg: '#fff', shadow: '0 6px 18px -6px rgba(46,196,182,0.5)' },
    ghost:   { bg: '#fff', fg: TUPalette.ink, border: `1px solid ${TUPalette.border}` },
    soft:    { bg: TUPalette.orangeSoft, fg: TUPalette.orangeDark },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      height: s.h, padding: `0 ${s.px}px`,
      background: v.bg, color: v.fg,
      border: v.border || 'none',
      borderRadius: 14, fontWeight: 700, fontSize: s.fs,
      fontFamily: TUType.body, letterSpacing: 0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer', boxShadow: v.shadow || 'none',
      width: full ? '100%' : undefined,
      transition: 'transform 120ms ease, box-shadow 120ms ease',
      ...style,
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {icon}
      {children}
    </button>
  );
}

// Section card
function TUCard({ children, style, padding = 16, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 18,
      padding, boxShadow: '0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)',
      border: `1px solid ${TUPalette.border}`,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>{children}</div>
  );
}

Object.assign(window, {
  TUPalette, TUType, TUSports,
  TUSportBadge, TULevelChip, TUAvatar, TUAvatarStack,
  TUButton, TUCard,
});
