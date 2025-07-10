# Module de Reconnaissance de Documents (OCR)

## Architecture Globale

### Frontend (React/Next.js)
- **DocumentUpload** : Composant de téléchargement et prévisualisation
- **DocumentScanner** : Page principale avec gestion des documents
- Interface utilisateur moderne avec retour en temps réel
- Gestion des états de traitement et affichage des résultats

### Backend (Next.js API Routes)
- Traitement des fichiers uploadés
- Intégration avec Tesseract.js pour l'OCR
- Classification automatique des documents
- Extraction des champs pertinents
- Stockage dans Supabase

### Stockage (Supabase)
- **Documents** : Stockage des fichiers et métadonnées
- **DocumentFields** : Champs extraits et validations
- **DocumentTypes** : Configuration des types de documents
- Statistiques et recherche full-text

## Fonctionnalités

### Reconnaissance de Documents
- Support des formats PDF et images
- OCR multilingue (français, anglais)
- Extraction intelligente des champs
- Classification automatique

### Types de Documents Supportés
1. **Factures**
   - Numéro de facture
   - Date
   - Montants (HT, TVA, TTC)
   - Informations fournisseur
   - Articles et prestations

2. **Bons de Commande**
   - Numéro de commande
   - Fournisseur
   - Articles commandés
   - Montants

3. **CV**
   - Informations personnelles
   - Formation
   - Expérience
   - Compétences

### Améliorations IA

#### Classification Automatique
- Analyse du contenu pour déterminer le type
- Apprentissage continu basé sur les corrections
- Suggestions de classification

#### Extraction Intelligente
- Reconnaissance des patterns courants
- Validation des données extraites
- Calcul de scores de confiance

#### Détection d'Anomalies
- Vérification des calculs
- Détection des doublons
- Alertes sur incohérences

## Installation

1. Configuration Supabase :
```bash
# Créer les tables et fonctions
cd supabase/migrations
sqlc db push
```

2. Variables d'environnement :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_KEY=votre_clé_service
```

3. Dépendances :
```bash
pnpm install tesseract.js uuid
```

## Utilisation

1. Upload de document :
```typescript
// Exemple d'utilisation du composant
import { DocumentUpload } from "@/components/document-scanner/document-upload"

export default function MyPage() {
  return <DocumentUpload />
}
```

2. Traitement des résultats :
```typescript
// Exemple de traitement des données extraites
const handleDocumentProcessed = (result: DocumentData) => {
  console.log("Type:", result.type)
  console.log("Champs extraits:", result.content.fields)
  console.log("Score de confiance:", result.content.confidence)
}
```

## Améliorations Futures

1. **Apprentissage Automatique**
   - Entraînement sur les corrections utilisateurs
   - Amélioration continue des modèles
   - Personnalisation par organisation

2. **Intégration IA Avancée**
   - Utilisation de GPT pour l'analyse contextuelle
   - Reconnaissance d'entités nommées
   - Suggestions intelligentes

3. **Optimisations**
   - Traitement par lots
   - Cache intelligent
   - Compression adaptative

4. **Fonctionnalités Métier**
   - Workflows automatisés
   - Règles de validation personnalisées
   - Intégration comptable

## Sécurité

- Validation des types de fichiers
- Analyse antivirus
- Chiffrement des données sensibles
- Politiques RLS Supabase

## Support

Pour toute question ou assistance :
- Documentation technique détaillée
- Exemples d'intégration
- Guides de dépannage