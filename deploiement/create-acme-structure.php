<?php
// Script simple pour créer la structure ACME Challenge
header('Content-Type: text/plain; charset=utf-8');

echo "=== CRÉATION STRUCTURE ACME CHALLENGE ===\n\n";

// Créer le dossier pour api.lamanufacturedubois.com
$apiPath = '/home/cexe9174/public_html/api/';
if (!is_dir($apiPath)) {
    mkdir($apiPath, 0755, true);
    echo "✅ Dossier créé : $apiPath\n";
}

// Créer .well-known/acme-challenge
$acmePath = $apiPath . '.well-known/acme-challenge/';
if (!is_dir($acmePath)) {
    mkdir($acmePath, 0755, true);
    echo "✅ Dossier ACME créé : .well-known/acme-challenge/\n";
}

// Créer un fichier test
file_put_contents($acmePath . 'test.txt', 'OK - ACME validation ready');
echo "✅ Fichier test créé\n";

// Créer le .htaccess minimal
$htaccess = '# Permettre accès Let\'s Encrypt
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/\.well-known/acme-challenge/
RewriteRule ^ - [L]

# Autoriser l\'accès
Require all granted';

file_put_contents($apiPath . '.htaccess', $htaccess);
echo "✅ .htaccess créé\n";

// Créer un index.html basique
$index = '<html><body><h1>API Mai Gestion</h1></body></html>';
file_put_contents($apiPath . 'index.html', $index);
echo "✅ index.html créé\n";

echo "\n=== TERMINÉ ===\n";
echo "\n📋 PROCHAINES ÉTAPES :\n";
echo "1. Testez : http://api.lamanufacturedubois.com/.well-known/acme-challenge/test.txt\n";
echo "2. Si ça affiche 'OK', retournez dans cPanel\n";
echo "3. Relancez la génération du certificat SSL\n";
echo "\n💡 CONSEIL : Si ça ne marche toujours pas, utilisez AutoSSL au lieu de Let's Encrypt\n";
?> 