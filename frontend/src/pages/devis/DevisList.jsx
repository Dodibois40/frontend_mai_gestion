import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconEye,
  IconSearch,
  IconFilter,
  IconCalendarEvent,
  IconCurrencyEuro,
  IconFileInvoice,
  IconCheck,
  IconClock,
  IconX,
  IconRefresh
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import devisService from '@/services/devisService';

const DevisList = () => {
  const [devis, setDevis] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDevis();
    fetchStats();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchDevis = async () => {
    try {
      setLoading(true);
      const params = {
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        statut: statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      const response = await devisService.getAllDevis(params);
      const devisData = response.devis || response.data || response || [];
      const totalData = response.total || devisData.length || 0;
      
      setDevis(Array.isArray(devisData) ? devisData : []);
      setPagination(prev => ({
        ...prev,
        total: totalData,
        totalPages: Math.ceil(totalData / pagination.limit)
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
      toast.error('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await devisService.getStats();
      setStats(response);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStats({
        total: 0,
        enAttenteValidation: 0,
        valides: 0,
        realises: 0,
        refuses: 0,
        expires: 0,
        montantTotal: 0,
        montantRealise: 0
      });
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (devisId, devisLibelle) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le devis "${devisLibelle}" ?`)) {
      try {
        await devisService.deleteDevis(devisId);
        toast.success('Devis supprimé avec succès');
        fetchDevis();
        fetchStats();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression du devis');
      }
    }
  };

  const handleUpdateStatus = async (devisId, newStatus) => {
    try {
      await devisService.updateStatutDevis(devisId, newStatus);
      toast.success('Statut mis à jour avec succès');
      fetchDevis();
      fetchStats();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

      const getStatusBadge = (statut) => {
    const statusConfig = devisService.getStatusBadge(statut);
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statut === 'EN_ATTENTE_VALIDATION' && <IconClock className="w-3 h-3 mr-1" />}
        {statut === 'VALIDE' && <IconCheck className="w-3 h-3 mr-1" />}
        {statut === 'REALISE' && <IconCheck className="w-3 h-3 mr-1" />}
        {statut === 'REFUSE' && <IconX className="w-3 h-3 mr-1" />}
        {statut === 'EXPIRE' && <IconX className="w-3 h-3 mr-1" />}
        {statusConfig.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading && devis.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Devis</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez et suivez tous vos devis</p>
        </div>
        <Button
          onClick={() => navigate('/devis/nouveau')}
          variant="primary"
          icon={IconPlus}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
        >
          Nouveau devis
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devis</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</p>
              </div>
              <IconFileInvoice className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enAttenteValidation || 0}</p>
              </div>
              <IconClock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Validés</p>
                <p className="text-2xl font-bold text-green-600">{stats.valides || 0}</p>
              </div>
              <IconCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Réalisés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.realises || 0}</p>
              </div>
              <IconCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Montant Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.montantTotal)}
                </p>
              </div>
              <IconCurrencyEuro className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un devis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusFilter('all')}
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
              >
                Tous
              </Button>
              <Button
                onClick={() => handleStatusFilter('EN_ATTENTE_VALIDATION')}
                variant={statusFilter === 'EN_ATTENTE_VALIDATION' ? 'primary' : 'outline'}
                size="sm"
              >
                En attente
              </Button>
              <Button
                onClick={() => handleStatusFilter('VALIDE')}
                variant={statusFilter === 'VALIDE' ? 'primary' : 'outline'}
                size="sm"
              >
                Validés
              </Button>
              <Button
                onClick={() => handleStatusFilter('REALISE')}
                variant={statusFilter === 'REALISE' ? 'primary' : 'outline'}
                size="sm"
              >
                Réalisés
              </Button>
              <Button
                onClick={() => handleStatusFilter('REFUSE')}
                variant={statusFilter === 'REFUSE' ? 'primary' : 'outline'}
                size="sm"
              >
                Refusés
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des devis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Liste des Devis ({pagination.total})</CardTitle>
            <Button
              onClick={fetchDevis}
              variant="outline"
              size="sm"
              icon={IconRefresh}
            >
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {devis.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Numéro</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Libellé</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Affaire</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Montant HT</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Validité</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.map((devisItem) => (
                    <tr key={devisItem.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                        {devisItem.numero}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{devisItem.libelle}</p>
                          {devisItem.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {devisItem.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {devisItem.affaire && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {devisItem.affaire.numero}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {devisItem.affaire.client}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(devisItem.statut)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(devisItem.montantHt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(devisItem.dateValidite)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => navigate(`/devis/${devisItem.id}`)}
                            variant="ghost"
                            size="sm"
                            icon={IconEye}
                          >
                            Voir
                          </Button>
                          <Button
                            onClick={() => navigate(`/devis/${devisItem.id}/modifier`)}
                            variant="ghost"
                            size="sm"
                            icon={IconPencil}
                          >
                            Modifier
                          </Button>
                          {devisItem.statut === 'EN_ATTENTE_VALIDATION' && (
                            <>
                              <Button
                                onClick={() => handleUpdateStatus(devisItem.id, 'VALIDE')}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                icon={IconCheck}
                              >
                                Valider
                              </Button>
                              <Button
                                onClick={() => handleUpdateStatus(devisItem.id, 'REFUSE')}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                icon={IconX}
                              >
                                Refuser
                              </Button>
                            </>
                          )}
                          {devisItem.statut === 'VALIDE' && (
                            <Button
                              onClick={() => handleUpdateStatus(devisItem.id, 'REALISE')}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              icon={IconCheck}
                            >
                              Marquer réalisé
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDelete(devisItem.id, devisItem.libelle)}
                            variant="ghost"
                            size="sm"
                            icon={IconTrash}
                            className="text-red-600 hover:text-red-700"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <IconFileInvoice className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun devis trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {statusFilter !== 'all' 
                  ? 'Aucun devis ne correspond à vos critères de filtrage.'
                  : 'Commencez par créer votre premier devis.'
                }
              </p>
              <Button
                onClick={() => navigate('/devis/nouveau')}
                variant="primary"
                icon={IconPlus}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Créer un devis
              </Button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} devis au total)
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  Précédent
                </Button>
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevisList; 