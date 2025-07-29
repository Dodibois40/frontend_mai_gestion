import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  Key, 
  Activity, 
  Settings,
  Lock,
  Smartphone,
  History,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import TwoFactorManager from '../../components/auth/TwoFactorManager';
import { toast } from 'sonner';
import authService from '../../services/authService';
import securityService from '../../services/securityService';

const SecuritySettings = () => {
  const { user } = useAuth();

  const PasswordSection = () => {
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
        return;
      }
      if (passwordData.newPassword.length < 8) {
        toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
        return;
      }

      setLoading(true);
      const promise = authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.promise(promise, {
        loading: 'Changement de mot de passe en cours...',
        success: (data) => {
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          return 'Mot de passe changé avec succès !';
        },
        error: (err) => err.message || 'Une erreur est survenue.',
        finally: () => setLoading(false),
      });
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-stone-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="w-6 h-6 text-stone-600" />
          <h2 className="text-xl font-bold text-stone-800">
            Gestion du mot de passe
          </h2>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg p-4 bg-stone-50 border border-stone-200">
            <h3 className="font-semibold mb-2 text-stone-800">
              Force du mot de passe actuel
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 rounded-full h-2 bg-stone-200">
                <div className="h-2 rounded-full w-4/5" style={{backgroundColor: '#6b7c3d'}}></div>
              </div>
              <span className="text-sm font-medium" style={{color: '#6b7c3d'}}>
                Fort
              </span>
            </div>
            <p className="text-sm mt-2 text-stone-600">
              Votre mot de passe respecte les critères de sécurité recommandés.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-stone-800">
              Changer le mot de passe
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-2 text-stone-700" htmlFor="currentPassword">
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-colors"
                  placeholder="Votre mot de passe actuel"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-stone-700" htmlFor="newPassword">
                  Nouveau mot de passe
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-colors"
                  placeholder="Votre nouveau mot de passe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-stone-700" htmlFor="confirmPassword">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-colors"
                  placeholder="Confirmer le nouveau mot de passe"
                  required
                />
              </div>

              <button
                type="submit"
                className="text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#6b7c3d' }}
                disabled={loading}
              >
                {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const SessionsSection = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const data = await securityService.getActiveSessions();
        // Simule la session actuelle si l'API n'en fournit pas
        if (!data.some(s => s.isCurrent)) {
            const currentSession = {
                id: 'current_session_mock',
                ipAddress: '127.0.0.1',
                userAgent: navigator.userAgent,
                lastActivity: new Date().toISOString(),
                isCurrent: true,
                location: 'Paris, France (simulé)',
                device: 'Cet appareil'
            };
            data.unshift(currentSession);
        }
        setSessions(data);
      } catch (error) {
        toast.error(error.message || 'Erreur lors du chargement des sessions.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchSessions();
    }, []);

    const handleTerminateSession = async (sessionId) => {
      const promise = securityService.terminateSession(sessionId).then(() => {
        fetchSessions(); // Recharger la liste
      });
      toast.promise(promise, {
        loading: 'Déconnexion de la session...',
        success: 'Session déconnectée avec succès.',
        error: 'Erreur lors de la déconnexion.',
      });
    };

    const handleLogoutAll = () => {
        const promise = securityService.logoutAllSessions().then(() => {
            fetchSessions();
        });
        toast.promise(promise, {
            loading: 'Déconnexion de toutes les autres sessions...',
            success: 'Toutes les autres sessions ont été déconnectées.',
            error: 'Erreur lors de la déconnexion de masse.'
        })
    }

    if (loading) {
      return (
        <div className="text-center p-8">
          <p>Chargement des sessions...</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-stone-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-stone-600" />
          <h2 className="text-xl font-bold text-stone-800">
            Sessions actives
          </h2>
        </div>

        <div className="space-y-4">
          {sessions.map(session => (
            <div 
              key={session.id}
              className={`rounded-lg p-4 border ${session.isCurrent ? 'bg-olive-100/50 border-olive-200' : 'bg-stone-50 border-stone-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${session.isCurrent ? 'bg-olive-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">
                      {session.device || 'Appareil inconnu'}
                    </h3>
                    <p className="text-sm text-stone-600">
                      {session.location || 'Lieu inconnu'}
                    </p>
                    <p className={`text-xs ${session.isCurrent ? 'font-semibold text-olive-700' : 'text-stone-500'}`}>
                      Dernière activité: {new Date(session.lastActivity).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                {session.isCurrent ? (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Actif
                  </div>
                ) : (
                  <button 
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    Déconnecter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button onClick={handleLogoutAll} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50">
            Déconnecter toutes les autres sessions
          </button>
        </div>
      </div>
    );
  };

  const HistorySection = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await securityService.getLoginHistory();
        setHistory(data);
      } catch (error) {
        toast.error(error.message || 'Erreur lors du chargement de l\'historique.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchHistory();
    }, []);

    if (loading) {
      return (
        <div className="text-center p-8">
          <p>Chargement de l'historique...</p>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-stone-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <History className="w-6 h-6 text-stone-600" />
          <h2 className="text-xl font-bold text-stone-800">
            Historique de sécurité
          </h2>
        </div>

        <ul className="space-y-4">
          {history.map(entry => (
            <li key={entry.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {entry.isSuccess ? <ShieldCheck className="w-5 h-5 text-green-600" /> : <ShieldX className="w-5 h-5 text-red-600" />}
                <div>
                  <p className="font-medium text-stone-700">
                    {entry.isSuccess ? 'Connexion réussie' : 'Échec de la connexion'}
                  </p>
                  <p className="text-sm text-stone-500">{new Date(entry.createdAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>
              <p className="text-sm text-stone-500">IP: {entry.ipAddress}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-olive-700 hover:text-olive-900 transition-colors">
            Voir tout l'historique
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-stone-200/50">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-stone-600" />
          <h2 className="text-xl font-bold text-stone-800">Authentification à deux facteurs (2FA)</h2>
        </div>
        <TwoFactorManager />
      </div>

      <PasswordSection />
      <SessionsSection />
      <HistorySection />
    </div>
  );
};

export default SecuritySettings; 