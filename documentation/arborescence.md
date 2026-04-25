# Arborescence & Parcours Utilisateur — TeamUp!

> PWA de gestion d'événements sportifs locaux — Digital Campus B3 DEV, Session Septembre 2025

---

## Concept

**TeamUp!** est une PWA permettant aux amateurs de sport de :
- Créer et rejoindre des événements sportifs de proximité
- Réserver des terrains / espaces publics
- Gérer des équipes et communiquer via messagerie
- Suivre ses performances et statistiques
- Fonctionner **hors ligne** (PWA offline-first)

---

## Navigation principale — Bottom Navigation Bar (5 onglets)

| Icône | Onglet | Rôle |
|-------|--------|------|
| 🏠 | **Accueil** | Feed événements proches (géolocalisation) |
| 📅 | **Événements** | Découvrir, créer, gérer des events |
| 📍 | **Terrains** | Carte + réservation d'espaces sportifs |
| 👥 | **Équipes** | Mes équipes + messagerie |
| 👤 | **Profil** | Profil sportif, stats, paramètres |

---

## Arborescence complète

```
TeamUp! PWA
│
├── 🔐 AUTHENTIFICATION (hors navigation)
│   ├── Splash Screen
│   ├── Onboarding (3 slides de présentation)
│   ├── Connexion (email / OAuth Google)
│   └── Inscription
│       ├── Étape 1 — Informations personnelles
│       ├── Étape 2 — Sports préférés & niveau
│       └── Étape 3 — Disponibilités
│
├── 🏠 ACCUEIL
│   ├── Feed événements proches (carte interactive + liste)
│   ├── Filtres (sport, distance, niveau, date)
│   ├── Carte géolocalisée des événements
│   └── Notifications (push + in-app)
│
├── 📅 ÉVÉNEMENTS
│   ├── Liste des événements (à venir / passés)
│   ├── Détail d'un événement
│   │   ├── Infos (sport, lieu, date, niveau)
│   │   ├── Participants (liste + rejoindre)
│   │   ├── Terrain réservé
│   │   └── Messagerie de l'événement
│   ├── Créer un événement
│   │   ├── Sport & niveau requis
│   │   ├── Date / heure / durée
│   │   ├── Lieu (carte) / terrain
│   │   ├── Nombre de participants max
│   │   └── Visibilité (public / privé / équipe)
│   └── Mes événements (créés + rejoints)
│
├── 📍 TERRAINS
│   ├── Carte des terrains disponibles (géoloc)
│   ├── Liste des terrains (filtres : sport, dispo, gratuit/payant)
│   ├── Détail d'un terrain
│   │   ├── Photos, équipements, accès
│   │   ├── Calendrier de disponibilité
│   │   └── Bouton Réserver
│   ├── Réservation d'un créneau
│   │   ├── Sélection date/heure
│   │   ├── Durée
│   │   └── Confirmation
│   └── Mes réservations (à venir / passées / annuler)
│
├── 👥 ÉQUIPES
│   ├── Mes équipes (liste)
│   ├── Détail d'une équipe
│   │   ├── Membres & rôles
│   │   ├── Événements de l'équipe
│   │   ├── Stats collectives
│   │   └── Messagerie d'équipe (chat temps réel)
│   ├── Créer une équipe
│   │   ├── Nom, sport, niveau
│   │   ├── Photo / avatar
│   │   └── Inviter des membres
│   └── Rejoindre une équipe (recherche / lien d'invitation)
│
└── 👤 PROFIL
    ├── Mon profil public
    │   ├── Avatar, bio, sports pratiqués
    │   ├── Niveau par sport
    │   └── Disponibilités (calendrier)
    ├── Mes statistiques
    │   ├── Événements joués
    │   ├── Sports pratiqués
    │   └── Performances (victoires, participation)
    ├── Paramètres
    │   ├── Notifications (push, email)
    │   ├── Confidentialité & RGPD
    │   ├── Mode hors ligne
    │   └── Déconnexion
    └── Aide / À propos
```

