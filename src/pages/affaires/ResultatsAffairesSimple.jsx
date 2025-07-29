import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { affairesService } from '@/services/affairesService';
import { IconArrowLeft } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ResultatsAffairesSimple = () => {
  const navigate = useNavigate();
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAffaires = async () => {
      try {
        console.log('🔄 Chargement des affaires...');
        const response = await affairesService.getAffaires({ take: 1000, skip: 0 });
        
        console.log('📊 Réponse complète:', response);
        console.log('📊 Type de réponse:', typeof response);
        console.log('📊 Clés disponibles:', Object.keys(response));
        
        const affairesData = response.affaires || response || [];
        console.log('📊 Nombre d\'affaires:', affairesData.length);
        
        if (affairesData.length > 0) {
          console.log('📊 Première affaire complète:', affairesData[0]);
        }
        
        setAffaires(affairesData);
      } catch (error) {
        console.error('❌ Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAffaires();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-6 bg-stone-50 min-h-screen">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/affaires')}
          className="mb-4"
        >
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Test Résultats Affaires - Version Simple</h1>
      </div>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Données brutes des affaires ({affaires.length} affaires)</h2>
        
        <table className="w-full text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="p-2 text-left">Numéro</th>
              <th className="p-2 text-left">Libellé</th>
              <th className="p-2 text-right">Objectif CA</th>
              <th className="p-2 text-right">CA Réel</th>
              <th className="p-2 text-right">Objectif Achats</th>
              <th className="p-2 text-right">Achats Réels</th>
            </tr>
          </thead>
          <tbody>
            {affaires.map((affaire, index) => (
              <tr key={affaire.id} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                <td className="p-2">{affaire.numero}</td>
                <td className="p-2">{affaire.libelle}</td>
                <td className="p-2 text-right">{affaire.objectifCaHt || 0} €</td>
                <td className="p-2 text-right">{affaire.caReelHt || 0} €</td>
                <td className="p-2 text-right">{affaire.objectifAchatHt || 0} €</td>
                <td className="p-2 text-right">{affaire.achatReelHt || 0} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {affaires.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">Voir les propriétés complètes de la première affaire</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(affaires[0], null, 2)}
            </pre>
          </details>
        )}
      </Card>
    </div>
  );
};

export default ResultatsAffairesSimple; 