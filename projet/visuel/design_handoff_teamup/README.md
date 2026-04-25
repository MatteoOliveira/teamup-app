# Handoff — TeamUp! PWA

> PWA de gestion d'événements sportifs locaux. Design hi-fi à recréer dans le codebase cible.

---

## Overview

**TeamUp!** est une PWA qui permet aux amateurs de sport (18-40 ans) de :
- Créer/rejoindre des événements sportifs de proximité (basket, foot, tennis, padel, running…)
- Réserver des terrains/espaces publics
- Gérer des équipes et chatter en temps réel
- Suivre stats et performances
- Fonctionner **hors ligne** (PWA offline-first)

Ce bundle contient le **design hi-fi complet des 6 écrans prioritaires** + un prototype cliquable de référence.

---

## About the Design Files

Les fichiers de ce bundle sont des **références de design construites en HTML/React (Babel inline)** — des prototypes qui montrent l'apparence et le comportement souhaités, **pas du code de production à copier tel quel**.

La tâche est de **recréer ces designs dans l'environnement cible** :
- Si le projet a déjà un stack (React/Next, Vue/Nuxt, SvelteKit, Flutter…), suivre ses patterns/libs établies (state mgmt, routing, design tokens, composants).
- **Si aucun stack n'existe**, recommandation : **Next.js + Tailwind + shadcn/ui** pour une PWA web rapide à mettre en place ; alternative native : React Native / Expo.
- La PWA doit être **offline-first** : Service Worker + cache (Workbox), localStorage/IndexedDB pour les données utilisateur.

## Fidelity

**Hi-fi (high-fidelity)**. Couleurs, typo, espacements, radius, shadows, et interactions sont définitifs. À recréer **pixel-perfect** en utilisant les libs existantes du codebase pour les composants équivalents (boutons, cards, inputs, modales, bottom sheets, tabs).

---

## Design Tokens

### Colors

| Token              | Hex        | Usage                                              |
|--------------------|------------|----------------------------------------------------|
| `--brand-orange`   | `#FF6B35`  | CTA primaires, accents, sport "basket"             |
| `--brand-orange-dark` | `#E5551F` | Hover/pressed orange                              |
| `--brand-orange-soft` | `#FFE6DA` | Backgrounds soft, badges                          |
| `--brand-teal`     | `#2EC4B6`  | CTA secondaires, sport "foot", success            |
| `--brand-teal-dark` | `#1FA89B` | Hover teal                                         |
| `--brand-teal-soft` | `#D6F4F1` | Backgrounds teal soft                             |
| `--brand-navy`     | `#1A2B4A`  | Texte principal, header hero, dark CTA            |
| `--bg`             | `#F6F7FA`  | Background app                                    |
| `--surface`        | `#FFFFFF`  | Cards, inputs                                     |
| `--surface-alt`    | `#F1F3F7`  | Bouton ghost, input bg, séparateurs               |
| `--border`         | `#E5E8EE`  | Bordures cards/inputs                             |
| `--border-strong`  | `#D5DAE3`  | Bordures accent                                   |
| `--ink`            | `#1A2B4A`  | Texte principal                                   |
| `--ink-muted`      | `#5B6478`  | Texte secondaire                                  |
| `--ink-soft`       | `#8A93A6`  | Texte tertiaire / labels                          |

#### Sport accents (pill badges)
- Basket `#FF6B35` 🏀
- Foot `#2EC4B6` ⚽
- Tennis `#F4B43A` 🎾
- Padel `#3B82F6` 🎾
- Running `#7B61FF` 🏃
- Volley `#EC4899` 🏐
- Yoga `#14B8A6` 🧘
- Vélo `#06B6D4` 🚴

#### Levels
- Débutant (`#22C55E`, 1 dot)
- Intermédiaire (`#F4B43A`, 2 dots)
- Confirmé (`#EF4444`, 3 dots)

### Typography

**Font family**: `"Plus Jakarta Sans"` (Google Fonts), fallback `system-ui, sans-serif`.

