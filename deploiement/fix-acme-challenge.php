<?php
// Script pour corriger l'accès ACME Challenge pour Let's Encrypt
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Fix ACME Challenge - Let's Encrypt</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px; }
        .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .button:hover { background: #0056b3; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Correction ACME Challenge pour SSL</h1>
        
        <div class="error">
            <h3>❌ Problème détecté</h3>
            <p>Let's Encrypt ne peut pas accéder au dossier de validation <code>.well-known/acme-challenge/</code></p>
            <p>Erreur : Code 500 - L'application bloque l'accès</p>
        </div>

        <?php
        // Déterminer le chemin correct selon le sous-domaine
        $subdomain = 'api.lamanufacturedubois.com';
        $basePath = '/home/cexe9174/';
        
        // Chemins possibles pour api.lamanufacturedubois.com
        $possiblePaths = [
            $basePath . 'public_html/api/',
            $basePath . 'public_html/api.lamanufacturedubois.com/',
            $basePath . 'nodejs_apps/mai-gestion-api/public/',
            $basePath . 'nodejs_apps/mai-gestion-api/'
        ];
        
        $apiPath = null;
        foreach ($possiblePaths as $path) {
            if (is_dir($path)) {
                $apiPath = $path;
                break;
            }
        }
        
        if (!$apiPath) {
            // Créer un dossier temporaire pour la validation
            $apiPath = $basePath . 'public_html/api/';
            if (!is_dir($apiPath)) {
                mkdir($apiPath, 0755, true);
                echo "<div class='info'>📁 Dossier créé : $apiPath</div>";
            }
        }
        
        echo "<div class='info'><h3>📍 Chemin détecté : $apiPath</h3></div>";
        
        // 1. Créer la structure .well-known/acme-challenge
        $wellKnownPath = $apiPath . '.well-known/';
        $acmePath = $wellKnownPath . 'acme-challenge/';
        
        if (!is_dir($acmePath)) {
            mkdir($acmePath, 0755, true);
            echo "<div class='success'>✅ Dossier ACME créé : <code>.well-known/acme-challenge/</code></div>";
        } else {
            echo "<div class='info'>📁 Dossier ACME existe déjà</div>";
        }
        
        // 2. Créer un fichier test
        $testFile = $acmePath . 'test.txt';
        file_put_contents($testFile, 'ACME validation test - OK');
        echo "<div class='success'>✅ Fichier test créé</div>";
        
        // 3. Créer un .htaccess pour permettre l'accès
        $htaccessContent = '# Permettre l\'accès Let\'s Encrypt
<IfModule mod_rewrite.c>
    RewriteEngine On
    # Ne pas rediriger les fichiers ACME
    RewriteRule ^\.well-known/acme-challenge/ - [L]
</IfModule>

# Autoriser l\'accès au dossier
Require all granted
Options -Indexes';
        
        file_put_contents($acmePath . '.htaccess', $htaccessContent);
        echo "<div class='success'>✅ .htaccess créé dans acme-challenge/</div>";
        
        // 4. Créer/Modifier le .htaccess principal
        $mainHtaccess = $apiPath . '.htaccess';
        $mainHtaccessContent = '# Configuration pour api.lamanufacturedubois.com
RewriteEngine On

# IMPORTANT: Permettre l\'accès Let\'s Encrypt AVANT toute autre règle
RewriteCond %{REQUEST_URI} ^/\.well-known/acme-challenge/
RewriteRule ^ - [L]

# Proxy vers l\'application Node.js (si configurée)
# RewriteCond %{REQUEST_URI} !^/\.well-known/
# RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Ou redirection simple
# RewriteCond %{REQUEST_URI} !^/\.well-known/
# RewriteRule ^(.*)$ /app.js [L]';

        file_put_contents($mainHtaccess, $mainHtaccessContent);
        echo "<div class='success'>✅ .htaccess principal configuré</div>";
        
        // 5. Créer un index.html simple
        $indexContent = '<!DOCTYPE html>
<html>
<head>
    <title>API Mai Gestion</title>
</head>
<body>
    <h1>API Mai Gestion</h1>
    <p>Backend Node.js</p>
</body>
</html>';
        
        file_put_contents($apiPath . 'index.html', $indexContent);
        echo "<div class='success'>✅ index.html créé</div>";
        
        ?>
        
        <div class="warning">
            <h3>📋 Configuration détectée</h3>
            <pre><?php echo htmlspecialchars($mainHtaccessContent); ?></pre>
        </div>
        
        <div class="info">
            <h3>🧪 Test de validation</h3>
            <p>Testez l'accès : <a href="http://api.lamanufacturedubois.com/.well-known/acme-challenge/test.txt" target="_blank">
                http://api.lamanufacturedubois.com/.well-known/acme-challenge/test.txt
            </a></p>
            <p>Si ce lien affiche "ACME validation test - OK", alors Let's Encrypt pourra valider.</p>
        </div>
        
        <div class="success">
            <h3>✅ Prochaines étapes</h3>
            <ol>
                <li>Vérifiez que le test fonctionne (lien ci-dessus)</li>
                <li>Retournez dans cPanel</li>
                <li>Relancez la génération du certificat SSL</li>
                <li>Cette fois, la validation devrait réussir</li>
            </ol>
        </div>
        
        <div class="warning">
            <h3>⚠️ Si ça ne fonctionne toujours pas</h3>
            <ul>
                <li>Vérifiez dans cPanel → "Setup Node.js App" si une app existe pour api.lamanufacturedubois.com</li>
                <li>Si oui, arrêtez-la temporairement pendant la génération SSL</li>
                <li>Ou utilisez AutoSSL au lieu de Let's Encrypt</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://o2switch.net" target="_blank" class="button">🔧 Retourner à cPanel</a>
            <a href="?refresh=<?php echo time(); ?>" class="button">🔄 Relancer le script</a>
        </div>
    </div>
</body>
</html> 