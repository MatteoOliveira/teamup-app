# Journal des actions Claude Code — TeamUp!

## 2026-04-25

### Initialisation du projet
- Analyse du dossier : projet vide, seul le PDF du sujet est présent (`B3DEV - T6 CDSD SUJET 2025 SEPTEMBRE (1).pdf`)
- Création du fichier `CLAUDE.md` à la racine du projet
- Création du dossier `documentation/` avec ce fichier `chat.md`
- Aucun code encore écrit — en attente de la définition du stack technique

## 2026-04-25 — Test credentials Supabase

- Authentification OAuth Supabase via MCP réussie
- Projet Supabase confirmé actif : `https://rjwuyxhekowrjnvnsyxy.supabase.co`
- Clé anon récupérée et testée (réponse 401 attendue = serveur opérationnel)
- Création du fichier `.env.local` à la racine avec `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Important** : `.env.local` ne doit jamais être commité dans git

## 2026-04-25 — Arborescence & parcours utilisateur

- Lecture du sujet complet (captures d'écran du PDF)
- Création de `documentation/arborescence.md` avec :
  - Arborescence complète (5 onglets, toutes les pages)
  - 5 parcours utilisateur (inscription, créer event, rejoindre event, réserver terrain, équipe)
  - Directives design system pour Claude Frontend Design (couleurs, typo, composants, PWA)

## 2026-04-25 — Bootstrap Next.js + premiers écrans

### Structure créée
```
src/
├── app/
│   ├── layout.tsx              — RootLayout (metadata PWA, viewport)
│   ├── page.tsx                — Redirect → /onboarding
│   ├── globals.css             — Tailwind + CSS variables design tokens + animations
│   ├── (auth)/
│   │   └── onboarding/
│   │       └── page.tsx        — Écran onboarding 3 slides ✅
│   └── (main)/
│       ├── layout.tsx          — Layout avec BottomNav
│       ├── home/page.tsx       — Écran Accueil ✅
│       ├── events/page.tsx     — Placeholder
│       ├── events/create/page.tsx — Placeholder
│       ├── fields/page.tsx     — Placeholder
│       ├── teams/page.tsx      — Placeholder
│       └── profile/page.tsx   — Placeholder
├── components/
│   └── BottomNav.tsx           — Bottom navigation 5 onglets + FAB ✅
└── lib/
    └── utils.ts                — cn(), SPORTS, LEVELS constants