| Style    | Size | Weight | Letter-spacing |
|----------|------|--------|----------------|
| Display  | 28-30px | 800 | -0.5         |
| Title    | 22px | 800    | -0.4           |
| Section  | 16px | 800    | -0.2           |
| Body     | 14px | 600    | 0              |
| Label    | 12-13px | 600/700 | 0          |
| Caption  | 11px | 700    | 0.4-1.5 (uppercase) |
| Tiny     | 10px | 600    | 0              |

### Spacing scale
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32

### Radius scale
- Pills: `999px`
- Buttons: `14px`
- Inputs: `14px`
- Cards: `16-20px`
- Phone screen: `52px`
- Sport icon tile: `10-14px`

### Shadows
- Card: `0 1px 0 rgba(26,43,74,0.04), 0 8px 28px -16px rgba(26,43,74,0.18)`
- Floating CTA (orange): `0 6px 18px -6px rgba(255,107,53,0.55)`
- Sticky header: bottom border `1px solid var(--border)`

---

## Screens / Views

### 1 · Onboarding (3 slides)
Plein écran coloré, hero illustration en glassmorphism, content card en bas avec :
- Tag uppercase (orange)
- Titre 30px/800
- Description 15px/inkMuted
- Dots progress + bouton "Suivant" / "Commencer"

**Backgrounds par slide** : `linear-gradient(160deg, #FF6B35 → #E5551F)` puis teal puis navy.
Logo TeamUp! en haut-gauche (filtré blanc), bouton "Passer" en haut-droite.

### 2 · Accueil (feed + carte)
- **Hero header navy** (gradient `#1A2B4A → #243757`, radius bottom 28px) : avatar utilisateur, ville, cloche notif (avec dot orange), titre "Quel match aujourd'hui ?", search bar glassmorphism avec bouton Filtres orange.
- **Stats grid 3 colonnes** : "Cette semaine", "À 1 km", "Streak"
- **Sport chips** scrollables horizontaux (Tous / Basket / Foot / …)
- **Mini map** (170px de haut) avec pins colorés par sport + dot user bleu
- **Featured event card** (cover gradient sport + emoji décoratif)
- **Liste compact** : à venir cette semaine

### 3 · Détail événement
- **Cover hero** 310px, gradient sport + emoji ; gradient overlay bas pour lisibilité
- Top bar absolue : back, share, heart (boutons blancs glass 40×40 radius 14)
- Badges (sport solid + niveau) + titre 26px/800 sur la cover
- **Card overlap** -22px : grille 2col Quand/Où avec icônes pill
- **Card organisateur** : avatar 44, nom, rating, bouton Profil ghost
- **Section Participants** : compteur + barre de progression (couleur sport) + grille 5col avatars 48px
- **Section Le terrain** : mini map 140px + ligne itinéraire
- **CTA bar fixe en bas** : bouton chat 52×52 + bouton Rejoindre full pleine largeur (devient teal "Tu participes !" avec check après tap)

### 4 · Créer un événement (4 étapes)
Header sticky : back, "Étape N/4" + "Nouvel événement", barre de progression 4 segments orange.

- **Étape 1 — Sport** : grille 2col de tiles (border 2px, devient orange si sélectionné, shadow colorée), sélecteur niveau 4 boutons
- **Étape 2 — Quand** : strip 7 jours (jour sélectionné navy), grille horaires 7 boutons, slider durée (30-180min, accent orange)
- **Étape 3 — Où** : input search + mini map + 3 cartes terrain suggérées (sélectionné = border orange + check rond)
- **Étape 4 — Détails** : input titre, stepper participants max (− chiffre +), 3 options visibilité (Public/Équipe/Privé) avec radio cerclé

Footer sticky : bouton ghost "Retour" + bouton primary full "Continuer" / "Publier".

### 5 · Profil
- **Hero gradient navy** avec blobs colorés (orange, teal) ; titre PROFIL uppercase, boutons share/sliders ; avatar 76 ring orange + nom + handle/ville + chip "Niveau Or · 1240 pts"
- **Stats card overlap** : grille 4col (Events / Victoires / Équipes / Joué) séparées par bordures
- **Mes sports** : carte par sport avec icône, label, progress bar couleur sport (33/66/95% selon niveau)
- **Récompenses** : scroll horizontal de tiles (icône emoji 28px, label, sub colorée)
- **Prochains events** : 2 event cards compact

