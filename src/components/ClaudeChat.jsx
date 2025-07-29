import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

const ClaudeChat = ({ userContext = {}, crmData = null, className = "" }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && !isInitialized) {
      startConversation();
    }
  }, [user, isInitialized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/claude/conversation/start', {
        userId: user.id,
        userContext: {
          userName: `${user.prenom} ${user.nom}`,
          role: user.role,
          company: 'Entreprise Organiser',
          ...userContext
        }
      });

      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setMessages([response.data.message]);
        setIsInitialized(true);
        toast.success('Chat Claude initialisé !');
      }
    } catch (error) {
      console.error('Erreur démarrage conversation:', error);
      toast.error('Erreur lors de l\'initialisation du chat');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Préparer la requête - n'envoyer crmData que si c'est une question CRM explicite
      const requestData = {
        sessionId,
        message: inputMessage,
      };

      // Seulement ajouter crmData si l'utilisateur semble poser une question métier
      // Laisser le backend détecter automatiquement via detectCrmContext()
      // Ne pas forcer le contexte CRM pour les questions générales
      
      const response = await api.post('/claude/conversation/message', requestData);

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          createdAt: new Date().toISOString(),
          metadata: response.data.metadata
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      
      const errorMessage = {
        role: 'assistant',
        content: 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer un message avec données CRM explicites
  const sendMessageWithCrmData = async (message, explicitCrmData = crmData) => {
    if (!sessionId || isLoading) return;

    const userMessage = {
      role: 'user',
      content: message,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await api.post('/claude/conversation/message', {
        sessionId,
        message,
        crmData: explicitCrmData
      });

      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          createdAt: new Date().toISOString(),
          metadata: response.data.metadata
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erreur envoi message avec CRM:', error);
      toast.error('Erreur lors de l\'envoi du message');
      
      const errorMessage = {
        role: 'assistant',
        content: 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const handleQuickAction = async (action, data = crmData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/claude/quick-action', {
        action,
        data,
        sessionId
      });

      if (response.data.success) {
        const actionMessage = {
          role: 'user',
          content: `Action rapide: ${getActionLabel(action)}`,
          createdAt: new Date().toISOString(),
          isQuickAction: true
        };
        const responseMessage = {
          role: 'assistant',
          content: response.data.response,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, actionMessage, responseMessage]);
      }
    } catch (error) {
      console.error('Erreur action rapide:', error);
      toast.error('Erreur lors de l\'exécution de l\'action');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      'analyze-customer': '🔍 Analyser client',
      'write-email': '📧 Écrire email',
      'sales-strategy': '💡 Stratégie vente',
      'financial-analysis': '📊 Analyse financière'
    };
    return labels[action] || action;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors z-50"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-medium">Claude Assistant</span>
          {messages.length > 1 && (
            <Badge variant="secondary" className="ml-1">
              {messages.length - 1}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-96 h-[600px] shadow-lg z-50 flex flex-col ${className}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <CardTitle className="text-lg">Claude Assistant</CardTitle>
              <p className="text-blue-100 text-sm">En ligne</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white/20 p-1"
            >
              ━
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                } ${message.isQuickAction ? 'bg-purple-100 border border-purple-200' : ''}`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.createdAt)}
                  {message.metadata?.tokensUsed && (
                    <span className="ml-2">• {message.metadata.tokensUsed} tokens</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg p-3 rounded-bl-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500">Claude réfléchit...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Actions rapides */}
        {crmData && (
          <div className="border-t p-3">
            <div className="text-xs text-gray-500 mb-2">Actions rapides :</div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction('analyze-customer')}
                disabled={isLoading}
                className="text-xs"
              >
                🔍 Analyser
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction('financial-analysis')}
                disabled={isLoading}
                className="text-xs"
              >
                📊 Finance
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction('sales-strategy')}
                disabled={isLoading}
                className="text-xs"
              >
                💡 Stratégie
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question à Claude..."
              disabled={isLoading || !sessionId}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim() || !sessionId}
              size="sm"
              title="Envoyer message"
            >
              📤
            </Button>
            {crmData && (
              <Button
                onClick={() => sendMessageWithCrmData(inputMessage)}
                disabled={isLoading || !inputMessage.trim() || !sessionId}
                size="sm"
                variant="outline"
                title="Analyser avec données CRM"
              >
                📊
              </Button>
            )}
          </div>
          {crmData && (
            <div className="text-xs text-gray-500 mt-1">
              💡 Utilisez 📊 pour forcer l'analyse avec les données CRM
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaudeChat; 