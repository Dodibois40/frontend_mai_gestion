import React, { useState } from 'react';
import { Tabs, Card, Title, Text } from '@mantine/core';
import { 
  IconReceipt, 
  IconFileText, 
  IconFileAnalytics,
  IconShoppingCart 
} from '@tabler/icons-react';

// Import des composants existants
import Achats from './Achats';
import BdcList from './achat/BdcList';
import RapprochementAchats from './RapprochementAchats';

const AchatsUnified = () => {
  const [activeTab, setActiveTab] = useState('factures');

  return (
    <div className="p-6">
      {/* En-tête principal */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <IconShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div>
            <Title order={1} className="text-blue-900">Module Achats Complet</Title>
            <Text c="dimmed">Gestion des factures, bons de commande et contrôles de rapprochement</Text>
          </div>
        </div>
      </Card>

      {/* Interface à onglets */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List className="mb-6">
          <Tabs.Tab 
            value="factures" 
            leftSection={<IconReceipt size={16} />}
            className="text-lg"
          >
            Factures d'Achats
          </Tabs.Tab>
          <Tabs.Tab 
            value="bdc" 
            leftSection={<IconFileText size={16} />}
            className="text-lg"
          >
            Bons de Commande
          </Tabs.Tab>
          <Tabs.Tab 
            value="rapprochement" 
            leftSection={<IconFileAnalytics size={16} />}
            className="text-lg"
          >
            Rapprochement
          </Tabs.Tab>
        </Tabs.List>

        {/* Contenu des onglets */}
        <Tabs.Panel value="factures">
          {/* Réutilisation du composant Achats existant sans le header */}
          <div className="mt-0">
            <AchatsContent />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="bdc">
          {/* Réutilisation du composant BDC existant */}
          <div className="mt-0">
            <BdcContent />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="rapprochement">
          {/* Réutilisation du composant Rapprochement existant sans le header */}
          <div className="mt-0">
            <RapprochementContent />
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

// Composant pour les factures d'achats (version allégée sans header)
const AchatsContent = () => {
  return <Achats hideHeader={true} />;
};

// Composant pour les BDC (version allégée sans header)  
const BdcContent = () => {
  return <BdcList hideHeader={true} />;
};

// Composant pour le rapprochement (version allégée sans header)
const RapprochementContent = () => {
  return <RapprochementAchats hideHeader={true} />;
};

export default AchatsUnified; 