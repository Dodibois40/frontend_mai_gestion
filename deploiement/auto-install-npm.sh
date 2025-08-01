#!/bin/bash

echo "=== Recherche automatique de npm pour Mai Gestion ==="

# Chercher le binaire npm
NPM_PATH=$(find /home/cexe9174 -path "*/node_modules" -prune -o -name "npm" -type f -print 2>/dev/null | head -1)

if [ -z "$NPM_PATH" ]; then
    echo "❌ npm non trouvé. Tentative avec l'environnement virtuel..."
    
    # Essayer d'activer l'environnement
    if [ -f "/home/cexe9174/nodevenv/nodejs_apps/mai-gestion-api/18/bin/activate" ]; then
        echo "✅ Activation de l'environnement Node.js..."
        source /home/cexe9174/nodevenv/nodejs_apps/mai-gestion-api/18/bin/activate
        npm install --production --legacy-peer-deps
    elif [ -f "/home/cexe9174/nodevenv/nodejs_apps/mai-gestion-api/20/bin/activate" ]; then
        echo "✅ Activation de l'environnement Node.js v20..."
        source /home/cexe9174/nodevenv/nodejs_apps/mai-gestion-api/20/bin/activate
        npm install --production --legacy-peer-deps
    else
        echo "❌ Impossible de trouver l'environnement Node.js"
        echo "Utilisez cPanel > Node.js > Run NPM Install"
    fi
else
    echo "✅ npm trouvé : $NPM_PATH"
    cd /home/cexe9174/nodejs_apps/mai-gestion-api
    $NPM_PATH install --production --legacy-peer-deps
fi 