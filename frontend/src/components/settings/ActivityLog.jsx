import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Activity, 
  Clock, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Download,
  Shield,
  PlusCircle,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// Sample data - replace with API call
const sampleActivities = [
  {
    id: 1,
    action: 'Connexion réussie',
    type: 'auth',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.10',
    location: 'Paris, France',
    device: 'Desktop',
    userAgent: 'Chrome on macOS'
  },
  {
    id: 2,
    action: 'Mot de passe modifié',
    type: 'security',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.10',
    location: 'Paris, France',
    device: 'Desktop',
    userAgent: 'Chrome on macOS'
  },
  {
    id: 3,
    action: 'Affaire "Nouveau Siège Social" créée',
    type: 'creation',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '88.123.45.67',
    location: 'Lyon, France',
    device: 'Mobile',
    userAgent: 'Safari on iOS'
  },
  {
    id: 4,
    action: '2FA activée',
    type: 'security',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '88.123.45.67',
    location: 'Lyon, France',
    device: 'Mobile',
    userAgent: 'Safari on iOS'
  },
  {
    id: 5,
    action: 'Connexion échouée',
    type: 'auth_fail',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 10 * 60 * 1000).toISOString(),
    ipAddress: '109.87.65.43',
    location: 'Inconnue',
    device: 'Unknown',
    userAgent: 'Unknown'
  }
];

const ActionIcon = ({ type }) => {
  const icons = {
    auth: <Monitor className="w-4 h-4 text-green-600" />,
    security: <Shield className="w-4 h-4 text-orange-500" />,
    creation: <PlusCircle className="w-4 h-4 text-blue-500" />,
    update: <Edit className="w-4 h-4 text-yellow-500" />,
    deletion: <Trash2 className="w-4 h-4 text-red-500" />,
    auth_fail: <AlertTriangle className="w-4 h-4 text-red-600" />,
  };
  return icons[type] || <Activity className="w-4 h-4 text-stone-500" />;
};

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // TODO: Remplacer par un appel API réel
    setLoading(true);
    setTimeout(() => {
      setActivities(sampleActivities);
      setLoading(false);
    }, 1000);
  }, []);
  
  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'security') return ['security', 'auth_fail', 'auth'].includes(activity.type);
    if (filter === 'actions') return ['creation', 'update', 'deletion'].includes(activity.type);
    return true;
  });

  const exportData = () => {
    // TODO: Implement CSV/JSON export functionality
    toast.info('Fonctionnalité d\'export bientôt disponible !');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Historique d'activité</h2>
        <p className="text-stone-600">Consultez les actions et connexions récentes sur votre compte.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-stone-200/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-stone-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              style={{backgroundColor: '#fefefe'}}
            >
              <option value="all">Toute l'activité</option>
              <option value="security">Sécurité & Connexions</option>
              <option value="actions">Actions & Modifications</option>
            </select>
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 mx-auto"></div>
            <p className="mt-4 text-stone-600">Chargement de l'historique...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map(activity => (
              <div key={activity.id} className="bg-stone-50 rounded-lg p-3 transition-all">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(activity.id)}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-stone-200 rounded-full">
                      <ActionIcon type={activity.type} />
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{activity.action}</p>
                      <p className="text-sm text-stone-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(activity.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {expanded[activity.id] ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                </div>

                {expanded[activity.id] && (
                  <div className="mt-3 pt-3 pl-12 border-t border-stone-200 text-sm text-stone-700 space-y-2">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{color: '#6b7c3d'}} /> <strong>Lieu:</strong> {activity.location}</p>
                    <p className="flex items-center gap-2"><Activity className="w-4 h-4" style={{color: '#6b7c3d'}} /> <strong>IP:</strong> {activity.ipAddress}</p>
                    <p className="flex items-center gap-2">
                      {activity.device === 'Desktop' ? <Monitor className="w-4 h-4" style={{color: '#6b7c3d'}} /> : <Smartphone className="w-4 h-4" style={{color: '#6b7c3d'}} />}
                      <strong>Appareil:</strong> {activity.userAgent}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredActivities.length === 0 && (
          <div className="text-center py-8 text-stone-600">
            <p>Aucune activité à afficher pour ce filtre.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ActivityLog; 