public/
└── manifest.json               — PWA manifest
tailwind.config.ts              — Tokens couleurs/typo/radius/shadows
postcss.config.js
next.config.ts
tsconfig.json
```

### Fichiers de configuration
- **`tailwind.config.ts`** : tokens complets (brand-orange, brand-teal, brand-navy, sport colors, level colors, radius-pill/button/card, shadow-card/orange-glow)
- **`globals.css`** : CSS variables, import Plus Jakarta Sans, animations (shimmer, tu-typing, pulse-dot), classes utilitaires (`.skeleton`, `.tap-scale`)
- **`next.config.ts`** : config Next.js 15 minimal
- **`public/manifest.json`** : PWA manifest (theme_color orange, bg navy, display standalone)

### Écran Onboarding (`src/app/(auth)/onboarding/page.tsx`)
- 3 slides avec transition animée (opacity + scale)
- Slide 1 : gradient orange + hero glassmorphism 🏀
- Slide 2 : gradient teal + hero glassmorphism 📍
- Slide 3 : gradient navy + hero glassmorphism 🏆
- Dots de progression cliquables (actif = pill étiré couleur slide)
- Emojis décoratifs flottants par slide
- Blob décoratifs en arrière-plan
- Bouton "Passer" → `/home`, bouton "Commencer" → `/home`

### Écran Accueil (`src/app/(main)/home/page.tsx`)
- Hero header sticky gradient navy avec avatar, cloche (dot orange), localisation, titre, search bar glassmorphism + bouton Filtres
- Stats grid 3 colonnes (matchs/events/streak)
- Sport chips scrollables horizontaux avec filtre actif
- Mini-map simulée (SVG) avec pins colorés par sport et dot utilisateur pulsant
- 2 EventCards avec bande colorée sport, badges, titre, date, avatars empilés, bouton Rejoindre toggle

### Bottom Navigation (`src/components/BottomNav.tsx`)
- 5 onglets : Accueil / Événements / FAB+ / Équipes / Profil
- FAB central orange (translateY -10px) avec shadow orange-glow
- Indicateur actif : dot orange 4px + couleur orange sur l'onglet courant
- Fond gradient blanc pour lisibilité sur scroll

### Écran Détail événement (`src/app/(main)/events/[id]/page.tsx`)
- Cover hero 310px gradient orange + emoji décoratif géant 0.13 opacity
- Top bar glassmorphism (retour, share, heart toggle)
- Badges + titre sur la cover
- Card overlap -22px (grille Quand/Où avec icônes pill)
- Card organisateur (avatar + rating + bouton Profil)
- Section participants (progress bar + grille avatars + cases vides "+")
- Section terrain (mini-map simulée + itinéraire)
- CTA bar fixe (chat + rejoindre toggle orange→teal)

### Écran Créer un événement (`src/app/(main)/events/create/page.tsx`)
- Header sticky avec progression 4 segments
- Étape 1 : grille 8 sports (tiles actif/inactif), 4 niveaux en row
- Étape 2 : strip 7 jours, grille 8 horaires, slider durée custom (30-180min)
- Étape 3 : input recherche, mini-map simulée, 3 terrains suggérés avec radio
- Étape 4 : input nom, stepper joueurs (2-30), 3 options visibilité avec radio
- Footer sticky (Retour ghost + Continuer/Publier), validation disabled si requis manquant

### Écran Profil (`src/app/(main)/profile/page.tsx`)
- Hero navy avec blobs décoratifs, top bar (settings + share), avatar ring orange
- Chip niveau "Niveau Or · 1240 pts"
- Stats card overlap -40px (4 colonnes : Events / Victoires / Équipes / Joué)
- Mes sports (3 cards avec progress bars colorées)
- Récompenses (scroll horizontal, 5 badges)
- Prochains events (2 event cards compactes)

### Écran Messagerie équipe (`src/app/(main)/teams/[id]/page.tsx`)
- Header sticky (retour, avatar équipe avec dot online, nom + membres en ligne, more)
- Bandeau "Event épinglé" gradient orange
- Messages reçus (bulle blanche, avatar 30px, nom si nouveau speaker)
- Messages envoyés (bulle gradient orange)
- Indicateur de frappe animé (3 dots bounce stagger CSS)
- Auto-scroll en bas après nouveau message
- Input dock (bouton +, input pill, bouton send orange si texte / gris si vide)

## 2026-04-25 — Suite du développement

### Corrections navigation (home page)
- `src/app/(main)/home/page.tsx` : EventCards désormais cliquables vers `/events/[id]` via `<Link>`
- Boutons "Voir tout" (Sports + Événements) convertis en `<Link href="/events">`

### Écran Liste des événements (`src/app/(main)/events/page.tsx`)
- Header sticky avec titre + bouton "Créer" → `/events/create`
- Barre de recherche filtrante
- Chips sports scrollables (Tous / Basket / Foot / Tennis / Running / Volley / Padel)
- Compteur de résultats dynamique
- EventCards enrichies : barre de progression remplissage, badge "Presque complet" si max-1, distance pill teal
- État vide avec lien "Créer le premier →"

### Écran Liste des équipes (`src/app/(main)/teams/page.tsx`)
- Header sticky avec titre + bouton "Créer"
- Barre de recherche filtrante
- Section "Mes équipes" — items en liste groupée (style messages), badge unread orange, dot online
- Section "Découvrir" — cards avec bouton Rejoindre
- État vide

### Schéma base de données Supabase

Fichiers SQL dans `supabase/migrations/` :

#### `001_initial_schema.sql`
Tables créées :
- `profiles` — extension de auth.users (username, level, sports[], points, is_admin…)
- `terrains` — terrains sportifs (sport, adresse, lat/lng, prix/h, rating)
- `events` — événements (organizer_id, terrain_id, sport, level, date, heure, durée, max_players, status)
- `event_participants` — participants (event_id, user_id, status confirmed/waitlist/cancelled)
- `teams` — équipes (owner_id, sport, level, is_public, members_count)
- `team_members` — membres d'équipe (team_id, user_id, role owner/admin/member)
- `messages` — messages d'équipe (team_id, sender_id, content)
- `bookings` — réservations terrains (terrain_id, user_id, event_id, date, start/end_time)

Triggers :
- `handle_new_user` — crée automatiquement un profil à l'inscription
- `update_event_player_count` — maintient current_players à jour
- `check_event_full` — passe status à "full" automatiquement
- `update_team_member_count` — maintient members_count à jour
- `set_updated_at` — updated_at automatique sur profiles et events

#### `002_rls_policies.sql`
RLS activé sur toutes les tables avec politiques :
- Profils : lecture publique, écriture owner uniquement
- Terrains : lecture publique, gestion admin uniquement
- Événements : visibles si publics ou organisateur, CRUD organisateur
- Participants : rejoindre/quitter self uniquement
- Équipes : lecture si public, CRUD owner
- Messages : lecture/écriture membres uniquement
- Réservations : self uniquement

#### `003_seed_data.sql`
7 terrains de test (basket, foot, tennis, padel, volley) dans Paris

### Client Supabase (`src/lib/supabase.ts`)
- `supabase` client singleton
- Types TypeScript : Profile, Terrain, Event, EventParticipant, Team, TeamMember, Message, Booking
- Helpers auth : getSession, getCurrentProfile, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut

### Route auth callback (`src/app/auth/callback/route.ts`)
- Échange le code OAuth contre une session Supabase
- Redirige vers `/home` après connexion

### Pages Auth

#### Login (`src/app/(auth)/login/page.tsx`)
- Fond gradient navy → orange
- Bouton Google OAuth
- Formulaire email + mot de passe (toggle show/hide)
- Gestion erreurs inline
- Lien vers /register

#### Inscription (`src/app/(auth)/register/page.tsx`)
- 2 étapes : (1) nom + email + mot de passe, (2) sports préférés (grille 2×4)
- Bouton Google OAuth
- Progression dots animés
- Lien vers /login

### Espace Admin (`src/app/admin/`)

#### Layout (`src/app/admin/layout.tsx`)
- Sidebar fixe navy (220px desktop) avec logo TeamUp!, nav items, badge "Administrateur", bouton déconnexion
- Menu hamburger sur mobile avec overlay
- 4 sections : Dashboard / Événements / Utilisateurs / Terrains

#### Dashboard (`src/app/admin/page.tsx`)
- 5 StatCards : événements, utilisateurs, équipes, terrains, participations — données Supabase réelles
- Liste 5 derniers événements avec statut coloré, lien vers admin/events

#### Événements admin (`src/app/admin/events/page.tsx`)
- Chargement depuis Supabase
- Filtres par statut (Tous / Ouvert / Complet / Annulé / Terminé)
- Recherche par titre
- Changement de statut inline (select)
- Suppression avec confirmation

#### Utilisateurs admin (`src/app/admin/users/page.tsx`)
- Liste tous les profils
- Avatar (photo ou initiales)
- Badge niveau coloré
- Toggle admin/non-admin (ShieldCheck/ShieldOff)

#### Terrains admin (`src/app/admin/terrains/page.tsx`)
- Liste des terrains avec emoji sport, quartier, note, prix
- Formulaire création inline (nom, sport, adresse, quartier, prix)
- Suppression avec confirmation

## 2026-04-25 — Suite (session 3)

### Corrections navigation supplémentaires
- `src/app/(main)/events/[id]/page.tsx` : bouton "Chat" dans la CTA bar converti en `<Link href="/teams/1">` (navigation vers le chat d'équipe)
- `src/app/(main)/home/page.tsx` : section "Terrains proches" avec titre + lien "Voir tout → /fields" ajoutée au-dessus de la minimap

### Écran Terrains (`src/app/(main)/fields/page.tsx`)
- Header sticky avec titre + badge localisation "Paris"
- Barre de recherche filtrante (nom ou quartier)
- Chips sports scrollables (Tous / Basket / Foot / Tennis / Running / Volley / Padel)
- Mini-map interactive (SVG) avec pins colorés cliquables par sport ; pin sélectionné agrandi
- Badge overlay "N terrains proches" sur la carte
- 7 terrains de données mockées (basket, foot, tennis, padel, volley)
- TerrainCard expansible au clic :
  - Collapsed : emoji, nom, quartier, distance pill teal, rating, prix (Gratuit/€/h), dot disponible
  - Expanded : amenities chips, bloc disponibilité (créneau prochain), bouton "Réserver" couleur sport
  - Feedback visuel réservation (✓ Réservé ! 1.8s)
  - Border + ombre colorée sur la card sélectionnée

### Middleware auth (`src/middleware.ts`)
- Protection `/admin/*` : redirige vers `/login` si non connecté, vers `/home` si connecté mais non admin
- Protection routes app (`/home`, `/events/*`, `/teams/*`, `/fields/*`, `/profile/*`) : redirige vers `/login` si non connecté
- Basé sur `@supabase/ssr` createServerClient + cookies Next.js

### Profil page — section Compte
- Lien "Paramètres", "Espace Admin" (→ /admin, vert), "Déconnexion" (→ /login, rouge)
- Cards avec icône colorée + chevron

## 2026-04-25 — Connexion complète Supabase

### Page terrains (`/fields`) — données réelles
- Fetch `supabase.from("terrains").select("*")` au chargement
- Mapping amenities DB → labels français (lighting → 💡 Éclairage, showers → 🚿 Douches…)
- Positions de carte dérivées de l'index (déterministe)
- Skeleton loading (`.skeleton` class) pendant le fetch

### Page événements (`/events`) — données réelles
- Fetch événements publics/ouverts triés par date
- Formatage date réelle (ex : "sam. 26 avr.")
- Durée calculée depuis `duration_min`
- Skeleton loading

### Page équipes (`/teams`) — données réelles
- Fetch "Mes équipes" via `team_members!inner(user_id)` pour l'utilisateur connecté
- Fetch équipes publiques (section Découvrir) en excluant celles déjà rejointes
- Skeleton loading

### Home page (`/home`) — données réelles
- Fetch profil utilisateur connecté → initiales dans l'avatar (ex : "ML")
- Fetch 5 prochains événements publics depuis aujourd'hui
- Skeleton 2 cards pendant le chargement
- État vide avec lien "Créer un événement →"

### Créer un événement — sauvegarde Supabase
- Step 3 : liste de terrains chargée depuis `supabase.from("terrains")` au lieu du mock
  - Affiche nom + quartier + prix pour chaque terrain
- Bouton "Publier" : insert réel dans `public.events` avec tous les champs
  - Mapping niveaux : "Tous" → "all", "Débutant" → "beginner"…
  - Mapping visibilité : "public" → "public", "team" → "private", "private" → "invite"
  - Date construite à partir du jour sélectionné (avril 2026)
  - Redirige vers `/events` après succès
  - Désactivé si non connecté (redirect → /login)
  - Bouton affiche "Publication…" pendant l'envoi

### Flux d'authentification complet
- `src/app/page.tsx` — redirect intelligent :
  - Session active → `/home`
  - Pas de session + onboarding vu → `/login`
  - Première visite → `/onboarding`
- `src/app/(auth)/onboarding/page.tsx` :
  - "Commencer" → `/register` + `localStorage.setItem("teamup_onboarding_done", "1")`
  - "Passer" → `/login` + même flag localStorage

### Prochaines étapes
- Configurer OAuth Google : Supabase Dashboard → Auth → Providers → Google
- Tester inscription/connexion end-to-end
- Page profil connectée au vrai profil Supabase
- Carte Leaflet interactive sur la page terrains (remplacer la SVG simulée)

## 2026-04-25 — Audit & corrections navigation

### Audit complet de la navigation
- Exploration de toutes les pages et composants de navigation (`BottomNav`, admin sidebar, tous les `<Link>`)
- Identification des liens cassés ou boutons sans destination

### Corrections apportées

#### `src/components/BottomNav.tsx`
- Corrigé la logique de détection de l'onglet actif : avant, être sur `/events/create` ou `/events/[id]` ne colorait aucun onglet
- Nouvelle logique : `pathname === item.href || pathname.startsWith(item.href + "/")` (sauf `/home` pour éviter les faux positifs)
- Résultat : l'onglet "Événements" reste actif sur toutes les sous-routes `/events/*`, idem pour "Équipes" sur `/teams/*`

#### `src/app/(main)/profile/page.tsx`
- Boutons "Voir" dans les EventCards du profil n'avaient aucune destination
- Convertis en `<Link href="/events/${event.id}">` pour naviguer vers le détail de l'événement

### Problèmes restants (fonctionnalités futures)
- Bouton "+ Créer" sur la page équipes : pas de page `/teams/create` encore créée
- Boutons "Rejoindre" dans la section "Découvrir" des équipes : stubs UI, pas encore de logique
- Bouton "Réserver" sur la page terrains : feedback visuel uniquement, pas encore connecté à Supabase
- Lien "Paramètres" du profil : pointe vers `/profile` (même page) — nécessite une page d'édition dédiée

## 2026-04-25 — Connexion profil & détail événement à Supabase

### `src/app/(main)/profile/page.tsx` — Connecté à Supabase
- Suppression de toutes les données mockées (SPORTS, BADGES hardcodés, EVENTS fictifs)
- `useEffect` charge : profil utilisateur courant, événements organisés + participations confirmées
- Affiche les vraies données : initiales, nom complet, username, location, points, level
- Stats dynamiques : `events_count`, `wins_count`, `teams_count`, `hours_played` depuis `profiles`
- Sports depuis `profile.sports` (tableau DB) mappé vers `SPORT_META` (emoji, couleur)
- Prochains événements : union des events organisés + participations, triés par date
- Bouton "Déconnexion" appelle `supabase.auth.signOut()` + `window.location.href = "/login"` (au lieu d'un simple Link)
- Espace Admin affiché seulement si `profile.is_admin === true`
- Skeletons pendant le chargement sur tous les blocs dynamiques

### `src/app/(main)/events/[id]/page.tsx` — Connecté à Supabase
- Suppression des mocks PARTICIPANTS hardcodés et des données statiques
- `useParams<{ id: string }>()` pour récupérer l'ID depuis l'URL
- Chargement parallèle : `events` (avec join `organizer:profiles` + `terrain:terrains`) + `event_participants` (avec join `profile:profiles`)
- Affiche le vrai titre, sport, niveau, date, heure, durée, terrain, organisateur
- Participants réels avec leurs initiales et couleurs d'avatar assignées
- Couleur/gradient de la hero adapté dynamiquement selon le sport de l'événement
- Bouton "Rejoindre" : insert dans `event_participants` + mise à jour du state local
- Bouton "Quitter" (si déjà inscrit) : delete de `event_participants`
- État "Complet" ou "Annulé" géré sur le bouton CTA
- Page 404 si événement introuvable
- Squelettes de chargement pendant la requête initiale

## 2026-04-25 — Sécurité & Tests

### Sécurité

#### Faille critique corrigée — is_admin self-escalation
- L'ancienne RLS `"Users can update own profile"` permettait à n'importe quel user de s'écrire `is_admin = true` sur son propre profil
- Nouveau `WITH CHECK` : la valeur `is_admin` ne peut pas changer sauf si le requêteur est déjà admin
- Fichier : `supabase/migrations/004_security_hardening.sql`
- **À appliquer dans Supabase SQL Editor**

#### Nouvelles policies admin (migration 004)
- Admins peuvent voir TOUS les événements (y compris privés/invite)
- Admins peuvent modifier/supprimer n'importe quel event ou team
- Admins peuvent modifier n'importe quel profil (pour gérer les flags admin)
- Corrige le bug silencieux : les boutons Supprimer/Modifier de l'espace admin échouaient sur les resources qu'ils ne possèdent pas

#### Headers HTTP de sécurité
- Ajoutés dans `next.config.ts` via `headers()`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (protection clickjacking)
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

#### Bug corrigé — Sports non sauvegardés à l'inscription
- `src/app/(auth)/register/page.tsx` : les sports sélectionnés à l'étape 2 n'étaient jamais persistés en DB
- Correction : après `supabase.auth.signUp()`, si une session est retournée et des sports sélectionnés, `UPDATE profiles SET sports = [...]`

### Tests

#### Setup Vitest
- Installation : `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Fichier config : `vitest.config.ts` (jsdom, globals, alias `@/`)
- Setup file : `src/tests/setup.ts` (import `@testing-library/jest-dom`)
- Scripts ajoutés : `npm test` (run) et `npm run test:watch` (watch mode)

#### Extraction des utilitaires — `src/lib/utils.ts`
- `cn()` — class merging Tailwind (déjà utilisé par BottomNav)
- `SPORT_META` — métadonnées centralisées des 8 sports
- `LEVEL_LABELS` — labels FR des niveaux DB
- `formatDuration(minutes)` — ex: 90 → "1h30"
- `formatEventDate(dateStr, timeStr)` — date FR formatée
- `getInitials(name)` — ex: "Jean Dupont" → "JD"
- `validateEventForm(data)` — valide titre, sport, joueurs, durée, date
- `hasErrors(errors)` — helper boolean

#### Fichier de tests — `src/tests/utils.test.ts`
- **43 tests** couvrant :
  - `formatDuration` : 0, négatif, <60min, 60, 90, padding des unités (1h05)
  - `getInitials` : null, undefined, vide, espaces, 1 mot, 2 mots, 3 mots
  - `validateEventForm` : titre manquant/trop long, sport inconnu, joueurs hors bornes, durée hors bornes, date passée/future/aujourd'hui, erreurs multiples simultanées
  - `SPORT_META` : présence des 8 sports, champs requis, format couleurs hex
  - `LEVEL_LABELS` : mapping correct des 5 niveaux

**Résultat : 43/43 tests passent, 0 erreur TypeScript**

## 2026-04-25 — Chat d'équipe Realtime + Rejoindre/Créer

### `src/app/(main)/teams/[id]/page.tsx` — Refonte complète avec Realtime

#### Connexion Supabase
- Charge les infos de l'équipe + statut membre de l'utilisateur connecté au chargement
- Charge les 50 derniers messages avec join `sender:profiles!sender_id(id, full_name, avatar_url)`
- Trois états de vue : skeleton chargement → vue non-membre (join CTA) → vue membre (chat complet)

#### Page non-membre
- Affiche les infos équipe (sport, niveau, ville, nombre membres)
- Bouton "Rejoindre l'équipe" → `insert` dans `team_members` avec `role:"member"`
- Transition vers la vue chat après rejointe

#### Chat Realtime
- Abonnement `supabase.channel("team-messages-{id}")` avec filtre `team_id=eq.{id}`
- Sur `INSERT` : charge le nouveau message complet via requête secondaire + l'ajoute au state
- **Déduplication** via `seenIds` Set ref → évite les doublons quand l'émetteur reçoit son propre message en realtime
- Auto-scroll vers le bas après chaque nouveau message (ref `bottomRef`)
- Nettoyage : `supabase.removeChannel(channel)` au unmount

#### Composants internes
- `ReceivedBubble` : bulle blanche + avatar coloré (gradient déterministe depuis `avatarGradient(userId)`) + nom si premier message du même sender
- `SentBubble` : bulle gradient orange
- `avatarGradient(userId)` : hash du userId → index dans `BUBBLE_GRADIENTS` (7 couleurs) → même gradient toujours pour le même user
- `formatMsgTime(iso)` : convertit `"2026-04-25T14:05:00Z"` → `"14h05"`
- Groupage messages : `showName` = vrai si premier message d'une série du même expéditeur

#### Envoi de message
- `handleSend` : `supabase.from("messages").insert({ team_id, sender_id, content })` + réinitialise l'input
- Bouton send orange si `text.trim()` non vide, gris sinon

#### État 404
- Si `team` est null après chargement → message "Équipe introuvable" + bouton retour

---

### `src/app/(main)/teams/page.tsx` — Rejoindre & Créer une équipe

#### Bouton "Rejoindre"
- `handleJoin(team)` : `supabase.from("team_members").insert({ team_id, user_id, role:"member" })`
- Après succès : déplace l'équipe de la section "Découvrir" vers "Mes équipes" localement + redirige vers `/teams/{id}`

#### Modal "Créer une équipe" (bottom sheet)
- Bouton "Créer" dans le header → ouvre un bottom sheet avec animation `slideUp` (CSS `@keyframes`)
- Formulaire complet :
  - Input nom de l'équipe
  - Grille 4 colonnes des 8 sports (tiles actif/inactif style sport color)
  - Select niveau (Tous niveaux / Débutant / Intermédiaire / Confirmé)
  - Input ville / localisation
  - Toggle Public / Privé
- `handleCreate(e)` :
  1. `supabase.from("teams").insert({ name, sport, level, location, is_public, owner_id, members_count:0 })`
  2. `supabase.from("team_members").insert({ team_id, user_id, role:"owner" })`
  3. Redirige vers `/teams/${newTeam.id}`
- **Note** : `members_count:0` explicite pour éviter le conflit avec le trigger qui l'incrémente à 1

#### Imports centralisés
- `SPORT_META` et `LEVEL_LABELS` importés depuis `@/lib/utils` (suppression des duplicats inline)

---

### `src/app/admin/teams/page.tsx` — Gestion des équipes en admin

Page de gestion des équipes dans l'espace admin :
- Liste toutes les équipes avec join `owner:profiles!owner_id(full_name, username)`
- Recherche par nom ou username du propriétaire
- Toggle visibilité publique/privée : `supabase.from("teams").update({ is_public: !team.is_public })`
- Suppression avec dialogue `window.confirm()` : `supabase.from("teams").delete().eq("id", team.id)`
- Affiche : emoji sport, nom, badge public/privé, propriétaire, nombre de membres, date de création
- Skeleton loading pendant le fetch

### `src/app/admin/layout.tsx` — Ajout "Équipes" dans la sidebar
- Nouvel item nav : icône `Shield` → `/admin/teams` → label "Équipes"
- Import `Shield` depuis `lucide-react`

### `src/app/admin/page.tsx` — Correction lien événement
- Lien cassé `/admin/events/${id}` corrigé en `/events/${id}` (route publique, pas admin)

---

### Résultat
- **TypeScript** : 0 erreur (`npx tsc --noEmit`)
- Chat realtime fonctionnel avec déduplication
- Création et rejointe d'équipe entièrement connectées à Supabase

## 2026-04-25 — Refonte visuelle "Créer un événement"

### `src/app/(main)/events/create/page.tsx` — Redesign complet (frontend-design skill)

#### Nouvelles données dynamiques
- Suppression du tableau `DAYS` hardcodé (["24"..."30"]) remplacé par `genDays()` qui génère 7 jours à partir d'aujourd'hui
- `selectedDate` stocke désormais la date complète `"YYYY-MM-DD"` au lieu du numéro de jour uniquement
- `SPORTS` dérivé de `SPORT_META` (import centralisé depuis `@/lib/utils`)
- `LEVELS` enrichi avec couleurs (`#1A2B4A` / `#22C55E` / `#F4B43A` / `#EF4444`)
- `STEP_CONFIG` : tableau des 4 étapes avec label, couleur accent, gradient et texte hero

#### Header sticky redesigné
- Titre step-specific ("Sport & Niveau" / "Date & Heure" / "Lieu" / "Finaliser") au lieu de "Nouvel événement"
- Pill "N/4" fond couleur accent de l'étape courante, transition CSS
- Barre progression 4 segments : passés = couleur pleine, actif = animation `fillBar` 0.4s, futurs = gris

#### Hero banner (partagé)
- Bandeau coloré h=80px sous le header avec gradient propre à chaque étape
- Texte hero blanc 17px/800 à gauche, emoji 52px à droite avec animation `heroSpin`
- Emoji rotatif adaptatif : étape 1 = emoji du sport sélectionné (🏟️ par défaut), étapes 2/3/4 = 📅/📍/🎉

#### Step 1 — Sport & Niveau
- Grille 3 colonnes (au lieu de 2) — tiles h=88px avec couleur propre à chaque sport (`SPORT_META[id].color`)
- Tile actif : fond couleur sport + shadow colorée `${color}55`
- Cards niveau en 4 colonnes h=52px avec dot coloré + label — actif = fond couleur niveau, texte blanc

#### Step 2 — Date & Heure
- Header mois dynamique ("Avril 2026")
- Strip 7 jours w=52 h=72 — actif = fond navy + barre orange 3px en bas
- Grille horaires (4 cols, h=44px) — actif = fond teal (#2EC4B6) + shadow teal
- Card durée avec slider (couleur teal) + 4 chips raccourcis cliquables (30min/1h/1h30/2h) — actif = fond `#D6F4F1`, texte `#1FA89B`
- `formatDuration` depuis `@/lib/utils` (suppression de l'inline `formatDur`)

#### Step 3 — Lieu
- Search bar h=50px avec bouton "Localiser" pill navy à droite (icône Navigation)
- Mini-map conservée avec badge overlay "3 terrains proches"
- Cards terrain enrichies (radius 16px) :
  - Ligne 1 : emoji sport + nom 15px/800 + badge prix pill vert (Gratuit) ou orange (€/h)
  - Ligne 2 : 📍 quartier + distance + ⭐ note
  - Radio check navy quand sélectionné
  - Fond `rgba(26,43,74,0.04)` + border navy si actif

#### Step 4 — Finaliser
- Carte récap navy avec résumé des 3 étapes : emoji+sport+niveau / 📅 date+heure+durée / 📍 terrain
- Input nom (focus → border verte)
- Stepper joueurs (max 100) + visualiseur de slots (bulles colorées dégradé vert → max 24 pts)
- Cards visibilité : actif = fond `rgba(34,197,94,0.06)` + border verte

#### Footer
- Bouton "Continuer" utilise le gradient + couleur shadow de l'étape courante (orange/teal/navy/vert)
- Bouton "Publier" en vert avec emoji 🎉

**TypeScript : 0 erreur après redesign**

## 2026-04-25 — Correction RLS équipes + Realtime

### Problèmes identifiés
- **Bug RLS teams** : la policy `"Public teams visible to all"` ne permettait pas aux membres de voir les équipes privées où ils étaient membres (non propriétaire). Résultat : la section "Mes équipes" apparaissait vide pour les équipes privées.
- **Realtime messages** : la table `messages` n'était pas dans la publication `supabase_realtime`, empêchant le chat temps-réel de recevoir les nouveaux messages.

### Correction

#### `supabase/migrations/005_fix_teams_rls.sql`
- Remplace la policy `"Public teams visible to all"` par `"Teams visible to members and public"` :
  - `is_public = TRUE` → visible par tous
  - `owner_id = auth.uid()` → visible par le propriétaire
  - `EXISTS (team_members WHERE team_id = teams.id AND user_id = auth.uid())` → visible par tous les membres (y compris équipes privées)
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages` → active le Realtime sur la table messages

**À appliquer dans Supabase SQL Editor**

## 2026-04-26 — Panel membres équipe avec exclusion

### Fonctionnalité ajoutée
- `src/app/(main)/teams/[id]/page.tsx` : bottom sheet "Membres" accessible via le bouton MoreHorizontal en haut de la page de chat
- **Ouverture** : tap sur `···` → `openMembers()` charge les membres via `team_members` jointure `profiles`
- **Affichage** :
  - Avatar avec dégradé coloré + initiales
  - Nom, badge rôle (Propriétaire avec couronne dorée, Admin, Membre)
  - Indicateur "(vous)" pour l'utilisateur courant
- **Exclusion** : seul le propriétaire voit le bouton `UserMinus` orange à côté de chaque membre (sauf lui-même)
  - Confirmation `window.confirm` avant suppression
  - `handleKick()` : DELETE sur `team_members` + mise à jour locale du state
  - État de chargement sur le bouton pendant l'opération (`kickingId`)
- **Migration 011** (`supabase/migrations/011_team_kick_member.sql`) : nouvelle policy RLS autorisant le propriétaire à supprimer n'importe quel membre
  - **À appliquer dans Supabase SQL Editor**
- Skeleton loading pendant le fetch des membres
- Animation `slideUp` + backdrop flou à l'ouverture

## 2026-04-26 — Correction RLS récursion infinie messages (500)

### Problème
- Erreur `POST /rest/v1/messages 500 Internal Server Error` à l'envoi de message dans le chat d'équipe
- Cause : récursion infinie RLS — la policy `team_members SELECT` contenait une sous-requête auto-référente, et la policy `messages INSERT` appelait `team_members`, créant une boucle infinie

### Correction — `supabase/migrations/007_fix_messages_rls.sql`
- Nouvelle fonction `check_team_is_public(p_team_id)` SECURITY DEFINER (contourne RLS pour lire `teams.is_public`)
- Policy `team_members SELECT` simplifiée : `user_id = auth.uid() OR check_team_is_public(team_id)` (plus de sous-requête auto-référente)
- Policies `messages SELECT` et `messages INSERT` recrées proprement avec `check_team_membership()` (déjà SECURITY DEFINER depuis migration 006)
- **Appliqué via Supabase SQL Editor**

## 2026-04-26 — Page détail terrain + système de réservation

### `src/app/(main)/fields/[id]/page.tsx` — Nouvelle page (créée)

#### Structure
- **Hero** : gradient dynamique selon le sport du terrain, emoji décoratif géant (opacity 0.13), titre + district + badges (sport, rating, prix)
- **Top bar fixe** : bouton retour + partage (glassmorphism)
- **Info card** (overlap -20px sur le hero) : chips amenities + adresse + bouton "Itinéraire" (ouvre Google Maps)

#### Calendrier de disponibilité
- **Date strip** : 7 jours à partir d'aujourd'hui (jour + numéro), actif = navy + barre orange en bas
- **Sélecteur de durée** : 3 boutons 1h / 1h30 / 2h, actif = orange avec shadow orange
- **Grille créneaux** : 07h00 → 21h30 par 30min, 4 colonnes
  - Pris (gris, barré) : chargé depuis `bookings` Supabase pour la date sélectionnée
  - Disponible mais durée dépasse 22h ou conflit : fond légèrement rosé + border orange
  - Disponible et OK pour la durée choisie : blanc + border gris
  - Sélectionné : navy + shadow
- Rechargement automatique des créneaux à chaque changement de date

#### Confirmation
- **CTA sticky** (apparaît quand un créneau est sélectionné) : affiche créneau sélectionné + total prix + bouton "Confirmer la réservation"
- `handleConfirm` : insert `bookings` (terrain_id, user_id, date, start_time, end_time, status:'confirmed') → redirect `/profile/reservations`

### `src/app/(main)/profile/reservations/page.tsx` — Nouvelle page (créée)
- Header sticky : bouton retour + titre
- **Onglets** : "À venir" / "Passées" avec compteur badge orange
- **Cards** : emoji sport, nom terrain, date formatée, créneau (start → end), badge statut (Confirmée vert / Annulée gris)
- **Bouton Annuler** (uniquement réservations futures non annulées) : UPDATE status='cancelled'
- **État vide** : CTA "Voir les terrains →" si onglet "À venir"
- Skeleton loading (3 cards)

### Migration `017_bookings_visibility.sql`
- Nouvelle policy RLS : `"Authenticated users can view terrain availability"` — `USING (auth.uid() IS NOT NULL)`
- Permet à tout utilisateur connecté de lire les bookings d'un terrain pour afficher la disponibilité
- **À appliquer dans Supabase SQL Editor**

### Modifications
- `src/app/(main)/fields/page.tsx` :
  - Ajout `import Link from "next/link"`
  - Suppression de `handleReserve` (stub setTimeout) et du state `reserving`
  - Bouton "Réserver ce terrain" remplacé par un `<Link href="/fields/${terrain.id}">`
- `src/app/(main)/profile/page.tsx` :
  - Ajout icône `CalendarCheck` dans les imports lucide
  - Nouveau lien "Mes réservations" → `/profile/reservations` dans la section Compte (fond teal)

## 2026-04-27 — Espace admin : page Réservations + mise à jour Dashboard & Sidebar

### `src/app/admin/reservations/page.tsx` — Nouvelle page (créée)

Page de gestion des réservations dans l'espace admin :
- Charge toutes les réservations via `bookings` avec join `terrains` + `profiles`
- **Header** : titre "Réservations" + mini-stats card (Confirmées / Annulées côte à côte)
- **Filtres** : chips Toutes / Confirmées / Annulées + barre de recherche (terrain ou utilisateur)
- **Liste** : chaque ligne affiche avatar utilisateur, nom/@username, emoji sport + nom terrain + district (pill), date formatée FR + créneau horaire, badge statut coloré
- **Annulation** : bouton X rouge uniquement pour les réservations confirmées → UPDATE status='cancelled' + mise à jour locale du state
- **Skeleton loading** : 5 lignes pendant le fetch
- **État vide** : emoji 📅 + message contextuel (avec ou sans filtre actif)

### `src/app/admin/layout.tsx` — Ajout "Réservations" dans la sidebar
- Nouvel item nav : icône `BookMarked` → `/admin/reservations` → label "Réservations"
- Import `BookMarked` depuis `lucide-react` (suppression de `X` non utilisé)

### `src/app/admin/page.tsx` — Stat Réservations dans le dashboard
- Requête supplémentaire : `bookings` count avec filtre `status = 'confirmed'`
- Nouvelle `StatCard` "Réservations" (couleur bleue `#3B82F6`, icône `BookMarked`)
- Type `Stats` mis à jour avec `totalBookings`

**TypeScript : 0 erreur**

## 2026-04-27 — Gestion des sports : admin + espace utilisateur

### Migration `supabase/migrations/018_sports_and_proposals.sql`
Deux nouvelles tables :
- **`sports`** : slug (unique), name, emoji, color, is_active, created_at — RLS : lecture publique, CRUD admin uniquement. Seedée avec les 8 sports existants (basket, foot, tennis, running, volley, padel, velo, yoga).
- **`sport_proposals`** : user_id, name, emoji, description, status (pending/approved/rejected), admin_note — RLS : user voit ses propres proposals + admins voient tout, users INSERT, admins UPDATE, user DELETE sur ses pending.
- **À appliquer dans Supabase SQL Editor**

### `src/app/admin/sports/page.tsx` — Page admin Sports (créée)
Deux onglets :
- **Sports actifs** : liste tous les sports (pastille colorée, nom, slug), toggle actif/inactif (switch pill vert/gris), suppression avec confirm. Formulaire "Ajouter un sport" : nom (slug auto-généré), emoji, color picker HTML — insert dans `sports`.
- **Propositions** : liste toutes les propositions avec join profil utilisateur, filtres chips (Toutes/En attente/Approuvées/Rejetées), recherche. Boutons Approuver (→ status='approved' + auto-insert dans `sports`) / Rejeter. Badge orange sur l'onglet avec le count pending.

### `src/app/(main)/sports/page.tsx` — Page utilisateur Sports (créée)
- Header sticky navy gradient + bouton "Proposer un sport" (orange pill)
- Grille 2 colonnes des sports actifs (card colorée, emoji, nom)
- Formulaire de proposition : nom, emoji, description (max 200 chars) → insert dans `sport_proposals`
- Feedback succès "Proposition envoyée ! 🎉"
- Section "Mes propositions" (si l'user en a) avec badge statut + bouton annuler sur les pending

### Modifications
- `src/app/admin/layout.tsx` : ajout "Sports" (icône `Dumbbell`) dans la sidebar admin
- `src/app/(main)/profile/page.tsx` : nouveau lien "Sports & Propositions" → `/sports` (icône `Dumbbell` orange) dans la section Compte

**TypeScript : 0 erreur**
