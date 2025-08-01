#!/bin/bash
# Script d'installation npm pour O2SWITCH

echo "=== Installation des node_modules sur O2SWITCH ==="

# 1. Trouver où est Node.js
echo "Recherche de Node.js..."
find /opt -name "node" 2>/dev/null | head -5
find /usr/local -name "node" 2>/dev/null | head -5

# 2. Version de Node disponible via nvm (si installé)
if command -v nvm &> /dev/null; then
    echo "NVM trouvé"
    nvm list
fi

# 3. Chercher dans les chemins cPanel classiques
echo "Vérification des chemins cPanel..."
ls -la /opt/cpanel/ea-nodejs*/bin/node 2>/dev/null
ls -la /opt/alt/alt-nodejs*/bin/node 2>/dev/null

# 4. Si CloudLinux Selector
if [ -f /usr/bin/cl-selector ]; then
    echo "CloudLinux Selector disponible"
    /usr/bin/cl-selector --interpreter=nodejs --user=cexe9174 --list
fi 