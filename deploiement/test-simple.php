<?php
echo "Test PHP OK !<br>";
echo "Date : " . date('Y-m-d H:i:s') . "<br>";

// Test cURL simple
$ch = curl_init('http://localhost:8000/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 2);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Test localhost:8000 :<br>";
echo "Code HTTP : " . $httpCode . "<br>";
echo "Erreur : " . $error . "<br>";
echo "Réponse : " . substr($response, 0, 100) . "<br>";
?> 