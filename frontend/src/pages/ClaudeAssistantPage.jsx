import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import './ClaudeAssistantPage.css';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  MessageSquare, 
  Clock,
  Settings,
  Share,
  MoreVertical,
  X,
  Upload,
  FileText,
  Image,
  File
} from 'lucide-react';

// Générateur d'ID unique pour éviter les conflits
let idCounter = 0;
const generateUniqueId = () => {
  return `uuid-${++idCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

const ClaudeAssistantPage = () => {
  const { user } = useAuth();
  
  // Log pour debug
  console.log('[ClaudeAssistantPage] Rendering component');
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Données factices pour démo avec clés stables
  const mockConversations = [
    {
      id: 'mock-conv-1',
      title: 'CRM AI Integration with Cursor',
      updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1h ago
    },
    {
      id: 'mock-conv-2',
      title: 'Astrological and Design Life Analysis',
      updatedAt: new Date(Date.now() - 7200000).toISOString(), // 2h ago
    },
    {
      id: 'mock-conv-3',
      title: 'Financial Pie Chart Terminology',
      updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: 'mock-conv-4',
      title: 'Construction Management App: User Accounts',
      updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
  ];

  const mockInitialMessage = {
    role: 'assistant',
    content: `Salut ! Je suis Claude, votre assistant IA. 👋

Je peux vous aider avec :
• **Questions générales** - Tout ce que vous voulez savoir
• **Analyse de documents** - Uploadez vos fichiers
• **Programmation** - Code, debug, explications
• **Rédaction** - Textes, emails, articles
• **Business** - Stratégie, analyse, conseils
• **Et bien plus** - Créativité, apprentissage, recherche...

Comment puis-je vous aider aujourd'hui ?`,
    timestamp: new Date().toISOString(),
    id: 'mock-initial-message'
  };

  useEffect(() => {
    // Charger les conversations au démarrage
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      // Debug des informations d'authentification
      const token = localStorage.getItem('auth_token');
      console.log('🔐 Token présent:', !!token);
      console.log('👤 User data:', user);
      console.log('🔗 API URL:', api.defaults.baseURL);
      
      // Essayer l'API réelle d'abord
      try {
        console.log('📡 Tentative de connexion à l\'API...');
        const response = await api.get('/claude/conversations');
        console.log('✅ API Response loadConversations:', response.data);
        
        if (response.data && Array.isArray(response.data) && response.data.length >= 0) {
          // Format de réponse actuel de l'API
          const conversations = response.data.map(conv => ({
            ...conv,
            id: conv.sessionId || conv.id // Utilise sessionId comme id si nécessaire
          }));
          setConversations(conversations);
          console.log('✅ Conversations chargées depuis l\'API:', conversations.length);
          
          if (!currentConversationId && conversations.length > 0) {
            setCurrentConversationId(conversations[0].id);
            loadConversation(conversations[0].id);
          }
          return;
        }
        
        if (response.data && response.data.success && response.data.conversations) {
          setConversations(response.data.conversations);
          if (!currentConversationId && response.data.conversations.length > 0) {
            setCurrentConversationId(response.data.conversations[0].id);
            loadConversation(response.data.conversations[0].id);
          }
          return;
        }
      } catch (apiError) {
        console.error('❌ ERREUR API loadConversations:', apiError);
        console.error('❌ API Error details:', apiError.response?.data || apiError.message);
        console.error('❌ Status:', apiError.response?.status);
        toast.error(`Erreur API loadConversations: ${apiError.response?.status} - ${apiError.response?.data?.message || apiError.message}`);
      }
      
      // Fallback sur les données factices si l'API n'est pas disponible
      console.log('⚠️ Utilisation des données factices (fallback)');
      setConversations(mockConversations);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      setConversations(mockConversations);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      console.log('🔄 Chargement conversation ID:', conversationId);
      setCurrentConversationId(conversationId);
      
      // Essayer de charger les messages depuis l'API
      try {
        const response = await api.get(`/claude/conversations/${conversationId}`);
        console.log('✅ Réponse loadConversation:', response.data);
        if (response.data && response.data.success && response.data.messages) {
          setMessages(response.data.messages);
          return;
        } else if (response.data && response.data.messages) {
          // Fallback si pas de success
          setMessages(response.data.messages);
          return;
        }
      } catch (apiError) {
        console.error('❌ ERREUR API loadConversation:', apiError);
        console.error('❌ API Error details:', apiError.response?.data || apiError.message);
      }
      
      // Fallback sur le message initial
      console.log('📝 Utilisation du message initial par défaut');
      setMessages([mockInitialMessage]);
    } catch (error) {
      console.error('Erreur chargement conversation:', error);
      setMessages([mockInitialMessage]);
    }
  };

  const createNewConversation = async () => {
    try {
      // Essayer de créer via l'API d'abord
      try {
        const response = await api.post('/claude/conversations', {
          title: 'Nouvelle conversation'
        });
        console.log('✅ Réponse createConversation:', response.data);
        if (response.data && response.data.success && response.data.conversation) {
          const newConversation = {
            ...response.data.conversation,
            id: response.data.conversation.id || response.data.conversation.sessionId
          };
          console.log('✅ Nouvelle conversation créée:', newConversation);
          setConversations(prev => [newConversation, ...prev]);
          setCurrentConversationId(newConversation.id);
          setMessages([mockInitialMessage]);
          toast.success('Nouvelle conversation créée !');
          return;
        }
      } catch (apiError) {
        console.error('❌ ERREUR API createNewConversation:', apiError);
        console.error('❌ API Error details:', apiError.response?.data || apiError.message);
        toast.error(`Erreur API createNewConversation: ${apiError.response?.data?.message || apiError.message}`);
      }
      
      // Fallback local
      const newConversation = {
        id: generateUniqueId(),
        title: 'Nouvelle conversation',
        updatedAt: new Date().toISOString(),
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setMessages([mockInitialMessage]);
      toast.success('Nouvelle conversation créée (mode local) !');
    } catch (error) {
      console.error('Erreur création conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;
    if (!currentConversationId) {
      await createNewConversation();
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      id: generateUniqueId(),
      files: selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const currentMessage = inputMessage;
    setInputMessage('');
    setSelectedFiles([]);

    try {
      // Essayer d'envoyer le message via l'API Claude réelle
      try {
        const token = localStorage.getItem('auth_token');
        console.log('📤 Envoi message - Token présent:', !!token);
        console.log('📤 ConversationId:', currentConversationId);
        console.log('📤 Message:', currentMessage);
        
        const formData = new FormData();
        formData.append('conversationId', currentConversationId);
        formData.append('message', currentMessage);
        
        selectedFiles.forEach((file, index) => {
          formData.append(`files`, file);
        });

        console.log('📡 Envoi vers API /claude/message...');
        const response = await api.post('/claude/message', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('✅ Réponse API sendMessage:', response.data);
        if (response.data && response.data.response) {
          const assistantMessage = {
            role: 'assistant',
            content: response.data.response,
            timestamp: response.data.timestamp || new Date().toISOString(),
            id: response.data.messageId || generateUniqueId()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          console.log('✅ Message de Claude reçu et affiché');
          return;
        }
      } catch (apiError) {
        console.error('❌ ERREUR API sendMessage:', apiError);
        console.error('❌ API Error details:', apiError.response?.data || apiError.message);
        console.error('❌ Status:', apiError.response?.status);
        toast.error(`Erreur API sendMessage: ${apiError.response?.status} - ${apiError.response?.data?.message || apiError.message}`);
      }

      // Fallback en mode simulation si l'API n'est pas disponible
      setTimeout(() => {
        const responses = [
          "C'est une excellente question ! Laissez-moi vous expliquer en détail...",
          "Je comprends votre besoin. Voici ce que je peux vous proposer :",
          "Intéressant ! Permettez-moi d'analyser cela pour vous...",
          "Parfait ! Je vais vous aider avec cela. Voici ma réponse :",
          "Excellente demande ! Voici une analyse complète :"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const assistantMessage = {
          role: 'assistant',
          content: `${randomResponse}\n\n${currentMessage.includes('?') ? 'Voici la réponse à votre question' : 'Voici ce que je peux vous dire sur le sujet'} :\n\n⚠️ **Mode Démonstration** - L'API Claude est temporairement indisponible. Cette réponse est simulée.\n\nVeuillez vérifier que le backend est démarré et que l'API Claude est configurée correctement.`,
          timestamp: new Date().toISOString(),
          id: generateUniqueId()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      
      const errorMessage = {
        role: 'assistant',
        content: 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.',
        timestamp: new Date().toISOString(),
        id: generateUniqueId()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image size={16} />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText size={16} />;
    return <File size={16} />;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title && conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <Button 
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Nouvelle conversation
          </Button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans vos conversations..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Votre historique de chat</h3>
            <div className="p-3 rounded-lg cursor-pointer mb-1 transition-colors bg-gray-100 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                    Test conversation - map désactivé
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                    Test pour identifier le problème
                    </p>
                  </div>
                  <MessageSquare size={14} className="text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </div>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Vous avez {conversations.length} conversations précédentes avec Claude.
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                C
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Claude</h1>
                <p className="text-sm text-gray-500">Assistant IA par Anthropic</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      C
                    </div>
                    <span className="text-sm font-medium text-gray-900">Claude</span>
                  </div>
                )}
                
                {message.role === 'user' && (
                  <div className="flex items-center justify-end mb-2">
                    <span className="text-sm font-medium text-gray-900 mr-2">Vous</span>
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.prenom?.[0] || 'U'}
                    </div>
                  </div>
                )}

                <div className={`rounded-2xl p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  {/* Files preview for user messages */}
                  {message.files && message.files.length > 0 && (
                    <div className="mb-3">
                      {message.files.map((file, index) => (
                        <div key={`${message.id}-file-${index}`} className="flex items-center space-x-2 bg-white/10 rounded-lg p-2 mb-2">
                          {getFileIcon(file)}
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs opacity-75">({formatFileSize(file.size)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>

                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-right text-gray-500' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                    C
                  </div>
                  <span className="text-sm font-medium text-gray-900">Claude</span>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">Claude réfléchit...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          {/* File upload area */}
          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={`selected-file-${index}-${file.name}-${file.size}`} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                    {getFileIcon(file)}
                    <span className="text-sm truncate max-w-32">{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-auto p-1"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div 
            className={`relative rounded-2xl border-2 transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex items-end space-x-3 p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-gray-700"
              >
                <Paperclip size={20} />
              </Button>

              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Répondre à Claude..."
                  disabled={isLoading}
                  rows="1"
                  className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-sm placeholder-gray-500 bg-transparent"
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
              </div>

              <Button
                onClick={sendMessage}
                disabled={isLoading || (!inputMessage.trim() && selectedFiles.length === 0)}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl"
              >
                <Send size={16} />
              </Button>
            </div>

            {dragOver && (
              <div className="absolute inset-0 bg-blue-100/80 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-blue-600 mb-2" />
                  <p className="text-blue-600 font-medium">Déposez vos fichiers ici</p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.csv,.xlsx"
          />

          <p className="text-xs text-gray-500 mt-2 text-center">
            Claude peut faire des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaudeAssistantPage; 