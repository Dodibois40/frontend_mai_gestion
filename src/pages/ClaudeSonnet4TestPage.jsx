import React from 'react';
import ClaudeSonnet4Chat from '../components/ClaudeSonnet4Chat';

const ClaudeSonnet4TestPage = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#333',
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '10px'
        }}>
          🚀 Claude Sonnet 4 - Test Complet
        </h1>
        
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            color: '#667eea',
            fontSize: '24px',
            marginBottom: '15px'
          }}>
            🤖 Assistant IA Universel
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ color: '#334155', fontSize: '18px', marginBottom: '8px' }}>
                🌟 Mode Universel
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Questions générales, météo, culture, sciences, blagues
              </p>
            </div>
            
            <div style={{ 
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ color: '#334155', fontSize: '18px', marginBottom: '8px' }}>
                💼 Mode CRM
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Analyse business, données métier, stratégies commerciales
              </p>
            </div>
            
            <div style={{ 
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ color: '#334155', fontSize: '18px', marginBottom: '8px' }}>
                🎨 Mode Créatif
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Écriture, brainstorming, inspiration artistique
              </p>
            </div>
            
            <div style={{ 
              padding: '15px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ color: '#334155', fontSize: '18px', marginBottom: '8px' }}>
                🔧 Mode Technique
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Programmation, debug, architecture logicielle
              </p>
            </div>
          </div>
          
          <div style={{ 
            padding: '15px',
            backgroundColor: '#e0f2fe',
            borderRadius: '8px',
            border: '1px solid #b3e5fc'
          }}>
            <h3 style={{ color: '#0277bd', fontSize: '18px', marginBottom: '8px' }}>
              ⚡ Actions Rapides Disponibles
            </h3>
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center'
            }}>
              {[
                '🌤️ Météo',
                '😂 Blagues',
                '🍝 Recettes',
                '🧠 Explications',
                '🌍 Traductions',
                '💡 Brainstorming',
                '🔧 Debug Code',
                '📧 Rédaction Email'
              ].map((action, index) => (
                <span key={index} style={{ 
                  padding: '4px 8px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#0277bd',
                  border: '1px solid #b3e5fc'
                }}>
                  {action}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <ClaudeSonnet4Chat />
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '20px auto 0',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          color: '#333',
          fontSize: '20px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          📋 Guide de Test Complet
        </h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <h4 style={{ color: '#667eea', fontSize: '16px', marginBottom: '10px' }}>
              🌟 Tests Mode Universel
            </h4>
            <ul style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Demander la météo : "Quel temps fait-il à Paris ?"</li>
              <li>Culture générale : "Explique-moi la relativité"</li>
              <li>Blagues : "Raconte une blague sur l'IA"</li>
              <li>Recettes : "Recette de cookies au chocolat"</li>
              <li>Conseils : "Comment bien dormir ?"</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#667eea', fontSize: '16px', marginBottom: '10px' }}>
              💼 Tests Mode CRM
            </h4>
            <ul style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Stratégie commerciale</li>
              <li>Analyse de données clients</li>
              <li>Recommandations business</li>
              <li>Optimisation processus</li>
              <li>Prévisions de ventes</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#667eea', fontSize: '16px', marginBottom: '10px' }}>
              🎨 Tests Mode Créatif
            </h4>
            <ul style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Écriture d'emails marketing</li>
              <li>Brainstorming d'idées</li>
              <li>Création de slogans</li>
              <li>Rédaction de contenus</li>
              <li>Inspiration artistique</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#667eea', fontSize: '16px', marginBottom: '10px' }}>
              🔧 Tests Mode Technique
            </h4>
            <ul style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Debug de code JavaScript</li>
              <li>Optimisation SQL</li>
              <li>Architecture logicielle</li>
              <li>Sécurité informatique</li>
              <li>Bonnes pratiques dev</li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <h4 style={{ color: '#0369a1', fontSize: '16px', marginBottom: '10px' }}>
            🚀 Fonctionnalités Avancées
          </h4>
          <ul style={{ color: '#0369a1', fontSize: '14px', lineHeight: '1.6' }}>
            <li><strong>Mémoire de conversation :</strong> Claude se souvient du contexte</li>
            <li><strong>Modes adaptatifs :</strong> Température et style selon le mode</li>
            <li><strong>Actions rapides :</strong> Boutons pour tâches courantes</li>
            <li><strong>Interface moderne :</strong> Design responsive et animations</li>
            <li><strong>Gestion d'erreurs :</strong> Messages d'erreur informatifs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClaudeSonnet4TestPage; 