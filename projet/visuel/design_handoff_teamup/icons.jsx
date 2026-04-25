// TeamUp! — Lucide-ish icons (custom-drawn for tighter control)
const Icon = ({ d, size = 22, stroke = 'currentColor', sw = 2, fill = 'none', vb = '0 0 24 24', children }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke} strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IcHome = (p) => <Icon {...p}>
  <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/>
</Icon>;
const IcCal = (p) => <Icon {...p}>
  <rect x="3" y="5" width="18" height="16" rx="2"/>
  <path d="M3 10h18M8 3v4M16 3v4"/>
</Icon>;
const IcPin = (p) => <Icon {...p}>
  <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/>
  <circle cx="12" cy="9" r="2.5"/>
</Icon>;
const IcUsers = (p) => <Icon {...p}>
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
  <circle cx="9" cy="7" r="4"/>
  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
</Icon>;
const IcUser = (p) => <Icon {...p}>
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</Icon>;
const IcSearch = (p) => <Icon {...p}>
  <circle cx="11" cy="11" r="7"/>
  <path d="M21 21l-4.3-4.3"/>
</Icon>;
const IcBell = (p) => <Icon {...p}>
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
  <path d="M10.3 21a2 2 0 0 0 3.4 0"/>
</Icon>;
const IcFilter = (p) => <Icon {...p}>
  <path d="M3 4h18l-7 9v6l-4 2v-8L3 4z"/>
</Icon>;
const IcPlus = (p) => <Icon {...p}>
  <path d="M12 5v14M5 12h14"/>
</Icon>;
const IcChevR = (p) => <Icon {...p}>
  <path d="M9 6l6 6-6 6"/>
</Icon>;
const IcChevL = (p) => <Icon {...p}>
  <path d="M15 6l-6 6 6 6"/>
</Icon>;
const IcChevD = (p) => <Icon {...p}>
  <path d="M6 9l6 6 6-6"/>
</Icon>;
const IcClock = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 7v5l3 2"/>
</Icon>;
const IcMapDot = (p) => <Icon {...p}>
  <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/>
</Icon>;
const IcShare = (p) => <Icon {...p}>
  <circle cx="18" cy="5" r="3"/>
  <circle cx="6" cy="12" r="3"/>
  <circle cx="18" cy="19" r="3"/>
  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
</Icon>;
const IcHeart = (p) => <Icon {...p}>
  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>
</Icon>;
const IcSend = (p) => <Icon {...p}>
  <path d="M22 2L11 13"/>
  <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
</Icon>;
const IcCheck = (p) => <Icon {...p}>
  <path d="M5 12l5 5L20 7"/>
</Icon>;
const IcSliders = (p) => <Icon {...p}>
  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
</Icon>;
const IcTrophy = (p) => <Icon {...p}>
  <path d="M8 21h8M12 17v4"/>
  <path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/>
  <path d="M17 5h3v3a3 3 0 0 1-3 3M7 5H4v3a3 3 0 0 0 3 3"/>
</Icon>;
const IcFlame = (p) => <Icon {...p}>
  <path d="M12 22a7 7 0 0 1-7-7c0-3 2-5 3-7 1 2 3 3 4 3-1-3 1-6 4-9 0 5 5 7 5 13a7 7 0 0 1-9 7z"/>
</Icon>;
const IcStar = (p) => <Icon {...p} fill="currentColor">
  <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
</Icon>;
const IcLayers = (p) => <Icon {...p}>
  <path d="M12 2l10 5-10 5L2 7l10-5z"/>
  <path d="M2 12l10 5 10-5M2 17l10 5 10-5"/>
</Icon>;
const IcMore = (p) => <Icon {...p}>
  <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
</Icon>;
const IcArrowR = (p) => <Icon {...p}>
  <path d="M5 12h14M13 5l7 7-7 7"/>
</Icon>;
const IcCamera = (p) => <Icon {...p}>
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
  <circle cx="12" cy="13" r="4"/>
</Icon>;
const IcLock = (p) => <Icon {...p}>
  <rect x="3" y="11" width="18" height="11" rx="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</Icon>;
const IcGlobe = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="9"/>
  <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
</Icon>;
const IcWifi = (p) => <Icon {...p}>
  <path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 9a16 16 0 0 1 20 0"/>
  <circle cx="12" cy="20" r="1" fill="currentColor"/>
</Icon>;

Object.assign(window, {
  IcHome, IcCal, IcPin, IcUsers, IcUser, IcSearch, IcBell, IcFilter, IcPlus,
  IcChevR, IcChevL, IcChevD, IcClock, IcMapDot, IcShare, IcHeart, IcSend, IcCheck,
  IcSliders, IcTrophy, IcFlame, IcStar, IcLayers, IcMore, IcArrowR, IcCamera, IcLock, IcGlobe, IcWifi,
});
