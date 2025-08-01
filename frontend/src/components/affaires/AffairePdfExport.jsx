import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { IconPrinter } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AffairePdfExport = ({ affaire, financialData }) => {
  const printRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount || 0);
  };

  const generatePDF = async () => {
    console.log('🔍 [DEBUG PDF] Début génération PDF');
    console.log('🔍 [DEBUG PDF] Affaire:', affaire);
    console.log('🔍 [DEBUG PDF] FinancialData:', financialData);

    if (!printRef.current) {
      console.error('❌ [DEBUG PDF] printRef.current est null');
      toast.error('Erreur: Référence du contenu PDF manquante');
      return;
    }

    if (!affaire) {
      console.error('❌ [DEBUG PDF] Données affaire manquantes');
      toast.error('Erreur: Données de l\'affaire manquantes');
      return;
    }

    if (!financialData) {
      console.error('❌ [DEBUG PDF] Données financières manquantes');
      toast.error('Erreur: Données financières manquantes');
      return;
    }

    try {
      setIsGenerating(true);
      toast.info('Génération du PDF en cours...');

      const element = printRef.current;
      console.log('🔍 [DEBUG PDF] Élément à convertir:', element);
      console.log('🔍 [DEBUG PDF] Contenu HTML:', element.innerHTML.substring(0, 200) + '...');

      // Temporairement rendre l'élément visible pour la génération
      const originalStyle = element.style.cssText;
      element.style.position = 'static';
      element.style.left = 'auto';
      element.style.visibility = 'visible';
      
      const options = {
        margin: [10, 10, 10, 10],
        filename: `Synthese_Affaire_${affaire.numero}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true,
          width: 800,
          height: 1120
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      console.log('🔍 [DEBUG PDF] Options:', options);

      await html2pdf().set(options).from(element).save();
      
      // Restaurer le style original
      element.style.cssText = originalStyle;
      
      toast.success('PDF généré avec succès !');
      console.log('✅ [DEBUG PDF] PDF généré avec succès');
    } catch (error) {
      console.error('❌ [DEBUG PDF] Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Vérification des données avant rendu
  if (!affaire || !financialData) {
    console.warn('⚠️ [DEBUG PDF] Données manquantes - affaire ou financialData');
    return (
      <div className="flex justify-end mb-4">
        <Button disabled className="bg-gray-400 text-white">
          Données manquantes - Export PDF indisponible
        </Button>
      </div>
    );
  }

  

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button
          onClick={generatePDF}
          disabled={isGenerating}
          className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
        >
          <IconPrinter className="w-4 h-4" />
          {isGenerating ? 'Génération...' : 'Exporter en PDF'}
        </Button>
      </div>

      {/* Contenu PDF - Masqué mais présent dans le DOM */}
      <div 
        ref={printRef} 
        className="print-content"
        style={{ 
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '800px',
          minHeight: '1120px',
          backgroundColor: '#ffffff',
          padding: '32px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          boxSizing: 'border-box'
        }}
      >
        {/* En-tête du document */}
        <div style={{ marginBottom: '32px', borderBottom: '2px solid #d1d5db', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', margin: '0' }}>
                SYNTHÈSE D'AFFAIRE
              </h1>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#2563eb', margin: '0' }}>
                {affaire?.numero} - {affaire?.libelle}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
              <div style={{ marginBottom: '4px' }}>Généré le : {formatDate(new Date())}</div>
              <div>Client : {affaire?.client}</div>
            </div>
          </div>
        </div>

        {/* Informations Générales */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '16px', borderLeft: '4px solid #3b82f6', paddingLeft: '12px', margin: '0 0 16px 0' }}>
            Informations Générales
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '12px' }}>
            <div>
              <div style={{ marginBottom: '8px' }}><strong>Statut :</strong> {affaire?.statut}</div>
              <div><strong>Date de commencement :</strong> {formatDate(affaire?.dateCommencement)}</div>
            </div>
            <div>
              <div style={{ marginBottom: '8px' }}><strong>Date de clôture prévue :</strong> {formatDate(affaire?.dateCloturePrevue)}</div>
              <div><strong>Adresse :</strong> {affaire?.adresse || affaire?.ville || 'Non renseignée'}</div>
            </div>
          </div>
        </div>

        {/* Métriques Financières */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '16px', borderLeft: '4px solid #10b981', paddingLeft: '12px', margin: '0 0 16px 0' }}>
            Métriques Financières
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', border: '2px solid #bfdbfe' }}>
              <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginBottom: '8px' }}>CA OBJECTIF</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a' }}>
                {formatCurrency(financialData?.objectifCA)}
              </div>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '2px solid #bbf7d0' }}>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginBottom: '8px' }}>CA RÉALISÉ</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#14532d' }}>
                {formatCurrency(financialData?.caReel)}
              </div>
            </div>
            <div style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', border: '2px solid #fed7aa' }}>
              <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '600', marginBottom: '8px' }}>AVANCEMENT</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9a3412' }}>
                {financialData?.objectifCA > 0 ? Math.round((financialData?.caReel / financialData?.objectifCA) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Répartition des Coûts */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '16px', borderLeft: '4px solid #8b5cf6', paddingLeft: '12px', margin: '0 0 16px 0' }}>
            Répartition des Coûts
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Section Prévisions */}
            <div>
              <h3 style={{ fontWeight: 'bold', color: '#374151', marginBottom: '12px', fontSize: '16px', margin: '0 0 12px 0' }}>PRÉVISIONS</h3>
              <div style={{ fontSize: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '12px' }}>
                  <span>Achats :</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '600' }}>
                      {formatCurrency(financialData?.objectifAchats)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '12px' }}>
                  <span>Main-d'œuvre :</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '600' }}>
                      {formatCurrency(financialData?.coutObjectifMainOeuvre)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '12px' }}>
                  <span>Frais généraux :</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '600' }}>
                      {formatCurrency(financialData?.fraisGenerauxObjectifs)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', fontWeight: 'bold', paddingTop: '8px', fontSize: '14px' }}>
                  <span>Marge prévue :</span>
                  <div style={{ textAlign: 'right' }}>
                    <span>{formatCurrency(financialData?.margeObjectif)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Réalisations */}
            <div>
              <h3 style={{ fontWeight: 'bold', color: '#374151', marginBottom: '12px', fontSize: '16px', margin: '0 0 12px 0' }}>RÉALISATIONS</h3>
              <div style={{ fontSize: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '12px' }}>
                  <span>Achats :</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '600' }}>
                      {formatCurrency(financialData?.achatReel)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '12px' }}>
                  <span>Main-d'œuvre :</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '600' }}>
                      {formatCurrency(financialData?.totalMainOeuvreReelle)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '12px' }}>
                  <span>Frais généraux :</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '600' }}>
                      {formatCurrency(financialData?.fraisGenerauxReels)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', fontWeight: 'bold', paddingTop: '8px', fontSize: '14px' }}>
                  <span>Marge réelle :</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#16a34a' }}>{formatCurrency(financialData?.margeReelle)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes si marge négative */}
        {financialData?.margeReelle < 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#dc2626', marginBottom: '16px', borderLeft: '4px solid #ef4444', paddingLeft: '12px', margin: '0 0 16px 0' }}>
              ⚠️ Alertes
            </h2>
            <div style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
              <div style={{ color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>
                Marge négative détectée !
              </div>
              <div style={{ color: '#b91c1c', fontSize: '12px' }}>
                Cette affaire présente une marge négative de {formatCurrency(Math.abs(financialData?.margeReelle))}.
              </div>
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div style={{ marginTop: '48px', paddingTop: '16px', borderTop: '2px solid #d1d5db', textAlign: 'center', fontSize: '10px', color: '#6b7280' }}>
          <div>Document généré automatiquement le {new Date().toLocaleString('fr-FR')}</div>
          <div style={{ marginTop: '4px' }}>Synthèse d'affaire - {affaire?.numero}</div>
        </div>
      </div>
    </div>
  );
};

export default AffairePdfExport; 