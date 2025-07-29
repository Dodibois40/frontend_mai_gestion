import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import './UniversalClaude.css';

const UniversalClaude = ({ userContext = {}, className = "" }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentMode, setCurrentMode] = useState('universal');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isMinimized && messages.length === 0) {
      initializeChat();
    }
  }, [isMinimized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = () => {
    const welcomeMessage = {
      role: 'assistant',
      content: `Salut ! Je suis Claude Sonnet 4, votre assistant IA universel ! 🤖

Je peux vous aider avec ABSOLUMENT TOUT :
• 💼 Questions business et CRM
• 🔧 Programmation et technique
• 🎨 Créativité et écriture
• 📚 Apprentissage et éducation
• 🍳 Recettes de cuisine
• 🌍 Voyage et culture
• 💰 Finance et investissement
• 🏃‍♂️ Sport et santé
• 🎬 Divertissement
• ... et vraiment tout le reste !

Posez-moi n'importe quelle question ! 😊`,
      timestamp: new Date(),
      mode: 'universal'
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (mode = 'universal') => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      mode: mode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let endpoint = '/claude-universal/chat';
      let body = {
        sessionId,
        message: inputMessage,
        userContext: {
          userName: user ? `${user.prenom} ${user.nom}` : 'Utilisateur',
          company: 'Entreprise Organiser',
          location: 'France',
          role: user?.role,
          ...userContext
        }
      };

      // Choisir l'endpoint selon le mode
      if (mode === 'crm') {
        endpoint = '/claude-universal/crm-mode';
        body = { ...body, query: inputMessage, crmData: userContext.crmData };
      } else if (mode === 'creative') {
        endpoint = '/claude-universal/creative';
        body = { ...body, request: inputMessage };
      } else if (mode === 'technical') {
        endpoint = '/claude-universal/technical';
        body = { ...body, question: inputMessage };
      }

      const response = await api.post(endpoint, body);

      if (response.data.success) {
        if (!sessionId && response.data.sessionId) {
          setSessionId(response.data.sessionId);
        }
        
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          mode: mode,
          metadata: response.data.metadata
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
        timestamp: new Date(),
        mode: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erreur lors de l\'envoi du message');
    }

    setIsLoading(false);
  };

  const quickActions = [
    { id: 'explain', label: '🧠 Expliquer', mode: 'universal', prompt: "Explique-moi un concept intéressant" },
    { id: 'brainstorm', label: '💡 Brainstormer', mode: 'creative', prompt: "Aide-moi à brainstormer des idées créatives" },
    { id: 'debug', label: '🐛 Debugger', mode: 'technical', prompt: "Comment debugger efficacement mon code ?" },
    { id: 'recipe', label: '🍳 Recette', mode: 'creative', prompt: "Propose-moi une recette simple et délicieuse" },
    { id: 'translate', label: '🌍 Traduire', mode: 'universal', prompt: "Comment améliorer mon anglais ?" },
    { id: 'summarize', label: '📝 Résumer', mode: 'universal', prompt: "Résume-moi les dernières tendances tech" },
  ];

  const handleQuickAction = async (action) => {
    setInputMessage(action.prompt);
    setCurrentMode(action.mode);
  };

  const modes = [
    { id: 'universal', label: '🌟 Universel', color: '#667eea', description: 'Questions générales' },
    { id: 'crm', label: '💼 CRM', color: '#11998e', description: 'Analyse business' },
    { id: 'creative', label: '🎨 Créatif', color: '#e056fd', description: 'Écriture & idées' },
    { id: 'technical', label: '🔧 Technique', color: '#f093fb', description: 'Code & tech' }
  ];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(currentMode);
    }
  };

  if (isMinimized) {
    return (
      <div className="claude-minimized" onClick={() => setIsMinimized(false)}>
        <div className="claude-icon">🤖</div>
        <span>Claude Assistant</span>
        <div className="notification-badge">💬</div>
      </div>
    );
  }

  return (
    <div className={`claude-universal-container ${className}`}>
      <div className="chat-header">
        <div className="header-left">
          <div className="claude-avatar">🤖</div>
          <div className="header-info">
            <h3>Claude Sonnet 4</h3>
            <span className="status">Assistant Universel</span>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setIsMinimized(true)} className="minimize-btn">−</button>
        </div>
      </div>

      <div className="mode-selector">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCurrentMode(mode.id)}
            className={`mode-btn ${currentMode === mode.id ? 'active' : ''}`}
            style={currentMode === mode.id ? { background: mode.color } : {}}
            title={mode.description}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
            </div>
            <div className="message-meta">
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {message.mode && message.mode !== 'universal' && (
                <span className={`mode-indicator ${message.mode}`}>
                  {modes.find(m => m.id === message.mode)?.label}
                </span>
              )}
              {message.metadata?.tokensUsed && (
                <span className="tokens-info">
                  {message.metadata.tokensUsed} tokens
                </span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action)}
            className="quick-action-btn"
            disabled={isLoading}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Posez n'importe quelle question à Claude... (Mode: ${modes.find(m => m.id === currentMode)?.label})`}
          disabled={isLoading}
          rows="3"
        />
        <button
          onClick={() => sendMessage(currentMode)}
          disabled={isLoading || !inputMessage.trim()}
          className="send-btn"
          style={{ background: modes.find(m => m.id === currentMode)?.color }}
        >
          📤
        </button>
      </div>
    </div>
  );
};

export default UniversalClaude; 