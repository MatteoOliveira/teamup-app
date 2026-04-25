# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**TeamUp!** — Application de gestion d'équipes / collaboration, sujet B3 DEV (CDSD T6, Septembre 2025).  
Le sujet complet est dans `B3DEV - T6 CDSD SUJET 2025 SEPTEMBRE (1).pdf`.

## État du projet

Le projet est en phase de démarrage — aucun code n'a encore été écrit. Développement **en local uniquement** (pas de déploiement Vercel pour le moment).

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (App Router) |
| Style | Tailwind CSS |
| UI Components | shadcn/ui |
| Auth | NextAuth.js (OAuth Google + email) |
| BDD / Realtime / Storage | Supabase |
| Carte / Géolocalisation | Leaflet |
| PWA | next-pwa (Service Worker + offline) |
| Runtime | Node.js (local) |

## Commandes de développement

```bash
npm run dev      # Démarrer le serveur local (http://localhost:3000)
npm run build    # Build de production
npm run lint     # Linter ESLint
```

## Documentation

- `documentation/chat.md` — journal des actions réalisées par Claude Code
- `documentation/` — toute la documentation technique du projet (à mettre à jour après chaque modification de code)

## Design

Toujours utiliser le skill **`frontend-design`** (via `/frontend-design`) pour créer ou modifier l'interface de l'application. Ce skill génère des interfaces de qualité production avec un design distinctif, en évitant les aesthetiques génériques.

## Conventions

- Langue du code : anglais (variables, fonctions, commentaires)
- Langue de la documentation : français
- Mettre à jour `documentation/chat.md` et la documentation technique après chaque modification
