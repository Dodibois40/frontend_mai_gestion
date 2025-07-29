import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ClaudeChat from '@/components/ClaudeChat';

const ClaudeTestPage = () => {
  const [showChat, setShowChat] = useState(true);
  
  // Exemple de données CRM à passer à Claude
  const [mockCrmData] = useState({
    affaire: {
      id: 'aff-001',
      numero: 'AFF-2024-001',
      libelle: 'Rénovation Bureau Dupont',
      client: 'Société Dupont SARL',
      objectifCaHt: 45000,
      caReelHt: 32000,
      objectifAchatHt: 25000,
      achatReelHt: 18500,
      statut: 'EN_COURS',
      avancementPourcentage: 65,
    },
    devis: [
      { numero: 'DEV-001', montantHt: 15000, statut: 'VALIDE' },
      { numero: 'DEV-002', montantHt: 17000, statut: 'REALISE' },
    ],
    bdc: [
      { numero: 'BDC-001', fournisseur: 'Leroy Merlin', montantHt: 8500, statut: 'RECEPTIONNE' },
      { numero: 'BDC-002', fournisseur: 'Castorama', montantHt: 10000, statut: 'EN_ATTENTE' },
    ],
    pointages: [
      { date: '2024-01-15', heures: 8, type: 'FAB', ouvrier: 'Jean Martin' },
      { date: '2024-01-16', heures: 7.5, type: 'POSE', ouvrier: 'Pierre Durand' },
    ]
  });

  const contextUtilisateur = {
    currentPage: 'Affaire',
    activeAffaire: mockCrmData.affaire.id,
    totalAffaires: 25,
    affairesEnCours: 8,
    budgetMensuel: '125000€'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test Assistant Claude</h1>
          <p className="text-muted-foreground">
            Page de démonstration de l'intégration Claude dans le CRM
          </p>
        </div>
        <Button 
          onClick={() => setShowChat(!showChat)}
          variant={showChat ? "destructive" : "default"}
        >
          {showChat ? "Masquer Claude" : "Afficher Claude"}
        </Button>
      </div>

      {/* Simulation de données CRM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Affaire en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Numéro:</strong> {mockCrmData.affaire.numero}</p>
              <p><strong>Client:</strong> {mockCrmData.affaire.client}</p>
              <p><strong>CA Objectif:</strong> {mockCrmData.affaire.objectifCaHt.toLocaleString()}€</p>
              <p><strong>CA Réel:</strong> {mockCrmData.affaire.caReelHt.toLocaleString()}€</p>
              <p><strong>Avancement:</strong> {mockCrmData.affaire.avancementPourcentage}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockCrmData.devis.map((devis, index) => (
                <div key={index} className="flex justify-between">
                  <span>{devis.numero}</span>
                  <span className="font-medium">{devis.montantHt.toLocaleString()}€</span>
                </div>
              ))}
              <div className="pt-2 border-t">
                <strong>Total: {mockCrmData.devis.reduce((sum, d) => sum + d.montantHt, 0).toLocaleString()}€</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bons de Commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockCrmData.bdc.map((bdc, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">{bdc.numero}</span>
                    <span className="font-medium">{bdc.montantHt.toLocaleString()}€</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bdc.fournisseur} • {bdc.statut}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions pour Claude */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions pour tester Claude</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Questions CRM à poser :</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Quelle est la marge de l'affaire Dupont ?</li>
                <li>Les BDC sont-ils tous réceptionnés ?</li>
                <li>Combien d'heures ont été pointées ?</li>
                <li>L'avancement correspond-il aux prévisions ?</li>
                <li>Quels sont les risques financiers sur cette affaire ?</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Questions générales à poser :</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Quel temps fait-il aujourd'hui ?</li>
                <li>Explique-moi la gestion de projet Agile</li>
                <li>Comment améliorer la productivité d'une équipe ?</li>
                <li>Raconte-moi une blague</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Actions rapides disponibles :</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>🔍 Analyser :</strong> Analyse complète de l'affaire</li>
                <li><strong>📊 Finance :</strong> Analyse financière détaillée</li>
                <li><strong>💡 Stratégie :</strong> Recommandations stratégiques</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions pour l'environnement */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-700">⚙️ Configuration requise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>Variable d'environnement :</strong></p>
            <code className="bg-gray-100 px-2 py-1 rounded">ANTHROPIC_API_KEY=votre_clé_api_claude</code>
            <p className="text-orange-600 mt-2">
              Si Claude ne répond pas, vérifiez que la variable d'environnement ANTHROPIC_API_KEY 
              est configurée dans votre fichier .env backend.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assistant Claude */}
      {showChat && (
        <ClaudeChat
          userContext={contextUtilisateur}
          crmData={mockCrmData}
        />
      )}
    </div>
  );
};

export default ClaudeTestPage; 