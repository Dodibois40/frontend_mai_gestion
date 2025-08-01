<?php
echo "Test de tous les ports :<br><br>";

$ports = [3000, 3001, 8000, 8080, 8081, 8888, 9000];

foreach ($ports as $port) {
    echo "Port $port : ";
    
    $ch = curl_init("http://localhost:$port/");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 1);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($response !== false && $httpCode > 0) {
        echo "<strong style='color:green'>✅ RÉPOND (HTTP $httpCode)</strong><br>";
        echo "Réponse : " . substr($response, 0, 100) . "...<br>";
    } else {
        echo "<span style='color:red'>❌ Pas de réponse</span><br>";
    }
    echo "<br>";
}

echo "<br>Si aucun port ne répond, l'app Node.js n'est pas démarrée !";
?> 