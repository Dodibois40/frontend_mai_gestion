<?php
echo "<h2>🔧 Diagnostic Package.json</h2>";

$appRoot = '/home/cexe9174/nodejs_apps/mai-gestion-api';
$packagePath = $appRoot . '/package.json';

if (file_exists($packagePath)) {
    $content = file_get_contents($packagePath);
    $package = json_decode($content, true);
    
    echo "<h3>📦 Package.json actuel :</h3>";
    echo "<pre style='background:#f8f9fa; padding:10px; max-height:400px; overflow:auto;'>";
    echo htmlspecialchars($content);
    echo "</pre>";
    
    if ($package === null) {
        echo "<p style='color:red'>❌ <strong>ERREUR : JSON invalide !</strong></p>";
        echo "<p>Le fichier package.json est corrompu !</p>";
    } else {
        echo "<h3>✅ Analyse :</h3>";
        
        // Vérifier les scripts
        if (isset($package['scripts'])) {
            echo "<p>✅ Scripts présents :</p>";
            echo "<ul>";
            foreach ($package['scripts'] as $name => $script) {
                echo "<li><strong>$name :</strong> $script</li>";
            }
            echo "</ul>";
        } else {
            echo "<p style='color:red'>❌ Aucun script défini !</p>";
        }
        
        // Vérifier les dépendances
        if (isset($package['dependencies'])) {
            $depCount = count($package['dependencies']);
            echo "<p>✅ <strong>$depCount dépendances</strong> dans dependencies</p>";
        }
        
        if (isset($package['devDependencies'])) {
            $devDepCount = count($package['devDependencies']);
            echo "<p>✅ <strong>$devDepCount dépendances</strong> dans devDependencies</p>";
        }
        
        // Vérifier le main
        if (isset($package['main'])) {
            echo "<p>✅ <strong>Main :</strong> " . $package['main'] . "</p>";
        } else {
            echo "<p style='color:orange'>⚠️ Pas de 'main' défini</p>";
        }
    }
} else {
    echo "<p style='color:red'>❌ <strong>Package.json MANQUANT !</strong></p>";
}

// Vérifier dist/main.js
$mainPath = $appRoot . '/dist/main.js';
echo "<h3>📁 Fichier dist/main.js :</h3>";
if (file_exists($mainPath)) {
    $size = filesize($mainPath);
    echo "<p>✅ <strong>Présent :</strong> $size bytes</p>";
    
    if ($size < 1000) {
        echo "<p style='color:red'>⚠️ <strong>Fichier trop petit !</strong> Probable erreur de build.</p>";
        $content = file_get_contents($mainPath);
        echo "<p><strong>Contenu :</strong></p>";
        echo "<pre style='background:#ffe4e4; padding:10px;'>" . htmlspecialchars($content) . "</pre>";
    } else {
        // Lire le début du fichier
        $content = file_get_contents($mainPath);
        echo "<p><strong>Début du fichier :</strong></p>";
        echo "<pre style='background:#e8f5e8; padding:10px;'>" . htmlspecialchars(substr($content, 0, 300)) . "</pre>";
    }
} else {
    echo "<p style='color:red'>❌ <strong>dist/main.js MANQUANT !</strong></p>";
    echo "<p>Le build n'a pas été fait ou a échoué.</p>";
}

// Recommandations
echo "<h3>💡 Recommandations :</h3>";
echo "<ol>";
echo "<li><strong>Si package.json est corrompu :</strong> Il faut le recréer</li>";
echo "<li><strong>Si dist/main.js manque :</strong> Essayez 'Run JS script' à nouveau</li>";
echo "<li><strong>Si dist/main.js est trop petit :</strong> Erreur de build, code source problématique</li>";
echo "<li><strong>Si tout semble OK :</strong> Problème dans les dépendances Node.js</li>";
echo "</ol>";

echo "<h3>🔧 Solution rapide :</h3>";
echo "<p>Si le problème persiste, on peut :</p>";
echo "<ol>";
echo "<li>Recréer un package.json minimal</li>";
echo "<li>Copier le code source depuis votre machine locale</li>";
echo "<li>Rebuilder complètement l'application</li>";
echo "</ol>";
?> 