### 6 · Messagerie équipe (chat)
- Header : back, avatar tile sport (avec dot online vert), nom équipe, "● N membres · X en ligne" (teal), bouton more
- **Pinned event** : bandeau gradient orange, "📌 Event épinglé"
- **Messages** : bulles asymétriques radius 18 (mine = gradient orange, theirs = blanc + border) ; avatar 30 + nom au-dessus si nouveau speaker ; séparateur "Aujourd'hui"
- **Indicateur de frappe** : bulle blanche avec 3 dots animés (`@keyframes tu-typing`)
- **Input dock** : bouton + (gris), pill input + bouton send (orange si texte sinon gris)

### Bottom Navigation Bar
5 items : Accueil / Événements / **FAB Plus (+)** centre / Équipes / Profil
- Icônes 23px, labels 10px (toggleable via Tweaks → icon-only)
- Item actif : orange + dot 4px en bas
- FAB : 54×54, gradient orange, translateY(-10px), shadow orange
- Background : gradient blanc fade (lisibilité sur scrolls)

### Composants transverses
- **TUSportBadge** : pill emoji + label, deux tons (soft / solid)
- **TULevelChip** : pill avec 3 dots dont N colorés
- **TUAvatar** : gradient hash-based des initiales (HSL), ring optionnel
- **TUAvatarStack** : avatars empilés -35% overlap + bulle "+N" navy
- **TUButton** : variants `primary`, `dark`, `teal`, `ghost`, `soft` ; tailles `sm/md/lg` (h36/44/52)
- **TUCard** : surface blanche, radius 18, padding 16, border + shadow

---

## Interactions & Behavior

- **Navigation** : pile d'écrans (push/pop). Bottom nav reset à la racine d'un onglet.
- **Bottom nav cachée** sur : detail event, create, chat (écrans modaux).
- **Tap effects** : boutons primary `transform: scale(0.97)` au mousedown.
- **Onboarding** : dots progressent, bouton "Passer" skip vers home.
- **Filtres** : chips home filtrent la liste par sport (re-render).
- **Create form** : validation par étape, blocage Continuer si requis manquant (pas implémenté dans le mock — à ajouter).
- **Chat** : Enter envoie, scroll auto en bas après nouveau message, indicateur de frappe (factice).
- **Like event** : toggle local du heart sur la cover.
- **Map** : pins cliquables ouvrent l'event ; user dot bleu pulse.

### Animations
- `@keyframes tu-typing` : bounce 1.2s sur les dots avec stagger 0.2s.
- Transitions: 120-200ms ease sur transform/box-shadow/background des boutons et tabs.
- Progress bar create : transition `all 200ms`.

---

## State Management

État minimum à modéliser côté client :

```ts
type User = { id, name, handle, city, avatarUrl, levels: Record<Sport, Level> }
type Event = { id, sport, title, dateISO, durationMin, place, city,
                lat, lng, level, max, participants: User[], organizer: User,
                visibility: 'public'|'team'|'private', hot?: boolean }
type Team = { id, name, sport, color, members: User[], unreadCount }
type Message = { id, teamId, fromUserId, text, sentAt }
type Terrain = { id, name, sport, free, price?, lat, lng, rating, available }
type Booking = { id, terrainId, userId, startAt, endAt }
```

Stores nécessaires (Zustand / Pinia / Redux selon stack) :
- `authStore` (user courant, token)
- `eventsStore` (feed, mes events, détail)
- `teamsStore` (équipes + messages)
- `terrainsStore` (liste, réservations)
- `geoStore` (position GPS, distance helpers)
- `notificationsStore`

Data fetching : SWR / React Query / TanStack Query recommandé. Cache offline via Service Worker (Workbox `NetworkFirst` pour API, `CacheFirst` pour assets).

Realtime chat : WebSocket (Socket.io) ou Firebase Realtime DB. Indicateur de frappe = event throttlé.

---

## Assets

