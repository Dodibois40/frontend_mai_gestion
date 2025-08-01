<?php
echo "<h3>🔍 Vérification App Node.js Mai Gestion</h3>";

$ports = [3000, 8000, 8080, 8081, 3001, 8888];

foreach ($ports as $port) {
    echo "<h4>Test Port $port</h4>";
    
    // Test GET /
    $ch = curl_init("http://localhost:$port/");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mai-Gestion-Test');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode == 200 && $response) {
        // Vérifier si c'est vraiment Mai Gestion
        if (strpos($response, 'Mai Gestion') !== false || 
            strpos($response, 'API running') !== false ||
            strpos($response, 'Express') !== false ||
            (strpos($response, '{') === 0 && json_decode($response))) {
            
            echo "<p style='color:green; font-weight:bold'>✅ APP NODE.JS TROUVÉE !</p>";
            echo "<p><strong>Port :</strong> $port</p>";
            echo "<p><strong>Réponse :</strong></p>";
            echo "<pre style='background:#e8f5e8'>" . htmlspecialchars(substr($response, 0, 300)) . "</pre>";
            
            // Test auth/login sur ce port
            $ch = curl_init("http://localhost:$port/auth/login");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 3);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, '{"email":"test","password":"test"}');
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            
            $loginResponse = curl_exec($ch);
            $loginCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            echo "<p><strong>Test login :</strong> HTTP $loginCode</p>";
            if ($loginCode == 400 || $loginCode == 401) {
                echo "<p style='color:green'>✅ Endpoint /auth/login fonctionne !</p>";
            }
            
        } else {
            echo "<p style='color:orange'>⚠️ Répond mais pas Mai Gestion (probablement cPanel/Apache)</p>";
            echo "<pre style='background:#fff3cd'>" . htmlspecialchars(substr($response, 0, 200)) . "</pre>";
        }
    } else {
        echo "<p style='color:red'>❌ Pas de réponse</p>";
    }
    echo "<hr>";
}

echo "<h3>📋 Instructions :</h3>";
echo "<ul>";
echo "<li><strong>Si aucun port n'affiche 'APP NODE.JS TROUVÉE' :</strong> L'app n'est pas démarrée</li>";
echo "<li><strong>Si un port montre Mai Gestion :</strong> Utilisez ce port dans le proxy</li>";
echo "<li><strong>Si tout montre cPanel/Apache :</strong> L'app Node.js est arrêtée</li>";
echo "</ul>";
?> 