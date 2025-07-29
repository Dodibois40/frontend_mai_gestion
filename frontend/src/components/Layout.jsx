import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  IconDashboard, 
  IconCalendarEvent, 
  IconUsers, 
  IconBriefcase,
  IconSettings,
  IconLogout,
  IconUserCircle,
  IconMoon,
  IconSun,
  IconBell,
  IconBuildingFactory,
  IconBuilding,
  IconCurrencyEuro,
  IconShoppingCart,
  IconClockHour4,
  IconList,
  IconChartBar,
  IconPackage,
  IconChartAreaLine,
  IconDatabase,
  IconMenu2,
  IconX,
  IconChevronDown,
  IconNotification,
  IconMailbox,
  IconFileAnalytics,
  IconDeviceAnalytics,
  IconTool,
  IconCalendar,
  IconClock,
  IconBug,
  IconRobot,
  IconAlertOctagon,
  IconClipboardList,
  IconExclamationMark,
  IconShield,
  IconCurrencyDollar
} from '@tabler/icons-react';
import NotificationCenter from './NotificationCenter';
import BrowserDiagnostic from './BrowserDiagnostic';
import TroubleshootingGuide from './TroubleshootingGuide';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationsService } from '../services/notificationsService';

// Configuration du menu de navigation avec groupes
const navigationConfig = [
  {
    group: 'Gestion Principale',
    items: [
      { path: '/', label: 'Affaires', icon: IconBriefcase, color: 'text-amber-700' },
      { path: '/devis', label: 'Devis', icon: IconFileAnalytics, color: 'text-orange-700' },
      { path: '/achats', label: 'Achats', icon: IconShoppingCart, color: 'text-red-700' },
      { path: '/fournisseurs', label: 'Fournisseurs', icon: IconBuildingFactory, color: 'text-orange-700' },
    ]
  },
  {
    group: 'Pilotage & Suivi',
    items: [
      { path: '/dashboard', label: 'Tableau de Bord', icon: IconDashboard, color: 'text-blue-700' },
      { path: '/notifications', label: 'Notifications', icon: IconBell, color: 'text-orange-600' },
      { path: '/pointages', label: 'Pointages', icon: IconClockHour4, color: 'text-lime-700' },
      { path: '/gestion-heures', label: 'Gestion des heures', icon: IconClock, color: 'text-blue-700' },
    ]
  },
  {
    group: 'Planification',
    items: [
      { path: '/planning-interactif', label: 'Planning Interactif', icon: IconCalendar, color: 'text-amber-700' },
      { path: '/planning-equipe', label: 'Planning Équipe', icon: IconUsers, color: 'text-blue-700' },
      { path: '/ressources', label: 'Ressources', icon: IconTool, color: 'text-lime-700' },
      { path: '/temps-passe', label: 'Temps passé', icon: IconClock, color: 'text-red-700' },
    ]
  },
  {
    group: 'Analyses',
    items: [
      { path: '/analyses-avancees', label: 'Analyses avancées', icon: IconChartAreaLine, color: 'text-teal-600' },
      { path: '/claude', label: 'Claude Assistant', icon: IconRobot, color: 'text-red-700' },
    ]
  },
  {
    group: 'Gestion Financière',
    items: [
      { path: '/frais-generaux', label: 'Frais Généraux', icon: IconCurrencyDollar, color: 'text-green-700' },
    ]
  },
  {
    group: 'Outils Production',
    items: [
      { path: '/opti-coupe', label: 'OptiCoupe', icon: IconTool, color: 'text-blue-700' },
      { path: '/caca-boudin', label: '💩 CACA Boudin', icon: IconPackage, color: 'text-yellow-700' },
    ]
  },
  {
    group: 'Administration',
    items: [
      { path: '/users', label: 'Gestion de l\'Équipe', icon: IconUsers, color: 'text-orange-700' },
      { path: '/parametres', label: 'Paramètres Utilisateur', icon: IconSettings, color: 'text-stone-500' },
      { path: '/parametres-entreprise', label: 'Paramètres Entreprise', icon: IconBuilding, color: 'text-blue-700' },
      { path: '/parametres-globaux', label: 'Paramètres Globaux', icon: IconSettings, color: 'text-gray-700' },
      { path: '/migration', label: 'Migration Excel', icon: IconDatabase, color: 'text-teal-700' },
    ]
  }
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fonction helper pour gérer la navigation depuis le menu utilisateur
  const handleMenuNavigation = (path) => {
    console.log('🚀 Navigation vers:', path);
    console.log('🔍 État actuel de userMenuOpen:', userMenuOpen);
    console.log('🔍 Fonction navigate disponible:', typeof navigate);
    setUserMenuOpen(false);
    try {
      navigate(path);
      console.log('✅ Navigation réussie vers:', path);
    } catch (error) {
      console.error('❌ Erreur de navigation:', error);
    }
  };

  // Charger les alertes critiques
  const loadAlertes = async () => {
    try {
      setLoading(true);
      const notifications = await notificationsService.getNotifications(5);
      const alertesCritiques = notifications.filter(n => n.priority === 'urgent' || n.priority === 'high');
      setAlertes(alertesCritiques);
      
      // Ouvrir automatiquement le modal si des alertes existent et on vient d'arriver sur l'app
      if (alertesCritiques.length > 0 && location.pathname === '/' && !sessionStorage.getItem('alertes_viewed')) {
        setShowAlertsModal(true);
        sessionStorage.setItem('alertes_viewed', 'true');
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir l'icône de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'echeance_affaire':
        return <IconCalendarEvent size={16} className="text-blue-600" />;
      case 'bdc_en_attente':
        return <IconClipboardList size={16} className="text-purple-600" />;
      case 'pointage_manquant':
        return <IconClock size={16} className="text-yellow-600" />;
      default:
        return <IconBell size={16} className="text-gray-600" />;
    }
  };

  useEffect(() => {
    loadAlertes();
    
    // Actualisation automatique toutes les 5 minutes
    const interval = setInterval(loadAlertes, 300000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Fonction pour vérifier si un lien est actif
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/affaires';
    }
    return location.pathname.startsWith(path);
  };

  // Obtenir le titre de la page actuelle
  const getCurrentPageTitle = () => {
    for (const group of navigationConfig) {
      const item = group.items.find(item => isActiveLink(item.path));
      if (item) return item.label;
    }
    return 'Entreprise Organiser';
  };

  // Composant Modal des Alertes Critiques
  const AlertsModal = () => {
    if (!showAlertsModal || alertes.length === 0) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header du modal */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <IconAlertOctagon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">🚨 Alertes Critiques</h2>
                  <p className="text-red-100 text-sm">
                    {alertes.length} alerte{alertes.length > 1 ? 's' : ''} nécessite{alertes.length > 1 ? 'nt' : ''} votre attention immédiate
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenu du modal */}
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="space-y-4">
              {alertes.map((alerte, index) => (
                <div key={alerte.id} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(alerte.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-red-800 dark:text-red-300">
                          {alerte.title || `Alerte ${index + 1}`}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alerte.priority === 'urgent' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          {alerte.priority === 'urgent' ? '🔴 URGENT' : '🟠 PRIORITÉ HAUTE'}
                        </span>
                      </div>
                      <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                        {alerte.message}
                      </p>
                      <p className="text-red-500 dark:text-red-400 text-xs mt-2">
                        📅 {new Date(alerte.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer du modal */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/notifications')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center"
            >
              <IconBell className="w-4 h-4 mr-2" />
              Voir toutes les notifications
            </button>
            <button
              onClick={() => setShowAlertsModal(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Modal des Alertes Critiques */}
      <AlertsModal />
      
      <div className="min-h-screen bg-stone-100 dark:bg-stone-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex h-full flex-col bg-white/95 backdrop-blur-xl border-r border-stone-200/60 dark:bg-stone-800/95 dark:border-stone-700/60 shadow-xl">
          {/* Logo et Brand */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-stone-200/60 dark:border-stone-700/60">
            <div className="flex items-center space-x-3">
              <img src="https://firebasestorage.googleapis.com/v0/b/site-web-commande-panneaux.firebasestorage.app/o/Logo%2FLOGO.png?alt=media&token=b236b3a0-eb50-4f46-b8d6-46d54e252ace" alt="M.AI Gestion Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-stone-800 dark:text-white">
                  M.AI Gestion
                </h1>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-stone-100/80 dark:hover:bg-stone-700/80 transition-colors border border-transparent hover:border-stone-200/40 dark:hover:border-stone-600/40"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
            {navigationConfig.map((group) => (
              <div key={group.group} className="space-y-3">
                <h3 key={`${group.group}-header`} className="px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider dark:text-stone-400 flex items-center gap-2">
                  <div key={`${group.group}-line`} className="w-4 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                  {group.group}
                </h3>
                <div key={`${group.group}-items`} className="space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveLink(item.path);
                    
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`sidebar-nav-item flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                          isActive 
                            ? 'text-white shadow-md' 
                            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/50'
                        }`}
                        style={isActive ? {
                          backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/site-web-commande-panneaux.firebasestorage.app/o/essence_de_bois%2Fdoussie.JPG?alt=media&token=d4d6dcc0-5166-47dd-8d4e-cc655d8f8792')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        } : {}}
                      >
                        {/* Indicateur actif subtil */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white/80 rounded-r-full"></div>
                        )}
                        
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isActive 
                            ? 'bg-white/20 border border-white/25' 
                            : 'bg-stone-100 dark:bg-stone-700/50 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                        </div>
                        <span className={`font-medium text-sm ${
                          isActive ? 'text-white' : 'text-stone-800 dark:text-stone-200'
                        }`}>
                          {item.label}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-stone-200/50 dark:border-stone-700/50 p-4">
            <div className="flex items-center space-x-3 p-4 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/40 dark:border-stone-600/40">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md border-2 border-white/20">
                <span className="text-white font-bold text-sm">
                  {user?.nom?.[0]}{user?.prenom?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate font-medium">
                  {user?.role === 'ADMIN_SYS' ? 'Administrateur' : 
                   user?.role === 'CHEF_ATELIER' ? 'Chef d\'atelier' : 'Employé'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-20 border-b border-stone-200/60 bg-white/95 backdrop-blur-xl dark:bg-stone-800/95 dark:border-stone-700/60 shadow-sm">
          <div className="flex h-full items-center justify-between px-6">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2.5 rounded-lg hover:bg-stone-100/80 dark:hover:bg-stone-700/80 transition-colors border border-transparent hover:border-stone-200/50 dark:hover:border-stone-600/50"
              >
                <IconMenu2 className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                  {getCurrentPageTitle()}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Bouton Alertes Critiques */}
              {alertes.length > 0 && (
                <button
                  onClick={() => setShowAlertsModal(true)}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  type="button"
                >
                  <IconAlertOctagon size={16} className="mr-2 animate-pulse" />
                  <span className="hidden sm:inline">Alertes</span>
                  <span className="ml-1">({alertes.length})</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                </button>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg hover:bg-stone-100/80 dark:hover:bg-stone-700/80 transition-colors border border-transparent hover:border-stone-200/50 dark:hover:border-stone-600/50"
                title={isDark ? 'Mode clair' : 'Mode sombre'}
              >
                {isDark ? (
                  <IconSun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <IconMoon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Notification Center */}
              <NotificationCenter />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    console.log('🖱️ Clic sur avatar utilisateur, userMenuOpen:', userMenuOpen);
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-2 p-2.5 rounded-lg hover:bg-stone-100/80 dark:hover:bg-stone-700/80 transition-colors border border-transparent hover:border-stone-200/50 dark:hover:border-stone-600/50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center border border-white/20 shadow-sm">
                    <span className="text-white font-semibold text-xs">
                      {user?.nom?.[0]}{user?.prenom?.[0]}
                    </span>
                  </div>
                  <IconChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white/98 dark:bg-stone-800/98 rounded-xl shadow-lg border border-stone-200/60 dark:border-stone-700/60 py-2 z-50 backdrop-blur-xl pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-stone-200/50 dark:border-stone-700/50">
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        {user?.prenom} {user?.nom}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        console.log('🖱️ Clic bouton Mon profil');
                        handleMenuNavigation('/profil');
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-colors"
                    >
                      <IconUserCircle className="w-4 h-4" />
                      <span>Mon profil</span>
                    </button>
                    <button
                      onClick={() => {
                        console.log('🖱️ Clic bouton Sécurité');
                        handleMenuNavigation('/securite');
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-colors"
                    >
                      <IconShield className="w-4 h-4" />
                      <span>Sécurité</span>
                    </button>
                    <button
                      onClick={() => {
                        handleMenuNavigation('/parametres');
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-colors"
                    >
                      <IconSettings className="w-4 h-4" />
                      <span>Paramètres</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowDiagnostic(true);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-colors"
                    >
                      <IconBug className="w-4 h-4" />
                      <span>Diagnostic Navigateur</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowTroubleshooting(true);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/80 transition-colors"
                    >
                      <IconFileAnalytics className="w-4 h-4" />
                      <span>Guide de Résolution</span>
                    </button>
                    <div className="border-t border-stone-200/50 dark:border-stone-700/50 my-2"></div>
                    <button
                      onClick={() => {
                        console.log('🖱️ Clic bouton Déconnexion');
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <IconLogout className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-stone-100 dark:bg-stone-900 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setUserMenuOpen(false)}
        />
      )}

      {/* Browser Diagnostic Modal */}
      {showDiagnostic && (
        <BrowserDiagnostic onClose={() => setShowDiagnostic(false)} />
      )}

      {/* Troubleshooting Guide Modal */}
      {showTroubleshooting && (
        <TroubleshootingGuide onClose={() => setShowTroubleshooting(false)} />
      )}
    </div>
    </>
  );
};

export default Layout; 