- `assets/teamup-logo.png` — logo officiel fourni par le client (320×320, transparence). À utiliser tel quel.
- **Photos terrains/events** : utiliser des photos réelles (pas les gradients SVG qui sont des placeholders). Sources : Unsplash sport, ou photos de l'équipe produit.
- **Icônes** : Lucide React (équivalents : Home, Calendar, MapPin, Users, User, Search, Bell, SlidersHorizontal, Plus, ChevronLeft/Right/Down, Clock, Send, Check, Heart, Share2, Flame, Trophy, Star, Layers, MoreHorizontal, ArrowRight, Camera, Lock, Globe, Wifi).
- **Emojis sport** : utilisés tels quels (natifs).

---

## PWA Specifics

- **Manifest** : `name: "TeamUp!"`, `theme_color: "#FF6B35"`, `background_color: "#1A2B4A"`, icônes 192/512.
- **Service Worker** : précache l'app shell, runtime cache pour API events/teams.
- **Offline banner** : sticky en haut quand `navigator.onLine === false`, fond `#F4B43A`.
- **Pull-to-refresh** sur les feeds (Accueil, Événements).
- **Skeleton loaders** : grandeur native des cards/avatars, shimmer subtil.
- **Bottom sheets** : pour filtres et formulaires rapides (lib : Vaul / react-spring-bottom-sheet).
- **Toast** : confirmations (`Event publié !`, `Réservation confirmée`).

---

## Files in this bundle

| File | Role |
|---|---|
| `TeamUp.html` | Entry point — charge React+Babel et monte le design canvas avec tous les écrans |
| `tokens.jsx` | Design tokens (couleurs, type, sports), composants atomes (Button, Card, Avatar, Badge, LevelChip) |
| `icons.jsx` | Set d'icônes SVG (style Lucide) |
| `phone.jsx` | Phone shell (TUPhone), status bar, bottom nav, header, logo, tabs |
| `data.jsx` | Données seed réalistes (user Léo, events Paris, teams, terrains) |
| `screens-1.jsx` | Onboarding · Accueil · Detail event · EventCard · MiniMap · SportCover |
| `screens-2.jsx` | Create event (4 étapes) · Profile · Chat · Terrains · Teams |
| `app.jsx` | ProtoApp = navigation/router pour le prototype cliquable |
| `design-canvas.jsx` | Wrapper canvas (pan/zoom, sections, artboards) — **outil de présentation, à ignorer pour la prod** |
| `tweaks-panel.jsx` | Panneau de tweaks live (couleurs, nav style, density) — **outil de présentation, à ignorer** |
| `ios-frame.jsx` | Frame iOS — **outil de présentation** |
| `assets/teamup-logo.png` | Logo officiel TeamUp! |
| `arborescence.md` | Brief original — arborescence complète + parcours utilisateur |

---

## Recommandations d'implémentation

1. **Stack suggéré** (si rien n'existe) :
   - **Next.js 14 (App Router)** + TypeScript + Tailwind CSS
   - **shadcn/ui** pour Button/Card/Input/Tabs/Sheet/Dialog
   - **Lucide React** pour les icônes
   - **Framer Motion** pour les transitions de pages et le bottom nav indicator
   - **Zustand** pour le state global
   - **TanStack Query** pour le data fetching
   - **next-pwa** pour Service Worker / manifest
   - **react-leaflet** ou **Mapbox GL JS** pour les vraies cartes (remplacer le `MiniMap` SVG)
   - **Socket.io** pour le chat temps réel

2. **Mapping CSS variables** :
   ```css
   :root {
     --brand-orange: #FF6B35;
     --brand-teal: #2EC4B6;
     --brand-navy: #1A2B4A;
     --bg: #F6F7FA;
     --ink: #1A2B4A;
     --ink-muted: #5B6478;
     --ink-soft: #8A93A6;
     --border: #E5E8EE;
     --radius-card: 18px;
     --radius-button: 14px;
     --radius-pill: 999px;
   }
   ```

3. **Ordre d'implémentation suggéré** :
   1. Setup PWA shell + manifest + SW
   2. Design tokens + atoms (Button, Card, Avatar, Badge, LevelChip)
   3. Bottom Nav + layout principal
   4. Accueil (feed) + Detail event (les 2 écrans clés)
   5. Onboarding
   6. Create event (le plus complexe)
   7. Profile + Teams
   8. Chat (realtime)
   9. Terrains + carte
   10. Offline / sync logic
