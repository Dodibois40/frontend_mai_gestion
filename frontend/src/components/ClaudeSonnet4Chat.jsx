import React, { useState, useRef, useEffect } from 'react';
import './ClaudeSonnet4Chat.css';

const ClaudeSonnet4Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [mode, setMode] = useState('universal');
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test de connexion au démarrage
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const response = await fetch('/api/claude-sonnet4/test');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('connected');
        console.log('✅ Claude Sonnet connecté:', data);
      } else {
        setConnectionStatus('error');
        console.error('❌ Erreur connexion Claude:', data);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Erreur test connexion:', error);
    }
  };

  const startConversation = async () => {
    try {
      const response = await fetch('/api/claude-sonnet4/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user',
          userContext: {
            userName: 'Dorian',
            company: 'CRM Business',
            role: 'Testeur'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setMessages([data.message]);
        console.log('✅ Conversation démarrée:', data.sessionId);
      } else {
        console.error('❌ Erreur démarrage conversation:', data.error);
      }
    } catch (error) {
      console.error('❌ Erreur démarrage conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!sessionId) {
      await startConversation();
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const currentMessage = inputMessage;
    setInputMessage('');

    try {
      const response = await fetch('/api/claude-sonnet4/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: currentMessage,
          mode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const claudeMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, claudeMessage]);
      } else {
        console.error('❌ Erreur envoi message:', data.error);
        // Ajouter un message d'erreur
        const errorMessage = {
          role: 'assistant',
          content: `❌ Erreur: ${data.error}`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      const errorMessage = {
        role: 'assistant',
        content: `❌ Erreur de connexion: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickAction = async (action, data = {}) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/claude-sonnet4/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      });

      const result = await response.json();
      
      if (result.success) {
        const actionMessage = {
          role: 'user',
          content: `Action rapide: ${action}`,
          timestamp: new Date().toISOString(),
          isQuickAction: true
        };
        
        const claudeMessage = {
          role: 'assistant',
          content: result.response,
          timestamp: result.timestamp
        };
        
        setMessages(prev => [...prev, actionMessage, claudeMessage]);
      } else {
        console.error('❌ Erreur action rapide:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur action rapide:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return <span className="status connected">🟢 Claude Sonnet Connecté</span>;
      case 'error':
        return <span className="status error">🔴 Erreur Connexion</span>;
      default:
        return <span className="status unknown">🟡 Test Connexion...</span>;
    }
  };

  return (
    <div className="claude-sonnet4-chat">
      <div className="chat-header">
        <h2>🤖 Claude Sonnet 4 - Assistant Universel</h2>
        <div className="status-bar">
          {getConnectionStatusDisplay()}
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
            className="mode-selector"
          >
            <option value="universal">🌟 Universel</option>
            <option value="crm">💼 CRM</option>
            <option value="creative">🎨 Créatif</option>
            <option value="technical">🔧 Technique</option>
          </select>
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={() => quickAction('weather', { location: 'Paris' })}>
          🌤️ Météo
        </button>
        <button onClick={() => quickAction('joke')}>
          😂 Blague
        </button>
        <button onClick={() => quickAction('recipe', { dish: 'pasta' })}>
          🍝 Recette
        </button>
        <button onClick={() => quickAction('explain', { topic: 'intelligence artificielle' })}>
          🧠 Expliquer IA
        </button>
        <button onClick={() => quickAction('translate', { text: 'Bonjour tout le monde!', target: 'anglais' })}>
          🌍 Traduire
        </button>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role} ${message.isError ? 'error' : ''} ${message.isQuickAction ? 'quick-action' : ''}`}
          >
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              Claude réfléchit...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={sessionId ? "Posez n'importe quelle question à Claude Sonnet..." : "Cliquez sur Envoyer pour démarrer une conversation"}
          disabled={isLoading}
          rows={2}
        />
        <button 
          onClick={sendMessage} 
          disabled={isLoading || (!inputMessage.trim() && sessionId)}
          className="send-button"
        >
          {sessionId ? '📤 Envoyer' : '🚀 Démarrer'}
        </button>
      </div>

      <div className="info-panel">
        <p><strong>Mode actuel:</strong> {mode}</p>
        <p><strong>Session:</strong> {sessionId ? sessionId.slice(-8) : 'Aucune'}</p>
        <p><strong>Messages:</strong> {messages.length}</p>
        
        <div className="test-examples">
          <h4>💡 Exemples à tester:</h4>
          <ul>
            <li>🌤️ "Quel temps fait-il à Paris ?"</li>
            <li>🍳 "Donne-moi une recette de cookies"</li>
            <li>😂 "Raconte-moi une blague sur les programmeurs"</li>
            <li>🧠 "Explique-moi l'intelligence artificielle"</li>
            <li>💰 "Conseils pour investir 1000€"</li>
            <li>🏃‍♂️ "Programme d'entraînement pour débutant"</li>
            <li>🌍 "Traduis 'Hello World' en français"</li>
            <li>💼 "Stratégie pour augmenter les ventes"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClaudeSonnet4Chat; 