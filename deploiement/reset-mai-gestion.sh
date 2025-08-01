#!/bin/bash
# Script de nettoyage Mai Gestion sur O2SWITCH
# À exécuter dans le Terminal cPanel

echo "=== NETTOYAGE MAI GESTION ==="
echo "Ce script va supprimer :"
echo "- Application Node.js"
echo "- Fichiers frontend et backend"
echo "- Sous-domaines (manuellement)"
echo ""
read -p "Êtes-vous sûr ? (oui/non) : " confirmation

if [ "$confirmation" != "oui" ]; then
    echo "Annulé."
    exit 0
fi

echo "Suppression en cours..."

# Supprimer les fichiers
rm -rf ~/nodejs_apps/mai-gestion-api
rm -rf ~/public_html/crm
rm -rf ~/public_html/api
rm -rf ~/nodevenv/nodejs_apps/mai-gestion-api

echo "✅ Fichiers supprimés"
echo ""
echo "⚠️  N'OUBLIEZ PAS de supprimer manuellement :"
echo "1. L'app Node.js dans cPanel"
echo "2. La base de données MySQL"
echo "3. Les sous-domaines crm et api"
echo ""
echo "Nettoyage terminé !" 