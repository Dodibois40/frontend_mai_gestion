import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RotateCcw, 
  Calculator, 
  TrendingUp, 
  Eye, 
  EyeOff,
  FileText,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from 'lucide-react';
import { fraisGenerauxService } from '../../services/fraisGenerauxService';

const FraisGenerauxPage = () => {
  const [fraisGeneraux, setFraisGeneraux] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInactifs, setShowInactifs] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    libelle: '',
    montantTtc: '',
    montantHt: '',
    categorie: 'AUTRE',
    ordre: '',
    commentaire: '',
    dateCommencement: '',
    dateFin: '',
    actif: true,
  });

  // États pour le calculateur
  const [calculData, setCalculData] = useState({
    dateDebut: '',
    dateFin: '',
    heuresParJour: 7,
    joursParSemaine: 5,
  });
  const [resultCalcul, setResultCalcul] = useState(null);

  // États pour le tri
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' ou 'desc'

  const categories = [
    { value: 'MATERIEL', label: 'Matériel', color: 'bg-blue-500' },
    { value: 'VEHICULE', label: 'Véhicule', color: 'bg-green-500' },
    { value: 'LOCATION', label: 'Location', color: 'bg-purple-500' },
    { value: 'CHARGES', label: 'Charges', color: 'bg-orange-500' },
    { value: 'ASSURANCE', label: 'Assurance', color: 'bg-red-500' },
    { value: 'BANQUE', label: 'Banque', color: 'bg-gray-500' },
    { value: 'LOGICIEL', label: 'Logiciel', color: 'bg-teal-500' },
    { value: 'SERVICE', label: 'Service', color: 'bg-indigo-500' },
    { value: 'COMMUNICATION', label: 'Communication', color: 'bg-cyan-500' },
    { value: 'CREDIT_CLASSIQUE', label: 'Crédit classique', color: 'bg-yellow-600' },
    { value: 'CREDIT_BAIL', label: 'Crédit bail', color: 'bg-rose-600' },
    { value: 'AUTRE', label: 'Autre', color: 'bg-stone-500' },
  ];

  // Charger les données
  useEffect(() => {
    loadData();
  }, []); // Ne recharger qu'une seule fois au montage

  const loadData = async () => {
    try {
      setLoading(true);
      const [fraisData, statsData] = await Promise.all([
        fraisGenerauxService.getAll(true), // Toujours charger TOUTES les données (actives + inactives)
        fraisGenerauxService.getStats(),
      ]);
      setFraisGeneraux(fraisData);
      setStats(statsData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initialiser les frais généraux par défaut
  const handleInitialiser = async () => {
    try {
      await fraisGenerauxService.initialiserDefaut();
      toast.success('Frais généraux initialisés avec succès');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'initialisation');
      console.error(error);
    }
  };

  // Gérer le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        montantTtc: parseFloat(formData.montantTtc),
        montantHt: parseFloat(formData.montantHt),
        ordre: formData.ordre ? parseInt(formData.ordre) : 0,
      };

      // Convertir les dates au format ISO-8601 pour le backend avec validation
      // Si les dates sont vides, les supprimer des données au lieu d'envoyer des chaînes vides
      if (data.dateCommencement && data.dateCommencement.trim() !== '') {
        // Créer une date en utilisant les composants année, mois, jour pour éviter les problèmes de fuseau horaire
        const parts = data.dateCommencement.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Les mois sont indexés à partir de 0
          const day = parseInt(parts[2]);
          
          // Vérifier que toutes les valeurs sont valides
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
              year > 1900 && year < 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            const dateCommencementISO = new Date(year, month, day, 0, 0, 0, 0);
            // Vérifier que la date créée est valide
            if (!isNaN(dateCommencementISO.getTime())) {
              data.dateCommencement = dateCommencementISO.toISOString();
            } else {
              throw new Error('Date de commencement invalide');
            }
          } else {
            throw new Error('Date de commencement invalide');
          }
        } else {
          throw new Error('Format de date de commencement invalide');
        }
      } else {
        // Supprimer la propriété si elle est vide
        delete data.dateCommencement;
      }
      
      if (data.dateFin && data.dateFin.trim() !== '') {
        // Créer une date en utilisant les composants année, mois, jour pour éviter les problèmes de fuseau horaire
        const parts = data.dateFin.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // Les mois sont indexés à partir de 0
          const day = parseInt(parts[2]);
          
          // Vérifier que toutes les valeurs sont valides
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
              year > 1900 && year < 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            const dateFinISO = new Date(year, month, day, 23, 59, 59, 999);
            // Vérifier que la date créée est valide
            if (!isNaN(dateFinISO.getTime())) {
              data.dateFin = dateFinISO.toISOString();
            } else {
              throw new Error('Date de fin invalide');
            }
          } else {
            throw new Error('Date de fin invalide');
          }
        } else {
          throw new Error('Format de date de fin invalide');
        }
      } else {
        // Supprimer la propriété si elle est vide
        delete data.dateFin;
      }

      if (editingItem) {
        await fraisGenerauxService.update(editingItem.id, data);
        toast.success('Frais général mis à jour avec succès');
      } else {
        await fraisGenerauxService.create(data);
        toast.success('Frais général créé avec succès');
      }

      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      libelle: '',
      montantTtc: '',
      montantHt: '',
      categorie: 'AUTRE',
      ordre: '',
      commentaire: '',
      dateCommencement: '',
      dateFin: '',
      actif: true,
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      libelle: item.libelle,
      montantTtc: item.montantTtc.toString(),
      montantHt: item.montantHt.toString(),
      categorie: item.categorie,
      ordre: item.ordre.toString(),
      commentaire: item.commentaire || '',
      dateCommencement: item.dateCommencement ? new Date(item.dateCommencement).toISOString().split('T')[0] : '',
      dateFin: item.dateFin ? new Date(item.dateFin).toISOString().split('T')[0] : '',
      actif: item.actif,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('⚠️ ATTENTION : Êtes-vous sûr de vouloir SUPPRIMER DÉFINITIVEMENT ce frais général ?\n\n🚨 Cette action est IRRÉVERSIBLE ! Le frais général sera supprimé pour toujours.\n\n✅ Confirmez-vous la suppression définitive ?')) return;

    try {
      await fraisGenerauxService.permanentDelete(id);
      toast.success('Frais général supprimé définitivement');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression définitive');
      console.error(error);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await fraisGenerauxService.reactivate(id);
      toast.success('Frais général réactivé avec succès');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la réactivation');
      console.error(error);
    }
  };

  // Nouvelle fonction pour basculer le statut actif/inactif
  const handleToggleStatus = async (item) => {
    try {
      if (item.actif) {
        await fraisGenerauxService.delete(item.id);
        toast.success(`${item.libelle} a été désactivé`);
      } else {
        await fraisGenerauxService.reactivate(item.id);
        toast.success(`${item.libelle} a été réactivé`);
      }
      loadData();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  // Calculer pour une période
  const handleCalculer = async (e) => {
    e.preventDefault();
    try {
      // Créer les dates de manière sûre
      const createSafeDate = (dateString) => {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          
          // Vérifier que toutes les valeurs sont valides
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
              year > 1900 && year < 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
          throw new Error(`Date invalide: ${dateString}`);
        }
        
        // Fallback avec validation
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error(`Date invalide: ${dateString}`);
        }
        return date;
      };

      const result = await fraisGenerauxService.calculerPeriode({
        dateDebut: createSafeDate(calculData.dateDebut),
        dateFin: createSafeDate(calculData.dateFin),
        heuresParJour: parseInt(calculData.heuresParJour),
        joursParSemaine: parseInt(calculData.joursParSemaine),
      });
      setResultCalcul(result);
      toast.success('Calcul effectué avec succès');
    } catch (error) {
      toast.error('Erreur lors du calcul');
      console.error(error);
    }
  };

  // Calcul automatique HT quand TTC change
  const handleMontantTtcChange = (value) => {
    setFormData(prev => ({
      ...prev,
      montantTtc: value,
      montantHt: value ? (parseFloat(value) / 1.2).toFixed(2) : '',
    }));
  };

  const getCategorieInfo = (categorie) => {
    return categories.find(cat => cat.value === categorie) || categories.find(cat => cat.value === 'AUTRE');
  };

  // Fonction de tri
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Si on clique sur la même colonne, on inverse la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouvelle colonne, tri ascendant par défaut
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Fonction pour appliquer le tri aux données
  const getSortedFraisGeneraux = () => {
    // Filtrer côté client selon showInactifs
    let data = [...fraisGeneraux];
    if (!showInactifs) {
      data = data.filter(item => item.actif);
    }

    if (!sortColumn) {
      // Tri par défaut (ordre puis libellé)
      return data.sort((a, b) => {
        if (a.ordre !== b.ordre) {
          return a.ordre - b.ordre;
        }
        return a.libelle.localeCompare(b.libelle);
      });
    }

    return data.sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Pour les montants, on compare les valeurs numériques
      if (sortColumn === 'montantTtc' || sortColumn === 'montantHt') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Fonction pour afficher l'icône de tri
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="w-4 h-4 ml-1 text-stone-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-stone-600" />
      : <ChevronDown className="w-4 h-4 ml-1 text-stone-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
            Frais Généraux
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Gestion des frais généraux avec calcul basé sur les jours ouvrés
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Calculateur
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau frais
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Total actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.actifs}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Montant mensuel HT</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.montantMensuelHt)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Montant mensuel TTC</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.montantMensuelTtc)}
                </p>
              </div>
              <Download className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Inactifs</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactifs}</p>
              </div>
              <EyeOff className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowInactifs(!showInactifs)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showInactifs 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                : 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
            }`}
          >
            {showInactifs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showInactifs ? 'Masquer inactifs' : 'Afficher inactifs'}
          </button>
        </div>
        
        <button
          onClick={handleInitialiser}
          className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Initialiser par défaut
        </button>
      </div>

      {/* Calculateur de période */}
      {showCalculator && (
        <div className="bg-white dark:bg-stone-800 rounded-xl p-6 border border-stone-200 dark:border-stone-700 mb-6">
          <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-4">
            Calculateur de frais généraux
          </h3>
          <form onSubmit={handleCalculer} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={calculData.dateDebut}
                onChange={(e) => setCalculData(prev => ({ ...prev, dateDebut: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={calculData.dateFin}
                onChange={(e) => setCalculData(prev => ({ ...prev, dateFin: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Heures/jour
              </label>
              <input
                type="number"
                value={calculData.heuresParJour}
                onChange={(e) => setCalculData(prev => ({ ...prev, heuresParJour: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                min="1"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Jours/semaine
              </label>
              <select
                value={calculData.joursParSemaine}
                onChange={(e) => setCalculData(prev => ({ ...prev, joursParSemaine: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="5">5 jours (Lu-Ve)</option>
                <option value="6">6 jours (Lu-Sa)</option>
                <option value="7">7 jours</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Calculator className="w-4 h-4" />
                Calculer
              </button>
            </div>
          </form>
          
          {resultCalcul && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">Résultat du calcul</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-stone-600 dark:text-stone-400">Jours ouvrés :</span>
                  <span className="font-semibold text-green-700 dark:text-green-300 ml-2">
                    {resultCalcul.joursOuvres}
                  </span>
                </div>
                <div>
                  <span className="text-stone-600 dark:text-stone-400">Heures total :</span>
                  <span className="font-semibold text-green-700 dark:text-green-300 ml-2">
                    {resultCalcul.heuresTotal}h
                  </span>
                </div>
                <div>
                  <span className="text-stone-600 dark:text-stone-400">Montant HT :</span>
                  <span className="font-semibold text-green-700 dark:text-green-300 ml-2">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(resultCalcul.montantTotalHt)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-600 dark:text-stone-400">Montant TTC :</span>
                  <span className="font-semibold text-green-700 dark:text-green-300 ml-2">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(resultCalcul.montantTotalTtc)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tableau des frais généraux */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-stone-800 dark:text-white">
            Liste des frais généraux
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 dark:bg-stone-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Libellé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('montantTtc')}
                    className="flex items-center hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                    title="Trier par montant TTC"
                  >
                    Montant TTC
                    {getSortIcon('montantTtc')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('montantHt')}
                    className="flex items-center hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                    title="Trier par montant HT"
                  >
                    Montant HT
                    {getSortIcon('montantHt')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Date début
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Date de fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
              {getSortedFraisGeneraux().map((item) => {
                const categorieInfo = getCategorieInfo(item.categorie);
                return (
                  <tr key={item.id} className={`hover:bg-stone-50 dark:hover:bg-stone-700 ${
                    !item.actif ? 'opacity-60' : ''
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      item.actif 
                        ? 'text-stone-900 dark:text-white' 
                        : 'text-stone-400 dark:text-stone-500'
                    }`}>
                      {item.ordre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        item.actif 
                          ? 'text-stone-900 dark:text-white' 
                          : 'text-stone-400 dark:text-stone-500'
                      }`}>
                        {item.libelle}
                      </div>
                      {item.commentaire && (
                        <div className={`text-sm ${
                          item.actif 
                            ? 'text-stone-500 dark:text-stone-400' 
                            : 'text-stone-400 dark:text-stone-500'
                        }`}>
                          {item.commentaire}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${categorieInfo.color}`}>
                        {categorieInfo.label}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      item.actif 
                        ? 'text-stone-900 dark:text-white' 
                        : 'text-stone-400 dark:text-stone-500'
                    }`}>
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.montantTtc)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      item.actif 
                        ? 'text-stone-900 dark:text-white' 
                        : 'text-stone-400 dark:text-stone-500'
                    }`}>
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.montantHt)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      item.actif 
                        ? 'text-stone-900 dark:text-white' 
                        : 'text-stone-400 dark:text-stone-500'
                    }`}>
                      {item.dateCommencement ? (
                        <span className={`text-xs ${
                          item.actif ? 'text-blue-600' : 'text-stone-400 dark:text-stone-500'
                        }`}>
                          {new Date(item.dateCommencement).toLocaleDateString('fr-FR')}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-xs">-</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      item.actif 
                        ? 'text-stone-900 dark:text-white' 
                        : 'text-stone-400 dark:text-stone-500'
                    }`}>
                      {item.dateFin ? (
                        <div className="flex flex-col">
                          <span className={`text-xs ${
                            !item.actif 
                              ? 'text-stone-400 dark:text-stone-500'
                              : new Date(item.dateFin) < new Date() 
                                ? 'text-red-600 font-semibold' 
                                : new Date(item.dateFin) < new Date(Date.now() + 30*24*60*60*1000)
                                  ? 'text-orange-600 font-medium'
                                  : 'text-stone-600'
                          }`}>
                            {new Date(item.dateFin).toLocaleDateString('fr-FR')}
                          </span>
                          {new Date(item.dateFin) < new Date() && item.actif && (
                            <span className="text-xs text-red-500 font-bold">EXPIRÉ</span>
                          )}
                          {new Date(item.dateFin) < new Date(Date.now() + 30*24*60*60*1000) && new Date(item.dateFin) > new Date() && item.actif && (
                            <span className="text-xs text-orange-500 font-medium">Bientôt</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.actif 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {item.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className={`transition-colors ${
                            item.actif 
                              ? 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                              : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-400'
                          }`}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={`transition-colors ${
                            item.actif 
                              ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                              : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-400'
                          }`}
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {/* Bouton toggle pour basculer le statut */}
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            item.actif 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                          }`}
                          title={item.actif ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                        >
                          {item.actif ? '✓ Actif' : '✗ Inactif'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {fraisGeneraux.length === 0 && (
            <div className="text-center py-12">
              <p className="text-stone-500 dark:text-stone-400">
                Aucun frais général trouvé. Cliquez sur "Initialiser par défaut" pour commencer.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-4">
              {editingItem ? 'Modifier' : 'Créer'} un frais général
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Libellé *
                </label>
                <input
                  type="text"
                  value={formData.libelle}
                  onChange={(e) => setFormData(prev => ({ ...prev, libelle: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Montant TTC *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montantTtc}
                    onChange={(e) => handleMontantTtcChange(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Montant HT *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montantHt}
                    onChange={(e) => setFormData(prev => ({ ...prev, montantHt: e.target.value }))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Ordre
                  </label>
                  <input
                    type="number"
                    value={formData.ordre}
                    onChange={(e) => setFormData(prev => ({ ...prev, ordre: e.target.value }))}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              {/* Date de commencement - pour tous les types */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  📅 Date de commencement
                </label>
                <input
                  type="date"
                  value={formData.dateCommencement}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateCommencement: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  🗓️ Date à laquelle ce frais général a commencé (ex: début d'assurance, crédit...)
                </p>
              </div>

              {/* Date de fin - pour tous types maintenant */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  {formData.categorie === 'CREDIT_BAIL' ? '🔴 Date de fin du crédit bail' :
                   formData.categorie === 'CREDIT_CLASSIQUE' ? '🟡 Date de fin du crédit classique' :
                   '📆 Date de fin (optionnel)'}
                  {(formData.categorie === 'CREDIT_BAIL' || formData.categorie === 'CREDIT_CLASSIQUE') && 
                    <span className="text-red-500"> *</span>
                  }
                </label>
                <input
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-green-500"
                  required={formData.categorie === 'CREDIT_BAIL' || formData.categorie === 'CREDIT_CLASSIQUE'}
                />
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {formData.categorie === 'CREDIT_BAIL' ? 
                    '🔴 Le crédit bail sera automatiquement désactivé à cette date' :
                    formData.categorie === 'CREDIT_CLASSIQUE' ?
                    '🟡 Date de fin prévue du crédit classique' :
                    '📅 Date de fin prévue (ex: fin de contrat d\'assurance, changement d\'assureur...)'
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="actif"
                  checked={formData.actif}
                  onChange={(e) => setFormData(prev => ({ ...prev, actif: e.target.checked }))}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-stone-300 rounded"
                />
                <label htmlFor="actif" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Actif
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingItem ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-stone-300 dark:bg-stone-600 text-stone-800 dark:text-white rounded-lg hover:bg-stone-400 dark:hover:bg-stone-500 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraisGenerauxPage; 