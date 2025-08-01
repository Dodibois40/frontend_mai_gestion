// Test ultra simple
const div = document.createElement('div');
div.innerHTML = '<h1>Test simple fonctionnel</h1><p>Si vous voyez ce message, le serveur marche!</p>';
div.style.padding = '20px';
div.style.textAlign = 'center';
document.getElementById('root').appendChild(div);

console.log('Script main-simple.jsx exécuté avec succès'); 