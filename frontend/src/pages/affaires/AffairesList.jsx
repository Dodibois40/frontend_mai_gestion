import React, { useState, useEffect, useCallback } from 'react';
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
  IconBriefcase,
  IconCheck,
  IconClock,
  IconX,
  IconAward,
  IconRefresh,
  IconAlertCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowUp,
  IconArrowDown,
  IconDots,
  IconChevronDown,
  IconTarget,
  IconUsers,
  IconCalendar,
  IconFileText,
  IconUser,
  IconCopy,
  IconListNumbers,
  IconClockHour4,
  IconCircleCheck,
  IconCash,
  IconInfoCircle,
  IconMapPin,
  IconHash,
  IconActivityHeartbeat,
  IconTargetArrow,
  IconSettings,
  IconRotateClockwise,
  IconListDetails,
  IconChartBar,
  IconTimeline
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { affairesService } from '@/services/affairesService';
import { StatCard } from '@/components/affaires/StatCard';
import { Input } from '@/components/ui/input';
import PlanningEquipeIntegre from '@/components/planning-equipe/PlanningEquipeIntegre';

const AffairesList = () => {
  const [affaires, setAffaires] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(null); // Pas de filtre par défaut
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50, // Augmenté pour voir plus d'affaires
    total: 0,
    totalPages: 0
  });
  const navigate = useNavigate();

  // Fonction pour calculer le taux de marge réel
  const calculerTauxMargeReel = useCallback((affaire) => {
    const caReel = affaire.caReelHt || 0;
    const depensesReelles = affaire.achatReelHt || 0;
    
    if (caReel === 0) {
      return { taux: 0, couleur: 'text-gray-500', bg: 'bg-gray-100' };
    }
    
    const margeReelle = caReel - depensesReelles;
    const tauxMarge = (margeReelle / caReel) * 100;
    
    // Définir les couleurs selon le taux de marge
    let couleur, bg;
    if (tauxMarge >= 30) {
      couleur = 'text-green-700';
      bg = 'bg-green-100';
    } else if (tauxMarge >= 15) {
      couleur = 'text-amber-700';
      bg = 'bg-amber-100';
    } else if (tauxMarge >= 0) {
      couleur = 'text-orange-700';
      bg = 'bg-orange-100';
    } else {
      couleur = 'text-red-700';
      bg = 'bg-red-100';
    }
    
    return { taux: tauxMarge, couleur, bg };
  }, []);

  const isDeletable = useCallback((affaire) => {
    if (!affaire) return false;
    const hasBdc = affaire._count?.bdc > 0;
    const hasPointages = affaire._count?.pointages > 0;
    const hasPhases = affaire._count?.phases > 0;
    const hasDevis = affaire._count?.devis > 0;
    const hasAchats = affaire._count?.achats > 0;
    
    return !hasBdc && !hasPointages && !hasPhases && !hasDevis && !hasAchats;
  }, []);

  const getDependenciesMessage = useCallback((affaire) => {
    if (!affaire || !affaire._count) return '';
    
    const dependencies = [];
    if (affaire._count.bdc > 0) dependencies.push(`${affaire._count.bdc} bon(s) de commande`);
    if (affaire._count.pointages > 0) dependencies.push(`${affaire._count.pointages} pointage(s)`);
    if (affaire._count.phases > 0) dependencies.push(`${affaire._count.phases} phase(s)`);
    if (affaire._count.devis > 0) dependencies.push(`${affaire._count.devis} devis`);
    if (affaire._count.achats > 0) dependencies.push(`${affaire._count.achats} achat(s)`);
    
    if (dependencies.length === 0) return '';
    return `Cette affaire contient : ${dependencies.join(', ')}`;
  }, []);
  
  const fetchAffaires = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        search: searchTerm,
        statut: filterStatus,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      console.log('🔍 Paramètres de requête:', params);
      const data = await affairesService.getAffaires(params);
      console.log('📊 Données reçues du backend:', data);
      setAffaires(data.affaires || []);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: Math.ceil(data.total / prev.limit)
      }));
    } catch (error) {
      console.error("Erreur chargement affaires:", error);
      toast.error("Impossible de charger les affaires.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterStatus, sortConfig]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await affairesService.getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
      toast.error("Impossible de charger les statistiques.");
    }
  }, []);

  // Effet de démarrage - vérifier les filtres stockés
  useEffect(() => {
    console.log('🚀 AffairesList mounted - Vérification des filtres stockés...');
    
    // Vérifier le localStorage
    const localStorageKeys = Object.keys(localStorage);
    console.log('📦 LocalStorage keys:', localStorageKeys);
    localStorageKeys.forEach(key => {
      if (key.includes('affaire') || key.includes('filter') || key.includes('search')) {
        console.log(`📦 ${key}:`, localStorage.getItem(key));
      }
    });
  }, []);
  
  // Effet principal pour charger les données
  useEffect(() => {
    console.log('📊 Chargement des affaires avec filtres:', {
      searchTerm,
      filterStatus,
      pagination
    });
    fetchAffaires();
    fetchStats();
  }, [fetchAffaires, fetchStats]);

  const handleManualRefresh = () => {
    // Réinitialiser les filtres pour voir toutes les affaires
    setSearchTerm('');
    setFilterStatus(null);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchAffaires();
    fetchStats();
    toast.success("Données actualisées");
  }

  const handleDelete = async (affaire) => {
    const dependencies = getDependenciesMessage(affaire);
    
    if (!isDeletable(affaire)) {
      // Proposer une suppression forcée
      const confirmMessage = `${dependencies}\n\nVoulez-vous :\n- Annuler (recommandé)\n- Supprimer AVEC toutes les données associées (IRRÉVERSIBLE)`;
      
      const userChoice = window.confirm(confirmMessage + '\n\nCliquez OK pour une suppression FORCÉE ou Annuler pour abandonner.');
      
      if (userChoice) {
        // Demander une confirmation supplémentaire pour la suppression forcée
        const finalConfirm = window.prompt(
          `⚠️ ATTENTION : Suppression forcée !\n\n${dependencies}\n\nToutes ces données seront DÉFINITIVEMENT supprimées.\n\nTapez "1234" pour confirmer :`
        );
        
        if (finalConfirm === "1234") {
          await handleForceDelete(affaire);
        }
      }
      return;
    }

    // Suppression normale pour les affaires sans dépendances
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'affaire "${affaire.numero}" ?`)) {
      try {
        await affairesService.deleteAffaire(affaire.id);
        toast.success('Affaire supprimée avec succès');
        handleManualRefresh();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression de l\'affaire';
        toast.error(errorMessage);
      }
    }
  };

  const handleForceDelete = async (affaire) => {
    try {
      const result = await affairesService.forceDeleteAffaire(affaire.id);
      toast.success(result.message || 'Affaire et toutes ses dépendances supprimées avec succès');
      handleManualRefresh();
    } catch (error) {
      console.error('Erreur lors de la suppression forcée:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression forcée';
      toast.error(errorMessage);
    }
  };

  const handleDuplicate = async (affaire) => {
    if (window.confirm(`Voulez-vous copier l'affaire "${affaire.numero}" ?`)) {
      try {
        const affaireDupliquee = await affairesService.duplicateAffaire(affaire.id);
        toast.success(`Affaire copiée avec succès ! Nouveau numéro : ${affaireDupliquee.numero}`);
        handleManualRefresh();
        navigate(`/affaires/${affaireDupliquee.id}`);
      } catch (error) {
        console.error('Erreur lors de la duplication:', error);
        toast.error('Erreur lors de la copie de l\'affaire');
      }
    }
  };

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'EN_COURS':
        return <span className="px-3 py-1 text-sm font-medium text-amber-800 bg-amber-100 rounded-full">En cours</span>;
      case 'TERMINEE':
        return <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">Terminée</span>;
      case 'EN_ATTENTE':
        return <span className="px-3 py-1 text-sm font-medium text-stone-800 bg-stone-200 rounded-full">En attente</span>;
      case 'PLANIFIEE':
        return <span className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">Planifiée</span>;
      case 'CLOTUREE':
        return <span className="px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full">Clôturée</span>;
      default:
        return <span className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">{statut}</span>;
    }
  };
  
  // Ne pas filtrer localement car déjà filtré côté serveur
  const filteredAffaires = affaires;
  
  // Debug : afficher les affaires dans la console
  console.log('🔍 Toutes les affaires:', affaires);
  console.log('🔍 Nombre d\'affaires:', affaires.length);
  console.log('🔍 FilteredAffaires:', filteredAffaires);
  console.log('🔍 Nombre filteredAffaires:', filteredAffaires.length);



  if (loading && affaires.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des affaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-stone-50 min-h-screen">
      <div className="w-full">
        <div 
         className="p-8 rounded-2xl shadow-lg mb-8 text-white relative overflow-hidden h-80 flex flex-col justify-end"
         style={{
           backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/site-web-commande-panneaux.firebasestorage.app/o/Divers%20belles%20images%2FCapture%20d%E2%80%99%C3%A9cran%202025-07-01%20192449.png?alt=media&token=18a57ff9-297e-4978-b387-d2f77f0fa0d0')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}
       >
         <div className="absolute inset-0 bg-black/40"></div>
         <div className="relative z-10">
           <h1 className="text-4xl font-bold">Gestion des Affaires</h1>
           <p className="mt-2 text-lg text-white/80">Suivez et gérez toutes vos affaires.</p>
           <div className="flex items-center gap-4 mt-6">
             {/* NOUVEAU BOUTON - VERSION APPLE PLANNING */}
             <Button
               onClick={() => navigate('/affaires/apple')}
               className="text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border-2 border-white/30"
               style={{ 
                 backgroundColor: '#007AFF', 
                 color: 'white' 
               }}
               onMouseEnter={(e) => e.target.style.backgroundColor = '#0056CC'}
               onMouseLeave={(e) => e.target.style.backgroundColor = '#007AFF'}
             >
               🍎 VERSION APPLE PLANNING
             </Button>
             
             {/* NOUVEAU BOUTON - RESULTATS CONDENSES */}
             <Button
               onClick={() => navigate('/affaires/resultats')}
               variant="outline"
               className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md"
             >
               <IconChartBar className="w-5 h-5 mr-2" />
               Résultats condensés
             </Button>
             
             <Button
               onClick={handleManualRefresh}
               variant="outline"
               className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md"
             >
               <IconRefresh className="w-5 h-5 mr-2" />
               Actualiser
             </Button>
             
             {/* BOUTON TEMPORAIRE DE DEBUG */}
             <Button
               onClick={async () => {
                 console.log('🔧 DEBUG: Forcer le chargement de TOUTES les affaires');
                 setSearchTerm('');
                 setFilterStatus(null);
                 setPagination({ page: 1, limit: 100, total: 0, totalPages: 0 });
                 
                 // Appel direct à l'API
                 try {
                   const data = await affairesService.getAffaires({ take: 100, skip: 0 });
                   console.log('🔧 DEBUG: Réponse complète:', data);
                   setAffaires(data.affaires || []);
                   toast.success(`${data.total} affaires chargées`);
                 } catch (err) {
                   console.error('🔧 DEBUG: Erreur:', err);
                   toast.error('Erreur lors du chargement');
                 }
               }}
<<<<<<< HEAD
                             variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Voir toutes
            </Button>
=======
               variant="outline"
               className="bg-red-600 hover:bg-red-700 text-white"
             >
               DEBUG: Voir TOUTES
             </Button>
>>>>>>> 80cb882ec299a5d98cb64db70adf5b22510865cd
             <Button
               className="text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
               style={{ 
                 backgroundColor: '#424632', 
                 color: 'white' 
               }}
               onMouseEnter={(e) => e.target.style.backgroundColor = '#3a3c2a'}
               onMouseLeave={(e) => e.target.style.backgroundColor = '#424632'}
               onClick={() => navigate('/affaires/nouveau')}
             >
               <IconPlus className="w-5 h-5 mr-2" />
               Nouvelle affaire
             </Button>
           </div>
         </div>
       </div>
        <div className="w-full">
            {/* Contenu principal en pleine largeur */}
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<IconListNumbers className="text-amber-600" />} title="Total Affaires" value={stats.totalAffaires || 0} />
                    <StatCard icon={<IconClockHour4 className="text-orange-600" />} title="En Cours" value={stats.enCours || 0} />
                    <StatCard icon={<IconCircleCheck className="text-green-600" />} title="Terminées" value={stats.terminees || 0} />
                    <StatCard icon={<IconCash className="text-emerald-600" />} title="CA Total" value={`${(stats.caTotal || 0).toLocaleString('fr-FR')} €`} />
                </div>

                <div className="mb-6 p-4 bg-white rounded-2xl shadow-md">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-auto flex-grow relative">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Rechercher par numéro, libellé, client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10"
                        />
                        </div>
                        {(searchTerm || filterStatus) && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus(null);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="text-red-600 hover:text-red-700"
                            >
                                <IconX className="h-4 w-4 mr-1"/>
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-stone-600">Filtrer par statut:</span>
                        {['TOUS', 'EN_COURS', 'TERMINEE', 'EN_ATTENTE', 'PLANIFIEE', 'CLOTUREE'].map((statut) => (
                        <button
                            key={statut}
                            onClick={() => setFilterStatus(statut === 'TOUS' ? null : statut)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                                (filterStatus === statut || (filterStatus === null && statut === 'TOUS'))
                                ? 'bg-amber-600 text-white shadow'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                        >
                            {statut.replace('_', ' ').charAt(0).toUpperCase() + statut.replace('_', ' ').slice(1).toLowerCase()}
                        </button>
                        ))}
                    </div>
                </div>

                {affaires.length > 0 && (
                <div className="p-4 mb-6 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r-lg">
                    <div className="flex">
                    <div className="py-1"><IconInfoCircle className="h-5 w-5" /></div>
                    <div className="ml-3">
                        <h3 className="text-sm font-semibold">Règles de suppression</h3>
                        <p className="text-sm">
                        Les affaires contenant des <strong>bons de commande</strong>, <strong>pointages</strong>, <strong>phases</strong>, <strong>devis</strong> ou <strong>achats</strong> nécessitent une suppression forcée.
                        <br />
                        ⚠️ La suppression forcée supprime définitivement toutes les données associées. (Code de confirmation : <strong>1234</strong>)
                        </p>
                    </div>
                    </div>
                </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-4 flex justify-between items-center border-b border-stone-200">
                        <h2 className="text-xl font-bold text-stone-800 flex items-center">
                        <IconListDetails className="mr-3 text-amber-600"/>
                        Liste des Affaires ({filteredAffaires.length})
                        {searchTerm && <span className="ml-2 text-sm text-stone-500">(Recherche: "{searchTerm}")</span>}
                        {filterStatus && <span className="ml-2 text-sm text-stone-500">(Filtre: {filterStatus})</span>}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-stone-600">
                        <thead className="text-xs text-stone-700 uppercase bg-stone-100/70">
                            <tr>
                            <th scope="col" className="px-4 py-4 font-bold">Test</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconHash className="mr-2 inline"/>Numéro</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconFileText className="mr-2 inline"/>Libellé</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconActivityHeartbeat className="mr-2 inline"/>Statut</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconTargetArrow className="mr-2 inline"/>Objectif CA HT</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconCash className="mr-2 inline"/>CA Réel</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconChartBar className="mr-2 inline"/>Obj. Dépense</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconTrendingDown className="mr-2 inline"/>Dép. Réelles</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconTrendingUp className="mr-2 inline" style={{color: '#7c3aed'}}/>Taux Marge Réel</th>
                            <th scope="col" className="px-4 py-4 font-bold"><IconCalendarEvent className="mr-2 inline"/>Date Clôture</th>
                            <th scope="col" className="px-4 py-4 font-bold text-center"><IconSettings className="mr-2 inline"/>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAffaires.map((affaire) => (
                            <tr key={affaire.id} 
                                className="border-b border-stone-200/60 hover:bg-stone-50/80 transition-colors duration-150 bg-white"
                            >
                                <td className="px-4 py-4 text-center">-</td>
                                <td className="px-4 py-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mr-3 font-bold text-lg">
                                    {affaire.numero.substring(affaire.numero.length - 2)}
                                    </div>
                                    <span className="font-semibold text-stone-800 text-sm">{affaire.numero}</span>
                                </div>
                                </td>
                                <td className="px-4 py-4">
                                <div className="font-semibold text-stone-800 text-sm">{affaire.libelle}</div>
                                <div className="text-xs text-stone-500 mt-1 flex items-center">
                                    <IconUser className="inline mr-1.5"/> {affaire.client}
                                </div>
                                </td>
                                <td className="px-4 py-4">{getStatutBadge(affaire.statut)}</td>
                                <td className="px-4 py-4 font-medium text-stone-800 text-sm">
                                <div className="flex items-center">
                                    <IconTargetArrow className="w-4 h-4 mr-1 text-blue-500"/>
                                    {(affaire.objectifCaHt || 0).toLocaleString('fr-FR')} €
                                </div>
                                </td>
                                <td className="px-4 py-4 font-medium text-stone-800 text-sm">
                                <div className="flex items-center">
                                    <IconCash className="w-4 h-4 mr-1 text-green-500"/>
                                    {(affaire.caReelHt || 0).toLocaleString('fr-FR')} €
                                </div>
                                </td>
                                <td className="px-4 py-4 font-medium text-stone-800 text-sm">
                                <div className="flex items-center">
                                    <IconChartBar className="w-4 h-4 mr-1 text-red-500"/>
                                    {(affaire.objectifAchatHt || 0).toLocaleString('fr-FR')} €
                                </div>
                                </td>
                                <td className="px-4 py-4 font-medium text-stone-800 text-sm">
                                <div className="flex items-center">
                                    <IconTrendingDown className="w-4 h-4 mr-1 text-orange-500"/>
                                    {(affaire.achatReelHt || 0).toLocaleString('fr-FR')} €
                                </div>
                                </td>
                                <td className="px-4 py-4 font-medium text-sm">
                                    <div className={`flex items-center px-2 py-1 rounded ${calculerTauxMargeReel(affaire).bg}`}>
                                        <span className={calculerTauxMargeReel(affaire).couleur}>
                                            {calculerTauxMargeReel(affaire).taux.toFixed(1)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-xs text-stone-500">
                                {affaire.dateCloturePrevue ? new Date(affaire.dateCloturePrevue).toLocaleDateString('fr-FR') : 'N/A'}
                                </td>
                                <td className="px-4 py-4">
                                <div className="flex items-center justify-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/affaires/${affaire.id}`)}>
                                    <IconEye className="h-4 w-4 mr-1"/>Voir
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/affaires/${affaire.id}/modifier`)}>
                                    <IconPencil className="h-4 w-4 mr-1"/>Modifier
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(affaire)}>
                                    <IconCopy className="h-4 w-4 mr-1"/>Copier
                                    </Button>
                                    <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleDelete(affaire)}
                                    className={!isDeletable(affaire) ? "bg-orange-50 border-orange-200 hover:bg-orange-100" : ""}
                                    title={
                                        isDeletable(affaire) 
                                        ? 'Supprimer' 
                                        : `Suppression forcée requise - ${getDependenciesMessage(affaire)}`
                                    }
                                    >
                                    <IconTrash className={`h-4 w-4 ${isDeletable(affaire) ? 'text-red-500' : 'text-orange-500'}`}/>
                                    </Button>
                                </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION PLANNING ÉQUIPE INTÉGRÉ */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-4 flex justify-between items-center border-b border-stone-200">
                        <h2 className="text-xl font-bold text-stone-800 flex items-center">
                            <IconCalendar className="mr-3 text-amber-600"/>
                            Planning Équipe
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-stone-600">Semaine 28 - Juillet 2025</span>
                            <Button variant="outline" size="sm" onClick={() => navigate('/planning-equipe')}>
                                <IconEye className="h-4 w-4 mr-1"/>
                                Voir complet
                            </Button>
                        </div>
                    </div>
                    <div className="p-4">
                        <PlanningEquipeIntegre />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AffairesList; 