<?php
echo "<h2>🔧 Correction Build TypeScript</h2>";

$appRoot = '/home/cexe9174/nodejs_apps/mai-gestion-api';

// Vérifier le fichier tsconfig.json
$tsconfigPath = $appRoot . '/tsconfig.json';
echo "<h3>📝 Configuration TypeScript actuelle :</h3>";

if (file_exists($tsconfigPath)) {
    $content = file_get_contents($tsconfigPath);
    echo "<pre style='background:#f8f9fa; padding:10px; max-height:300px; overflow:auto;'>";
    echo htmlspecialchars($content);
    echo "</pre>";
    
    $tsconfig = json_decode($content, true);
    if ($tsconfig !== null) {
        echo "<p>✅ tsconfig.json valide</p>";
        
        // Vérifier les exclusions
        if (isset($tsconfig['exclude'])) {
            echo "<p>✅ Fichiers exclus : " . implode(', ', $tsconfig['exclude']) . "</p>";
        } else {
            echo "<p>⚠️ Aucun fichier exclu</p>";
        }
    } else {
        echo "<p style='color:red'>❌ tsconfig.json invalide !</p>";
    }
} else {
    echo "<p style='color:red'>❌ tsconfig.json manquant !</p>";
}

// Vérifier le fichier seed.ts problématique
$seedPath = $appRoot . '/prisma/seed.ts';
echo "<h3>🔍 Fichier problématique prisma/seed.ts :</h3>";

if (file_exists($seedPath)) {
    $size = filesize($seedPath);
    echo "<p>✅ Présent : $size bytes</p>";
    
    $content = file_get_contents($seedPath);
    echo "<p><strong>Première ligne (problématique) :</strong></p>";
    echo "<pre style='background:#ffe4e4; padding:10px;'>";
    echo htmlspecialchars(substr($content, 0, 200));
    echo "</pre>";
    
    // Chercher RoleEnum dans le fichier
    if (strpos($content, 'RoleEnum') !== false) {
        echo "<p style='color:red'>❌ Contient 'RoleEnum' qui cause l'erreur</p>";
    }
} else {
    echo "<p>ℹ️ prisma/seed.ts n'existe pas</p>";
}

// Créer un tsconfig.json corrigé
echo "<h3>🛠️ Solution : tsconfig.json corrigé</h3>";

$fixedTsconfig = [
    "compilerOptions" => [
        "target" => "ES2020",
        "module" => "commonjs",
        "outDir" => "./dist",
        "rootDir" => "./src",
        "strict" => true,
        "esModuleInterop" => true,
        "skipLibCheck" => true,
        "forceConsistentCasingInFileNames" => true,
        "experimentalDecorators" => true,
        "emitDecoratorMetadata" => true,
        "resolveJsonModule" => true
    ],
    "include" => ["src/**/*"],
    "exclude" => [
        "node_modules",
        "dist",
        "prisma/seed.ts",
        "**/*.test.ts",
        "**/*.spec.ts"
    ]
];

echo "<p><strong>tsconfig.json corrigé (exclut prisma/seed.ts) :</strong></p>";
echo "<pre style='background:#e8f5e8; padding:10px;'>";
echo htmlspecialchars(json_encode($fixedTsconfig, JSON_PRETTY_PRINT));
echo "</pre>";

// Boutons d'action
echo "<h3>🚀 Actions disponibles :</h3>";
echo "<form method='post' style='margin:10px 0;'>";
echo "<button type='submit' name='fix_tsconfig' style='background:#007bff; color:white; padding:10px; border:none; border-radius:5px;'>📝 Corriger tsconfig.json</button>";
echo "</form>";

echo "<form method='post' style='margin:10px 0;'>";
echo "<button type='submit' name='rename_seed' style='background:#28a745; color:white; padding:10px; border:none; border-radius:5px;'>📦 Renommer seed.ts (temporaire)</button>";
echo "</form>";

// Traitement des actions
if (isset($_POST['fix_tsconfig'])) {
    if (file_put_contents($tsconfigPath, json_encode($fixedTsconfig, JSON_PRETTY_PRINT))) {
        echo "<p style='color:green'>✅ <strong>tsconfig.json corrigé !</strong></p>";
        echo "<p>Maintenant, dans cPanel : Run JS script → build</p>";
    } else {
        echo "<p style='color:red'>❌ Erreur lors de l'écriture du fichier</p>";
    }
}

if (isset($_POST['rename_seed'])) {
    if (file_exists($seedPath)) {
        if (rename($seedPath, $seedPath . '.backup')) {
            echo "<p style='color:green'>✅ <strong>seed.ts renommé en seed.ts.backup !</strong></p>";
            echo "<p>Maintenant, dans cPanel : Run JS script → build</p>";
        } else {
            echo "<p style='color:red'>❌ Erreur lors du renommage</p>";
        }
    } else {
        echo "<p style='color:orange'>⚠️ seed.ts n'existe pas</p>";
    }
}

echo "<h3>📋 Plan d'action :</h3>";
echo "<ol>";
echo "<li><strong>Corriger NODE_ENV</strong> dans cPanel (supprimer et recréer)</li>";
echo "<li><strong>Cliquer un des boutons ci-dessus</strong> pour corriger tsconfig ou renommer seed</li>";
echo "<li><strong>Dans cPanel :</strong> Run JS script → build</li>";
echo "<li><strong>Changer startup file</strong> → dist/src/main.js</li>";
echo "<li><strong>RESTART</strong> l'application</li>";
echo "</ol>";
?> 