# Portail Mobile ERP

Portail collaboratif sous forme de Progressive Web App (PWA) intégré à l'ERP, destiné aux employés pour la gestion quotidienne des tâches RH.

## Fonctionnalités

### 1. Pointage Horaire
- Enregistrement des heures d'entrée et de sortie
- Support de géolocalisation facultatif
- Historique des pointages
- Synchronisation hors ligne

### 2. Gestion des Congés
- Soumission de demandes de congés
- Historique des demandes
- Support de pièces jointes
- Notifications de statut

### 3. Documents RH
- Consultation des fiches de paie
- Accès aux contrats et avenants
- Gestion des attestations
- Téléchargement sécurisé

### 4. Messagerie Interne
- Communication directe avec le service RH
- Support de pièces jointes
- Notifications en temps réel
- Historique des conversations

### 5. Calendrier Personnel
- Vue des congés et absences
- Jours fériés
- Événements RH
- Synchronisation avec le calendrier de l'entreprise

## Architecture Technique

### Frontend
- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui pour les composants

### Backend
- Next.js API Routes
- Supabase pour la base de données et l'authentification
- Service Worker pour le support hors ligne

### Base de Données
- PostgreSQL (via Supabase)
- Tables principales :
  - timesheet
  - leave_requests
  - employee_documents
  - messages
  - calendar_events

### Stockage
- Supabase Storage pour les fichiers
- Buckets séparés pour :
  - Documents RH
  - Pièces jointes des congés
  - Pièces jointes des messages

## Installation

1. Cloner le repository :
```bash
git clone [url-du-repo]
cd erp-systeme
```

2. Installer les dépendances :
```bash
pnpm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```
Remplir les variables suivantes :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Lancer les migrations Supabase :
```bash
supabase db push
```

5. Démarrer le serveur de développement :
```bash
pnpm dev
```

## Déploiement

1. Construire l'application :
```bash
pnpm build
```

2. Vérifier la construction :
```bash
pnpm start
```

3. Déployer sur votre plateforme préférée (Vercel recommandé)

## Support Hors Ligne

Le portail mobile utilise un Service Worker pour :
- Mise en cache des ressources statiques
- Synchronisation des pointages en arrière-plan
- Stockage local des demandes de congés
- Mise en file d'attente des messages

Stratégies de cache :
- Cache-first pour les ressources statiques
- Network-first pour les API dynamiques
- Background sync pour les opérations d'écriture

## Sécurité

- Authentification via Supabase Auth
- Row Level Security (RLS) pour toutes les tables
- Chiffrement des fichiers sensibles
- Validation des tokens JWT
- Protection CSRF
- Headers de sécurité configurés

## Gestion des Droits

Trois niveaux d'accès :
1. Employé
   - Accès à ses propres données
   - Soumission de demandes
   - Consultation de documents

2. Manager
   - Validation des demandes de son équipe
   - Vue d'équipe
   - Rapports simplifiés

3. RH
   - Administration complète
   - Gestion des documents
   - Communication globale

## Maintenance

### Mises à jour
1. Vérifier les dépendances :
```bash
pnpm outdated
```

2. Mettre à jour les packages :
```bash
pnpm update
```

3. Tester l'application

### Sauvegarde
- Backup quotidien de la base de données
- Sauvegarde des fichiers stockés
- Export des logs

## Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs
3. Contacter l'équipe technique

## Roadmap

### Version 1.1
- [ ] Support des notifications push
- [ ] Signature électronique des documents
- [ ] Module de formation

### Version 1.2
- [ ] Chat en temps réel
- [ ] Vidéoconférence intégrée
- [ ] Tableau de bord personnalisé

### Version 1.3
- [ ] Support multi-langue
- [ ] Mode sombre
- [ ] Widgets personnalisables