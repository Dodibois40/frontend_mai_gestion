import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Shield, 
  Activity, 
  Users, 
  Calendar,
  Save,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Notifications par email
    emailNewConnection: true,
    emailSecurityAlert: true,
    emailProjectUpdate: false,
    emailTaskAssigned: true,
    emailReminder: true,
    emailWeeklyReport: false,
    
    // Notifications push (navigateur)
    pushNewConnection: true,
    pushSecurityAlert: true,
    pushProjectUpdate: false,
    pushTaskAssigned: true,
    pushReminder: true,
    pushMessage: true,
    
    // Notifications in-app
    inAppAll: true,
    inAppSounds: true,
    
    // Fréquence des notifications
    digestFrequency: 'daily', // none, daily, weekly
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  });

  useEffect(() => {
    // TODO: Charger les préférences depuis l'API
    // loadNotificationSettings();
  }, []);

  const handleToggle = (settingName) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: !prev[settingName]
    }));
  };

  const handleSelectChange = (settingName, value) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to save notification settings
      // await notificationService.updateSettings(settings);
      
      // Simulation de l'API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Préférences de notification sauvegardées !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des préférences');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications autorisées !');
      } else {
        toast.error('Notifications refusées');
      }
    }
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-stone-600' : 'bg-stone-200'
      }`}
      style={checked ? {backgroundColor: '#6b7c3d'} : {}}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const NotificationItem = ({ icon: Icon, title, description, settingName, type = 'toggle', options = null }) => (
    <div className="flex items-center justify-between py-4 border-b border-stone-200 last:border-b-0">
      <div className="flex items-start space-x-3 flex-1">
        <Icon className="w-5 h-5 mt-0.5" style={{color: '#6b7c3d'}} />
        <div className="flex-1">
          <h4 className="font-medium text-stone-800">{title}</h4>
          <p className="text-sm text-stone-600 mt-1">{description}</p>
        </div>
      </div>
      <div className="ml-4">
        {type === 'toggle' ? (
          <ToggleSwitch
            checked={settings[settingName]}
            onChange={() => handleToggle(settingName)}
          />
        ) : (
          <select
            value={settings[settingName]}
            onChange={(e) => handleSelectChange(settingName, e.target.value)}
            className="px-3 py-1 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            style={{backgroundColor: '#fefefe'}}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Préférences de notification</h2>
        <p className="text-stone-600">Configurez comment et quand vous souhaitez être notifié.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notifications par email */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" style={{color: '#6b7c3d'}} />
            Notifications par email
          </h3>
          
          <div className="space-y-1">
            <NotificationItem
              icon={Shield}
              title="Nouvelles connexions"
              description="Être notifié lorsque votre compte est connecté depuis un nouvel appareil"
              settingName="emailNewConnection"
            />
            <NotificationItem
              icon={Shield}
              title="Alertes de sécurité"
              description="Notifications importantes concernant la sécurité de votre compte"
              settingName="emailSecurityAlert"
            />
            <NotificationItem
              icon={Activity}
              title="Mises à jour de projets"
              description="Changements importants sur les projets auxquels vous participez"
              settingName="emailProjectUpdate"
            />
            <NotificationItem
              icon={Users}
              title="Tâches assignées"
              description="Nouvelles tâches qui vous sont assignées"
              settingName="emailTaskAssigned"
            />
            <NotificationItem
              icon={Calendar}
              title="Rappels"
              description="Rappels de deadlines et échéances importantes"
              settingName="emailReminder"
            />
            <NotificationItem
              icon={Activity}
              title="Rapport hebdomadaire"
              description="Résumé de votre activité de la semaine"
              settingName="emailWeeklyReport"
            />
          </div>
        </div>

        {/* Notifications push */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
              <Smartphone className="w-5 h-5" style={{color: '#6b7c3d'}} />
              Notifications push (navigateur)
            </h3>
            {Notification.permission !== 'granted' && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="px-3 py-1 text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
              >
                Autoriser
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            <NotificationItem
              icon={Shield}
              title="Nouvelles connexions"
              description="Notifications instantanées pour les nouvelles connexions"
              settingName="pushNewConnection"
            />
            <NotificationItem
              icon={Shield}
              title="Alertes de sécurité"
              description="Alertes de sécurité critiques"
              settingName="pushSecurityAlert"
            />
            <NotificationItem
              icon={Activity}
              title="Mises à jour de projets"
              description="Notifications en temps réel des changements de projets"
              settingName="pushProjectUpdate"
            />
            <NotificationItem
              icon={Users}
              title="Tâches assignées"
              description="Notification immédiate des nouvelles tâches"
              settingName="pushTaskAssigned"
            />
            <NotificationItem
              icon={Calendar}
              title="Rappels"
              description="Rappels push pour les échéances"
              settingName="pushReminder"
            />
            <NotificationItem
              icon={MessageSquare}
              title="Messages"
              description="Nouveaux messages et communications"
              settingName="pushMessage"
            />
          </div>
        </div>

        {/* Préférences générales */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" style={{color: '#6b7c3d'}} />
            Préférences générales
          </h3>
          
          <div className="space-y-1">
            <NotificationItem
              icon={Bell}
              title="Toutes les notifications in-app"
              description="Afficher les notifications dans l'interface de l'application"
              settingName="inAppAll"
            />
            <NotificationItem
              icon={settings.inAppSounds ? Volume2 : VolumeX}
              title="Sons de notification"
              description="Jouer un son lors des notifications"
              settingName="inAppSounds"
            />
            <NotificationItem
              icon={Mail}
              title="Fréquence des résumés"
              description="À quelle fréquence recevoir un résumé par email"
              settingName="digestFrequency"
              type="select"
              options={[
                { value: 'none', label: 'Jamais' },
                { value: 'daily', label: 'Quotidien' },
                { value: 'weekly', label: 'Hebdomadaire' }
              ]}
            />
          </div>
        </div>

        {/* Heures de silence */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <VolumeX className="w-5 h-5" style={{color: '#6b7c3d'}} />
            Heures de silence
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-stone-800">Activer les heures de silence</h4>
                <p className="text-sm text-stone-600 mt-1">
                  Désactiver les notifications push pendant certaines heures
                </p>
              </div>
              <ToggleSwitch
                checked={settings.quietHoursEnabled}
                onChange={() => handleToggle('quietHoursEnabled')}
              />
            </div>
            
            {settings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-stone-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Début
                  </label>
                  <input
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => handleSelectChange('quietHoursStart', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                    style={{backgroundColor: '#fefefe'}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Fin
                  </label>
                  <input
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => handleSelectChange('quietHoursEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                    style={{backgroundColor: '#fefefe'}}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading ? '#6b7c3d' : '#6b7c3d',
              border: 'none'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#556533')}
            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#6b7c3d')}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder les préférences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings; 