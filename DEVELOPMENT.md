# 🛠 Guide de Développement - Entreprise Organiser

## 📋 Résumé des Corrections Appliquées

### ✅ Problèmes Résolus

1. **Erreurs 404 API** : Correction des doubles préfixes `/api/api/` → `/api/`
2. **Erreurs d'imports** : Harmonisation des exports/imports nommés vs par défaut
3. **Conflits de ports** : Standardisation backend:8000, frontend:8080
4. **Méthodes manquantes** : Correction `getAffaire` → `getAffaireById`

### 🔧 Architecture des Services

#### Services avec Export Nommé
```javascript
// ✅ Correct
export const serviceName = { ... };

// Import
import { serviceName } from '@/services/serviceName';
```

**Services concernés :**
- `notificationsService.js`
- `reportingService.js` 
- `affairesService.js`

#### Services avec Export Par Défaut
```javascript
// ✅ Correct
export default serviceName;

// Import
import serviceName from '@/services/serviceName';
```

**Services concernés :**
- `authService.js`
- `devisService.js`
- `bdcService.js`
- `taskService.js`
- `migrationService.js`
- `pointageService.js`
- `phasesService.js`
- `estimationAchatsService.js`

## 🚀 Commandes de Développement

### Démarrage
```bash
# Démarrage complet (recommandé)
npm start

# Démarrage séparé
npm run start:backend
npm run start:frontend

# Nettoyage des processus
npm run clean
```

### Ports Standardisés
- **Backend** : `http://localhost:8000`
- **Frontend** : `http://localhost:8080`
- **Health Check** : `http://localhost:8000/health`

## 🔍 Debugging

### Vérification des Services
```bash
# Health check backend
curl http://localhost:8000/health

# Test endpoints API (doivent retourner 401)
curl http://localhost:8000/api/notifications
curl http://localhost:8000/api/affaires
curl http://localhost:8000/api/reporting/dashboard
```

### Logs Utiles
```bash
# Voir les processus actifs
ss -tlnp | grep -E ":(8000|8080)"

# Tuer les processus si nécessaire
pkill -f "node.*8000"
pkill -f "vite.*8080"
```

## 📁 Structure des Services

### Configuration API
```javascript
// frontend/src/services/api.js
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  // PAS de préfixe /api ici
});
```

### Endpoints Backend
```javascript
// backend/src/main.ts
app.setGlobalPrefix('api'); // Ajoute /api/ automatiquement
```

### Appels Frontend
```javascript
// Les services appellent directement les endpoints
await api.get('/notifications'); // → http://localhost:8000/api/notifications
await api.get('/affaires');      // → http://localhost:8000/api/affaires
```

## ⚠️ Bonnes Pratiques

### 1. Imports de Services
```javascript
// ✅ Vérifier le type d'export avant d'importer
import { affairesService } from '@/services/affairesService';     // Export nommé
import authService from '@/services/authService';                 // Export par défaut
```

### 2. Noms de Méthodes
```javascript
// ✅ Utiliser les noms corrects
affairesService.getAffaireById(id);  // ✅ Correct
affairesService.getAffaire(id);      // ❌ N'existe pas
```

### 3. Configuration des Ports
```bash
# backend/.env
PORT=8000

# frontend/.env  
VITE_API_URL=http://localhost:8000
```

## 🧪 Tests de Validation

### Script de Test Complet
```bash
#!/bin/bash
echo "🧹 Nettoyage..."
npm run clean
sleep 2

echo "🚀 Démarrage..."
npm start &
sleep 10

echo "🔍 Tests..."
curl -s http://localhost:8000/health
curl -s http://localhost:8000/api/notifications | jq .statusCode
curl -s http://localhost:8080 | head -5

echo "✅ Tests terminés"
```

## 📝 Checklist de Développement

Avant chaque commit :

- [ ] Tous les imports utilisent la bonne syntaxe
- [ ] Aucune erreur 404 dans la console
- [ ] Les deux services démarrent sans conflit
- [ ] Health check retourne "healthy"
- [ ] Les endpoints API retournent 401 (pas 404)

## 🔄 Workflow de Développement

1. **Démarrage** : `npm start`
2. **Développement** : Modifier le code
3. **Test** : Vérifier dans le navigateur
4. **Nettoyage** : `npm run clean` si problème
5. **Redémarrage** : `npm start`

## 🆘 Résolution de Problèmes

### Erreur "Port already in use"
```bash
npm run clean
npm start
```

### Erreur "Cannot GET /api/api/..."
```bash
# Vérifier les imports dans le fichier concerné
# S'assurer qu'il n'y a pas de double préfixe
```

### Erreur "is not a function"
```bash
# Vérifier le type d'export/import du service
# Consulter la liste ci-dessus
```

---

**🎯 L'application est maintenant stable et prête pour le développement !** 