---

## Parcours utilisateur — Scénarios clés

### Parcours 1 — Premier lancement (Nouvel utilisateur)

```
Splash Screen
  → Onboarding (3 slides : créer events, réserver terrains, rejoindre équipes)
    → Inscription
      → Choix des sports préférés + niveau
        → Disponibilités
          → Accueil (feed personnalisé géolocalisé)
```

### Parcours 2 — Créer un événement sportif

```
Onglet Événements
  → Bouton "+" (Créer)
    → Formulaire (sport, niveau, date, durée)
      → Sélection terrain (carte) ou saisie manuelle
        → Paramètres participants (nb max, public/privé)
          → Confirmation → Événement publié
            → Partager (lien / équipe)
```

### Parcours 3 — Trouver et rejoindre un événement

```
Onglet Accueil
  → Carte géolocalisée (événements proches)
    → Filtrer (sport: basket, distance: 2km, niveau: débutant)
      → Sélectionner un événement
        → Page détail (infos + participants)
          → "Rejoindre" → Confirmation
            → Accès messagerie de l'événement
```

### Parcours 4 — Réserver un terrain

```
Onglet Terrains
  → Carte (terrains à proximité)
    → Sélectionner un terrain (filtres: sport, dispo)
      → Page détail (équipements, photos)
        → "Réserver" → Calendrier disponibilités
          → Choisir créneau → Confirmation
            → Réservation dans "Mes réservations"
```

### Parcours 5 — Gérer son équipe

```
Onglet Équipes
  → Créer une équipe (nom, sport, avatar)
    → Inviter des membres (lien / recherche)
      → Page équipe (membres, événements)
        → Chat messagerie temps réel
          → Créer un événement pour l'équipe
```

---

## Design System — Directives pour Claude Frontend Design

### Identité visuelle

- **Nom** : TeamUp!
- **Logo existant** : personnages colorés (orange, vert, bleu) avec ballons de basket → tons chauds + sport
- **Ambiance** : énergique, communautaire, accessible, moderne
- **Cible** : 18-40 ans, amateurs de sport de proximité

### Palette de couleurs suggérée

| Rôle | Couleur |
|------|---------|
| Primaire | Orange vif `#FF6B35` |
| Secondaire | Vert sport `#2EC4B6` |
| Accent | Bleu nuit `#1A2B4A` |
| Background | Blanc cassé `#F8F9FA` |
| Surface card | `#FFFFFF` avec ombre légère |
| Texte principal | `#1A2B4A` |
| Texte secondaire | `#6B7280` |

### Typographie suggérée

- **Titres** : Inter Bold / Poppins Bold
- **Corps** : Inter Regular
- **Labels / Badges** : Inter SemiBold

### Composants UI clés

- **Bottom Navigation Bar** — 5 onglets avec icônes + labels, indicateur actif orange
- **Event Card** — image de couverture, sport badge coloré, infos (date, lieu, participants restants), bouton "Rejoindre"
- **Sport Badge** — pill coloré par sport (basket=orange, foot=vert, tennis=jaune...)
- **Map View** — carte avec pins colorés par sport + liste slide-up en dessous
- **Avatar + niveau** — cercle avatar avec badge niveau (débutant/intermédiaire/confirmé)
- **Chat Bubble** — messagerie style iMessage, bulles colorées

### Spécificités PWA

- **Header** : sticky, logo + icône notifications + avatar
- **Pull to refresh** sur les feeds
- **Skeleton loaders** pour le chargement
- **Toast notifications** pour les confirmations
- **Bottom sheet** pour les filtres et formulaires rapides
- **Offline banner** quand pas de connexion internet

---

## Pages à designer en priorité

1. **Onboarding** (3 slides) — première impression
2. **Accueil** (feed + carte) — écran principal
3. **Détail événement** — page de conversion clé
4. **Créer un événement** — formulaire multi-étapes
5. **Profil utilisateur** — stats + infos sportives
6. **Messagerie équipe** — chat temps réel
